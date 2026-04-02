<?php
/**
 * Database Manager — Handles the creation and management of custom database tables.
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Data
 */

namespace OptionBay\Data;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles custom database logic.
 *
 * Manages the custom assignments lookup table and provides methods for
 * group-level data persistence and retrieval.
 *
 * @since 1.0.0
 */
class DbManager {

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
	public static function get_instance() {
		static $instance = null;
		if ( null === self::$instance ) {
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
	public function create_tables() {
		$this->create_assignments_table();
	}

	/**
	 * Get the assignments table name (with WP prefix).
	 *
	 * @since 1.0.0
	 * @return string
	 */
	public static function get_assignments_table() {
		global $wpdb;
		return $wpdb->prefix . '_assignments';
	}

	/**
	 * Create the assignments lookup table.
	 *
	 * This table routes Option Groups to Products, Categories, Tags, or Global scope.
	 * It uses indexed lookups to determine which groups apply to a given product page
	 * in milliseconds, even with thousands of products.
	 *
	 * @since 1.0.0
	 * @access private
	 */
	private function create_assignments_table() {
		global $wpdb;
		$table_name      = self::get_assignments_table();
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            group_id bigint(20) UNSIGNED NOT NULL,
            target_type varchar(20) NOT NULL DEFAULT 'global',
            target_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
            is_exclusion tinyint(1) NOT NULL DEFAULT 0,
            priority int(11) NOT NULL DEFAULT 10,
            PRIMARY KEY  (id),
            KEY group_id (group_id),
            KEY target_lookup (target_type, target_id, is_exclusion, priority)
        ) $charset_collate;";

		dbDelta( $sql );
	}

	/**
	 * Delete all assignment rows for a specific group.
	 *
	 * @since 1.0.0
	 * @param int $group_id The Option Group post ID.
	 * @return int|false Number of rows deleted, or false on error.
	 */
	public function delete_assignments_for_group( $group_id ) {
		global $wpdb;
		$table_name = self::get_assignments_table();

		return $wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$table_name,
			array( 'group_id' => absint( $group_id ) ),
			array( '%d' )
		);
	}

	/**
	 * Insert assignment rows for a group (bulk insert).
	 *
	 * Adds mapping rules to the custom assignments table to link an option group
	 * to specific global rules, products, categories, or tags.
	 *
	 * @since 1.0.0
	 * @param int   $group_id    The Option Group post ID.
	 * @param array $assignments Array of assignment arrays. Each with target_type, target_id, etc.
	 *                           - target_type: 'global', 'product', 'category', 'tag'
	 *                           - target_id: int (0 for global)
	 *                           - is_exclusion: bool
	 *                           - priority: int (optional, defaults to 10).
	 * @return int Number of rows safely inserted.
	 */
	public function insert_assignments( $group_id, $assignments ) {
		global $wpdb;
		$table_name = self::get_assignments_table();
		$inserted   = 0;

		foreach ( $assignments as $assignment ) {
			$result = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$table_name,
				array(
					'group_id'     => absint( $group_id ),
					'target_type'  => sanitize_text_field( $assignment['target_type'] ?? 'global' ),
					'target_id'    => absint( $assignment['target_id'] ?? 0 ),
					'is_exclusion' => ! empty( $assignment['is_exclusion'] ) ? 1 : 0,
					'priority'     => absint( $assignment['priority'] ?? 10 ),
				),
				array( '%d', '%s', '%d', '%d', '%d' )
			);

			if ( $result ) {
				++$inserted;
			} else {
				// Record error if insertion query fails
				optionbay_log( "Failed to insert assignment for group {$group_id} to {$assignment['target_type']}:{$assignment['target_id']}", 'ERROR' );
			}
		}

		optionbay_log( "Successfully inserted {$inserted} assignments for group {$group_id}", 'INFO' );

		return $inserted;
	}

	/**
	 * Sync assignments for a group (delete & re-insert atomically).
	 *
	 * @since 1.0.0
	 * @param int   $group_id    The Option Group post ID.
	 * @param array $assignments New assignments to insert.
	 * @return int Number of rows inserted.
	 */
	public function sync_assignments( $group_id, $assignments ) {
		$this->delete_assignments_for_group( $group_id );
		return $this->insert_assignments( $group_id, $assignments );
	}

	/**
	 * Get all assignments for a specific group.
	 *
	 * @since 1.0.0
	 * @param int $group_id The Option Group post ID.
	 * @return array
	 */
	public function get_assignments_for_group( $group_id ) {
		global $wpdb;
		$table_name = self::get_assignments_table();

		return $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT target_type, target_id, is_exclusion, priority FROM {$table_name} WHERE group_id = %d ORDER BY priority ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				absint( $group_id )
			),
			ARRAY_A
		);
	}

	/**
	 * Get active group IDs for a product.
	 *
	 * Queries the lookup table to find which Option Groups should be
	 * displayed on a given product page, considering product ID, its
	 * category IDs, tag IDs, and global assignments.
	 *
	 * @since 1.0.0
	 * @param int   $product_id  The WooCommerce product ID.
	 * @param array $category_ids Array of term IDs for the product's categories.
	 * @param array $tag_ids      Array of term IDs for the product's tags.
	 * @return array Ordered array of group IDs to display.
	 */
	public function get_groups_for_product( $product_id, $category_ids = array(), $tag_ids = array() ) {
		global $wpdb;
		$table_name = self::get_assignments_table();

		// Build target conditions
		$conditions = array();
		$values     = array();

		// Global assignments
		$conditions[] = "(target_type = 'global' AND target_id = 0)";

		// Product-specific
		$conditions[] = "(target_type = 'product' AND target_id = %d)";
		$values[]     = absint( $product_id );

		// Category assignments
		if ( ! empty( $category_ids ) ) {
			$cat_placeholders = implode( ',', array_fill( 0, count( $category_ids ), '%d' ) );
			$conditions[]     = "(target_type = 'category' AND target_id IN ({$cat_placeholders}))";
			foreach ( $category_ids as $cat_id ) {
				$values[] = absint( $cat_id );
			}
		}

		// Tag assignments
		if ( ! empty( $tag_ids ) ) {
			$tag_placeholders = implode( ',', array_fill( 0, count( $tag_ids ), '%d' ) );
			$conditions[]     = "(target_type = 'tag' AND target_id IN ({$tag_placeholders}))";
			foreach ( $tag_ids as $tag_id ) {
				$values[] = absint( $tag_id );
			}
		}

		$where_clause = implode( ' OR ', $conditions );

		// Get all matching assignments (inclusions and exclusions)
		$query = "SELECT group_id, is_exclusion, MIN(priority) as priority
                  FROM {$table_name}
                  WHERE ({$where_clause})
                  GROUP BY group_id, is_exclusion
                  ORDER BY priority ASC"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$results = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare( $query, $values ), // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			ARRAY_A
		);

		// Separate inclusions and exclusions by processing query results
		$included = array();
		$excluded = array();

		foreach ( $results as $row ) {
			$gid = (int) $row['group_id'];
			if ( 1 === (int) $row['is_exclusion'] ) {
				$excluded[ $gid ] = true;
			} else {
				$included[ $gid ] = (int) $row['priority'];
			}
		}

		// Remove excluded groups from the final inclusion list
		foreach ( $excluded as $gid => $val ) {
			unset( $included[ $gid ] );
		}

		// Sort by priority (ascending, where 1 > 10) and return group IDs
		asort( $included );
		$final_ids = array_keys( $included );

		optionbay_log( 'Resolved ' . count( $final_ids ) . " group(s) for product {$product_id}", 'DEBUG' );

		return $final_ids;
	}
}
