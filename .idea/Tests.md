# OptionBay - Detailed End-User Test Cases

This document expands the logic matrices into individual, step-by-step test cases for manual QA execution.

---

## Part 1: Field Types & Pricing Logic

**General Preconditions for Part 1:**
- You have an Option Group assigned to a test product (e.g., "Product A" with a base price of $100).
- Open Product A on the frontend.

### 1.1 Text Input & Textarea

**TC 1.01: Text Field - No Pricing**
- **Steps:**
  1. Add a **Text** field. Set Price Type to `None`. Save.
  2. On the frontend, type "Hello World" into the field.
- **Expected Result:** The input accepts the text. The product total price remains $100.

**TC 1.02: Text Field - Flat Pricing**
- **Steps:**
  1. Add a **Text** field. Set Price Type to `Flat`, Price to `10`. Save.
  2. On the frontend, leave the field blank. Verify total price is $100.
  3. Type any text into the field.
- **Expected Result:** As soon as text is entered, the total price updates to $110.

**TC 1.03: Text Field - Percentage Pricing**
- **Steps:**
  1. Add a **Text** field. Set Price Type to `Percentage`, Price to `10`. Save.
  2. On the frontend, type any text.
- **Expected Result:** The total price updates to $110 (10% of $100 base price added).

**TC 1.04: Text Field - Character Count Pricing**
- **Steps:**
  1. Add a **Text** field. Set Price Type to `Character Count`, Price to `1`. Save.
  2. On the frontend, type exactly 5 characters (e.g., "Apple").
- **Expected Result:** The total price updates to $105.

**TC 1.05: Text Field - Formula Pricing**
- **Steps:**
  1. Add a **Text** field. Set Price Type to `Formula`. Enter formula `[price] * 2`. (Assuming base price is $10). Save.
  2. On the frontend, type any text.
- **Expected Result:** The total price updates by adding the calculated formula value.

**TC 1.06: Textarea - No Pricing**
- **Steps:**
  1. Add a **Textarea** field. Set Price Type to `None`. Save.
  2. On the frontend, enter multiple lines of text.
- **Expected Result:** The input accepts multi-line text. Price remains unchanged.

**TC 1.07: Textarea - Flat Pricing**
- **Steps:**
  1. Add a **Textarea** field. Set Price Type to `Flat`, Price to `15`. Save.
  2. On the frontend, type any text.
- **Expected Result:** Total price updates to $115.

**TC 1.08: Textarea - Character Count Pricing**
- **Steps:**
  1. Add a **Textarea** field. Set Price Type to `Character Count`, Price to `0.10`. Save.
  2. On the frontend, type exactly 100 characters.
- **Expected Result:** Total price updates to $110 ($10 added for 100 chars).

### 1.2 Number Input

**TC 1.09: Number Field - Validation**
- **Steps:**
  1. Add a **Number** field. Set min=1, max=10 at the schema level. Price `None`. Save.
  2. On the frontend, attempt to type text.
  3. Attempt to type "15".
- **Expected Result:** Text is rejected. Forms should validate or restrict input above 10.

**TC 1.10: Number Field - Flat Pricing**
- **Steps:**
  1. Add a **Number** field. Set Price Type to `Flat`, Price to `5`. Save.
  2. On the frontend, enter any number (e.g., "8").
- **Expected Result:** Total price adds $5 regardless of the number entered.

**TC 1.11: Number Field - Quantity Multiplier**
- **Steps:**
  1. Add a **Number** field. Set Price Type to `Quantity Multiplier`, Price to `5`. Save.
  2. On the frontend, enter "3" in the number field.
- **Expected Result:** Total price adds $15 (3 * $5).

**TC 1.12: Number Field - Formula**
- **Steps:**
  1. Add a **Number** field. Set Price Type to `Formula`, formula `[value] * 2 + 10`. Save.
  2. On the frontend, enter "5".
- **Expected Result:** Total price adds $20 ((5 * 2) + 10).

### 1.3 Choice-Based Fields (Select, Radio, Checkbox, Swatches)

**TC 1.13: Select Field - Flat Pricing**
- **Steps:**
  1. Add a **Select** field. Add Choice A (Price: None) and Choice B (Price Type: Flat, Price: 5). Save.
  2. On the frontend, select Choice A. Verify price is $100.
  3. Select Choice B.
- **Expected Result:** Total price updates to $105.

**TC 1.14: Select Field - Percentage Pricing**
- **Steps:**
  1. Add a **Select** field. Add Choice C (Price Type: Percentage, Price: 15). Save.
  2. On the frontend, select Choice C.
- **Expected Result:** Total price updates to $115 (15% of $100 base).

