# Neobrutalism Design System

## Overview

**Neobrutalism** (or "Neo-Brutalism") is a bold, raw design style rooted in architectural Brutalism. It rejects polished aesthetics in favor of harsh shadows, thick black borders, high-contrast color clashes, and unapologetically loud typography. It's designed to grab attention and make a statement.

**Origin:** Inspired by Brutalist architecture (1950s–1970s) and adapted for digital interfaces around 2020–2021. Popularized by Gumroad's redesign.

**Best for:** Startups, creative portfolios, design agency sites, landing pages, editorial platforms.

---

## Design Tokens

### Colors
```
Background:    #fffbe6 (warm cream)
Surface:       #ffffff
Primary:       #ff5252 (bold red)
Secondary:     #ffe156 (electric yellow)
Tertiary:      #6c63ff (purple)
Quaternary:    #42e695 (green)
Black:         #000000
Text:          #000000
```

### Shadows
```
Offset:     4px 4px 0px #000000
Offset-lg:  6px 6px 0px #000000
Offset-xl:  8px 8px 0px #000000
Hover:      2px 2px 0px #000000
```

### Borders
```
Standard:   2px solid #000000
Thick:      3px solid #000000
Heavy:      4px solid #000000
```

### Border Radius
```
None:       0px
Small:      4px
Medium:     8px
Pill:       50px (rare — neobrutalism favors sharp corners)
```

### Typography
```
Font Family:     'Space Grotesk', 'Inter', sans-serif
Heading Weight:  800-900
Body Weight:     500-600
Mono:            'JetBrains Mono', monospace
Size Scale:      0.875rem, 1rem, 1.25rem, 1.75rem, 2.5rem, 4rem
```

---

## CSS Variables

```css
:root {
  /* Colors */
  --brut-bg: #fffbe6;
  --brut-surface: #ffffff;
  --brut-primary: #ff5252;
  --brut-secondary: #ffe156;
  --brut-tertiary: #6c63ff;
  --brut-green: #42e695;
  --brut-black: #000000;
  --brut-text: #000000;
  
  /* Shadows */
  --brut-shadow: 4px 4px 0px var(--brut-black);
  --brut-shadow-lg: 6px 6px 0px var(--brut-black);
  --brut-shadow-hover: 2px 2px 0px var(--brut-black);
  
  /* Borders */
  --brut-border: 2px solid var(--brut-black);
  --brut-border-thick: 3px solid var(--brut-black);
  
  /* Radius */
  --brut-radius: 4px;
  
  /* Transitions */
  --brut-transition: all 0.15s ease;
}
```

---

## Component Recipes

### Button
```css
.brut-button {
  background: var(--brut-primary);
  color: var(--brut-black);
  border: var(--brut-border-thick);
  padding: 12px 28px;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: var(--brut-shadow);
  cursor: pointer;
  transition: var(--brut-transition);
}

.brut-button:hover {
  transform: translate(2px, 2px);
  box-shadow: var(--brut-shadow-hover);
}

.brut-button:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

### Card
```css
.brut-card {
  background: var(--brut-surface);
  border: var(--brut-border-thick);
  box-shadow: var(--brut-shadow-lg);
  padding: 24px;
  transition: var(--brut-transition);
}

.brut-card:hover {
  transform: translate(2px, 2px);
  box-shadow: var(--brut-shadow);
}
```

### Input Field
```css
.brut-input {
  background: var(--brut-surface);
  border: var(--brut-border);
  padding: 14px 18px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--brut-text);
  width: 100%;
  outline: none;
}

.brut-input:focus {
  box-shadow: var(--brut-shadow);
  border-color: var(--brut-primary);
}
```

### Toggle Switch
```css
.brut-toggle {
  width: 56px;
  height: 28px;
  background: var(--brut-surface);
  border: var(--brut-border);
  position: relative;
  cursor: pointer;
}

.brut-toggle .knob {
  width: 20px;
  height: 20px;
  background: var(--brut-black);
  position: absolute;
  top: 2px;
  left: 3px;
  transition: var(--brut-transition);
}

.brut-toggle.active {
  background: var(--brut-secondary);
}

.brut-toggle.active .knob {
  left: 31px;
}
```

### Progress Bar
```css
.brut-progress {
  height: 16px;
  background: var(--brut-surface);
  border: var(--brut-border);
  overflow: hidden;
}

.brut-progress-fill {
  height: 100%;
  background: repeating-linear-gradient(
    -45deg,
    var(--brut-primary),
    var(--brut-primary) 5px,
    var(--brut-secondary) 5px,
    var(--brut-secondary) 10px
  );
}
```

---

## Do's and Don'ts

### ✅ Do
- Use maximum contrast: black text on bright backgrounds
- Keep borders thick and visible — they ARE the design
- Use bold, heavy typography (800–900 weight)
- Embrace "ugly" — imperfection is the point
- Offset shadows should go bottom-right consistently

### ❌ Don't
- Use gradients or soft shadows — that defeats the purpose
- Round corners too much — sharp or minimal radius only
- Use subtle, muted colors — go loud or go home
- Mix with glassmorphism or neomorphism — they're fundamentally opposite
- Forget to maintain interactive feedback (hover/active states are critical)

---

## Accessibility Notes

✅ **Neobrutalism is inherently accessible** — its high-contrast nature naturally meets WCAG standards.

- **Contrast:** Black borders and text on bright backgrounds easily exceed 7:1 ratio (WCAG AAA).
- **Focus states:** The thick borders make focus indicators naturally visible.
- **Interactive feedback:** The shadow-shift on hover/active provides clear visual feedback.

```css
/* Focus state — already high contrast */
.brut-button:focus-visible {
  outline: 3px solid var(--brut-tertiary);
  outline-offset: 3px;
}
```
