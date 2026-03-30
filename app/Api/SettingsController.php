<?php

namespace OptionBay\Api;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

use OptionBay\Core\Settings;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * REST API controller for managing settings.
 *
 * @since      1.0.0
 * @package    WPAB_Boilerplate
 * @subpackage WPAB_Boilerplate/Api
 * @author     WPAnchorBay <wpanchorbay@gmail.com>
 */
class SettingsController extends ApiController
{
    /**
     * The single instance of the class.
     *
     * @since 1.0.0
     * @var   SettingsController
     * @access private
     */
    private static $instance = null;

    /**
     * Gets an instance of this object.
     *
     * @static
     * @access public
     * @return SettingsController
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
     * Register the routes for this controller.
     *
     * @since 1.0.0
     */
    public function register_routes()
    {
        $namespace = $this->namespace . $this->version;

        // GET endpoint: Retrieve settings
        register_rest_route($namespace, '/settings', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_settings'),
                'permission_callback' => array($this, 'get_item_permissions_check'),
            ),
        ));

        // POST endpoint: Update settings
        register_rest_route($namespace, '/settings', array(
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'update_settings'),
                'permission_callback' => array($this, 'update_item_permissions_check'),
            ),
        ));
    }

    /**
     * Handle GET request for settings.
     *
     * @since 1.0.0
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function get_settings($request)
    {
        optionbay_log('SettingsController: Fetching plugin settings.', 'DEBUG');
        $settings = Settings::get_instance()->get_settings();

        return new WP_REST_Response(array(
            'success' => true,
            'data'    => $settings,
        ), 200);
    }

    /**
     * Handle POST request to update settings.
     *
     * @since 1.0.0
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function update_settings($request)
    {
        optionbay_log('SettingsController: Updating plugin settings.', 'INFO');
        
        $validated = $this->validate($request, array(
            'global_enableFeature'          => 'required|boolean',
            'global_exampleText'            => 'required|min:1|max:255',
            'advanced_deleteAllOnUninstall' => 'required|boolean',
            'debug_enableMode'              => 'required|boolean',
        ));

        if (is_wp_error($validated)) {
            return $validated;
        }

        $settings_instance = Settings::get_instance();
        $settings_instance->update_settings($validated);

        return new WP_REST_Response(array(
            'success' => true,
            'message' => __('Settings updated successfully.', 'optionbay'),
            'data'    => $settings_instance->get_settings(),
        ), 200);
    }
}
