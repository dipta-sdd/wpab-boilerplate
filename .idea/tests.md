# OptionBay - Comprehensive End-User Test Suite

This document contains an exhaustive test suite designed to cover all scenarios, field type combinations, pricing logic combinations, and conditional logic behavior within the OptionBay plugin.

Each test is designed to verify the frontend product page behavior, the backend builder configuration, and the final cart calculation.

---

## Part 1: [Field Types & Pricing Logic Matrices](file:///home/sdd/Documents/campaign-bay-testing/plugin/optionbay/.idea/Tests_Fields.md)

This section tests every field type against every possible `price_type`: `None`, `Flat`, `Percentage`, `Character Count`, `Quantity Multiplier`, and `Formula`.

> **Note**: For "Choice-based" fields (Select, Checkbox, Radio, Color Swatch, Image Swatch), pricing can be applied to the field itself OR to the individual choices. Both must be tested.

### 1.1 Text Input & Textarea
| Field Type | Price Type | Test Scenario & Verification | Status |
| :--- | :--- | :--- | :--- |
| **Text** | `None` | Verify input allows text, no price change on the product. | [ ] |
| **Text** | `Flat` | Add a $10 flat fee. Typing *any* value adds exactly $10 to the total. | [ ] |
| **Text** | `Percentage` | Set 10%. Typing a value adds 10% of the base product price. | [ ] |
| **Text** | `Character Count` | Set $1 per char. Typing 5 chars adds $5. | [ ] |
| **Text** | `Quantity Mult.` | *(Usually N/A for text, but test system fallback to Flat or ignores it).* | [ ] |
| **Text** | `Formula` | Set `[price] * 2`. Typing a value triggers the formula. | [ ] |
| **Textarea**| `None` | Verify multi-line input, no price change. | [ ] |
| **Textarea**| `Flat` | Add a $15 flat fee for leaving a note. | [ ] |
| **Textarea**| `Percentage` | Add 5% fee for a custom message. | [ ] |
| **Textarea**| `Character Count`| $0.10 per char. Test typing 100 characters ($10). Test spaces vs non-spaces (if applicable). | [ ] |

### 1.2 Number Input
| Field Type | Price Type | Test Scenario & Verification | Status |
| :--- | :--- | :--- | :--- |
| **Number** | `None` | Restricts input to numbers only. Min/Max attributes work. | [ ] |
| **Number** | `Flat` | Adds a flat fee when *any* number is entered. | [ ] |
| **Number** | `Percentage` | Adds a % fee when *any* number is entered. | [ ] |
| **Number** | `Quantity Mult.` | Set $5. If user enters "3" in the number field, total adds $15. | [ ] |
| **Number** | `Formula` | Set `[value] * 2 + 10`. User enters "5", total adds $20. | [ ] |

### 1.3 Choice-Based Fields (Select, Radio, Checkbox, Swatches)
*Test both the base field price AND the individual choice price.*

| Field Type | Price Type (Choice) | Test Scenario & Verification | Status |
| :--- | :--- | :--- | :--- |
| **Select** | `None` & `Flat` | Default choice has no price. Selecting Choice2 adds $5 flat. | [ ] |
| **Select** | `Percentage` | Selecting Choice3 adds exactly 15% of base price. | [ ] |
| **Radio** | `Flat` (Multiple) | Choice A (+$5), Choice B (+$10). Switching between them updates total dynamically. | [ ] |
| **Checkbox**| `Flat` (Multiple) | Choice A (+$5), Choice B (+$10). Checking BOTH adds $15 total. Unchecking removes price. | [ ] |
| **Checkbox**| `Percentage` | Choice A (+10%), Choice B (+20%). Checking BOTH adds 30% of base price. | [ ] |
| **Color** | `Flat` | Red (+$0), Gold (+$50). Swapping swatches updates the main image and price. | [ ] |
| **Image** | `Percentage` | Small Image (+0%), Premium Image (+10%). Selecting premium updates price correctly. | [ ] |

