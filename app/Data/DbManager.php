<?php

/**
 * The Database Manager class.
 *
 * Handles the creation and management of the plugin's custom database tables.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Data
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */

namespace WpabBoilerplate\Data;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class DbManager
{
    /**
     * The single instance of the class.
     *
     * @since 1.0.0
     * @var   DbManager
     * @access private
     */
    private static $instance = null;

    /**
     * Gets an instance of this object.
     *
     * @static
     * @access public
     * @since 1.0.0
     * @return DbManager
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
     * Private constructor.
     *
     * @since 1.0.0
     * @access private
     */
    private function __construct() {}

    /**
     * Create all custom tables.
     *
     * @since 1.0.0
     */
    public function create_tables()
    {
        $this->create_example_table();
    }

    /**
     * Create an example items table.
     *
     * Demonstrates the pattern for creating custom tables.
     * Replace this with your own table schema.
     *
     * @since 1.0.0
     * @access private
     */
    private function create_example_table()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wpab_boilerplate_items';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            content longtext DEFAULT NULL,
            status varchar(20) NOT NULL DEFAULT 'draft',
            created_by bigint(20) UNSIGNED NOT NULL DEFAULT 0,
            date_created datetime NOT NULL,
            date_modified datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY status (status)
        ) $charset_collate;";

        dbDelta($sql);
    }
}
