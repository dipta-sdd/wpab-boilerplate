<?php

/**
 * Plugin Name:       WPAB Boilerplate
 * Plugin URI:        https://wpanchorbay.com
 * Source URI:        https://github.com/dipta-sdd/wpab-boilerplate
 * Description:       A modern WordPress plugin boilerplate with React/TypeScript admin UI, REST API, and modular PHP architecture.
 * Requires at least: 5.6
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Stable tag:        1.0.0
 * Author:            WPAnchorBay
 * Author URI:        https://wpanchorbay.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wpab-boilerplate
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

define('WPAB_BOILERPLATE_PATH', plugin_dir_path(__FILE__));
define('WPAB_BOILERPLATE_DIR', plugin_dir_path(__FILE__));
define('WPAB_BOILERPLATE_URL', plugin_dir_url(__FILE__));
define('WPAB_BOILERPLATE_VERSION', '1.0.0');
define('WPAB_BOILERPLATE_PLUGIN_NAME', 'wpab-boilerplate');
define('WPAB_BOILERPLATE_TEXT_DOMAIN', 'wpab-boilerplate');
define('WPAB_BOILERPLATE_OPTION_NAME', 'wpab_boilerplate');
define('WPAB_BOILERPLATE_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('WPAB_BOILERPLATE_DEV_MODE', true);

spl_autoload_register(function ($class) {
	// Only handle our plugin's classes
	if (strpos($class, 'WpabBoilerplate\\') !== 0) {
		return;
	}
	// Convert namespace to file path
	$file = WPAB_BOILERPLATE_PATH . 'app/' . str_replace('\\', '/', substr($class, 15)) . '.php';

	// Load the file if it exists
	if (file_exists($file)) {
		require_once $file;
	}
});

require_once WPAB_BOILERPLATE_PATH . 'app/functions.php';

register_activation_hook(__FILE__, 'wpab_boilerplate_activate');
register_deactivation_hook(__FILE__, 'wpab_boilerplate_deactivate');
/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
if (!function_exists('wpab_boilerplate_run')) {
	function wpab_boilerplate_run()
	{
		$plugin = \WpabBoilerplate\Core\Plugin::get_instance();
		add_action('plugins_loaded', array($plugin, 'run'));
	}
}
wpab_boilerplate_run();

function wpab_boilerplate_activate()
{
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	\WpabBoilerplate\Core\Activator::activate();
}

function wpab_boilerplate_deactivate()
{
	\WpabBoilerplate\Core\Deactivator::deactivate();
}
