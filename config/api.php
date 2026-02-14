<?php

/**
 * API Configuration
 *
 * Use this file to register your API controllers.
 * Each controller must extend WpabBoilerplate\Api\ApiController
 * and implement get_instance() and run().
 */

return array(
    \WpabBoilerplate\Api\SampleController::class,
    \WpabBoilerplate\Api\LogController::class,
);
