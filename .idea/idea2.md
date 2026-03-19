I'll update the entire specification with the new plugin name "OptionBay". Let me provide the complete revised document.

---

# **OptionBay Plugin**
## **Complete System Design & Architecture Specification**
### WooCommerce Product Options Solution

---

## **PART 1: EXECUTIVE OVERVIEW**

### 1.1 Plugin Identity & Scope

| Attribute | Specification |
|-----------|-------------|
| **System Name** | OptionBay |
| **Plugin Slug** | `optionbay` |
| **Text Domain** | `optionbay` |
| **PHP Namespace** | `OptionBay` |
| **CSS Prefix** | `ob-` |
| **JS Global** | `optionBay` |
| **Architecture Pattern** | Modular, Decoupled, Event-Driven |
| **Core Principle** | Strict Separation of Concerns |
| **Target Scale** | Small to Enterprise WooCommerce stores |
| **Performance Target** | < 50ms added to product page TTFB |

### 1.2 Architectural Philosophy

The system follows **four-module decoupling** where each module communicates through well-defined contracts (data schemas and hooks) rather than direct dependencies:

```
┌─────────────────────────────────────────────────────────────┐
│                     SYSTEM MODULES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MODULE 1: ADMIN SPA                                        │
│  ├─ Responsibility: Visual form builder interface           │
│  ├─ Technology: React SPA embedded in WP Admin             │
│  ├─ Output: JSON Schema (form structure)                   │
│  └─ Integration: WordPress REST API                        │
│                                                             │
│  MODULE 2: REST API BRIDGE                                  │
│  ├─ Responsibility: Secure data transmission               │
│  ├─ Technology: WordPress REST API                         │
│  ├─ Contract: JSON Schema validation, permission checks    │
│  └─ Integration: Database persistence layer                  │
│                                                             │
│  MODULE 3: RENDERING ENGINE                                 │
│  ├─ Responsibility: Server-side form generation            │
│  ├─ Technology: PHP with Factory Pattern                   │
│  ├─ Output: Semantic HTML + hydrated state                 │
│  └─ Integration: WooCommerce product page hooks            │
│                                                             │
│  MODULE 4: INTERACTIVITY ENGINE                             │
│  ├─ Responsibility: Client-side logic, live pricing        │
│  ├─ Technology: Vanilla JavaScript (ES6+)                  │
│  ├─ Input: Hydrated JSON schema from server                │
│  └─ Integration: Browser event system, DOM mutations       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decision**: If you replace the entire React Admin with a Vue.js alternative, the cart calculation logic remains untouched because it only consumes the JSON schema contract.

---

## **PART 2: DATA ARCHITECTURE**

### 2.1 Hybrid Storage Model

The system employs a **dual-storage strategy** optimized for different access patterns:

| Storage Layer | Data Type | Access Pattern | Rationale |
|--------------|-----------|----------------|-----------|
| **Document Store** (JSON in Post Meta) | Form schemas, field definitions, conditional rules | Read-heavy, complex nested structures | Schema flexibility without migrations; form structures evolve frequently |
| **Relational Store** (Custom SQL Table) | Assignment rules (which products get which forms) | Write-heavy, fast lookups, simple relations | SQL excels at indexed lookups; assignment rules change frequently |
| **Session Store** (WC Cart Session) | Customer selections, calculated prices | Temporary, per-cart lifecycle | WooCommerce native; auto-cleanup |
| **Order Meta** (WooCommerce tables) | Final purchase configuration | Permanent, audit trail | WC native; appears in emails, receipts, admin |

### 2.2 Data Entities & Relationships

#### Entity: Option Group
- **Representation**: WordPress Custom Post Type
- **Post Type Slug**: `ob_option_group`
- **Identifier**: Post ID
- **Core Payload**: Complete form schema (fields, pricing, logic)
- **Metadata**: Version tracking, display settings, status

#### Entity: Assignment Rule
- **Representation**: Row in custom lookup table
- **Table Name**: `{wpdb->prefix}ob_assignments`
- **Purpose**: Routing decision (which products display which groups)
- **Attributes**:
  - Target Type: Global, Product, Category, Tag
  - Target ID: Reference to specific entity (0 for global)
  - Exclusion Flag: Negative rule (hide from target)
  - Priority: Display order when multiple groups apply

#### Entity: Field Definition
- **Representation**: Object within group schema
- **Identifier**: Unique alphanumeric string (8 chars), prefixed `ob_`
- **Attributes**: Type, label, validation rules, pricing configuration, conditional logic references

#### Entity: Customer Selection
- **Representation**: Cart item metadata
- **Meta Key**: `optionbay_addons`
- **Lifecycle**: Temporary (cart) → Permanent (order)
- **Content**: Field values, calculated prices, weight adjustments

### 2.3 The Universal Schema Contract

The **Golden Schema** is the single source of truth that binds all modules. It is versioned for future migrations.

**Schema Structure Overview**:
- **Version**: Semantic versioning for backward compatibility
- **Fields Array**: Ordered list of field definitions
  - Identity: Unique field ID (e.g., `ob_a1b2c3d4`)
  - Presentation: Label, description, placeholder, CSS classes
  - Type Configuration: Field-specific settings (options for select, validation for file)
  - Pricing: Type (flat, percentage, character-based), base amount, per-unit rates
  - Conditional Logic: Active status, action (show/hide), match strategy (AND/OR), rule set
  - Physical: Weight adjustment for shipping calculations
- **Timestamps**: Creation and modification tracking

**Conditional Logic Rules**:
- Scope: Strictly intra-group (fields only reference siblings in same group)
- Operators: Equality, comparison, containment, emptiness checks
- Evaluation: Client-side (UX) + Server-side (security validation)

---

## **PART 3: MODULE 1 - ADMIN SPA DESIGN**

### 3.1 Interface Architecture

**Embedding Strategy**: React SPA injected into WooCommerce "Product Data" meta box area, maintaining native WC aesthetic using boilerplate's `classics` component library.

**Layout Structure**:
- **Header**: Group title input, status indicator, save action
- **Sidebar**: Field type palette, assignment rules panel
- **Main Canvas**: Drag-and-drop field builder with collapsible field rows

### 3.2 State Management Pattern

**Approach**: React Context API with reducer pattern (no external state library required for this scope).

**State Domains**:
- **Schema State**: Field definitions, their order, configurations
- **Assignment State**: Routing rules (where form appears)
- **Settings State**: Group-level display preferences
- **UI State**: Loading indicators, dirty flags, error messages
- **Meta State**: Group ID, publish status, timestamps

**Persistence Flow**:
1. User modifies field → Local state updates, dirty flag set
2. User triggers save → Validation runs against schema contract
3. API request dispatched with complete state snapshot
4. Server validates permissions, sanitizes, persists to database
5. Success response → Dirty flag cleared, success notice displayed

### 3.3 Builder Interaction Patterns

**Field Creation**:
- User selects field type from toolbar
- System generates unique ID (`ob_` prefix + 8 random chars), applies type-specific defaults
- Field appears in canvas with expanded configuration panel

**Field Configuration**:
- **Basic**: Label, description, placeholder, required toggle
- **Type-Specific**: 
  - Select/Radio/Checkbox: Option editor with nested pricing per option
  - File: MIME type restrictions, size limits
  - Text: Character limits
- **Pricing**: Price type selector, amount input, conditional per-unit rate display
- **Logic**: Toggle activation, action selector (show/hide), match strategy, rule builder interface

**Conditional Logic Builder**:
- Rule structure: [Target Field] [Operator] [Value]
- Target selection: Dropdown of sibling fields (filtered by group scope)
- Operator options: Context-aware based on target field type
- Value input: Text, number, or select based on operator

**Assignment Configuration**:
- Global toggle (all products)
- Category multi-select with search
- Product multi-select with search (for exceptions)
- Exclusion mode (hide from selected targets)
- Priority slider (display order)

### 3.4 Drag-and-Drop Architecture

**Library**: `@hello-pangea/dnd` (modern, accessible, maintained fork)

**Behavior**:
- Fields draggable within canvas via drag handle
- Drop zones indicate valid placement
- Reorder updates array index, preserves field IDs
- No cross-group dragging (enforces intra-group scope for logic)

---

## **PART 4: MODULE 2 - REST API BRIDGE DESIGN**

### 4.1 Endpoint Contract

**Base Namespace**: `optionbay/v1`

**Resource: Groups**
- **GET** `/groups/{id}`: Retrieve complete group (schema, settings, assignments)
- **POST** `/groups`: Create new group
- **PUT** `/groups/{id}`: Update existing group (full replacement)
- **GET** `/groups`: List groups (filtered, paginated)

**Resource: Validation** (Future/Phase 2)
- **POST** `/validate`: Server-side schema validation for complex rules

### 4.2 Request/Response Contract

**Request Structure (PUT/POST)**:
- Title: String
- Schema: Object (fields array)
- Settings: Object (layout, priority, active status)
- Assignments: Array of routing rules

**Response Structure**:
- Success flag
- Group ID (for new resources)
- Modified timestamp
- Error collection (if validation fails)

### 4.3 Security Model

**Authentication**: WordPress cookie-based nonce verification
**Authorization**: `manage_woocommerce` capability check
**Sanitization**: Deep recursive sanitization based on data type expectations
**Validation**: Schema structure validation, field ID uniqueness, circular logic detection in conditions

### 4.4 Database Transaction Pattern

**Assignment Update Strategy**: Delete-and-replace for atomic consistency
1. Begin transaction
2. Delete all existing assignment rows for group ID
3. Insert new assignment rows from request
4. Update post meta (schema, settings)
5. Commit transaction

**Rationale**: Prevents orphaned assignment records, ensures perfect sync with React state

---

## **PART 5: MODULE 3 - RENDERING ENGINE DESIGN**

### 5.1 Execution Trigger

**Hook**: `woocommerce_before_add_to_cart_button`
**Priority**: Default (10), filterable for theme compatibility

### 5.2 Rendering Pipeline

**Stage 1: Assignment Resolution**
- Input: Current product ID, its category IDs, tag IDs
- Query: Custom lookup table (`ob_assignments`) for matching group IDs
- Logic: Apply exclusion rules, sort by priority
- Output: Ordered array of group IDs to display
- Caching: Object cache with 5-minute TTL, cache key includes product ID

**Stage 2: Schema Retrieval**
- Input: Array of group IDs from Stage 1
- Query: Post meta `_ob_schema` for each group
- Validation: JSON decode, schema version check
- Output: Grouped schema objects indexed by group ID

**Stage 3: HTML Generation (Factory Pattern)**

**Field Factory Contract**:
- Input: Group ID, field schema object
- Process: Instantiate appropriate field type class
- Output: HTML string with standardized wrapper attributes

**HTML Output Requirements**:
- Wrapper: `div` with data attributes (`data-field-id`, `data-group-id`, `data-field-type`, `data-condition-status`)
- Input naming: `optionbay_addons[{group_id}][{field_id}]` (multidimensional array for automatic WC processing)
- Accessibility: Labels properly associated, ARIA attributes for dynamic visibility
- Pricing data: Data attributes for JavaScript price calculation
- Conditional fields: Initial hidden state if logic active

**Stage 4: State Hydration**
- Purpose: Provide JavaScript engine with schema context without additional AJAX calls
- Method: Print JSON object to page before closing form tag
- Content: Complete schema for all displayed groups, base product price, currency symbol
- Variable: `window.optionBaySchema` (namespaced to prevent conflicts)

### 5.3 Field Type Registry

**Extensibility Pattern**: Registration system allowing third-party field types

**Core Field Types**:
- Text (single line)
- Textarea (multi-line)
- Select (dropdown)
- Radio (single choice, inline display)
- Checkbox (toggle or multi-select)
- File (upload with restrictions)
- Number (with min/max)
- Email (validated format)
- Date/Time (picker integration)
- Color Swatch (visual color selection)
- Image Swatch (visual image selection)

**Field Type Contract** (what each type must implement):
- Render method: Generate HTML given value context
- Validation method: Check submitted value against constraints
- Sanitization method: Clean value for storage
- Price calculation method: Determine cost based on value and rules
- Weight calculation method: Determine shipping weight addition
- Display formatter: Convert stored value to human-readable format

---

## **PART 6: MODULE 4 - INTERACTIVITY ENGINE DESIGN**

### 6.1 Architecture Constraints

**Technology**: Vanilla JavaScript (ES6+), no frameworks
**Bundle Target**: < 15KB gzipped
**Performance Target**: < 16ms response to user interaction (60fps)

### 6.2 Event System Design

**Pattern**: Event Delegation (single listener on form container)

**Rationale**: Product forms may contain 50+ dynamic fields; individual listeners create memory overhead and binding complexity

**Event Flow**:
1. User interacts with input (click, change, input)
2. Event bubbles to delegated form listener
3. Engine identifies field via data attributes
4. Triggers logic evaluation and price recalculation

### 6.3 Conditional Logic Engine

**Evaluation Trigger**: Any field value change within a group

**Scope Enforcement**: 
- Engine reads `data-group-id` from changed field
- Only evaluates conditions within that group ID
- Prevents cross-group logic pollution

**Evaluation Process**:
1. Retrieve group schema from `window.optionBaySchema`
2. Iterate fields in group, identify those with active conditions
3. For each conditional field:
   - Evaluate all rules in condition set
   - Apply match strategy (AND/OR)
   - Determine visibility state
4. Update DOM: Toggle visibility class (`ob-hidden`), clear values of hidden fields

**Rule Evaluation Matrix**:
- Equality operators: Direct value comparison
- Comparison operators: Numeric comparison with type coercion
- Containment operators: String inclusion or array membership
- Emptiness operators: Null, empty string, or empty array check

### 6.4 Live Pricing Engine

**Calculation Trigger**: Follows logic evaluation (visibility changes affect price)

**Calculation Process**:
1. Reset base price from `window.optionBayBasePrice`
2. Iterate all groups in schema
3. For each field in group:
   - Check visibility state (skip hidden fields)
   - Retrieve field value from DOM
   - Calculate price using schema rules:
     - Flat: Add fixed amount
     - Percentage: Add percentage of base price
     - Character count: Multiply character length by per-unit rate
     - Quantity multiplier: Multiply by cart quantity (if editing cart)
4. Update DOM price display element (selector: `.optionbay-live-total .amount`)
5. Format using currency symbol and decimal rules

**Visual-Only Disclaimer**: Frontend calculation is UX-only; actual pricing recalculated server-side for security

### 6.5 File Upload Handling

**Pre-submission Validation**:
- File size check against `data-max-size` attribute
- MIME type check against `accept` attribute
- Immediate feedback (no server round-trip)

**Upload Strategy**:
- Standard form submission (multipart/form-data)
- PHP handles file processing during `woocommerce_add_cart_item_data` hook
- No AJAX upload (simpler, works with all WC themes)

---

## **PART 7: E-COMMERCE PIPELINE INTEGRATION**

### 7.1 WooCommerce Hook Integration Points

The system integrates at five critical WC pipeline stages:

| Stage | Hook | Responsibility |
|-------|------|----------------|
| 1 | `woocommerce_add_to_cart_validation` | Security validation, required field checking, conditional logic verification |
| 2 | `woocommerce_add_cart_item_data` | File processing, price calculation, session storage preparation |
| 3 | `woocommerce_before_calculate_totals` | Apply addon prices to cart item, adjust weights |
| 4 | `woocommerce_get_item_data` | Render addon selections under product name in cart |
| 5 | `woocommerce_checkout_create_order_line_item` | Transfer session data to permanent order meta |

### 7.2 Data Flow Through Pipeline

```
Customer submits form
        ↓