**TC 1.15: Radio Buttons - Switching Choices**
- **Steps:**
  1. Add a **Radio** field. Choice A (Flat, $5), Choice B (Flat, $10). Save.
  2. On the frontend, click Choice A. Note price.
  3. Click Choice B.
- **Expected Result:** Price updates from $105 to $110 immediately. Both fees do not stack.

**TC 1.16: Checkbox - Multiple Selections Stacking**
- **Steps:**
  1. Add a **Checkbox** field. Choice A (Flat, $5), Choice B (Flat, $10). Save.
  2. On the frontend, check Choice A. Verify price ($105).
  3. Check Choice B as well.
  4. Uncheck Choice A.
- **Expected Result:** With both checked, price is $115. Upon unchecking A, price becomes $110.

**TC 1.17: Color Swatch - Selection and Image Swap**
- **Steps:**
  1. Add a **Color Swatch** field. Red (Flat $0), Gold (Flat $50). (Optionally assign an image to Gold). Save.
  2. On the frontend, click Gold.
- **Expected Result:** Price updates to $150. If an image replacing rule is active, the main product image updates.

### 1.4 File Upload, Email, Date, Time

**TC 1.18: File Upload - Basic Test**
- **Steps:**
  1. Add a **File** field. Price Type `Flat`, Price `25`. Save.
  2. On the frontend, upload a valid image file.
- **Expected Result:** The file is accepted and total price increases by $25.

**TC 1.19: Date/Time Picker - Fee Addition**
- **Steps:**
  1. Add a **Date** field (Flat $50) and a **Time** field (Flat $10). Save.
  2. On the frontend, select a date and a time.
- **Expected Result:** Total price increases by $60 ($100 + $50 + $10 = $160).

---

## Part 2: Conditional Logic Combinations

**General Preconditions for Part 2:**
- Add two fields to the group: 
  - `Target Field`: The field the user interacts with.
  - `Dependent Field`: The field that applies the conditional logic rules looking at the Target Field.

### 2.1 Operators on Text Targets

**TC 2.01: Text Exact Match (==)**
- **Steps:**
  1. Target: Text field named "Name".
  2. Dependent: Text field. Condition: Show if Name `==` "John".
  3. Frontend: Type "John". Verify field appears.
  4. Type "John Doe".
- **Expected Result:** Dependent field hides when the value changes to "John Doe".

**TC 2.02: Text Not Equal (!=)**
- **Steps:**
  1. Target: Text field named "Location".
  2. Dependent: Text field. Condition: Hide if Location `!=` "None".
  3. Frontend: Type "None". Verify dependent hides.
  4. Type "Seattle".
- **Expected Result:** Dependent field shows when value is anything but "None".

**TC 2.03: Text Contains / Not Contains**
- **Steps:**
  1. Target: Text field. 
  2. Dependent A: Show if Target `contains` "VIP".
  3. Dependent B: Hide if Target `not_contains` "spam".
  4. Frontend: Type "Hello VIP user". Check Dependent A.
  5. Type "This is spam". Check Dependent B.
- **Expected Result:** Dependent A shows for the first input. Dependent B hides for the second input.

**TC 2.04: Text Empty / Not Empty**
- **Steps:**
  1. Target: Text field.
  2. Dependent: Show if Target `not_empty`.
  3. Frontend: Leave Target blank. Check Dependent.
  4. Type "A". Check Dependent.
- **Expected Result:** Dependent is hidden initially, and appears the moment "A" is typed.

### 2.2 Operators on Number Targets

**TC 2.05: Number Greater/Less Than (>, <)**
- **Steps:**
  1. Target: Number field "Age".
  2. Dependent A: Show if Age `>` 10.
  3. Dependent B: Show if Age `<` 5.
  4. Frontend: Type 10. Type 11. Type 4. Type 5.
- **Expected Result:** Type 10: Neither shows. Type 11: Dep A shows. Type 4: Dep B shows. Type 5: Neither shows.

**TC 2.06: Number Greater/Less Than or Equal (>=, <=)**
- **Steps:**
  1. Target: Number field "Qty".
  2. Dependent A: Show if Qty `>=` 21.
  3. Dependent B: Show if Qty `<=` 12.
  4. Frontend: Type 20, 21. Type 13, 12.
- **Expected Result:** Type 20: Dep A hides. Type 21: Dep A shows. Type 13: Dep B hides. Type 12: Dep B shows.

### 2.3 Operators on Choice Targets

**TC 2.07: Select/Radio Match (==, !=)**
- **Steps:**
  1. Target: Select field "Material" (Wood, Plastic, Metal).
  2. Dependent: Show if Material `==` "Wood".
  3. Frontend: Select "Wood". Watch Dependent. Select "Plastic".
