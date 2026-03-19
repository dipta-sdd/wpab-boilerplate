<?php

namespace OptionBay\Api;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use OptionBay\Core\AddonGroup;
use OptionBay\Data\DbManager;

/**
 * REST API controller for Option Groups (CRUD + assignment sync).
 *
 * Endpoints:
 *   GET    /optionbay/v1/groups         - List all groups
 *   GET    /optionbay/v1/groups/{id}    - Get single group
 *   POST   /optionbay/v1/groups         - Create group
 *   PUT    /optionbay/v1/groups/{id}    - Update group
 *   DELETE /optionbay/v1/groups/{id}    - Delete group
 *
 * @since      1.0.0
 * @package    OptionBay
 * @subpackage OptionBay/Api
 */
class AddonGroupController extends ApiController
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   AddonGroupController
	 * @access private
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @static
	 * @access public
	 * @return AddonGroupController
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
	 * Register REST routes for option groups.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_routes()
	{
		$namespace = $this->namespace . $this->version;

		// GET /groups (list all)
		register_rest_route($namespace, '/groups', array(
			array(
				'methods'             => 'GET',
				'callback'            => array($this, 'get_items'),
				'permission_callback' => array($this, 'get_item_permissions_check'),
				'args'                => array(
					'page' => array(
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'default'           => 20,
						'sanitize_callback' => 'absint',
					),
					'search' => array(
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'status' => array(
						'default'           => 'any',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			),
			// POST /groups (create)
			array(
				'methods'             => 'POST',
				'callback'            => array($this, 'create_item'),
				'permission_callback' => array($this, 'update_item_permissions_check'),
			),
		));

		// GET/PUT/DELETE /groups/{id}
		register_rest_route($namespace, '/groups/(?P<id>\d+)', array(
			array(
				'methods'             => 'GET',
				'callback'            => array($this, 'get_item'),
				'permission_callback' => array($this, 'get_item_permissions_check'),
				'args'                => array(
					'id' => array(
						'validate_callback' => function ($param) {
							return is_numeric($param) && $param > 0;
						},
					),
				),
			),
			array(
				'methods'             => 'PUT',
				'callback'            => array($this, 'update_item'),
				'permission_callback' => array($this, 'update_item_permissions_check'),
				'args'                => array(
					'id' => array(
						'validate_callback' => function ($param) {
							return is_numeric($param) && $param > 0;
						},
					),
				),
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => array($this, 'delete_item'),
				'permission_callback' => array($this, 'update_item_permissions_check'),
				'args'                => array(
					'id' => array(
						'validate_callback' => function ($param) {
							return is_numeric($param) && $param > 0;
						},
					),
				),
			),
		));
	}

	/**
	 * List all option groups with pagination.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items($request)
	{
		$page     = $request->get_param('page');
		$per_page = min($request->get_param('per_page'), 100);
		$search   = $request->get_param('search');
		$status   = $request->get_param('status');

		$args = array(
			'post_type'      => AddonGroup::POST_TYPE,
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		// Status filter
		if ($status !== 'any') {
			$args['post_status'] = $status;
		} else {
			$args['post_status'] = array('publish', 'draft');
		}

		// Search filter
		if (!empty($search)) {
			$args['s'] = $search;
		}

		$query = new \WP_Query($args);
		$items = array();

		$db = DbManager::get_instance();

		foreach ($query->posts as $post) {
			$schema = json_decode(get_post_meta($post->ID, AddonGroup::META_SCHEMA, true), true);
			$settings = json_decode(get_post_meta($post->ID, AddonGroup::META_SETTINGS, true), true);
			$assignments = $db->get_assignments_for_group($post->ID);

			$items[] = array(
				'id'           => $post->ID,
				'title'        => $post->post_title,
				'status'       => $post->post_status,
				'field_count'  => is_array($schema) ? count($schema) : 0,
				'settings'     => is_array($settings) ? $settings : AddonGroup::get_default_settings(),
				'assignments'  => is_array($assignments) ? $assignments : array(),
				'date_created' => $post->post_date,
				'date_modified' => $post->post_modified,
			);
		}

		return new WP_REST_Response(array(
			'items'       => $items,
			'total'       => (int) $query->found_posts,
			'total_pages' => (int) $query->max_num_pages,
			'page'        => (int) $page,
			'per_page'    => (int) $per_page,
		), 200);
	}

	/**
	 * Get a single option group by ID.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item($request)
	{
		$id = absint($request->get_param('id'));
		$post = get_post($id);

		if (!$post || $post->post_type !== AddonGroup::POST_TYPE) {
			return new WP_Error(
				'not_found',
				__('Option group not found.', 'optionbay'),
				array('status' => 404)
			);
		}

		$schema = json_decode(get_post_meta($id, AddonGroup::META_SCHEMA, true), true);
		$settings = json_decode(get_post_meta($id, AddonGroup::META_SETTINGS, true), true);
		$assignments = DbManager::get_instance()->get_assignments_for_group($id);

		return new WP_REST_Response(array(
			'id'           => $post->ID,
			'title'        => $post->post_title,
			'status'       => $post->post_status,
			'schema'       => is_array($schema) ? $schema : array(),
			'settings'     => is_array($settings) ? $settings : AddonGroup::get_default_settings(),
			'assignments'  => is_array($assignments) ? $assignments : array(),
			'date_created' => $post->post_date,
			'date_modified' => $post->post_modified,
		), 200);
	}

	/**
	 * Create a new option group.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item($request)
	{
		$body = $request->get_json_params();

		$title = sanitize_text_field($body['title'] ?? __('Untitled Option Group', 'optionbay'));
		$schema = $body['schema'] ?? array();
		$settings = $body['settings'] ?? AddonGroup::get_default_settings();
		$assignments = $body['assignments'] ?? array();
		$status = sanitize_text_field($body['status'] ?? 'publish');

		// Validate schema is an array
		if (!is_array($schema)) {
			return new WP_Error(
				'invalid_schema',
				__('Schema must be an array of field definitions.', 'optionbay'),
				array('status' => 400)
			);
		}

		// Sanitize the schema fields
		$schema = $this->sanitize_schema($schema);

		// Create the CPT post
		$post_id = wp_insert_post(array(
			'post_type'   => AddonGroup::POST_TYPE,
			'post_title'  => $title,
			'post_status' => in_array($status, array('publish', 'draft'), true) ? $status : 'publish',
		), true);

		if (is_wp_error($post_id)) {
			return new WP_Error(
				'create_failed',
				__('Failed to create option group.', 'optionbay'),
				array('status' => 500)
			);
		}

		// Save schema and settings as post meta
		update_post_meta($post_id, AddonGroup::META_SCHEMA, wp_json_encode($schema));
		update_post_meta($post_id, AddonGroup::META_SETTINGS, wp_json_encode($settings));

		// Sync assignments
		if (!empty($assignments) && is_array($assignments)) {
			DbManager::get_instance()->sync_assignments($post_id, $assignments);
		}

		// Invalidate cache
		$this->invalidate_cache($post_id);

		return new WP_REST_Response(array(
			'success' => true,
			'id'      => $post_id,
			'message' => __('Option group created successfully.', 'optionbay'),
		), 201);
	}

	/**
	 * Update an existing option group.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item($request)
	{
		$id = absint($request->get_param('id'));
		$post = get_post($id);

		if (!$post || $post->post_type !== AddonGroup::POST_TYPE) {
			return new WP_Error(
				'not_found',
				__('Option group not found.', 'optionbay'),
				array('status' => 404)
			);
		}

		$body = $request->get_json_params();

		// Update title if provided
		if (isset($body['title'])) {
			wp_update_post(array(
				'ID'         => $id,
				'post_title' => sanitize_text_field($body['title']),
			));
		}

		// Update status if provided
		if (isset($body['status'])) {
			$new_status = sanitize_text_field($body['status']);
			if (in_array($new_status, array('publish', 'draft'), true)) {
				wp_update_post(array(
					'ID'          => $id,
					'post_status' => $new_status,
				));
			}
		}

		// Update schema if provided
		if (isset($body['schema']) && is_array($body['schema'])) {
			$schema = $this->sanitize_schema($body['schema']);
			update_post_meta($id, AddonGroup::META_SCHEMA, wp_json_encode($schema));
		}

		// Update settings if provided
		if (isset($body['settings'])) {
			update_post_meta($id, AddonGroup::META_SETTINGS, wp_json_encode($body['settings']));
		}

		// Sync assignments (delete & re-insert)
		if (isset($body['assignments']) && is_array($body['assignments'])) {
			DbManager::get_instance()->sync_assignments($id, $body['assignments']);
		}

		// Invalidate cache
		$this->invalidate_cache($id);

		return new WP_REST_Response(array(
			'success'  => true,
			'id'       => $id,
			'message'  => __('Option group updated successfully.', 'optionbay'),
			'modified' => current_time('mysql'),
		), 200);
	}

	/**
	 * Delete an option group and its assignments.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item($request)
	{
		$id = absint($request->get_param('id'));
		$post = get_post($id);

		if (!$post || $post->post_type !== AddonGroup::POST_TYPE) {
			return new WP_Error(
				'not_found',
				__('Option group not found.', 'optionbay'),
				array('status' => 404)
			);
		}

		// Delete assignments from lookup table
		DbManager::get_instance()->delete_assignments_for_group($id);

		// Delete the CPT post and its meta
		wp_delete_post($id, true);

		// Invalidate cache
		$this->invalidate_cache($id);

		return new WP_REST_Response(array(
			'success' => true,
			'message' => __('Option group deleted successfully.', 'optionbay'),
		), 200);
	}

	/**
	 * Sanitize the schema array.
	 *
	 * Ensures each field has required properties and sanitizes values.
	 *
	 * @since 1.0.0
	 * @param array $schema Raw schema array.
	 * @return array Sanitized schema.
	 */
	private function sanitize_schema($schema)
	{
		if (!is_array($schema)) {
			return array();
		}

		$allowed_types = array(
			'text', 'textarea', 'select', 'checkbox', 'radio', 'number',
			'file', 'email', 'date', 'time', 'color_swatch', 'image_swatch',
		);

		$allowed_price_types = array(
			'flat', 'percentage', 'character_count', 'quantity_multiplier', 'formula', 'none',
		);

		$sanitized = array();

		foreach ($schema as $field) {
			if (!is_array($field) || empty($field['id'])) {
				continue;
			}

			$clean_field = array(
				'id'          => sanitize_text_field($field['id']),
				'type'        => in_array($field['type'] ?? '', $allowed_types, true) ? $field['type'] : 'text',
				'label'       => sanitize_text_field($field['label'] ?? ''),
				'description' => sanitize_textarea_field($field['description'] ?? ''),
				'placeholder' => sanitize_text_field($field['placeholder'] ?? ''),
				'required'    => !empty($field['required']),
				'class_name'  => sanitize_html_class($field['class_name'] ?? ''),
				'price_type'  => in_array($field['price_type'] ?? 'none', $allowed_price_types, true)
					? ($field['price_type'] ?? 'none')
					: 'none',
				'price'       => floatval($field['price'] ?? 0),
				'weight'      => floatval($field['weight'] ?? 0),
			);

			// Sanitize options for select/radio/checkbox
			if (isset($field['options']) && is_array($field['options'])) {
				$clean_field['options'] = array();
				foreach ($field['options'] as $option) {
					if (!is_array($option)) {
						continue;
					}
					$clean_field['options'][] = array(
						'label'      => sanitize_text_field($option['label'] ?? ''),
						'value'      => sanitize_text_field($option['value'] ?? ''),
						'price_type' => in_array($option['price_type'] ?? 'flat', $allowed_price_types, true)
							? ($option['price_type'] ?? 'flat')
							: 'flat',
						'price'      => floatval($option['price'] ?? 0),
						'weight'     => floatval($option['weight'] ?? 0),
					);
				}
			}

			// Preserve type-specific settings
			if (isset($field['min_length'])) {
				$clean_field['min_length'] = absint($field['min_length']);
			}
			if (isset($field['max_length'])) {
				$clean_field['max_length'] = absint($field['max_length']);
			}
			if (isset($field['min_value'])) {
				$clean_field['min_value'] = floatval($field['min_value']);
			}
			if (isset($field['max_value'])) {
				$clean_field['max_value'] = floatval($field['max_value']);
			}
			if (isset($field['step'])) {
				$clean_field['step'] = floatval($field['step']);
			}
			if (isset($field['allowed_types'])) {
				$clean_field['allowed_types'] = sanitize_text_field($field['allowed_types']);
			}
			if (isset($field['max_file_size'])) {
				$clean_field['max_file_size'] = absint($field['max_file_size']);
			}

			// Sanitize conditional logic
			if (isset($field['conditions']) && is_array($field['conditions'])) {
				$clean_field['conditions'] = $this->sanitize_conditions($field['conditions']);
			} else {
				$clean_field['conditions'] = array(
					'status' => 'inactive',
				);
			}

			$sanitized[] = $clean_field;
		}

		return $sanitized;
	}

	/**
	 * Sanitize conditional logic block.
	 *
	 * @since 1.0.0
	 * @param array $conditions Raw conditions array.
	 * @return array Sanitized conditions.
	 */
	private function sanitize_conditions($conditions)
	{
		$clean = array(
			'status' => in_array($conditions['status'] ?? 'inactive', array('active', 'inactive'), true)
				? ($conditions['status'] ?? 'inactive')
				: 'inactive',
			'action' => in_array($conditions['action'] ?? 'show', array('show', 'hide'), true)
				? ($conditions['action'] ?? 'show')
				: 'show',
			'match'  => in_array($conditions['match'] ?? 'ALL', array('ALL', 'ANY'), true)
				? ($conditions['match'] ?? 'ALL')
				: 'ALL',
			'rules'  => array(),
		);

		if (isset($conditions['rules']) && is_array($conditions['rules'])) {
			$allowed_operators = array('==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains', 'empty', 'not_empty');

			foreach ($conditions['rules'] as $rule) {
				if (!is_array($rule) || empty($rule['target_field_id'])) {
					continue;
				}

				$clean['rules'][] = array(
					'target_field_id' => sanitize_text_field($rule['target_field_id']),
					'operator'        => in_array($rule['operator'] ?? '==', $allowed_operators, true)
						? ($rule['operator'] ?? '==')
						: '==',
					'value'           => sanitize_text_field($rule['value'] ?? ''),
				);
			}
		}

		return $clean;
	}

	/**
	 * Invalidate object cache for a group.
	 *
	 * @since 1.0.0
	 * @param int $group_id The Option Group post ID.
	 * @return void
	 */
	private function invalidate_cache($group_id)
	{
		wp_cache_delete('ob_schema_group_' . $group_id, 'optionbay');
		// Note: Product-level assignment caches are invalidated broadly
		// since we don't know which products are affected.
		wp_cache_flush_group('optionbay');
	}
}
