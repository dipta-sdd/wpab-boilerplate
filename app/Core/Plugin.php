<?php

namespace WpabBoilerplate\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

use WpabBoilerplate\Admin\Admin;
use WpabBoilerplate\Helper\Loader;

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Core
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Plugin
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   Plugin
	 * @access private
	 */
	private static $instance = null;

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * Get the instance of the Plugin class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return Plugin
	 */
	public static function get_instance()
	{
		static $instance = null;
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    1.0.0
	 * @access public
	 * @return void
	 */
	public function __construct()
	{
		$this->loader = Loader::get_instance();
		$this->define_core_hooks();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Register all of the hooks related to the core functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_core_hooks()
	{
		// Initialize API controllers from config
		$api_controllers = include WPAB_BOILERPLATE_PATH . 'config/api.php';
		error_log('API Controllers: ' . print_r($api_controllers, true));
		if (is_array($api_controllers)) {
			foreach ($api_controllers as $controller) {
				if (class_exists($controller) && method_exists($controller, 'get_instance')) {
					error_log('Registering controller: ' . $controller);
					add_action('rest_api_init', function () use ($controller) {
						error_log('Registering controller: ' . $controller);
						$controller::get_instance()->register_routes();
					});
				}
			}
		}

		// Register your custom hook-based components here.
		// Example:
		// $my_component = MyComponent::get_instance();
		// $components_with_hooks = array($my_component);
		//
		// foreach ($components_with_hooks as $component) {
		//     $hooks = $component->get_hooks();
		//     foreach ($hooks as $hook) {
		//         if ('action' === $hook['type']) {
		//             $this->loader->add_action($hook['hook'], $component, $hook['callback'], $hook['priority'], $hook['accepted_args']);
		//         } elseif ('filter' === $hook['type']) {
		//             $this->loader->add_filter($hook['hook'], $component, $hook['callback'], $hook['priority'], $hook['accepted_args']);
		//         }
		//     }
		// }
	}

	/**
	 * Register all of the hooks related to the public area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_public_hooks()
	{
		if (is_admin()) {
			return;
		}
		// Enqueue the public CSS for the plugin.
		$this->loader->add_action(
			'wp_enqueue_scripts',
			$this,
			'enqueue_public_styles'
		);
	}

	/**
	 * Enqueue the public CSS for the plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return void
	 */
	public function enqueue_public_styles()
	{
		wp_enqueue_style(WPAB_BOILERPLATE_OPTION_NAME . '_public', WPAB_BOILERPLATE_URL . 'assets/css/public.css', array(), WPAB_BOILERPLATE_VERSION);
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_admin_hooks()
	{
		// Initialize Core classes from config
		$core_classes = include WPAB_BOILERPLATE_PATH . 'config/core.php';
		if (is_array($core_classes)) {
			foreach ($core_classes as $class) {
				if (class_exists($class) && method_exists($class, 'get_instance')) {
					$instance = $class::get_instance();
					if (method_exists($instance, 'run')) {
						$instance->run($this);
					}
				}
			}
		}
	}

	/**
	 * Changes the plugin's display name on the plugins page.
	 *
	 * @since 1.0.0
	 * @param array $plugins The array of all plugin data.
	 * @return array The modified array of plugin data.
	 */
	public function change_plugin_display_name($plugins)
	{
		$plugin_basename = plugin_basename(WPAB_BOILERPLATE_PATH . 'wpab-boilerplate.php');

		if (isset($plugins[$plugin_basename])) {
			$plugins[$plugin_basename]['Name'] = 'WPAB Boilerplate';
		}

		return $plugins;
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 * @access public
	 * @return void
	 */
	public function run()
	{
		$this->loader->run();
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @access public
	 * @return    Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader()
	{
		return $this->loader;
	}
}
