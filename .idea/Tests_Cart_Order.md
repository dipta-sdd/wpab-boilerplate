# OptionBay End-User Tests: Part 5 - Cart & Order

This document provides exhaustive, row-by-row test cases for Part 5 of the master matrix (`tests.md`).

---

## 5.1 Pricing Calculations in Cart

| Test ID | Setup | Action | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 5.01** | `Text Field ($5)` | Add to Cart | Fill out text field. Add to Cart. | Total: $105. | [ ] |
| **TC 5.02** | `Checkbox ($10+$15)` | Select Both | Check Choice A and Choice B. Add to Cart. | Total: $125. | [ ] |
| **TC 5.03** | `Number (Qty Mult $5)`| Qty = 3 | Enter 3 in number field. Add to Cart. | Total: $115 ($100 + $15). | [ ] |
| **TC 5.04** | `Formula Field ($20)` | Select | Select formula trigger. Add to Cart. | Total: $120. | [ ] |
| **TC 5.05** | `Percentage (10%)` | Select | Select field with 10% price. Add to Cart. | Total: $110. | [ ] |

---

## 5.2 WooCommerce Order Meta & Data

| Test ID | Field Type | Action | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 5.11** | `Text` | Complete Order | Store custom text. View in Checkout & History. | "Label: [Value]" is clearly visible. | [ ] |
| **TC 5.12** | `File` | Upload & Order | Upload image. Complete checkout. | Admin Order shows clickable link to file. | [ ] |
| **TC 5.21** | `Admin UI` | Review Order | Check Order items in WooCommerce backend. | All OptionBay fields are listed under the Item. | [ ] |
| **TC 5.22** | `Email` | View Email | View Order Confirmation Email. | Options are listed beneath the product name. | [ ] |

---

## 5.3 Conditional Pricing Verification

| Test ID | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC 5.31** | `Hidden with Price` | Hide field ($50) via logic. Add to Cart. | Price remains $100. Meta is empty. | [ ] |
| **TC 5.32** | `Visible with Price`| Show field ($10) via logic. Add to Cart. | Price is $110. Meta is stored. | [ ] |
| **TC 5.33** | `Reset Logic` | Check trigger (shows $5), Uncheck trigger (hides $5). | Price returns to $100 before Add to Cart. | [ ] |
