<?php

namespace OptionBay\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use OptionBay\Helper\Logger;

/**
 * LogController class.
 *
 * Serves the merged last-30-days log content via the REST API.
 *
 * @since 1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Api
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class LogController extends ApiController {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'logs';

	/**
	 * Instance of this class.
	 *
	 * @var LogController
	 */
	protected static $instance = null;

	/**
	 * Get instance of this class.
	 *
	 * @return LogController
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		// GET endpoint: Retrieve merged logs for last 30 days
		register_rest_route(
			$namespace,
			'/logs',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
		);

		// DELETE endpoint: Clear all logs
		register_rest_route(
			$namespace,
			'/logs',
			array(
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_items' ),
					'permission_callback' => array( $this, 'update_items_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check if a given request has access to get items.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return bool|WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if a given request has access to delete items.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return bool|WP_Error
	 */
	public function update_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get merged logs from transient cache + today's file.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		optionbay_log( 'LogController: Fetching merged logs via REST API.', 'DEBUG' );

		$content = Logger::get_merged_logs();
		return rest_ensure_response( array( 'content' => $content ) );
	}

	/**
	 * Clear all logs and the transient cache.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_items( $request ) {
		optionbay_log( 'LogController: Emptying all aggregated logs via REST API.', 'WARNING' );
		$log_dir = Logger::get_log_dir();

		// Delete all log files
		$files = glob( $log_dir . 'plugin-log-*.log' );
		if ( $files ) {
			foreach ( $files as $file ) {
				if ( file_exists( $file ) ) {
					wp_delete_file( $file );
				}
			}
		}

		// Clear the transient cache
		delete_transient( \OptionBay\Core\Cron::LOG_CACHE_KEY );

		return rest_ensure_response( array( 'success' => true ) );
	}
}
