<?php

/**
 * Plugin Name:       OptionBay
 * Plugin URI:        https://wpanchorbay.com
 * Source URI:        https://github.com/dipta-sdd/optionbay
 * Description:       A modern WordPress plugin boilerplate with React/TypeScript admin UI, REST API, and modular PHP architecture.
 * Requires at least: 5.6
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Stable tag:        1.0.0
 * Author:            WPAnchorBay
 * Author URI:        https://wpanchorbay.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       optionbay
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

define('OPTIONBAY_PATH', plugin_dir_path(__FILE__));
define('OPTIONBAY_DIR', plugin_dir_path(__FILE__));
define('OPTIONBAY_URL', plugin_dir_url(__FILE__));
define('OPTIONBAY_VERSION', '1.0.0');
define('OPTIONBAY_PLUGIN_NAME', 'optionbay');
define('OPTIONBAY_TEXT_DOMAIN', 'optionbay');
define('OPTIONBAY_OPTION_NAME', 'optionbay');
define('OPTIONBAY_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('OPTIONBAY_DEV_MODE', true);

/**
 * Initialize Composer Autoloader.
 */
if (file_exists(OPTIONBAY_PATH . 'vendor/autoload.php')) {
	require_once OPTIONBAY_PATH . 'vendor/autoload.php';
}

require_once OPTIONBAY_PATH . 'app/functions.php';

register_activation_hook(__FILE__, 'optionbay_activate');
register_deactivation_hook(__FILE__, 'optionbay_deactivate');
/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
if (!function_exists('optionbay_run')) {
	function optionbay_run()
	{
		$plugin = \OptionBay\Core\Plugin::get_instance();
		add_action('plugins_loaded', array($plugin, 'run'));
	}
}
optionbay_run();

function optionbay_activate()
{
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	\OptionBay\Core\Activator::activate();
}

function optionbay_deactivate()
{
	\OptionBay\Core\Deactivator::deactivate();
}
