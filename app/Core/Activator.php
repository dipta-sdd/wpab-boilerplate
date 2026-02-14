<?php

namespace WpabBoilerplate\Core;

use WpabBoilerplate\Core\Common;
use WpabBoilerplate\Data\DbManager;

/**
 * Fired during plugin activation.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Core
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

class Activator
{
	/**
	 * The main activation method.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public static function activate()
	{
		// Set up the default options if they don't exist.
		/* Default Settings */
		Settings::get_instance()->update_settings(Settings::get_instance()->get_default_settings());

		// Create custom database tables.
		self::create_custom_tables();

		// Flush rewrite rules.
		flush_rewrite_rules();

		// Secure the log directory.
		self::secure_log_directory();

		// Add custom capabilities.
		self::add_plugin_roles_and_capabilities();
	}

	/**
	 * Instantiates the DB Manager and creates the custom tables.
	 *
	 * @since 1.0.0
	 * @access private
	 * @return void
	 */
	private static function create_custom_tables()
	{
		DbManager::get_instance()->create_tables();
	}

	/**
	 * Secures the log directory by creating an .htaccess file and an index.php file.
	 *
	 * @since    1.0.0
	 * @access private
	 * @return void
	 */
	private static function secure_log_directory()
	{
		$upload_dir = wp_upload_dir();
		$log_dir = $upload_dir['basedir'] . '/' . WPAB_BOILERPLATE_TEXT_DOMAIN . '-logs/';

		if (!is_dir($log_dir)) {
			wp_mkdir_p($log_dir);
		}

		$htaccess_file = $log_dir . '.htaccess';
		if (!file_exists($htaccess_file)) {
			$htaccess_content = "
			# Protect log files from direct access
			<Files *.log>
				Order allow,deny
				Deny from all
			</Files>
			";
			file_put_contents($htaccess_file, $htaccess_content); // phpcs:ignore
		}

		$index_file = $log_dir . 'index.php';
		if (!file_exists($index_file)) {
			$index_content = "<?php\n// Silence is golden.\n";
			file_put_contents($index_file, $index_content); // phpcs:ignore
		}
	}

	/**
	 * Adds custom roles and capabilities required by the plugin.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 */
	private static function add_plugin_roles_and_capabilities()
	{
		$custom_capability = 'manage_wpab_boilerplate';

		$admin_role = get_role('administrator');
		if ($admin_role && !$admin_role->has_cap($custom_capability)) {
			$admin_role->add_cap($custom_capability);
		}
	}
}
