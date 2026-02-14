<?php

namespace WpabBoilerplate\Helper;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Handles all logging for the plugin.
 *
 * Provides a central point for logging events to a custom database table.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Helper
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Logger
{
	/**
	 * The instance of the Logger class.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var Logger
	 */
	private static $instance = null;

	/**
	 * Gets an instance of the Logger class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return Logger
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
	 * Central logging function for the entire plugin.
	 *
	 * Records events to a custom database table.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string $log_type The category of the log entry (e.g., 'info', 'error', 'activity').
	 * @param string $message  A short, human-readable message describing the event.
	 * @param array  $context  Optional. An associative array of contextual data to store.
	 * @return void
	 */
	public function log($log_type, $message, $context = array())
	{
		$level = $log_type;
		if (!empty($context)) {
			$message .= ' ' . json_encode($context);
		}
		wpab_boilerplate_log($message, $level);
	}
}
