# Design System Specification: The Precision Workshop

## 1. Overview & Creative North Star
**Creative North Star: "Industrial High-Fidelity"**

This design system rejects the "cluttered dashboard" trope in favor of an editorial, high-utility experience tailored for the modern craftsman. It treats digital space like a well-organized workshop: every tool has a place, and every measurement is sacred. 

We break the "template" look by utilizing **Intentional Asymmetry**. Instead of a centered, boxed-in layout, we use a weighted left-hand grid for primary data inputs, balanced by expansive, airy "Live Summary" panels on the right. We replace noisy borders with **Tonal Zonation**, creating a sense of physical depth that feels like stacked timber or machined steel. The result is a premium, authoritative interface that feels as reliable as a cast-iron table saw.

---

## 2. Colors: The Palette of the Shop
The palette utilizes earthy, sawdust-inspired neutrals and deep industrial charcoals, punctuated by a high-visibility "Safety Orange" for critical path actions.

### Core Tones
- **Primary (`#a43700`):** The "Safety Orange." Used exclusively for primary calls to action and active states. It must command attention against the sawdust-neutral backgrounds.
- **Tertiary (`#186a22`):** The "Forest Green." Used for "Success" states, "In-Stock" indicators, or "Project Complete" confirmations.
- **Surface Neutrals:** A range of `f9f9f6` (Surface) to `eeeeeb` (Container) that mimics the clean, neutral light of a professional studio.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. To separate the "Cut List" from the "Project Specs," use a background shift. 
*   **Example:** A `surface-container-low` (`#f4f4f1`) sidebar sitting against a `surface` (`#f9f9f6`) main stage. 

### Surface Hierarchy & Nesting
Treat the UI as a physical assembly. 
1.  **Base Layer:** `surface` (The workshop floor).
2.  **Section Layer:** `surface-container-low` (The workbench).
3.  **Active Component:** `surface-container-lowest` (`#ffffff`) (The blueprint sitting on the bench).

### The Glass & Gradient Rule
For "Live Summary" panels that float over scrolling data, use **Glassmorphism**. Apply `surface-container-high` at 80% opacity with a `20px` backdrop blur. For primary CTAs, apply a subtle linear gradient from `primary` (`#a43700`) to `primary_container` (`#cd4700`) at a 145-degree angle to give the button a "machined" weight.

---

## 3. Typography: Measured Clarity
We use a high-contrast pairing of **Space Grotesk** for brand authority and **Inter** for technical legibility.

- **Display & Headlines (Space Grotesk):** These are your "Engravings." Use `display-md` for project titles. The slightly geometric, industrial nature of Space Grotesk mirrors the precision of woodworking tools.
- **Body & Labels (Inter):** The workhorse. Use `body-md` for all instructional text. 
- **Numerical Data (Monospaced):** All measurements, dimensions, and tolerances *must* be rendered in a monospaced stack (fallback to `Courier New` or `SF Mono`). This ensures that decimals align perfectly in tables, preventing costly misreads in the shop.

---

## 4. Elevation & Depth: Tonal Layering
In a workshop, depth is physical. In this system, depth is tonal.

- **The Layering Principle:** Avoid shadows for static elements. A `surface-container-highest` card placed on a `surface-container-low` background provides enough "lift" through contrast alone.
- **Ambient Shadows:** For floating modals or dropdowns, use a "Dust Shadow": `box-shadow: 0 12px 40px rgba(26, 28, 27, 0.08)`. The shadow color is derived from `on-surface`, making it feel like ambient shop light rather than a digital glow.
- **The Ghost Border:** If a boundary is required for a complex input grid, use `outline-variant` (`#e3bfb2`) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Built for the Bench

### Input Fields (The Measurement Hub)
Inputs are the most critical component. They feature a `surface-container-highest` background and a thick 2px bottom-stroke of `outline` (`#8f7066`). 
- **Focus State:** The bottom-stroke transitions to `primary` (`#a43700`).
- **Suffixes:** Units (in, mm, ft) are permanently visible using `label-md` in the `secondary` color, pinned to the right.

### Buttons
- **Primary:** High-saturation `primary` fill, white text, `md` (0.375rem) corner radius.
- **Secondary:** `secondary_container` fill. No border.
- **Tertiary:** Text-only, using `primary` color with an underline that only appears on hover.

### Data Cards & Tables
- **Forbid Dividers:** Use `1.3rem` (Spacing 6) of vertical whitespace to separate rows in a table. 
- **Zebra Striping:** Use a subtle shift between `surface` and `surface-container-low` for alternating rows.
- **Live Summary Panels:** These should be anchored or floating "HUD" style elements using the Glassmorphism rule to stay present while the user scrolls through long timber tallies.

### The "Measurement Chip"
A custom component for quick-reference dimensions. A `secondary_fixed` background with `on_secondary_fixed` text, using a monospaced font. It looks like a dymo-label or a pencil mark on a piece of pine.

---

## 6. Do’s and Don’ts

### Do:
- **Do** align all numerical decimals in tables using monospaced fonts.
- **Do** use `Spacing 8` (1.75rem) as your default gutter between major layout sections to allow for "visual breathing room" in high-stress workshop environments.
- **Do** use `primary` orange sparingly—only for things that *move* the project forward.

### Don't:
- **Don't** use 100% black. Use `on_surface` (`#1a1c1b`) for a softer, more natural high-contrast look.
- **Don't** use rounded corners larger than `xl` (0.75rem). This system is about precision; overly "bubbly" corners feel toy-like and unprofessional.
- **Don't** use dividers or lines to separate content. If it feels cluttered, increase the background contrast or the padding.

### Accessibility Note:
Ensure all primary actions pass AA contrast ratios against the neutral backgrounds. The workshop environment often has high glare; high-contrast typography and clear "surface stacking" are functional requirements, not just aesthetic choices.