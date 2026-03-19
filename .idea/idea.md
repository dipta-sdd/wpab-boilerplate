### 1. High-Level Architecture Overview

The system is divided into four completely decoupled modules. This decoupling ensures that if you change how the admin UI looks, it doesn't break the cart calculation.

1.  **The Admin SPA (React):** A single-page application where store owners build forms and define display rules.
2.  **The REST API Bridge (PHP):** The communication layer that securely receives the Admin SPA's data and routes it to the database.
3.  **The Rendering & Processing Engine (PHP):** The core engine that outputs the forms on the product page and recalculates cart totals.
4.  **The Interactivity Engine (Vanilla JS):** A lightweight browser script that handles live pricing and conditional logic without reloading the page.

---

### 2. Data Storage Design (The Hybrid Model)

We are using a "Hybrid" database design to get the best of both Document Storage (NoSQL style) and Relational Storage (SQL style).

- **The Document Store (JSON in Post Meta):**
  Every Option Group is a Custom Post Type. The entire structure of the form (the fields, the choices, the prices, the math formulas, and the conditional logic rules) is stored as one massive JSON string.
  _Why?_ Because form structures are deeply nested and constantly changing. Storing them as JSON means you never have to alter database columns when you invent a new field type.
- **The Relational Router (Custom Lookup Table):**
  We use a custom SQL table strictly for routing. It contains just the Group ID, the Target (Product ID or Category ID), and whether it is an inclusion or exclusion.
  _Why?_ Because SQL is designed for fast mapping. When a product page loads, the system can instantly look up which JSON documents it needs to load in milliseconds.

---

### 3. Data Flow: Admin Building a Form

_How data moves when a store owner creates an option group:_

