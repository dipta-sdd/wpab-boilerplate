# WPAB Boilerplate

A modern WordPress plugin boilerplate with a React/TypeScript admin UI, REST API infrastructure, and modular PHP architecture.

## Features

- **PHP Autoloader** — PSR-4 style namespace-to-directory autoloading
- **Singleton Pattern** — `Base` class with reliable singleton + hook registration
- **REST API** — Base controller with permission checks + sample controller
- **Database Manager** — Custom table creation on activation via `dbDelta()`
- **Settings API** — WordPress Settings API integration with schema validation
- **White Label** — Fully filterable plugin name, icons, and URLs
- **Logger** — Custom database table logging with JSON context
- **React/TypeScript Admin** — SPA with `react-router-dom`, `@wordpress/scripts`, Tailwind CSS
- **Component Library** — 25+ reusable UI components (Button, Input, Select, Modal, Toast, etc.)
- **State Management** — React Context store with `wp_localize_script` data bridge
- **Dual Build** — Modern + legacy JS builds via webpack
- **i18n Ready** — Text domain and translation infrastructure

## Directory Structure

```
wpab-boilerplate/
├── wpab-boilerplate.php   # Plugin entry point, constants & autoloader
├── uninstall.php           # Cleanup on plugin deletion
├── app/
│   ├── Admin/Admin.php     # Admin menu, enqueue, settings
│   ├── Api/
│   │   ├── ApiController.php    # Base REST controller
│   │   └── SampleController.php # Example GET/POST endpoints
│   ├── Core/
│   │   ├── Plugin.php      # Main orchestrator
│   │   ├── Base.php        # Abstract singleton + hook manager
│   │   ├── Common.php      # Settings management
│   │   ├── Activator.php   # Runs on plugin activation
│   │   └── Deactivator.php # Runs on plugin deactivation
│   ├── Data/DbManager.php  # Custom table creation
│   ├── Helper/
│   │   ├── Loader.php      # Hook registration queue
│   │   └── Logger.php      # Database logging
│   └── functions.php       # Global helper functions & white label
├── src/                    # React/TypeScript source
│   ├── index.tsx           # Entry point
│   ├── App.tsx             # Router & providers
│   ├── pages/Dashboard.tsx # Example dashboard page
│   ├── components/common/  # Reusable UI components
│   ├── store/              # React Context state management
│   └── utils/              # Types, API fetch, date helpers
├── build/                  # Compiled output (generated)
├── assets/                 # Static assets (images, CSS)
└── languages/              # i18n translation files
```

## Getting Started

### 1. Clone & Rename

```bash
git clone <repo> your-plugin-name
cd your-plugin-name
```

### 2. Find & Replace

Replace the following strings throughout the project:

| Find                      | Replace With         |
| ------------------------- | -------------------- |
| `WpabBoilerplate`         | `YourNamespace`      |
| `WPAB_BOILERPLATE_`       | `YOUR_PLUGIN_`       |
| `wpab-boilerplate`        | `your-plugin-slug`   |
| `wpab_boilerplate`        | `your_plugin_slug`   |
| `wpabBoilerplate`         | `yourPlugin`         |
| `WPAB Boilerplate`        | `Your Plugin Name`   |
| `manage_wpab_boilerplate` | `manage_your_plugin` |

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run start    # Watch mode with hot reload
```

### 5. Build

```bash
npm run build    # Production build
```

## Requirements

- WordPress 5.6+
- PHP 7.0+
- Node.js 18+

## License

GPLv2 or later
