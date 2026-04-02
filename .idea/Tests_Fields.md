# OptionBay End-User Tests: Part 1 - Fields & Pricing

This document provides exhaustive, row-by-row test cases for Part 1 of the master matrix (`tests.md`).

---

## 1.1 Text Input & Textarea

**General Precondition**: Option Group assigned to a product with base price $100.

| Test ID | Field Type | Price Type | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1.01** | **Text** | `None` | Add Text field. Type "Hello". | Total remains $100. | [ ] |
| **TC 1.02** | **Text** | `Flat` | Add Text field, Price: $10. Type "A". | Total updates to $110. | [ ] |
| **TC 1.03** | **Text** | `Percentage` | Add Text field, Price: 10%. Type "A". | Total updates to $110. | [ ] |
| **TC 1.04** | **Text** | `Char Count` | Add Text field, Price: $1. Type "Apple". | Total updates to $105. | [ ] |
| **TC 1.05** | **Text** | `Qty Mult.` | Add Text field, Price: $5. (Product Qty=2). Type "A". | Total updates to $110 ($5 * 2). | [ ] |
| **TC 1.06** | **Text** | `Formula` | Add Text field. Formula: `[price] * 2`. Type "A". | Total adds calculated formula value ($20). | [ ] |
| **TC 1.11** | **Textarea**| `None` | Add Textarea. Type multi-line text. | Total remains $100. | [ ] |
| **TC 1.12** | **Textarea**| `Flat` | Add Textarea, Price: $15. Type "Hello". | Total updates to $115. | [ ] |
| **TC 1.13** | **Textarea**| `Percentage` | Add Textarea, Price: 5%. Type "Hello". | Total updates to $105. | [ ] |
| **TC 1.14** | **Textarea**| `Char Count` | Add Textarea, Price: $0.10. Type 100 chars. | Total updates to $110 ($0.10 * 100 = $10). | [ ] |

---

## 1.2 Number Input

| Test ID | Field Type | Price Type | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1.21** | **Number** | `None` | Add Number field. Type "5". | Total remains $100. | [ ] |
| **TC 1.22** | **Number** | `Flat` | Add Number field, Price: $5. Type "3". | Total updates to $105. | [ ] |
| **TC 1.23** | **Number** | `Percentage` | Add Number field, Price: 10%. Type "1". | Total updates to $110. | [ ] |
| **TC 1.24** | **Number** | `Qty Mult.` | Add Number field, Price: $5. Type "4". | Total updates to $120 ($5 * 4). | [ ] |
| **TC 1.25** | **Number** | `Formula` | Add Number field. Formula: `[value] * 10`. Type "2". | Total updates to $120 ($2 * 10 = $20). | [ ] |

---

## 1.3 Choice-Based Fields (Select, Radio, Checkbox, Swatches)

**Note**: For choice-based fields, verify that the price is correctly applied to the specific selection.

| Test ID | Field Type | Target | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1.31** | **Select** | `Choice 1` | Choice 1 has `None` / `Flat $0`. Select Choice 1. | Total remains $100. | [ ] |
| **TC 1.32** | **Select** | `Choice 2` | Choice 2 has `Flat $5`. Select Choice 2. | Total updates to $105. | [ ] |
| **TC 1.33** | **Select** | `Choice 3` | Choice 3 has `Percentage 15%`. Select Choice 3. | Total updates to $115. | [ ] |
| **TC 1.34** | **Radio** | `Choice B` | A ($5), B ($10). Select B. Then switch to A. | Updates from $110 to $105 correctly. | [ ] |
| **TC 1.35** | **Checkbox**| `Both` | A ($5), B ($10). Check both. Uncheck B. | $115 with both. $105 with only A. | [ ] |
| **TC 1.36** | **Checkbox**| `Percentage` | A (10%), B (20%). Check both. | Total adds $30 (10% + 20% of base). | [ ] |
| **TC 1.37** | **Color** | `Swatch` | Red ($0), Gold ($50). Select Gold. | Total updates to $150. | [ ] |
| **TC 1.38** | **Image** | `Swatch` | Small (0%), Premium (10%). Select Premium. | Total updates to $110. | [ ] |

---

## 1.4 File Upload, Email, Date, Time

| Test ID | Field Type | Price Type | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1.41** | **File** | `None` | Add File field. Upload JPG. | Total remains $100. | [ ] |
| **TC 1.42** | **File** | `Flat` | Add File field, Price: $25. Upload PNG. | Total updates to $125. | [ ] |
| **TC 1.43** | **File** | `Percentage` | Add File field, Price: 5%. Upload JPG. | Total updates to $105. | [ ] |
| **TC 1.44** | **Email** | `Flat` | Add Email field, Price: $5. Enter valid email. | Total updates to $105. | [ ] |
| **TC 1.45** | **Date** | `Flat` | Add Date field, Price: $50. Select date. | Total updates to $150. | [ ] |
| **TC 1.46** | **Date** | `Percentage` | Add Date field, Price: 10%. Select date. | Total updates to $110. | [ ] |
| **TC 1.47** | **Time** | `Flat` | Add Time field, Price: $10. Select time. | Total updates to $110. | [ ] |
