

Here is the complete, combined master list of classic WordPress and WooCommerce admin CSS classes, categorized by how you will use them.

---

### 1. WooCommerce Specific Form Layouts (Crucial for Product Pages)
When you inject your add-ons into the WooCommerce "Product Data" meta box, you should use WooCommerce’s specific wrapper classes so your fields align perfectly with WooCommerce’s native Price and Inventory fields.

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `options_group` | `<div>` | Wraps a group of fields. It adds the standard WooCommerce grey border-bottom and padding between sections. |
| `form-field` | `<p>` | **The most important WC class.** Wrap every single label + input combo in this. It automatically aligns the label to the left and the input to the right, just like the regular price field. |
| `form-row` | `<div>` or `<p>` | Used when you need fields to sit side-by-side. Combine with `form-row-first` (left 50%) and `form-row-last` (right 50%). |
| `show_if_simple` | `<div>` or `<p>` | Native WC class. Hides the field unless the product type is "Simple". |
| `show_if_variable` | `<div>` or `<p>` | Native WC class. Hides the field unless the product type is "Variable". |

### 2. Form Inputs & Sizing (WP + WC)
WooCommerce uses some standard WP classes, but also introduces its own specific sizing classes for things like prices and dimensions.

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `regular-text` | `<input type="text">` | Standard WP width (25em). Good for "Option Name". |
| `short` | `<input>` or `<select>` | **WooCommerce specific.** Makes the input about 50% width. WC uses this for regular/sale prices. |
| `wc_input_price` | `<input type="text">` | **WooCommerce specific.** Formats the input for currency. |
| `wc_input_decimal`| `<input type="text">` | **WooCommerce specific.** Formats the input for decimals (weights/dimensions). |
| `small-text` | `<input type="number">` | WP core. Very small input (50px). Good for quantities or sorting numbers. |
| `large-text` | `<input>` / `<textarea>`| WP core. Expands to 100% of the container width. |
| `description` | `<span>` | WP/WC core. The italicized, grey subtext that sits under/next to an input. |

### 3. The WooCommerce Repeater UI (For Your Add-ons!)
If you look at the WooCommerce "Variations" or "Attributes" tab, they use a beautiful accordion/repeater UI. You can steal these exact classes to make your add-on builder look 100% native!

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `wc-metaboxes-wrapper` | `<div>` | The outermost container for a WooCommerce repeater area. |
| `wc-metaboxes` | `<div>` | The inner container that holds the individual items. |
| `wc-metabox` | `<div>` | An individual row/accordion item. It creates the grey box with a border. |
| `wc-metabox ` <br>`closed` | `<div>` | Add the `closed` class alongside `wc-metabox` to make the accordion collapsed by default. |
| `wc-metabox-content` | `<div>` | Put this inside the `wc-metabox`. This holds your actual form inputs. |
| `remove_row` | `<a>` or `<button>`| Put this in your header. WC automatically styles it as a red "Remove" text link pushed to the right. |

### 4. Buttons & Actions
Use these to trigger your React state changes (Adding new rows, saving).

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `button` | `<button>` | Base WP button (grey gradient). |
| `button-primary` | `<button>` | Base WP primary button (Blue). Use for saving. |
| `button-secondary`| `<button>` | Alternative standard button. |
| `button-link` | `<button>` | Looks like a text link, acts like a button. |
| `button-link-delete`| `<button>` | Looks like a red text link. |
| `wc-action-button`| `<button>` | WooCommerce specific. Used for small action buttons next to items. |

### 5. Tooltips & Icons (The WooCommerce Way)
WooCommerce has a very specific, beloved way of showing help text using a tiny `(?)` icon that reveals a tooltip on hover.

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `woocommerce-help-tip` | `<span>` | **Highly Recommended.** Add this class and put your text in a `data-tip` attribute. WC automatically turns it into a `(?)` icon with a beautiful dark tooltip on hover! |
| `dashicons` | `<span>` | Base class for WP native icons. |
| `dashicons-menu` | `<span>` | Hamburger icon (Great for a drag-and-drop handle in your repeater). |
| `dashicons-trash` | `<span>` | Trash can icon. |

### 6. Tables & Settings Pages (For Global Addons)
If you create a separate menu page in the WordPress admin for "Global Addons", use these classes.

| CSS Class | Used On | Description |
| :--- | :--- | :--- |
| `wrap` | `<div>` | Base wrapper for the whole page. |
| `wp-list-table` | `<table>` | Base class for the table. |
| `widefat` | `<table>` | Adds WP styling (borders, backgrounds) to the table. |
| `striped` | `<table>` | Adds zebra striping to rows. |
| `form-table` | `<table>` | Use this if you are building a settings page (like WooCommerce > Settings). It perfectly aligns labels on the left and inputs on the right. |