### 1.4 File Upload, Email, Date, Time
| Field Type | Price Type | Test Scenario & Verification | Status |
| :--- | :--- | :--- | :--- |
| **File** | `None` | Uploading a valid file (e.g., JPG) works. Invalid file sizes/types are blocked. | [ ] |
| **File** | `Flat` | Uploading a file adds a "Setup Fee" of $25. | [ ] |
| **File** | `Percentage` | Uploading adds a 5% processing fee. | [ ] |
| **Email** | `Flat` | Entering a valid email adds a subscription fee of $5. | [ ] |
| **Date** | `Flat` | Picking a date (e.g., Rush Delivery) adds $50. | [ ] |
| **Date** | `Percentage` | Picking a date adds 10%. | [ ] |
| **Time** | `Flat` | Picking a time adds $10. | [ ] |

---

## Part 2: [Conditional Logic Combinations](file:///home/sdd/Documents/campaign-bay-testing/plugin/optionbay/.idea/Tests_Logic.md)

This section ensures that fields dynamically show/hide based on the operator and value of target fields. `Target Field` is the field that the user interacts with, which triggers the visibility of the `Dependent Field`.

### 2.1 Operators on Text / Email / Textarea Targets
*Target Field: "Custom Name" (Text)*

| Target Type | Operator | Condition Value | Action | User Does... | Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Text | `==` | "John" | Show | Types "John" | Field appears. Types "John Doe", field hides. | [ ] |
| Text | `!=` | "None" | Hide | Types "None" | Field hides. Types anything else, field shows. | [ ] |
| Text | `contains` | "VIP" | Show | Types "Hello VIP user" | Field appears. | [ ] |
| Text | `not_contains`| "spam" | Hide | Types "This is spam" | Field hides. | [ ] |
| Text | `empty` | *(blank)* | Hide | Clears field | Field hides. | [ ] |
| Text | `not_empty` | *(blank)* | Show | Types *anything* | Field appears. | [ ] |

### 2.2 Operators on Number Targets
*Target Field: "Age" (Number)*

| Target Type | Operator | Condition Value | Action | User Does... | Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Number | `==` | 18 | Show | Types 18 | Field appears. | [ ] |
| Number | `!=` | 0 | Show | Types 5 | Field appears. Types 0, field hides. | [ ] |
| Number | `>` | 10 | Show | Types 11 (shows), Types 10 (hides). | Strict greater-than works. | [ ] |
| Number | `<` | 5 | Hide | Types 4 (hides), Types 5 (shows). | Strict less-than works. | [ ] |
| Number | `>=` | 21 | Show | Types 21 (shows), Types 20 (hides). | Greater-than-or-equal works. | [ ] |
| Number | `<=` | 12 | Show | Types 12 (shows), Types 13 (hides). | Less-than-or-equal works. | [ ] |

### 2.3 Operators on Choice Targets (Select, Radio, Checkbox)
*Target Field: "Material" (Select: Wood, Plastic, Metal)*

| Target Type | Operator | Condition Value | Action | User Does... | Verification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Select | `==` | Wood | Show | Selects "Wood" | Dependent field appears. | [ ] |
| Select | `!=` | Plastic | Hide | Selects "Plastic" | Dependent field hides. | [ ] |
| Radio | `empty` | *(blank)* | Show | First load (no selection) | Field is visible. Selection hides it. | [ ] |
| Checkbox | `==` | Option2 | Show | Checks Option2 | Field appears. Unchecks it, hides. | [ ] |
| Checkbox | `!=` | Option1 | Show | Checks Option 1 | Field hides. Checks Option 3, field shows. | [ ] |

