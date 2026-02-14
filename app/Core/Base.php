<?php

namespace WpabBoilerplate\Core;

/**
 * The Base Hook Manager class.
 *
 * Provides a Singleton pattern that works correctly with inheritance and a system
 * for child classes to register their actions and filters.
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

abstract class Base
{
	/**
	 * An array of instances of the extending classes.
	 *
	 * @since 1.0.0
	 * @var   array
	 * @access private
	 */
	private static $instances = array();

	/**
	 * The array of hooks to be registered for a specific instance.
	 *
	 * @since 1.0.0
	 * @access protected
	 * @var array
	 */
	protected $hooks = array();

	/**
	 * Gets a single instance of the called class.
	 *
	 * @static
	 * @access public
	 * @since 1.0.0
	 * @return object The single instance of the calling class.
	 */
	public static function get_instance()
	{
		$class = static::class;
		if (!isset(self::$instances[$class])) {
			self::$instances[$class] = new static();
		}
		return self::$instances[$class];
	}

	/**
	 * Protected constructor to prevent direct creation of object.
	 *
	 * @since    1.0.0
	 */
	protected function __construct() {}

	/**
	 * Adds a new action to the hooks array.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function add_action($hook, $callback, $priority = 10, $accepted_args = 1)
	{
		$this->add_hook('action', $hook, $callback, $priority, $accepted_args);
	}

	/**
	 * Adds a new filter to the hooks array.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function add_filter($hook, $callback, $priority = 10, $accepted_args = 2)
	{
		$this->add_hook('filter', $hook, $callback, $priority, $accepted_args);
	}

	/**
	 * A private helper method to add hooks to the hooks array.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function add_hook($type, $hook, $callback, $priority, $accepted_args)
	{
		$this->hooks[] = array(
			'type' => $type,
			'hook' => $hook,
			'component' => $this,
			'callback' => $callback,
			'priority' => $priority,
			'accepted_args' => $accepted_args,
		);
	}

	/**
	 * Returns the complete array of hooks to be registered by the main loader.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return array
	 */
	public function get_hooks()
	{
		return $this->hooks;
	}

	/**
	 * Prevents the instance from being cloned.
	 *
	 * @since 1.0.0
	 */
	private function __clone() {}

	/**
	 * Prevents the instance from being unserialized.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup() {}
}
