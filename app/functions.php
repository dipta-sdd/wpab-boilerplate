<?php

/**
 * Reusable functions.
 *
 * @package    WPAB_Boilerplate
 * @since 1.0.0
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}





if (!function_exists('wpab_boilerplate_log')) {
	/**
	 * Log messages to the debug log file.
	 *
	 * @param mixed  $message  The message to log.
	 * @param string $level    The log level (e.g., 'DEBUG', 'INFO', 'ERROR').
	 */
	function wpab_boilerplate_log($message, $level = 'INFO')
	{
		$enable_logging = WpabBoilerplate\Core\Settings::get_instance()->get_settings('debug_enableMode');
		if (!$enable_logging && ($level !== 'ERROR' && $level !== 'error')) {
			return;
		}
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/' . WPAB_BOILERPLATE_TEXT_DOMAIN . '-logs/';

		if (!is_dir($log_dir)) {
			wp_mkdir_p($log_dir);
		}

		$log_file = $log_dir . 'plugin-log-' . gmdate('Y-m-d') . '.log';

		$formatted_message = '';
		if (is_array($message) || is_object($message)) {
			$formatted_message = json_encode($message);
		} else {
			$formatted_message = $message;
		}

		$log_level = is_string($level) ? strtoupper($level) : (is_array($level) || is_object($level) ? print_r($level, true) : '');
		$log_entry = sprintf(
			"[%s] [%s]: %s\n",
			current_time('mysql'),
			$log_level,
			$formatted_message
		);
		file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
	}
}


if (!function_exists('wpab_boilerplate_get_value')) {
	/**
	 * Safely retrieve a value from a nested array or object using dot notation.
	 * Returns default if key is missing OR if value is an empty string.
	 *
	 * @since 1.0.0
	 * @param array|object $target  The array or object to search.
	 * @param string|array $key     The key path (e.g., 'settings.color').
	 * @param mixed        $default The default value if key is not found.
	 * @return mixed
	 */
	function wpab_boilerplate_get_value($target, $key, $default = null)
	{
		if (is_null($key) || trim($key) == '') {
			return $target;
		}

		$keys = is_array($key) ? $key : explode('.', $key);

		foreach ($keys as $segment) {
			if (is_array($target) && isset($target[$segment])) {
				$target = $target[$segment];
			} elseif (is_object($target) && isset($target->{$segment})) {
				$target = $target->{$segment};
			} else {
				return $default;
			}
		}

		if ($target === '') {
			return $default;
		}

		return $target;
	}
}
