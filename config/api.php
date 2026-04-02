<?php
/**
 * API Configuration
 *
 * Use this file to register your API controllers.
 * Each controller must extend OptionBay\Api\ApiController
 * and implement get_instance() and run().
 *
 * @since      1.0.0
 * @package    OptionBay
 */

return array(
	\OptionBay\Api\SettingsController::class,
	\OptionBay\Api\LogController::class,
	\OptionBay\Api\AddonGroupController::class,
	\OptionBay\Api\ResourceController::class,
);