[Stage 1] Validation: Check required fields, re-evaluate conditions, validate file types
        ↓
[Stage 2] Processing: Move uploaded files to secure directory, calculate prices, build session array
        ↓
WC Cart Session stores: {display_data, total_price, total_weight, file_paths}
        ↓
[Stage 3] Price Application: WC calls calculate_totals, plugin modifies item price/weight
        ↓
Customer views cart: [Stage 4] Display formatted addon data
        ↓
Customer checks out: [Stage 5] Meta saved to order, session cleared
        ↓
Admin views order: Native WC meta display shows addon selections
```

### 7.3 Security Model

**Validation Hierarchy**:
1. Client-side (JS): UX feedback, immediate error prevention
2. Server-side (Validation hook): Authoritative security check, condition re-evaluation
3. Sanitization (Processing hook): Data cleaning, file validation

**Critical Rule**: All conditional logic re-evaluated server-side; hidden fields submitted by malicious clients are rejected

---

## **PART 8: SPECIALIZED FEATURE ARCHITECTURE**

### 8.1 Secure File Upload System

**Storage Strategy**:
- Location: Custom directory outside media library (`wp-content/uploads/optionbay/`)
- Protection: `.htaccess` rules preventing direct PHP execution, directory indexing disabled
- Naming: Randomized filenames to prevent guessing
- Access: Admin-ajax proxy requiring valid nonce before file delivery

**Lifecycle**:
- Upload: Temporary → Custom directory (Stage 2)
- Cart: File path stored in session
- Order: Path converted to secure download URL in meta
- Cleanup: Orphaned file removal via scheduled task (files not attached to orders after 24 hours)

### 8.2 Edit-in-Cart Architecture

**Challenge**: WooCommerce cart items are immutable; "editing" requires removal and re-addition with modified data.

**Flow**:
1. Cart displays "Edit Options" link with cart item key parameter
2. Product page detects edit mode, retrieves cart item data from session
3. Form pre-fills with existing selections (passed via hydrated schema as `prefill_data`)
4. Form submission includes hidden `optionbay_update_key` field
5. Processing hook detects update key, removes old cart item, adds new item with modified data

**State Management**: WC session used to pass data between cart and product page (avoids URL parameter tampering)

### 8.3 Multi-Currency & Translation Architecture

**Currency Handling**:
- Storage: All prices stored in store base currency
- Display: PHP `wc_price()` function handles formatting and conversion
- Compatibility: Multi-currency plugins hook into `wc_price()` automatically

**Translation (WPML/Polylang)**:
- String Registration: Labels and descriptions registered as dynamic strings on group save
- Context: `optionbay` text domain
- Method: `wpml_register_single_string` or Polylang equivalent

---

## **PART 9: PERFORMANCE & SCALABILITY DESIGN**

### 9.1 Database Query Optimization

**Lookup Table Indexing**:
- Composite index: `(target_type, target_id, is_exclusion, priority)` covers main frontend query
- Covering index strategy: All columns in query satisfied by index

**Query Patterns**:
- Frontend: Single indexed lookup by product ID + categories
- Admin: Primary key lookups by group ID
- No table scans for hot paths

### 9.2 Caching Strategy

**Object Cache Integration**:
- Group assignments cached per product ID (5-minute TTL)
- Schema cached per group ID (10-minute TTL, cleared on save)
- Cache invalidation: Triggered on group save/delete

**Cache Keys**:
- `ob_assignments_product_{$product_id}`
- `ob_schema_group_{$group_id}`

### 9.3 Frontend Asset Loading

**Conditional Loading**:
- Admin assets: Only on `ob_option_group` post screens
- Frontend assets: Only on `is_product()` pages with active assignments
- No global loading (prevents bloat on non-product pages)

**Asset Strategy**:
- Admin: React bundle (acceptable size for admin context)
- Frontend: Vanilla JS (minimal, optimized for mobile)

---

## **PART 10: EXTENSIBILITY & PHASES**

### 10.1 Extension Points

| Extension Type | Mechanism | Hook/Filter |
|----------------|-----------|-------------|
| Field Types | Registry system | `optionbay_register_field_types` |
| Pricing Strategies | Strategy pattern | `optionbay_register_pricing_strategy` |
| Validation Rules | Filter hook | `optionbay_validate_field_value` |
| Display Templates | Filter hook | `optionbay_field_template_{$type}` |

### 10.2 Development Phases

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1 (MVP)** | Core infrastructure, 5 field types (text, select, checkbox, file, number), flat pricing only | Weeks 1-4 |
| **Phase 2** | Conditional logic, percentage pricing, character count, edit-in-cart | Weeks 5-6 |
| **Phase 3** | Formula pricing, weight modifiers, image swatches, date/time fields | Weeks 7-8 |
| **Phase 4** | Advanced file handling (image crop), multi-step forms, conditional sections | Weeks 9-10 |

