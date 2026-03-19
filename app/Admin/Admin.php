<?php

namespace OptionBay\Admin;

use OptionBay\Core\Settings;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * The admin-specific functionality of the plugin.
 *
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Admin
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Admin
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   Admin
	 * @access private
	 */
	private static $instance = null;

	/**
	 * Menu info.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array
	 */
	private $menu_info;

	/**
	 * Gets an instance of this object.
	 *
	 * @access public
	 * @return Admin
	 * @since 1.0.0
	 */
	public static function get_instance()
	{
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Get plugin data (formerly white label options).
	 *
	 * @since 1.0.0
	 * @access private
	 * @return array
	 */
	private function get_plugin_data()
	{
		return array(
			'plugin_name' => esc_html__('OptionBay', 'optionbay'),
			'short_name'  => esc_html__('OptionBay', 'optionbay'),
			'menu_label'  => esc_html__('OptionBay', 'optionbay'),
			'custom_icon' => OPTIONBAY_URL . 'assets/img/icon.svg',
			'menu_icon'   => 'dashicons-admin-plugins',
			'author_name' => 'WP Anchor Bay',
			'author_uri'  => 'https://wpanchorbay.com',
			'support_uri' => 'https://wpanchorbay.com/support',
			'docs_uri'    => 'https://docs.wpanchorbay.com',
			'position'    => 57,
		);
	}

	/**
	 * Add Admin Page Menu page.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function add_admin_menu()
	{
		optionbay_log('Admin: Registering WPAB admin menu', 'INFO');
		$plugin_data = $this->get_plugin_data();

		// Define menu items
		$menu_items = array(
			array(
				'page_title' => $plugin_data['plugin_name'],
				'menu_title' => $plugin_data['menu_label'],
				'menu_slug'  => OPTIONBAY_PLUGIN_NAME,
				'icon_url'   => $plugin_data['custom_icon'],
				'position'   => $plugin_data['position'],
				'callback'   => array($this, 'add_setting_root_div'),
				'submenu'    => array(
					array(
						'menu_title' => esc_html__('Dashboard', 'optionbay'),
						'menu_slug'  => OPTIONBAY_PLUGIN_NAME,
						'callback'   => array($this, 'add_setting_root_div')
					),
					array(
						'menu_title' => esc_html__('Settings', 'optionbay'),
						'menu_slug'  => OPTIONBAY_PLUGIN_NAME . '#/settings',
						'callback'   => array($this, 'add_setting_root_div')
					),
					array(
						'menu_title' => esc_html__('Components', 'optionbay'),
						'menu_slug'  => OPTIONBAY_PLUGIN_NAME . '#/components-classic',
						'callback'   => array($this, 'add_setting_root_div')
					)
				)
			)
		);

		foreach ($menu_items as $item) {
			optionbay_log('Admin: Adding menu page: ' . $item['menu_title'], 'DEBUG');
			add_menu_page(
				$item['page_title'],
				$item['menu_title'],
				'manage_optionbay',
				$item['menu_slug'],
				$item['callback'],
				$item['icon_url'],
				$item['position']
			);

			if (!empty($item['submenu'])) {
				foreach ($item['submenu'] as $sub) {
					// The first submenu item should use the same slug as add_menu_page to override the default parent name
					add_submenu_page(
						$item['menu_slug'], // Parent slug
						$item['page_title'] . ' - ' . $sub['menu_title'], // Page title
						$sub['menu_title'],
						'manage_optionbay',
						$sub['menu_slug'],
						$sub['callback']
					);
				}
			}
		}

		// Store menu info for other methods
		$this->menu_info = array(
			'menu_slug' => OPTIONBAY_PLUGIN_NAME
		);

		// Add custom submenu under Products (simulating TubeBay)
		add_submenu_page(
			'edit.php?post_type=product',
			esc_html__('OptionBay', 'optionbay'),
			esc_html__('OptionBay', 'optionbay'),
			'manage_optionbay',
			'optionbay-redirect',
			array($this, 'redirect_to_dashboard')
		);
	}

	/**
	 * Redirect to the main dashboard.
	 *
	 * @return void
	 */
	public function redirect_to_dashboard()
	{
		$redirect_url = admin_url('admin.php?page=' . OPTIONBAY_PLUGIN_NAME);
		wp_safe_redirect($redirect_url);
		exit;
	}

	/**
	 * Check if current page is our menu page.
	 *
	 * @access public
	 * @since 1.0.0
	 * @return bool
	 */
	public function is_menu_page()
	{
		$screen = get_current_screen();
		$admin_scripts_bases = array(
			'toplevel_page_' . OPTIONBAY_PLUGIN_NAME,
			'product_page_' . OPTIONBAY_PLUGIN_NAME, // Match TubeBay
		);
		if (!(isset($screen->base) && in_array($screen->base, $admin_scripts_bases, true))) {
			return false;
		}
		return true;
	}

	/**
	 * Add has sticky header class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string $classes The classes.
	 * @return string
	 */
	public function add_has_sticky_header($classes)
	{
		if ($this->is_menu_page()) {
			$classes .= ' at-has-hdr-stky ';
		}
		return $classes;
	}

	/**
	 * Add setting root div.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function add_setting_root_div()
	{
		echo '<div id="' . esc_attr(OPTIONBAY_PLUGIN_NAME) . '">
			<div class="wpab-loader-container">
				<p>' . esc_html__('Loading...', 'optionbay') . '</p>
			</div>
		</div>';
	}

	/**
	 * Enqueue resources.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function enqueue_resources()
	{
		if (!$this->is_menu_page()) {
			return;
		}

		optionbay_log('Admin: Enqueueing admin resources for WPAB menu page', 'DEBUG');

		$deps_file = OPTIONBAY_PATH . 'build/admin.asset.php';
		$dependency = array('wp-i18n');
		$version = OPTIONBAY_VERSION;
		if (file_exists($deps_file)) {
			$deps_file = require $deps_file;
			$dependency = $deps_file['dependencies'];
			$version = $deps_file['version'];
			optionbay_log('Admin: Loaded exact build dependencies: ' . wp_json_encode($dependency), 'DEBUG');
		} else {
			optionbay_log('Admin: Build asset file not found; falling back to default dependencies', 'DEBUG');
		}

		/**
		 * Filters the URL of the main admin JavaScript file.
		 *
		 * @since 1.0.0
		 * @hook optionbay_admin_script
		 * @param string $script_url The URL to the admin.js file.
		 */
		$admin_script = apply_filters('optionbay_admin_script', OPTIONBAY_URL . 'build/admin.js');
		wp_enqueue_script(OPTIONBAY_PLUGIN_NAME, $admin_script, $dependency, $version, true);

		/**
		 * Filters the URL of the main admin CSS file.
		 *
		 * @since 1.0.0
		 * @hook optionbay_admin_css
		 * @param string $style_url The URL to the admin.css file.
		 */
		$admin_css = apply_filters('optionbay_admin_css', OPTIONBAY_URL . 'build/admin.css');
		wp_enqueue_style(OPTIONBAY_PLUGIN_NAME, $admin_css, array(), $version);
		wp_style_add_data(OPTIONBAY_PLUGIN_NAME, 'rtl', 'replace');

		/**
		 * Filters the data passed from PHP to the main admin JavaScript application.
		 *
		 * @since 1.0.0
		 * @hook optionbay_admin_localize
		 * @param array $localize An associative array of data to be passed to JS.
		 * @return array The filtered localization data array.
		 */
		$localize = apply_filters(
			'optionbay_admin_localize',
			array(
				'version'     => $version,
				'root_id'     => OPTIONBAY_PLUGIN_NAME,
				'nonce'       => wp_create_nonce('wp_rest'),
				'store'       => OPTIONBAY_PLUGIN_NAME,
				'rest_url'    => get_rest_url(),
				'pluginData'  => $this->get_plugin_data(),
				'wpSettings'  => array(
					'dateFormat' => get_option('date_format'),
					'timeFormat' => get_option('time_format'),
				),
				'plugin_settings' => \OptionBay\Core\Settings::get_instance()->get_settings(),
				'products_url'    => admin_url('edit.php?post_type=product'),
			)
		);

		wp_localize_script(OPTIONBAY_PLUGIN_NAME, 'wpabBoilerplate_Localize', $localize);

		$path_to_check = OPTIONBAY_PATH . 'languages';
		wp_set_script_translations(
			OPTIONBAY_PLUGIN_NAME,
			'optionbay',
			$path_to_check
		);
	}

	/**
	 * Add plugin action links.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string[] $actions     Plugin action links.
	 * @param string   $plugin_file Path to the plugin file.
	 * @param array    $plugin_data Plugin data.
	 * @param string   $context     The plugin context.
	 * @return array
	 */
	public function add_plugin_action_links($actions, $plugin_file, $plugin_data, $context)
	{
		$actions[] = '<a href="' . esc_url(menu_page_url($this->menu_info['menu_slug'], false)) . '">' . esc_html__('Settings', 'optionbay') . '</a>';
		return $actions;
	}
	
	/**
	 * Register the hooks for the admin area.
	 *
	 * @since    1.0.0
	 * @param    \OptionBay\Core\Plugin $plugin The Plugin instance.
	 * @return   void
	 */
	public function run($plugin)
	{
		$loader = $plugin->get_loader();
		$loader->add_filter('all_plugins', $plugin, 'change_plugin_display_name');
		$loader->add_action('admin_menu', $this, 'add_admin_menu');
		$loader->add_filter('admin_body_class', $this, 'add_has_sticky_header');
		$loader->add_action('admin_enqueue_scripts', $this, 'enqueue_resources');

		$plugin_basename = plugin_basename(OPTIONBAY_PATH . 'optionbay.php');
		$loader->add_filter('plugin_action_links_' . $plugin_basename, $this, 'add_plugin_action_links', 10, 4);
	}
}
