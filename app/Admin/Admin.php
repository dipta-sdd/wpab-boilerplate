<?php

namespace WpabBoilerplate\Admin;

use WpabBoilerplate\Core\Common;

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
		static $instance = null;
		if (null === self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Add Admin Page Menu page.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
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
			'plugin_name' => esc_html__('WPAB Boilerplate', 'wpab-boilerplate'),
			'short_name'  => esc_html__('WPAB Boilerplate', 'wpab-boilerplate'),
			'menu_label'  => esc_html__('WPAB Boilerplate', 'wpab-boilerplate'),
			'custom_icon' => WPAB_BOILERPLATE_URL . 'assets/img/icon.svg',
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
		$plugin_data = $this->get_plugin_data();
		$this->menu_info = array(
			'page_title' => $plugin_data['plugin_name'],
			'menu_title' => $plugin_data['menu_label'],
			'menu_slug'  => WPAB_BOILERPLATE_PLUGIN_NAME,
			'icon_url'   => $plugin_data['menu_icon'],
			'position'   => $plugin_data['position'],
			'docs_uri'   => $plugin_data['docs_uri'],
		);

		add_menu_page(
			$this->menu_info['page_title'],
			$this->menu_info['menu_title'],
			'manage_wpab_boilerplate',
			$this->menu_info['menu_slug'],
			array($this, 'add_setting_root_div'),
			$this->menu_info['icon_url'],
			$this->menu_info['position'],
		);

		add_submenu_page(
			$this->menu_info['menu_slug'],
			$this->menu_info['page_title'],
			esc_html__('Dashboard', 'wpab-boilerplate'),
			'manage_wpab_boilerplate',
			WPAB_BOILERPLATE_TEXT_DOMAIN,
			array($this, 'add_setting_root_div')
		);

		$submenu_pages = array(
			array(
				'menu_title' => 'Settings',
				'menu_slug'  => '#/settings',
			),
		);

		foreach ($submenu_pages as $submenu_page) {
			add_submenu_page(
				$this->menu_info['menu_slug'],
				esc_html($submenu_page['menu_title'] . ' - ' . $this->menu_info['page_title']),
				$submenu_page['menu_title'],
				'manage_wpab_boilerplate',
				WPAB_BOILERPLATE_TEXT_DOMAIN . $submenu_page['menu_slug'],
				array($this, 'add_setting_root_div')
			);
		}
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
		$admin_scripts_bases = array('toplevel_page_' . WPAB_BOILERPLATE_PLUGIN_NAME);
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
		echo '<div id="' . esc_attr(WPAB_BOILERPLATE_PLUGIN_NAME) . '">
			<div class="wpab-loader-container">
				<p>' . esc_html__('Loading...', 'wpab-boilerplate') . '</p>
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

		$deps_file = WPAB_BOILERPLATE_PATH . 'build/admin.asset.php';
		$dependency = array('wp-i18n');
		$version = WPAB_BOILERPLATE_VERSION;
		if (file_exists($deps_file)) {
			$deps_file = require $deps_file;
			$dependency = $deps_file['dependencies'];
			$version = $deps_file['version'];
		}

		/**
		 * Filters the URL of the main admin JavaScript file.
		 *
		 * @since 1.0.0
		 * @hook wpab_boilerplate_admin_script
		 * @param string $script_url The URL to the admin.js file.
		 */
		$admin_script = apply_filters('wpab_boilerplate_admin_script', WPAB_BOILERPLATE_URL . 'build/admin.js');
		wp_enqueue_script(WPAB_BOILERPLATE_PLUGIN_NAME, $admin_script, $dependency, $version, true);

		/**
		 * Filters the URL of the main admin CSS file.
		 *
		 * @since 1.0.0
		 * @hook wpab_boilerplate_admin_css
		 * @param string $style_url The URL to the admin.css file.
		 */
		$admin_css = apply_filters('wpab_boilerplate_admin_css', WPAB_BOILERPLATE_URL . 'build/admin.css');
		wp_enqueue_style(WPAB_BOILERPLATE_PLUGIN_NAME, $admin_css, array(), $version);
		wp_style_add_data(WPAB_BOILERPLATE_PLUGIN_NAME, 'rtl', 'replace');

		/**
		 * Filters the data passed from PHP to the main admin JavaScript application.
		 *
		 * @since 1.0.0
		 * @hook wpab_boilerplate_admin_localize
		 * @param array $localize An associative array of data to be passed to JS.
		 * @return array The filtered localization data array.
		 */
		$localize = apply_filters(
			'wpab_boilerplate_admin_localize',
			array(
				'version'     => $version,
				'root_id'     => WPAB_BOILERPLATE_PLUGIN_NAME,
				'nonce'       => wp_create_nonce('wp_rest'),
				'store'       => WPAB_BOILERPLATE_PLUGIN_NAME,
				'rest_url'    => get_rest_url(),
				'pluginData'  => $this->get_plugin_data(),
				'wpSettings'  => array(
					'dateFormat' => get_option('date_format'),
					'timeFormat' => get_option('time_format'),
				),
				'plugin_settings' => Common::get_instance()->get_settings()
			)
		);

		wp_localize_script(WPAB_BOILERPLATE_PLUGIN_NAME, 'wpabBoilerplate_Localize', $localize);

		$path_to_check = WPAB_BOILERPLATE_PATH . 'languages';
		wp_set_script_translations(
			WPAB_BOILERPLATE_PLUGIN_NAME,
			'wpab-boilerplate',
			$path_to_check
		);
	}

	/**
	 * Get settings schema.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array settings schema for this plugin.
	 */
	public function get_settings_schema()
	{
		/**
		 * Filters the settings schema for the plugin.
		 *
		 * @since 1.0.0
		 * @hook wpab_boilerplate_options_properties
		 * @param array $setting_properties The associative array of setting properties.
		 * @return array The filtered array of setting properties.
		 */
		$setting_properties = apply_filters(
			'wpab_boilerplate_options_properties',
			array(
				'global_enableFeature' => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'global_exampleText' => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'default'           => 'Hello from WPAB Boilerplate!',
				),
				'debug_enableMode' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'advanced_deleteAllOnUninstall' => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
		);

		return array(
			'type'       => 'object',
			'properties' => $setting_properties,
		);
	}

	/**
	 * Register settings.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function register_settings()
	{
		$defaults = Common::get_instance()->get_default_settings();

		register_setting(
			'wpab_boilerplate_settings_group',
			WPAB_BOILERPLATE_OPTION_NAME,
			array(
				'type'    => 'object',
				'default' => $defaults,
				'show_in_rest' => array(
					'schema' => $this->get_settings_schema(),
				),
				'sanitize_callback' => array($this, 'sanitize_settings_object'),
			)
		);
	}

	/**
	 * Custom sanitization callback for the main settings object.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param array $input The raw array of settings data submitted for saving.
	 * @return array The sanitized array of settings data.
	 */
	public function sanitize_settings_object($input)
	{
		$schema = $this->get_settings_schema();
		$properties = $schema['properties'] ?? array();
		$default_options = Common::get_instance()->get_default_settings();
		$sanitized_output = get_option(WPAB_BOILERPLATE_OPTION_NAME, $default_options);

		foreach ($properties as $key => $details) {
			if (!isset($input[$key])) {
				continue;
			}

			$value = $input[$key];
			$type = $details['type'] ?? 'string';

			switch ($type) {
				case 'boolean':
					$sanitized_output[$key] = (bool) $value;
					break;
				case 'integer':
					$sanitized_output[$key] = absint($value);
					break;
				case 'string':
					$sanitized_output[$key] = sanitize_text_field($value);
					break;
				default:
					$sanitized_output[$key] = sanitize_text_field($value);
					break;
			}
		}

		return $sanitized_output;
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
		$actions[] = '<a href="' . esc_url(menu_page_url($this->menu_info['menu_slug'], false)) . '">' . esc_html__('Settings', 'wpab-boilerplate') . '</a>';
		return $actions;
	}
}
