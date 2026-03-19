<?php

/**
 * Core Configuration
 *
 * Use this file to register your Core classes that need to be initialized.
 * Each class should implement a run($loader) method or similar logic
 * to register its hooks with the Loader.
 */

return array(
    \OptionBay\Admin\Admin::class,
    \OptionBay\Core\Settings::class,
    \OptionBay\Core\Cron::class,
    \OptionBay\Core\AddonGroup::class,
);
