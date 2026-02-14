<?php

namespace WpabBoilerplate\Core;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Fired during plugin deactivation.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Core
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class Deactivator
{
	/**
	 * Fired during plugin deactivation.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public static function deactivate()
	{
		self::remove_custom_capabilities();
	}

	/**
	 * Removes the custom plugin capabilities from all roles.
	 *
	 * @since 1.0.0
	 * @access private
	 * @return void
	 */
	private static function remove_custom_capabilities()
	{
		$roles = get_editable_roles();
		$custom_capability = 'manage_wpab_boilerplate';

		foreach ($roles as $role_name => $role_info) {
			$role = get_role($role_name);
			if ($role && $role->has_cap($custom_capability)) {
				$role->remove_cap($custom_capability);
			}
		}
	}
}
