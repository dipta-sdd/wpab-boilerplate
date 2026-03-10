<?php

namespace WpabBoilerplate\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Cron job management for the plugin.
 *
 * Uses WP-Cron as the primary scheduler with a self-healing fallback
 * that detects missed/overdue events and runs them inline on `init`.
 * No custom database tables are used — all state lives in WP transients
 * and the built-in WP-Cron system.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Core
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Cron
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var Cron
	 */
	private static $instance = null;

	/**
	 * Prefix for all cron hook names.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const HOOK_PREFIX = 'wpab_boilerplate_cron_';

	/**
	 * Transient key for the merged-logs cache.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const LOG_CACHE_KEY = 'wpab_boilerplate_logs_cache';

	/**
	 * Option key that stores the last-run timestamps for fallback detection.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const LAST_RUN_OPTION = 'wpab_boilerplate_cron_last_run';

	/**
	 * Number of days to retain log files.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	const LOG_RETENTION_DAYS = 30;

	/**
	 * Grace period (in seconds) before a missed job triggers the fallback.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	const MISSED_GRACE = 300; // 5 minutes

	/**
	 * Gets a single instance of the class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return Cron
	 */
	public static function get_instance()
	{
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Private constructor for singleton.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function __construct() {}

	/**
	 * Returns the list of cron jobs managed by this plugin.
	 *
	 * Each entry: [ 'hook' => string, 'interval' => string, 'callback' => string ]
	 * The 'interval' must match a registered WP-Cron schedule (e.g. 'daily', 'hourly').
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array
	 */
	public function get_jobs()
	{
		/**
		 * Filters the list of cron jobs registered by the plugin.
		 *
		 * @since 1.0.0
		 * @hook wpab_boilerplate_cron_jobs
		 * @param array $jobs The array of cron job definitions.
		 * @return array
		 */
		return apply_filters('wpab_boilerplate_cron_jobs', array(
			array(
				'hook'     => self::HOOK_PREFIX . 'purge_old_logs',
				'interval' => 'daily',
				'callback' => 'purge_old_logs',
			),
			array(
				'hook'     => self::HOOK_PREFIX . 'rebuild_log_cache',
				'interval' => 'daily',
				'callback' => 'rebuild_log_cache',
			),
		));
	}

	/**
	 * Schedule all plugin cron events if they are not already scheduled.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function schedule_events()
	{
		$jobs = $this->get_jobs();
		foreach ($jobs as $job) {
			if (!wp_next_scheduled($job['hook'])) {
				wp_schedule_event(time(), $job['interval'], $job['hook']);
			}
		}
	}

	/**
	 * Self-healing fallback: detect overdue cron events and run them inline.
	 *
	 * If WP-Cron hasn't fired (e.g. low-traffic site with DISABLE_WP_CRON),
	 * this method checks whether any scheduled event is overdue and, if so,
	 * executes it directly during the current request.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function maybe_run_missed()
	{
		$jobs      = $this->get_jobs();
		$last_runs = get_option(self::LAST_RUN_OPTION, array());
		$intervals = wp_get_schedules();

		foreach ($jobs as $job) {
			$next = wp_next_scheduled($job['hook']);

			// If the event was somehow removed, re-schedule it.
			if (false === $next) {
				$this->schedule_events();
				continue;
			}

			// Determine interval in seconds.
			$interval_seconds = isset($intervals[$job['interval']]['interval'])
				? (int) $intervals[$job['interval']]['interval']
				: DAY_IN_SECONDS;

			// Check if the event is overdue.
			$overdue_threshold = $next + self::MISSED_GRACE;
			if (time() > $overdue_threshold) {
				// Run the callback inline.
				if (method_exists($this, $job['callback'])) {
					call_user_func(array($this, $job['callback']));
				}

				// Re-schedule for the next interval.
				wp_unschedule_event($next, $job['hook']);
				wp_schedule_event(time() + $interval_seconds, $job['interval'], $job['hook']);
			}
		}
	}

	/**
	 * Unschedule all plugin cron events.
	 *
	 * Should be called during plugin deactivation.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function unschedule_all()
	{
		$jobs = $this->get_jobs();
		foreach ($jobs as $job) {
			$timestamp = wp_next_scheduled($job['hook']);
			if ($timestamp) {
				wp_unschedule_event($timestamp, $job['hook']);
			}
		}
		delete_option(self::LAST_RUN_OPTION);
		delete_transient(self::LOG_CACHE_KEY);
	}

	// ------------------------------------------------------------------
	// Cron Job Callbacks
	// ------------------------------------------------------------------

	/**
	 * Purge log files older than the retention period.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function purge_old_logs()
	{
		$log_dir = $this->get_log_dir();
		if (!is_dir($log_dir)) {
			$this->record_last_run('purge_old_logs');
			return;
		}

		$files = glob($log_dir . 'plugin-log-*.log');
		if (empty($files)) {
			$this->record_last_run('purge_old_logs');
			return;
		}

		$cutoff = gmdate('Y-m-d', strtotime('-' . self::LOG_RETENTION_DAYS . ' days'));

		foreach ($files as $file) {
			// Extract the date from the filename: plugin-log-YYYY-MM-DD.log
			$basename = basename($file, '.log');
			$date     = str_replace('plugin-log-', '', $basename);

			if ($date < $cutoff) {
				wp_delete_file($file);
			}
		}

		$this->record_last_run('purge_old_logs');
	}

	/**
	 * Rebuild the merged-logs transient cache.
	 *
	 * Reads the last 29 days of log files (excluding today), merges them
	 * into a single string, and stores it in a transient. The REST API
	 * endpoint only needs to concatenate this cache with today's live file.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function rebuild_log_cache()
	{
		$log_dir = $this->get_log_dir();
		$merged  = '';

		// Go from oldest (29 days ago) to yesterday.
		for ($i = self::LOG_RETENTION_DAYS - 1; $i >= 1; $i--) {
			$date = gmdate('Y-m-d', strtotime('-' . $i . ' days'));
			$file = $log_dir . 'plugin-log-' . $date . '.log';

			if (file_exists($file)) {
				$content = file_get_contents($file); // phpcs:ignore
				if (!empty($content)) {
					$merged .= $content;
				}
			}
		}

		set_transient(self::LOG_CACHE_KEY, $merged, DAY_IN_SECONDS);
		$this->record_last_run('rebuild_log_cache');
	}

	// ------------------------------------------------------------------
	// Helpers
	// ------------------------------------------------------------------

	/**
	 * Get the log directory path.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string
	 */
	public function get_log_dir()
	{
		$upload_dir = wp_upload_dir();
		return $upload_dir['basedir'] . '/' . WPAB_BOILERPLATE_TEXT_DOMAIN . '-logs/';
	}

	/**
	 * Get the merged logs for the REST API response.
	 *
	 * Returns the transient cache (last 29 days) + today's live log file.
	 * If the transient is expired / missing, it rebuilds it first.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return string
	 */
	public function get_merged_logs()
	{
		$cached = get_transient(self::LOG_CACHE_KEY);

		// If cache is missing, rebuild it on-demand.
		if (false === $cached) {
			$this->rebuild_log_cache();
			$cached = get_transient(self::LOG_CACHE_KEY);
			if (false === $cached) {
				$cached = '';
			}
		}

		// Append today's log.
		$today_file = $this->get_log_dir() . 'plugin-log-' . gmdate('Y-m-d') . '.log';
		$today_log  = '';
		if (file_exists($today_file)) {
			$today_log = file_get_contents($today_file); // phpcs:ignore
		}

		return $cached . $today_log;
	}

	/**
	 * Record the last-run timestamp for a job.
	 *
	 * @since 1.0.0
	 * @access private
	 * @param string $job_name The callback name of the job.
	 * @return void
	 */
	private function record_last_run($job_name)
	{
		$last_runs = get_option(self::LAST_RUN_OPTION, array());
		$last_runs[$job_name] = time();
		update_option(self::LAST_RUN_OPTION, $last_runs);
	}

	/**
	 * Register the hooks for the cron system.
	 *
	 * @since 1.0.0
	 * @param \WpabBoilerplate\Core\Plugin $plugin The Plugin instance.
	 * @return void
	 */
	public function run($plugin)
	{
		$loader = $plugin->get_loader();

		// Schedule events on init.
		$loader->add_action('init', $this, 'schedule_events');

		// Self-healing: check for missed events on every request.
		$loader->add_action('init', $this, 'maybe_run_missed', 20);

		// Register the actual cron callbacks.
		$jobs = $this->get_jobs();
		foreach ($jobs as $job) {
			add_action($job['hook'], array($this, $job['callback']));
		}
	}
}
