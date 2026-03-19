<?php

/**
 * API Configuration
 *
 * Use this file to register your API controllers.
 * Each controller must extend OptionBay\Api\ApiController
 * and implement get_instance() and run().
 */

return array(
    \OptionBay\Api\SettingsController::class,
    \OptionBay\Api\LogController::class,
    \OptionBay\Api\AddonGroupController::class,
);