### 2.4 Complex Match Logistics (ALL vs ANY)
| Scenario Setup | Logic Type | User Interaction | Verification | Status |
| :--- | :--- | :--- | :--- | :--- |
| Target A (== Yes), Target B (> 10) | `Match ALL` | Only matches A. | Dependent field remains **hidden**. | [ ] |
| Target A (== Yes), Target B (> 10) | `Match ALL` | Matches A AND matches B. | Dependent field **shows**. | [ ] |
| Target A (== Yes), Target B (> 10) | `Match ANY` | Only matches A. | Dependent field **shows**. | [ ] |
| Target A (== Yes), Target B (> 10) | `Match ANY` | Matches neither. | Dependent field remains **hidden**. | [ ] |

---

## Part 3: [Nested Conditional Chains](file:///home/sdd/Documents/campaign-bay-testing/plugin/optionbay/.idea/Tests_Logic.md#part-3-nested-conditional-chains)
Testing multiple layers of dependencies.

| Chain Level | Trigger | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **Level 1** | Checkbox "Add Gift Wrapping" == Checked | Shows Level 2 Dropdown "Wrapping Style". | [ ] |
| **Level 2** | Select "Custom Pattern" == Selected | Shows Level 3 File Upload "Upload Pattern". | [ ] |
| **Level 3** | File is uploaded (`not_empty`) | Shows Level 4 Textarea "Delivery Instructions". | [ ] |
| **Resolution**| User unchecks "Add Gift Wrapping" | Level 2, 3, and 4 ALL instantly disappear. Any prices associated with them are removed from the total calculation. | [ ] |

---

## Part 4: [Assignment Rules (Reach & Exceptions)](file:///home/sdd/Documents/campaign-bay-testing/plugin/optionbay/.idea/Tests_Assignments.md)
Verifying that the backend lookup logic correctly places the Option Group on the frontend.

| Rule Configuration | Test Page Visited | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **Visibility**: Global (All Products) | Any product | Group displays. | [ ] |
| **Visibility**: Targeted. **Reach**: Category X | Product in Category X | Group displays. | [ ] |
| **Visibility**: Targeted. **Reach**: Category X | Product in Category Y | Group is hidden. | [ ] |
| **Visibility**: Targeted. **Reach**: Tag T | Product with Tag T | Group displays. | [ ] |
| **Visibility**: Targeted. **Reach**: Product A | Product A | Group displays. | [ ] |
| **Visibility**: Global. **Exceptions**: Product B | Product C | Group displays. | [ ] |
| **Visibility**: Global. **Exceptions**: Product B | Product B | Group is hidden (Exception overrides Global). | [ ] |
| **Targeted**. Priority 10. | Product A | Group displays at bottom. | [ ] |
| **Targeted**. Priority 1. | Product A | Group displays at top (above Priority 10 groups). | [ ] |

---

## Part 5: [Cart & Order Submission](file:///home/sdd/Documents/campaign-bay-testing/plugin/optionbay/.idea/Tests_Cart_Order.md)
Crucial end-to-end testing to ensure calculated totals are passed to WooCommerce properly.

| Scenario | Verification | Status |
| :--- | :--- | :--- |
| Add simple required Text field + $5. | Cannot add to cart if empty. Adds to cart successfully if filled. Cart item meta shows text value. Cart total is Base + $5. | [ ] |
| Add Checkbox (Choice 1 = +$10, Choice 2 = +15%). | Select both choices. Base Price = $100. Product total = $100 + $10 + $15 = $125. Add to cart. Cart total matches $125. | [ ] |
| Change Quantity to 3 with Quantity Multiplier ($5) | Price update shows `Base*3 + (5*3)`. Add to cart. Cart line total is completely accurate. | [ ] |
| Conditional field with price is hidden. | Even though the conditional field has a value internally, because it is HIDDEN, its price is NOT added to the cart, and its meta is NOT sent to the order. | [ ] |
| File Upload | Upload image to custom field. Add to cart. Cart item meta contains a hyperlink to the uploaded file in `wp-content/uploads`. | [ ] |
| WooCommerce Order Email | Complete checkout. View WooCommerce admin order screen and customer email. Custom fields are clearly listed under the product name. | [ ] |
