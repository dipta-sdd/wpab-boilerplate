<?php

namespace WpabBoilerplate\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

use WpabBoilerplate\Admin\Admin;
use WpabBoilerplate\Api\SampleController;
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
		// Initialize API controllers
		SampleController::get_instance()->run();

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
	private function define_admin_hooks()
	{
		$plugin_admin = Admin::get_instance();

		$this->loader->add_filter('all_plugins', $this, 'change_plugin_display_name');
		$this->loader->add_action('admin_menu', $plugin_admin, 'add_admin_menu');
		$this->loader->add_filter('admin_body_class', $plugin_admin, 'add_has_sticky_header');
		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_resources');

		/*Register Settings*/
		$this->loader->add_action('rest_api_init', $plugin_admin, 'register_settings');
		$this->loader->add_action('admin_init', $plugin_admin, 'register_settings');

		$plugin_basename = plugin_basename(WPAB_BOILERPLATE_PATH . 'wpab-boilerplate.php');
		$this->loader->add_filter('plugin_action_links_' . $plugin_basename, $plugin_admin, 'add_plugin_action_links', 10, 4);
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