1.  **UI Interaction:** The user opens the React Builder (using your boilerplate's Classic components). They drag and drop a Text field and a Dropdown field into a group. They set a rule: "Only show this group on the T-Shirts category."
2.  **State Management:** The React Context API holds this entire configuration in a live JavaScript object.
3.  **Transmission:** When they click "Save," React fires a POST request to your custom REST API endpoint.
4.  **Database Sync:**
    - The REST API validates the permissions.
    - It saves the form configuration JSON into the Custom Post Type's meta.
    - It reads the "T-Shirts" assignment rule, deletes the old routing rows in the Lookup Table, and inserts the new routing rows.

---

### 4. Data Flow: Customer Viewing a Product

_How the system decides what to show a shopper:_

1.  **The Query:** The customer opens the "Blue Graphic Tee" product page. The PHP Rendering Engine asks the Lookup Table: _"Which groups are assigned to this specific product or its categories?"_
2.  **The Fetch:** The Lookup Table returns the IDs of the active groups. PHP fetches the JSON strings for those specific groups from the meta table.
3.  **The Factory Translation:** The PHP Engine passes the JSON through a "Field Factory." The Factory looks at the JSON `type` (e.g., `checkbox`), grabs the corresponding HTML template, and renders the fields onto the page.
4.  **The Hydration:** Before the page finishes loading, PHP prints the JSON schema directly into the browser's memory so the Interactivity Engine (JavaScript) knows the rules.

---

### 5. The Interactivity Engine (Frontend Logic)

_How the frontend reacts to user clicks instantly:_

1.  **Event Delegation:** A single JavaScript listener watches the entire WooCommerce cart form for any changes (clicks, typing, dropdown selections).
2.  **The Rules Evaluator:** When the customer clicks a checkbox, the Engine checks the hydrated JSON schema. It looks for any fields that have a "Condition" tied to that checkbox. It evaluates the logic (AND/OR) and dynamically hides or reveals the dependent fields.
3.  **The Math Calculator:** Immediately after evaluating logic, the Engine scans all currently _visible_ and _selected_ fields. It references the JSON for their price values, calculates the total extra cost, and updates the floating "Total Price" UI element on the screen.

---

### 6. The E-Commerce Pipeline (Cart & Checkout)

_How the system safely processes the money._ (Crucial: The frontend JS price is purely visual. The PHP backend recalculates everything for security).

1.  **Validation Stage:** The customer clicks "Add to Cart." WooCommerce sends the form data to PHP. The PHP Engine checks the submitted data against the JSON schema. If a field was marked `required` but is empty (or bypassed by a malicious user), it blocks the cart.
2.  **Session Stage:** The data is sanitized. The PHP Pricing Engine does the exact same math the frontend JS did (calculating flat fees, percentages, and weight modifiers). This final calculated data is saved securely into the WooCommerce Cart Session.
3.  **Mutation Stage:** Right before WooCommerce displays the cart totals to the user, your system intercepts the prices. It says, _"Take the base price of the Blue Tee, and add the Option total from the Session."_ WooCommerce updates the cart subtotal.
4.  **Permanent Storage Stage:** The customer pays. The system takes the customized options from the temporary Cart Session and saves them as permanent Order Meta. WooCommerce natively prints this Order Meta on receipts, emails, and the admin dashboard.

---

### 7. Scalability & Extensibility Design

The most important part of this system design is the **Open/Closed Principle**. The system is open for extension but closed for modification.

- **Adding a new Field Type (e.g., Image Cropper):** You only have to add the UI in the React builder and create one new translation class in the PHP Field Factory. The database, the cart pipeline, and the routing table do not change at all.
- **Adding a new Math Formula:** You add the formula logic to the frontend JS Calculator and the backend PHP Pricing Engine. The rest of the system remains untouched.

## PART 2: DATABASE SCHEMA & DATA MODELING

### 2.1 The Hybrid Data Strategy

To achieve high performance and infinite scalability for 30+ field types, the database uses a hybrid approach. Form configurations (which are complex and deeply nested) are stored as JSON documents. The assignment rules (where the form appears) are stored in a highly indexed Custom SQL Table to prevent slow database queries.

### 2.2 The Custom Post Type (Form Manager)

Every group of options created by a merchant is stored as a Custom Post Type.

- **Post Type Slug:** `wc_addon_group`
- **Visibility:** Excluded from frontend search, public queries, and archives (`public => false`, `show_ui => true`).
- **Post Title:** The internal name of the group (e.g., "Global Laptop Upgrades").
- **Post Meta (`_addon_schema`):** A single, heavily sanitized JSON string containing the entire form structure, fields, pricing rules, and intra-group conditional logic.
- **Post Meta (`_addon_settings`):** A JSON string containing group-level settings (e.g., display layout: accordion vs. flat, priority order, active status).

### 2.3 The Routing Engine (Custom SQL Lookup Table)

To assign an Option Group to 10,000 products instantly, we bypass `wp_postmeta` entirely for routing. The plugin will use `dbDelta()` on activation to create the following table:

**Table Name:** `wp_woo_addons_lookup`

| Column         | Type                  | Attributes                            | Description                                               |
| :------------- | :-------------------- | :------------------------------------ | :-------------------------------------------------------- |
| `id`           | `bigint(20) unsigned` | `NOT NULL AUTO_INCREMENT PRIMARY KEY` | Standard row ID.                                          |
| `group_id`     | `bigint(20) unsigned` | `NOT NULL`                            | The ID of the `wc_addon_group` post.                      |
| `target_type`  | `varchar(20)`         | `NOT NULL`                            | Accepts: `'global'`, `'category'`, or `'product'`.        |
| `target_id`    | `bigint(20) unsigned` | `NOT NULL DEFAULT 0`                  | The Category ID or Product ID (0 if global).              |
| `is_exclusion` | `tinyint(1)`          | `NOT NULL DEFAULT 0`                  | `1` if the group is explicitly excluded from this target. |

**Database Indexes:**

- `KEY group_id (group_id)`
- `KEY target_id (target_id)`

_Developer Note on Saving Rules:_ When the React Admin SPA saves a group via the REST API, the PHP backend must perform a "Delete & Re-insert" operation on this table for the specific `group_id` to ensure routing rules are always perfectly synced without duplicates.

### 2.4 The Universal JSON Schema (The "Golden Schema")

The entire React frontend and PHP backend rely on a standardized JSON structure stored in `_addon_schema`. The developer must strictly adhere to this schema. By using this structure, adding a new feature (like an Image Cropper) in Phase 3 requires zero database schema changes.

**Example Schema Structure:**

```json[
  {
    "id": "field_a1b2c3",
    "type": "select",
    "label": "Choose RAM Upgrade",
    "description": "Select the amount of memory.",
    "required": true,
    "class_name": "custom-css-class",
    "options":[
      {
        "label": "16GB (Standard)",
        "value": "16gb",
        "price_type": "flat",
        "price": 0,
        "weight": 0
      },
      {
        "label": "32GB (+ $100)",
        "value": "32gb",
        "price_type": "flat",
        "price": 100,
        "weight": 0.5
      }
    ],
    "conditions": {
      "status": "active",
      "action": "show",
      "match": "ALL",
      "rules":[
        {
          "target_field_id": "field_x9y8z7",
          "operator": "==",
          "value": "custom_build"
        }
      ]
    }
  },
  {
    "id": "field_x9y8z7",
    "type": "text",
    "label": "Custom Engraving",
    "required": false,
    "price_type": "character_count",
    "price": 2.50,
    "min_length": 0,
    "max_length": 15,
    "conditions": {
      "status": "inactive"
    }
  }
]
```

**Schema Dictionary:**

- `id`: A unique 6-to-8 character alphanumeric string generated by the React builder. Used for HTML `name` attributes and logic targeting.
- `type`: The field identifier (e.g., `text`, `textarea`, `select`, `checkbox`, `file`, `swatch_color`). Maps directly to the PHP Field Factory classes.
- `price_type`: Determines the math strategy. Accepts: `flat`, `percentage`, `character_count`, `quantity_multiplier`, `formula`.
- `weight`: (Float) Amount of physical weight to add to the WooCommerce cart item if selected.
- `conditions.rules`: An array of dependencies. `target_field_id` MUST reference a sibling field's `id` within the SAME Option Group. This guarantees intra-group scoping and prevents JavaScript logic collisions on the frontend.

## PART 3: BACKEND ARCHITECTURE & ADMIN UI

### 3.1 The REST API Bridge

The React Admin SPA must communicate securely with the WordPress database via custom REST API endpoints. The developer will utilize the `optionbay`'s built-in `ApiController` to handle authentication and routing.

**Endpoints Required:**

- `GET /wp-json/yournamespace/v1/addons/{id}`
  - **Purpose:** Fetches the `_addon_schema` (JSON), `_addon_settings` (JSON), and the routing rules from the `wp_woo_addons_lookup` table to hydrate the React state when editing an existing group.
- `POST /wp-json/yournamespace/v1/addons/{id}`
  - **Purpose:** Saves the payload from the React Builder.
  - **Action 1:** Validates permissions and sanitizes the JSON schema array.
  - **Action 2:** Updates `_addon_schema` and `_addon_settings` in `wp_postmeta`.
  - **Action 3:** Performs the "Delete & Re-insert" operation on the `wp_woo_addons_lookup` table using the provided Category IDs, Product IDs, and Exclusion IDs.

### 3.2 The React Admin SPA (Form Builder)

The backend UI is a Single Page Application (SPA) built with React. To maintain a native WordPress/WooCommerce aesthetic, the developer must strictly use the `classics/` component library provided in the `optionbay`.

**Architecture & State:**

- **Layout:** Wrapped in `ClassicLayout` to match native WooCommerce settings pages.
- **State Management:** Use React Context (`AddonContext`) to hold the active JSON schema array.
- **Drag-and-Drop:** Integrate `@hello-pangea/dnd` to allow merchants to reorder fields and options easily.
- **UI Components:** Use `ClassicRepeater` for adding multiple fields to a group, and adding multiple options (choices) within a field (e.g., dropdown options). Use `ClassicInput` and `ClassicSelect` for standard field configurations.
- **Logic Builder UI:** A dedicated modal or expandable section within each field row to construct the `"conditions"` array (e.g., "Show this field IF [Sibling Field] == [Value]").

### 3.3 PHP Engine: The Field Factory Pattern

When a product page loads, PHP must convert the JSON schema into raw HTML. To support 30+ field types without monolithic `if/else` statements, the developer must implement the **Factory Design Pattern**.

**Directory Structure:** `app/Fields/`

- `InterfaceField.php`: Defines required methods (`render()`, `validate()`, `sanitize()`).
- `BaseField.php`: Abstract class handling common HTML wrappers, labels, and descriptions.
- `FieldFactory.php`: Reads the JSON `"type"` and instantiates the correct class.
- `TextField.php`, `SelectField.php`, `CheckboxField.php`, etc.

**The Golden HTML Name Attribute:**
To ensure the WooCommerce Cart hooks can process the submitted data flawlessly, every generated HTML input MUST use a multidimensional array structure referencing the Group ID and Field ID.

```html
<!-- Example Output generated by the Factory -->
<div
  class="woo-addon-field-wrapper"
  data-field-id="field_a1b2c3"
  data-group-id="88"
>
  <label>Choose RAM Upgrade</label>
  <select name="woo_addons[88][field_a1b2c3]">
    <option value="16gb">16GB (Standard)</option>
    <option value="32gb">32GB (+ $100)</option>
  </select>
</div>
```

### 3.4 PHP Engine: The Pricing Strategy Pattern

Because the plugin will eventually handle complex math (character counts, formulas, weight modifiers), pricing calculations must be decoupled from the fields themselves. The developer must implement the **Strategy Design Pattern**.

**Directory Structure:** `app/Pricing/`

- `PricingEngine.php`: The context class that determines which strategy to use based on the JSON schema's `"price_type"`.
- `InterfacePricingStrategy.php`: Requires a `calculate( $base_price, $field_value, $schema_rules )` method.
- `FlatFeeStrategy.php`: Simply adds the flat amount.
- `PercentageStrategy.php`: Calculates `$base_price * ($percentage / 100)`.
- `CharacterCountStrategy.php`: Multiplies the string length of `$field_value` by the per-character price.
- `QuantityMultiplierStrategy.php`: Multiplies the flat fee by the WooCommerce cart item quantity.

By utilizing this pattern, adding a `FormulaStrategy.php` (e.g., `Length * Width`) in Phase 3 will require zero modifications to the core engine or database schema.

## PART 4: FRONTEND RENDERING & INTERACTIVITY ENGINE

### 4.1 The PHP Rendering Engine (Product Page Load)

When a customer visits a single product page, the PHP engine must efficiently query the database and render the forms before the page loads. The developer must hook into `woocommerce_before_add_to_cart_button`.

**Execution Flow:**

1.  **The Master Query:** PHP retrieves the current Product ID and its assigned Category IDs. It executes a single SQL query against the `wp_woo_addons_lookup` table to retrieve an array of active Group IDs (respecting exclusion rules).
2.  **Schema Fetching:** PHP iterates through the active Group IDs and retrieves their `_addon_schema` JSON from `wp_postmeta`.
3.  **HTML Generation:** PHP passes each JSON schema to the `FieldFactory`, which outputs the raw HTML input fields.
4.  **State Hydration:** To allow the frontend JavaScript to handle conditional logic and live pricing without making slow AJAX calls, PHP must print the compiled JSON schema directly into the DOM just before the closing `</form>` tag:
    ```html
    <script>
      window.wooAddonsSchema = {
        88: [
          /* Group 88 JSON Array */
        ],
        92: [
          /* Group 92 JSON Array */
        ],
      };
    </script>
    ```

### 4.2 The Interactivity Engine (Vanilla JavaScript)

To guarantee 100/100 Google Lighthouse performance scores, the frontend interactivity must be written in **Object-Oriented Vanilla JavaScript (ES6+)**. The developer is strictly forbidden from enqueuing React, ReactDOM, or jQuery on the frontend product pages.

**Event Delegation Model:**
Instead of attaching individual event listeners to 50 different inputs, the JS Engine must use a single Event Delegator attached to the WooCommerce cart form.

```javascript
const cartForm = document.querySelector("form.cart");
if (cartForm) {
  cartForm.addEventListener("change", (event) => {
    WooAddonsEngine.evaluateLogic(event.target);
    WooAddonsEngine.calculateLivePrice();
  });
}
```

### 4.3 Intra-Group Conditional Logic Scoping

When the `change` event fires, the JS Engine must determine if any other fields need to be shown or hidden based on the user's selection.

**Strict Scoping Rule:** Logic must _never_ bleed across Option Groups.

1. The JS Engine identifies the `data-group-id` of the changed input.
2. It looks up that specific group in `window.wooAddonsSchema[groupId]`.
3. It evaluates the `"conditions"` array for sibling fields within that group.
4. If a condition evaluates to `true` (e.g., "Add Engraving" is checked), the Engine removes the `.woo-addon-hidden` CSS class from the dependent field (e.g., "Engraving Text Input"). If `false`, it adds the class and clears the field's value to prevent hidden data from being submitted to the cart.

### 4.4 Live Visual Price Calculator

Customers expect to see the total price update instantly as they select options.

1.  **The DOM Element:** The PHP engine will render a floating or inline total box: `<div class="woo-addon-live-total">Total: <span class="amount">$50.00</span></div>`.
2.  **The Calculation:** The JS Engine iterates through all currently _visible_ and _selected_ inputs. It references `window.wooAddonsSchema` to find the `"price"` and `"price_type"` for each selected option.
3.  **Visual Only:** The JS calculates the total and updates the DOM. _Developer Note:_ This calculation is strictly for user experience. For security, the actual financial math will be recalculated entirely in PHP during the Add to Cart process.

---

## PART 5: WOOCOMMERCE E-COMMERCE PIPELINE (CART & CHECKOUT)

This is the most critical pipeline in the plugin. The developer must strictly use these 5 exact WooCommerce hooks to process the multidimensional `$_POST['woo_addons']` array.

### 5.1 Stage 1: Security & Validation

**Hook:** `woocommerce_add_to_cart_validation`

- **Action:** WooCommerce sends the raw `$_POST` data here before adding the item to the cart.
- **Logic:** PHP loops through the active Option Groups for the product. It compares the submitted `$_POST['woo_addons']` against the JSON database schema.
- **Validation:** If the schema dictates a field is `"required": true` AND the field's conditions dictate it should be visible, but the user bypassed it (e.g., DOM manipulation), PHP must block the cart addition and throw an error: `wc_add_notice( 'Please complete all required fields.', 'error' ); return false;`

### 5.2 Stage 2: Session Storage & Server-Side Math

**Hook:** `woocommerce_add_cart_item_data`

- **Action:** Converts raw `$_POST` data into sanitized, permanent session data.
- **Sanitization:** PHP maps the input type to the correct sanitization function (e.g., `sanitize_textarea_field`, `esc_url` for uploaded file paths).
- **Math Execution:** PHP passes the sanitized data to the `PricingEngine` (Strategy Pattern from Part 3). The Pricing Engine calculates the absolute `$total_addon_price` and `$total_addon_weight`.
- **Session Array:** PHP saves a compiled, optimized array into the cart item.
  ```php
  $cart_item_data['woo_custom_addons'] =[
      'total_price'  => 15.50,
      'total_weight' => 0.5,
      'display_data' => [
          [ 'name' => 'Engraving', 'value' => 'Happy Birthday' ],[ 'name' => 'Uploaded Logo', 'value' => '<a href="url" target="_blank">View File</a>' ]
      ]
  ];
  ```

### 5.3 Stage 3: Dynamic Price & Weight Modification

**Hook:** `woocommerce_before_calculate_totals`

- **Action:** Alters the WooCommerce Cart Object before the customer sees the checkout screen.
- **Logic:** PHP iterates through `$cart->get_cart()`. If `$cart_item['woo_custom_addons']` exists, it applies the modifiers natively:

  ```php
  $base_price = $cart_item['data']->get_price();
  $addon_price = $cart_item['woo_custom_addons']['total_price'];
  $cart_item['data']->set_price( $base_price + $addon_price );

  // Optional Phase 3 Feature: Weight Modifiers
  $base_weight = $cart_item['data']->get_weight();
  $addon_weight = $cart_item['woo_custom_addons']['total_weight'];
  if ( $addon_weight > 0 ) {
      $cart_item['data']->set_weight( $base_weight + $addon_weight );
  }
  ```

### 5.4 Stage 4: Cart & Checkout Display (Block Theme Compatible)

**Hook:** `woocommerce_get_item_data`

- **Action:** Displays the customized options under the product title on the Cart and Checkout pages.
- **Logic:** PHP returns the `display_data` array created in Stage 2.
- **Block Theme Constraint:** The developer MUST ensure that file uploads or image swatches are passed as text links (`<a href="...">`) and NOT as `<img>` or `<div>` tags. The modern WooCommerce React Cart Block aggressively strips HTML tags for security, but it safely permits `<a>` tags.

### 5.5 Stage 5: Final Order Meta Storage

**Hook:** `woocommerce_checkout_create_order_line_item`

- **Action:** Moves the temporary cart session data into the permanent WooCommerce Database when the customer successfully pays.
- **Logic:** PHP iterates through the `display_data` session array and attaches the keys and values to the final order item.
  ```php
  foreach ( $values['woo_custom_addons']['display_data'] as $addon ) {
      $item->add_meta_data( $addon['name'], $addon['value'] );
  }
  ```
- **Result:** WooCommerce will natively print these meta details on the Admin Order Dashboard, the Customer's "My Account" page, and all automated transactional emails. No custom email templates are required!

## PART 6: SPECIALIZED FEATURE ARCHITECTURE & EDGE CASES

The following features require specific architectural patterns to prevent security vulnerabilities and compatibility issues. The developer must follow these guidelines.

### 6.1 Secure File Upload Pipeline

Standard WordPress media uploads (`wp_handle_upload`) dump files into the public media library. This bloats the merchant's library with customer files and exposes sensitive user data (like custom photos or PDFs) to public indexing.

**The Custom Upload Architecture:**

1. **Frontend:** File inputs must use native HTML `<input type="file" accept=".jpg,.png,.pdf">`. The Vanilla JS engine must validate file size (`File.size`) and type _before_ the form is submitted.
2. **Backend Processing (`woocommerce_add_cart_item_data`):**
   - PHP must intercept `$_FILES['woo_addons']`.
   - Files must be moved to a protected, custom directory: `wp-content/uploads/woo-product-options/`.
   - **Security Requirement:** PHP must generate a `.htaccess` file in this custom directory containing `Options -Indexes` and `deny from all` (for non-image files) to prevent direct public directory browsing.
3. **Session Storage:** Save the absolute file path and a generated secure URL in the cart session. Do _not_ save the raw binary data in the session.

### 6.2 "Edit in Cart" Architecture (Phase 4)

Allowing customers to edit their add-ons from the cart page requires a specific data-loop architecture.

1. **The Trigger:** The Cart Block output (Stage 4) includes an `<a href="?edit_addon={cart_item_key}">Edit Options</a>` link.
2. **The Hydration (PHP):** When a product page loads with `?edit_addon=xxx` in the URL, PHP intercepts it. It looks up the WooCommerce cart session for that `cart_item_key`.
3. **Pre-filling the Form:** PHP injects the session data into the `window.wooAddonsSchema` JavaScript object as a `prefill_data` array.
4. **The Update (Cart Hook):** When the user clicks "Update Cart", the form submits a hidden input `<input type="hidden" name="woo_addon_update_key" value="xxx">`. The `woocommerce_add_cart_item_data` hook recognizes this key, removes the _old_ cart item, and replaces it with the newly calculated item.

### 6.3 Multi-Currency & WPML Compatibility

To ensure the plugin works for international, enterprise-level stores:

- **String Translation:** All labels and descriptions saved in the JSON schema must be passed through WPML/Polylang dynamic string registration upon saving the Custom Post Type.
- **Currency Conversion:** Do _not_ hardcode currency symbols in JavaScript. PHP must use `wc_price()` to format all prices before printing them to the frontend JS variable. If a multi-currency plugin (like WOOCS) is active, it will automatically hook into `wc_price()` and convert the raw JSON values based on the user's active currency.

---

## PART 7: BOILERPLATE INTEGRATION & WORKFLOW

The developer is utilizing the `optionbay`. To prevent code conflicts and maintain the native UI, these boilerplate-specific rules apply.

### 7.1 The Tailwind Preflight Guard

Because React injects into the classic WooCommerce "Product Data" meta box, default Tailwind CSS will destroy WooCommerce's native typography, borders, and margins.

- **Requirement:** The developer MUST wrap the React root component in the boilerplate's custom guard class: `<div className="optionbay-ignore-preflight">...</div>`. This ensures Tailwind only applies to the custom components and leaves native WooCommerce CSS untouched.

### 7.2 Naming Conventions & White-labeling

Before writing the first line of code, the developer must run the boilerplate's `rename.sh` script to set the global namespace.

- **Namespace:** `WooProductOptions`
- **Text Domain:** `woo-product-options`
- **Tailwind Prefix:** `wpo-` (e.g., `wpo-flex`, `wpo-text-center` to prevent CSS bleed).

### 7.3 Build Process

The project uses two separate Webpack entry points to ensure the frontend remains lightweight.

- `npm run build` must compile:
  1. `build/admin.js` (React SPA - loaded _only_ on the WP Admin CPT and Product Edit screens).
  2. `build/frontend.js` (Vanilla JS - loaded _only_ on the single product page).

---
