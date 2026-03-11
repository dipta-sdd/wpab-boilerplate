# WPAB Boilerplate (Classic & Modern)

A comprehensive, production-ready WordPress plugin boilerplate that bridges the gap between modern React/TypeScript development and native WordPress/WooCommerce aesthetics.

## Core Philosophy
This boilerplate is designed to provide everything you need to build a complex, scalable WordPress plugin. It offers a robust, Object-Oriented PHP backend and a powerful React single-page application (SPA) frontend. Uniquely, it provides **two distinct UI component libraries**: one for modern, custom dashboard interfaces, and another designed specifically to blend seamlessly into native WordPress and WooCommerce settings pages.

---

## 🚀 Key Features

### Robust PHP Backend Architecture
- **OOP Structure & Autoloading**: PSR-4 compliant namespace-to-directory autoloading.
- **Base Singleton Pattern (`Base.php`)**: A reliable singleton abstract class that manages instance creation and automatic hook registration.
- **REST API Infrastructure (`ApiController.php`)**: Secure, extendable base controllers with built-in permission checks and namespace management.
- **Cron Job Manager (`Cron.php`)**: A highly robust API for scheduling, managing, and executing background tasks dynamically.
- **Settings API (`Settings.php`)**: Streamlined abstraction over the WordPress Settings API.
- **Database Orchestration (`DbManager.php`)**: Automated custom table creation and structure updates via `dbDelta()`.
- **Database Logger (`Logger.php`)**: Custom database table logging equipped with JSON context and log-level filtering.
- **White Label Ready**: Fully filterable plugin name, slugs, icons, and URLs via `functions.php`.

### Modern React / TypeScript Frontend
- **SPA Architecture**: Powered by React 18+ and `react-router-dom` for fluid navigation within the WP admin.
- **Dual Component Libraries**:
    - **`common` (Modern UI)**: 30+ reusable Tailwind CSS components (Modals, Toasts, MultiSelects, Steppers, etc.) designed for custom, app-like interfaces.
    - **`classics` (Native UI)**: 10+ components (`ClassicInput`, `ClassicSettingsTable`, `ClassicRepeater`) built to 1:1 match native WooCommerce and WordPress settings aesthetics.
- **Tailwind CSS Integration**: Fully configured Tailwind setup using a custom `wpab-` prefix to prevent style bleed.
- **Preflight Conflict Mitigation**: Custom `wpab-ignore-preflight` guard class integrated into `index.scss` to allow Tailwind usage without destroying native WP/WC typography and input styles.
- **State Management**: React Context stores integrated with `wp_localize_script` data bridges.
- **Production Build System**: Powered by `@wordpress/scripts` (Webpack) for modern and legacy JS builds.

---

## 📁 Directory Structure

``` text
wpab-boilerplate-classic/
├── wpab-boilerplate.php        # Plugin bootstrap, constants & autoloader
├── uninstall.php               # Cleanup routines on plugin deletion
├── app/                        # PHP Backend Application
│   ├── Admin/Admin.php         # Admin menu & localized script enqueuing
│   ├── Api/                    # REST API Controllers (LogController, SettingsController)
│   ├── Core/                   # Core mechanics (Plugin, Base, Cron, Settings, Activator)
│   ├── Data/DbManager.php      # Custom table schemas
│   ├── Helper/Loader,Logger    # Hook queues and custom logging
│   └── functions.php           # Global helper functions & white label filters
├── src/                        # React / TypeScript Frontend
│   ├── index.tsx               # JS Entry point
│   ├── App.tsx                 # Router & provider wrappers
│   ├── pages/                  # Route views (Dashboard, ClassicShowcase, etc.)
│   ├── components/
│   │   ├── common/             # Modern, Tailwind-powered UI components
│   │   └── classics/           # Native WP/WooCommerce style components
│   ├── store/                  # React Context definitions
│   └── styles/                 # Scoped SCSS, Tailwind configuration, & preflight guards
├── build/                      # Compiled JS/CSS output (generated)
├── assets/                     # Static media
└── languages/                  # i18n translation strings
```

---

## 🛠 Getting Started

### 1. Clone & Rename
Use this repository as a template for your new plugin.
```bash
git clone <repo_url> your-plugin-name
cd your-plugin-name
```

### 2. Global Find & Replace
To white-label the boilerplate, replace these identifier strings throughout the entire codebase:

| Find String                 | Replace With (Example) | Context                     |
| --------------------------- | ---------------------- | --------------------------- |
| `WpabBoilerplate`           | `YourNamespace`        | PHP Namespaces              |
| `WPAB_BOILERPLATE_`         | `YOUR_PLUGIN_`         | PHP Constants               |
| `wpab-boilerplate`          | `your-plugin-slug`     | Text domains, URLs, Classes |
| `wpab_boilerplate`          | `your_plugin_slug`     | PHP Variable/Option names   |
| `wpabBoilerplate`           | `yourPlugin`           | JS Globals                  |
| `WPAB Boilerplate`          | `Your Plugin Title`    | UI Text                     |
| `wpab-`                     | `yourprefix-`          | Tailwind CSS Prefix         |

### 3. Install Dependencies
```bash
npm install
composer install # (If dependencies are added later)
```

### 4. Development Workflow
Launch the Webpack dev server with hot-reload capabilities:
```bash
npm run start
```
*Note: Make sure your local WordPress environment has `SCRIPT_DEBUG` set to `true` to load the development assets.*

### 5. Production Build
Compile minified, optimized JS/CSS assets into the `/build` directory:
```bash
npm run build
```

---

## 🎨 Working with UI Components

### When to use `common` vs `classics`?
- **Use `common`** when building a standalone dashboard page (like an Analytics tab or a visual dragging builder) where you want complete control over the modern, app-like aesthetic.
- **Use `classics`** when building setting form pages that need to sit alongside WooCommerce settings natively. These components utilize core WP classes (`form-table`, `regular-text`) and intentionally bypass Tailwind's global property resets to ensure they look 100% native.

### Preserving Native Styles
If you are writing custom HTML alongside Tailwind classes and notice native WordPress styles breaking (like `h2` sizing or link styling), add the `wpab-ignore-preflight` class to the element to bypass the Tailwind CSS reset.

---

## ⚙️ Requirements

- WordPress 5.6+
- PHP 7.0+
- Node.js 18+

## 📄 License
GPLv2 or later.
