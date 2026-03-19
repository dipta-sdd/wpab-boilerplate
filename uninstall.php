<?php

/**
 * Fired when the user clicks "Delete" for the plugin.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 */

// If uninstall not called from WordPress, then exit.
if (! defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

define('OPTIONBAY_OPTION_NAME', 'optionbay');
define('OPTIONBAY_TEXT_DOMAIN', 'optionbay');

optionbay_run_uninstall();

/**
 * The main controller function for the uninstallation process.
 *
 * @since 1.0.0
 */
function optionbay_run_uninstall()
{
	$options = get_option(OPTIONBAY_OPTION_NAME);

	// Only proceed if user opted in to delete all data.
	if (! empty($options['advanced_deleteAllOnUninstall']) && true === $options['advanced_deleteAllOnUninstall']) {
		optionbay_drop_custom_tables();
		optionbay_delete_plugin_options();
		optionbay_remove_capabilities();
	}
}

/**
 * Drop Custom Database Tables.
 *
 * @since 1.0.0
 */
function optionbay_drop_custom_tables()
{
	global $wpdb;

	$tables = array(
		$wpdb->prefix . 'optionbay_items',
	);

	foreach ($tables as $table) {
		$wpdb->query("DROP TABLE IF EXISTS {$table}"); // phpcs:ignore
	}
}

/**
 * Delete Plugin Options.
 *
 * @since 1.0.0
 */
function optionbay_delete_plugin_options()
{
	delete_option(OPTIONBAY_OPTION_NAME);
}

/**
 * Remove Custom Capabilities.
 *
 * @since 1.0.0
 */
function optionbay_remove_capabilities()
{
	$editable_roles = get_editable_roles();

	foreach ($editable_roles as $role_name => $role_info) {
		$role = get_role($role_name);
		if ($role && $role->has_cap('manage_optionbay')) {
			$role->remove_cap('manage_optionbay');
		}
	}
}
