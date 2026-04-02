# OptionBay End-User Tests: Part 2 & 3 - Logic & Chains

This document provides exhaustive, row-by-row test cases for Part 2 and Part 3 of the master matrix (`tests.md`).

---

## 2.1 Operators on Text / Email / Textarea Targets

**General Precondition**: Target Field (A) and Dependent Field (B). B is hidden by default.

| Test ID | Operator | Value | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 2.01** | `==` | "John" | Type "John" in A. Then type "John Doe". | B shows on "John". B hides on "John Doe". | [ ] |
| **TC 2.02** | `!=` | "None" | Type "A". Then type "None". | B shows on "A". B hides on "None". | [ ] |
| **TC 2.03** | `contains` | "VIP" | Type "Hello VIP user". | B shows. | [ ] |
| **TC 2.04** | `not_contains`| "spam" | Type "This is spam". | B remains hidden. | [ ] |
| **TC 2.05** | `empty` | *(blank)* | Leave A empty. Then type "A". | B shows if empty. B hides if not empty. | [ ] |
| **TC 2.06** | `not_empty` | *(blank)* | Type "A". Then delete text. | B shows if not empty. B hides if empty. | [ ] |

---

## 2.2 Operators on Number Targets

| Test ID | Operator | Value | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 2.11** | `==` | 18 | Type 18. Type 19. | B shows on 18. B hides on 19. | [ ] |
| **TC 2.12** | `!=` | 0 | Type 5. Type 0. | B shows on 5. B hides on 0. | [ ] |
| **TC 2.13** | `>` | 10 | Type 11. Type 10. | B shows on 11. B hides on 10. | [ ] |
| **TC 2.14** | `<` | 5 | Type 4. Type 5. | B shows on 4. B hides on 5. | [ ] |
| **TC 2.15** | `>=` | 21 | Type 21. Type 20. | B shows on 21. B hides on 20. | [ ] |
| **TC 2.16** | `<=` | 12 | Type 12. Type 13. | B shows on 12. B hides on 13. | [ ] |

---

## 2.3 Operators on Choice Targets (Select, Radio, Checkbox)

**Note**: For choices, specify the exact choice label as the value.

| Test ID | Operator | Value | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 2.21** | `==` | "Wood" | Target: Select (Wood, Plastic). Select Wood. | B shows. | [ ] |
| **TC 2.22** | `!=` | "Plastic" | Target: Select (Wood, Plastic). Select Wood. | B shows. Select Plastic -> B hides. | [ ] |
| **TC 2.23** | `empty` | *(blank)* | Target: Radio. No selection made. | B shows. Select any radio -> B hides. | [ ] |
| **TC 2.24** | `==` | "Option2" | Target: Checkbox. Check Option 2. | B shows. | [ ] |
| **TC 2.25** | `!=` | "Option1" | Target: Checkbox. Check Option 1. | B hides. Check Option 3 instead -> B shows. | [ ] |

---

## 2.4 Complex Match Logistics (ALL vs ANY)

| Test ID | Logic Type | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 2.31** | `Match ALL` | A (== Yes), B (> 10) | Match A only. Then match A and B. | B shows ONLY when both met. | [ ] |
| **TC 2.32** | `Match ANY` | A (== Yes), B (> 10) | Match A only. Then neither. | B shows when at least one met. | [ ] |

---

## Part 3: Nested Conditional Chains

| Test ID | Chain Level | Trigger | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 3.01** | `1 -> 2` | Chbox (X) -> Select (Y) | Check Box X. | Select Y appears. | [ ] |
| **TC 3.02** | `2 -> 3` | Select (Y) -> File (Z) | Select style in Y. | File Z upload appears. | [ ] |
| **TC 3.03** | `3 -> 4` | File (Z) -> Textarea (W) | Upload File Z. | Textarea W appears. | [ ] |
| **TC 3.04** | `Reset` | Uncheck Root (X) | Uncheck Box X. | Y, Z, and W ALL disappear instantly. | [ ] |
