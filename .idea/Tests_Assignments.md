# OptionBay End-User Tests: Part 4 - Assignment Rules

This document provides exhaustive, row-by-row test cases for Part 4 of the master matrix (`tests.md`).

---

## 4.1 Visibility & Reach (Inclusions)

**Precondition**: Option Group A with specific rules.

| Test ID | Visibility | Reach | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 4.01** | `Global` | *(All)* | Global rule. Visit random product. | Group is visible. | [ ] |
| **TC 4.11** | `Targeted` | `Category X` | Visit Product P in Category X. | Group is visible. | [ ] |
| **TC 4.12** | `Targeted` | `Category X` | Visit Product Q in Category Y. | Group is absent. | [ ] |
| **TC 4.21** | `Targeted` | `Tag T` | Visit Product with Tag T. | Group is visible. | [ ] |
| **TC 4.22** | `Targeted` | `Tag T` | Visit Product without Tag T. | Group is absent. | [ ] |
| **TC 4.31** | `Targeted` | `Product A` | Visit Product A. | Group is visible. | [ ] |
| **TC 4.32** | `Targeted` | `Product A` | Visit Product B. | Group is absent. | [ ] |

---

## 4.2 Exceptions (Exclusions)

**Precondition**: Global visibility unless overridden.

| Test ID | Visibility | Reach | Exceptions | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 4.41** | `Global` | *(All)* | `Product B` | Visit Product C. | Group is visible (Global). | [ ] |
| **TC 4.42** | `Global` | *(All)* | `Product B` | Visit Product B. | Group is hidden (Exception). | [ ] |
| **TC 4.51** | `Targeted` | `Cat X` | `Prod A` | Visit Prod A (in Cat X). | Group is hidden (Exception). | [ ] |
| **TC 4.61** | `Global` | *(All)* | `Tag T` | Visit product with Tag T. | Group is hidden (Exception). | [ ] |

---

## 4.3 Priority & Sorting

**Precondition**: Multiple groups assigned to same product.

| Test ID | Setup | Rule | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 4.71** | `Group 1 (P10)` | `Group 2 (P1)` | Visit Product. | Group 2 ABOVE Group 1. | [ ] |
| **TC 4.72** | `Group 1 (P1)` | `Group 2 (P10)` | Visit Product. | Group 1 ABOVE Group 2. | [ ] |
| **TC 4.81** | `Global (P10)` | `Target (P1)` | Visit Target Product. | Target group is at top. | [ ] |