- **Expected Result:** Dependent shows on Wood, hides on Plastic.

**TC 2.08: Checkbox Interaction**
- **Steps:**
  1. Target: Checkbox field (Options 1, 2, 3).
  2. Dependent: Show if Checkbox `==` Option 2.
  3. Frontend: Check Option 1. Check Option 2. Uncheck Option 2.
- **Expected Result:** Dependent remains hidden on Option 1. Shows when Option 2 is checked (even if 1 is checked). Hides when 2 is unchecked.

### 2.4 Complex Match Logistics (ALL vs ANY)

**TC 2.09: Match ALL Logic**
- **Steps:**
  1. Target 1: Checkbox "Gift" (Yes). Target 2: Number "Qty" (> 10).
  2. Dependent: Show if Match ALL (Gift == Yes AND Qty > 10).
  3. Frontend: Check Gift. Qty is 5. 
  4. Change Qty to 11.
- **Expected Result:** Dependent remains hidden in step 3. Only appears in step 4 when BOTH conditions are met.

**TC 2.10: Match ANY Logic**
- **Steps:**
  1. Dependent: Show if Match ANY (Gift == Yes OR Qty > 10).
  2. Frontend: Leave Gift unchecked. Set Qty to 11.
- **Expected Result:** Dependent shows because at least one condition (Qty > 10) is met.

---

## Part 3: Nested Conditional Chains

**TC 3.01: Cascading Conditions (Levels 1-4)**
- **Steps:**
  1. Create the chain: Checkbox "Add Wrapping" -> Shows Select "Style". Select "Custom" -> Shows File Upload "Pattern". File Upload `not_empty` -> Shows Textarea "Instructions".
  2. Frontend: Check "Add Wrapping". (Level 2 appears).
  3. Select "Custom". (Level 3 appears).
  4. Upload image. (Level 4 appears).
  5. Uncheck "Add Wrapping".
- **Expected Result:** Levels 2, 3, and 4 all disappear instantly when the root trigger is unchecked.

---

## Part 4: Assignment Rules

**TC 4.01: Global Visibility**
- **Steps:**
  1. Set group to "Apply to all products". Save.
  2. Visit any random product on the frontend.
- **Expected Result:** The group is displayed on the product.

**TC 4.02: Targeted Inclusions (Reach)**
- **Steps:**
  1. Set group to targeted. In Reach, select "Category X". Save.
  2. Visit a Product in Category X.
  3. Visit a Product in Category Y.
- **Expected Result:** Group shows on Product X, but is completely absent from Product Y.

**TC 4.03: Exceptions Overrides**
- **Steps:**
  1. Set group to "Apply to all products" (Global). 
  2. In Exceptions, select "Product B". Save.
  3. Visit Product C. Visit Product B.
- **Expected Result:** Group shows on Product C. Group is hidden on Product B, proving exception overrides global inclusion.

**TC 4.04: Priority Sorting**
- **Steps:**
  1. Assign Group 1 (Priority 10) and Group 2 (Priority 1) to the same product.
  2. Visit the product on frontend.
- **Expected Result:** Group 2 renders ABOVE Group 1 in the UI due to lower priority number.

---

## Part 5: Cart & Order Submission

**TC 5.01: Standard Field Addition**
- **Steps:**
  1. Fill out a required Text field (+ $5).
  2. Click Add to Cart. View Cart.
- **Expected Result:** Cart total equals Base Price + $5. The custom field name and value are listed underneath the product in the cart row.

**TC 5.02: Quantity Multiplication in Cart**
- **Steps:**
  1. Add a Product ($100) with a Number field (Quantity Multiplier price: $5). Enter "3" in the field.
  2. Change WooCommerce Product Quantity to 2. Add to Cart.
- **Expected Result:** Product Single Price is calculated as $100 + ($5 * 3) = $115. Total Cart Line for 2 items is $230.

**TC 5.03: Hidden Conditional Pricing Excluded**
- **Steps:**
  1. Have a conditional field with a $50 fee that is currently HIDDEN.
  2. Add to Cart.
- **Expected Result:** The cart does NOT add the $50 fee, and the field metadata is not present on the cart item.

**TC 5.04: Checking Out & Emails**
- **Steps:**
  1. Complete checkout with custom fields filled.
  2. Go to WooCommerce > Orders in wp-admin.
  3. Check the confirmation email sent.
- **Expected Result:** OptionBay metadata is cleanly listed per line-item in both the WP Admin Order screen and the customer email receipt.
