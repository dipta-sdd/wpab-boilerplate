<?php

namespace WpabBoilerplate\Api;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The parent class of all API controllers for this plugin.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Api
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class ApiController extends WP_REST_Controller
{
	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   ApiController
	 * @access private
	 */
	private static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 */
	public $namespace = WPAB_BOILERPLATE_TEXT_DOMAIN . '/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 */
	public $version = 'v1';

	/**
	 * Whether the controller supports batching.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	protected $allow_batch = array('v1' => true);

	/**
	 * Constructor
	 *
	 * @since    1.0.0
	 */
	public function __construct() {}

	/**
	 * Initialize the class — registers REST routes.
	 */
	public function run()
	{
		add_action('rest_api_init', array($this, 'register_routes'));
	}

	/**
	 * Gets an instance of this object.
	 *
	 * @static
	 * @access public
	 * @return object
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
	 * Throw error on object clone
	 *
	 * @access public
	 * @return void
	 * @since 1.0.0
	 */
	public function __clone()
	{
		_doing_it_wrong(__FUNCTION__, esc_html__('Cloning is not allowed.', 'wpab-boilerplate'), '1.0.0');
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 1.0.0
	 */
	public function __wakeup()
	{
		_doing_it_wrong(__FUNCTION__, esc_html__('Unserializing is not allowed.', 'wpab-boilerplate'), '1.0.0');
	}

	/**
	 * Checks if a given request has access to read items.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has read access, WP_Error otherwise.
	 */
	public function get_item_permissions_check($request)
	{
		if (!current_user_can('manage_wpab_boilerplate')) {
			return new WP_Error(
				'rest_forbidden',
				__('Sorry, you are not allowed to access this resource.', 'wpab-boilerplate'),
				array('status' => rest_authorization_required_code())
			);
		}

		$nonce = $request->get_header('X-WP-Nonce');
		if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
			return new WP_Error('rest_nonce_invalid', __('The security token is invalid.', 'wpab-boilerplate'), array('status' => 403));
		}

		return true;
	}

	/**
	 * Checks if a given request has access to update items.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has update access, WP_Error otherwise.
	 */
	public function update_item_permissions_check($request)
	{
		if (!current_user_can('manage_wpab_boilerplate')) {
			return new WP_Error(
				'rest_forbidden',
				__('Sorry, you are not allowed to access this resource.', 'wpab-boilerplate'),
				array('status' => rest_authorization_required_code())
			);
		}

		$nonce = $request->get_header('X-WP-Nonce');

		if (!$nonce) {
			$nonce = isset($_REQUEST['_wpnonce']) ? sanitize_text_field(wp_unslash($_REQUEST['_wpnonce'])) : '';
		}

		if (!wp_verify_nonce($nonce, 'wp_rest')) {
			return new WP_Error(
				'rest_invalid_nonce',
				__('Invalid or missing nonce.', 'wpab-boilerplate'),
				array('status' => 403)
			);
		}

		return true;
	}
}
