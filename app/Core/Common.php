<?php

namespace WpabBoilerplate\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * The common functionality of the plugin.
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Core
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Common
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var   Common
	 */
	private static $instance = null;

	/**
	 * The default settings of the plugin.
	 *
	 * Customize these defaults for your own plugin.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var   array
	 */
	private $default_settings = array(
		/*==================================================
		* Global Settings
		==================================================*/
		'global_enableFeature' => true,
		'global_exampleText'   => 'Hello from WPAB Boilerplate!',

		/*==================================================
		* Advanced Settings
		==================================================*/
		'advanced_deleteAllOnUninstall' => false,
		'debug_enableMode'             => false,
	);

	/**
	 * The settings of the plugin.
	 *
	 * @since 1.0.0
	 * @access private
	 * @var   array
	 */
	private $settings = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @access public
	 * @return Common
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
	 * Get the settings with caching.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string $key optional meta key.
	 * @return array|mixed|null
	 */
	public function get_settings($key = '')
	{
		if (!$this->settings) {
			$this->load_settings();
		}
		if (!empty($key)) {
			return isset($this->settings[$key]) ? $this->settings[$key] : false;
		}
		return $this->settings;
	}

	/**
	 * Get the default settings.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array
	 */
	public function get_default_settings()
	{
		return $this->default_settings;
	}

	/**
	 * Load the settings.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function load_settings()
	{
		$options = get_option(WPAB_BOILERPLATE_OPTION_NAME);
		if (!is_array($options)) {
			$options = array();
		}
		$default_settings = $this->get_default_settings();
		$settings = array_merge($default_settings, $options);
		$this->settings = $settings;
	}

	/**
	 * Update the settings.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string|array $key_or_data The key or data to update.
	 * @param string       $val         The value to update.
	 * @return void
	 */
	public function update_settings($key_or_data, $val = '')
	{
		if (is_string($key_or_data)) {
			$options = $this->get_settings();
			$options[$key_or_data] = $val;
		} else {
			$options = $key_or_data;
		}
		update_option(WPAB_BOILERPLATE_OPTION_NAME, $options);
		$this->load_settings();
	}
}
