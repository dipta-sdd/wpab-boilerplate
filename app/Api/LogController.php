<?php

namespace WpabBoilerplate\Api;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * LogController class.
 *
 * @since 1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Api
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class LogController extends ApiController
{
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
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes()
    {
        wpab_boilerplate_log('Registering routes for LogController', 'error');


        $namespace = $this->namespace . $this->version;

        // GET endpoint: Retrieve sample data
        register_rest_route($namespace, '/logs', array(
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
            ),
        ));

        // POST endpoint: Create/update sample data
        register_rest_route($namespace, '/logs', array(
            array(
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => array($this, 'delete_items'),
                'permission_callback' => array($this, 'update_items_permissions_check'),
            ),
        ));
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool|WP_Error
     */
    public function get_items_permissions_check($request)
    {
        return current_user_can('manage_options');
    }

    /**
     * Check if a given request has access to delete items.
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool|WP_Error
     */
    public function update_items_permissions_check($request)
    {
        return current_user_can('manage_options');
    }

    /**
     * Get logs from file.
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response|WP_Error
     */
    public function get_items($request)
    {
        $upload_dir = wp_upload_dir();
        $log_dir = $upload_dir['basedir'] . '/' . WPAB_BOILERPLATE_TEXT_DOMAIN . '-logs/';

        // Find the most recent log file
        $files = glob($log_dir . 'plugin-log-*.log');
        if (empty($files)) {
            return rest_ensure_response(array('content' => ''));
        }

        // Sort by name desc (dates will sort correctly)
        rsort($files);
        $log_file = $files[0];

        if (!file_exists($log_file)) {
            return rest_ensure_response(array('content' => ''));
        }

        $content = file_get_contents($log_file);
        return rest_ensure_response(array('content' => $content));
    }

    /**
     * Clear logs.
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response|WP_Error
     */
    public function delete_items($request)
    {
        $upload_dir = wp_upload_dir();
        $log_dir = $upload_dir['basedir'] . '/' . WPAB_BOILERPLATE_TEXT_DOMAIN . '-logs/';

        // Delete all log files
        $files = glob($log_dir . 'plugin-log-*.log');
        if ($files) {
            foreach ($files as $file) {
                if (file_exists($file)) {
                    unlink($file);
                }
            }
        }

        return rest_ensure_response(array('success' => true));
    }
}
