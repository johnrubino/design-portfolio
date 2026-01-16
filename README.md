# John's Portfolio Website

A portfolio website built using a custom skeuomorphic design system with 3D depth, glows, and Material Design motion.

## Project Structure

```
portfolio/
├── index.html          # Homepage with featured work and skills
├── about.html          # About page with experience timeline
├── writing.html        # Writing/blog page with article cards
├── case-study-nao.html # New Account Opening case study with floating stepper
└── README.md           # This file
```

## Design System Features

- **Skeuomorphic Styling**: 3D depth with inset highlights, layered shadows, and physical button design
- **Color Palette**: Dark theme (#141414) with orange (#FF8C42) and purple (#667eea) accents
- **Typography**: Inter font family with consistent hierarchy
- **Motion System**: Material Design easing curves (cubic-bezier functions)
- **Components**: 
  - Buttons with radial gradients and border glows
  - Cards with purple hover glow effects
  - Stepper navigation with scroll spy
  - Stats tables, quote blocks, highlight boxes

## Pages Overview

### Homepage (`index.html`)
- Hero section with positioning statement
- Featured projects grid (3 cards)
- Skills section with 6 skill cards
- Links to case study

### About Page (`about.html`)
- Profile header with social links
- Overview and approach sections
- Experience timeline with 3 entries
- Core themes with stat cards
- Skills tags
- Beyond work section

### Writing Page (`writing.html`)
- Page header with Substack CTA
- Filter buttons for categories
- Featured article (large card)
- Article grid (9 regular articles)
- Newsletter signup section

### Case Study (`case-study-nao.html`)
- Floating stepper navigation (8 sections)
- Long-scroll layout with scroll spy
- Complete NAO redesign case study content
- Stats tables, quotes, and highlight boxes

## Technical Details

- Pure HTML + CSS + Vanilla JS (no frameworks)
- Responsive design (mobile-friendly)
- Fixed navigation header
- Smooth scroll behavior
- No external dependencies except Google Fonts (Inter)

## Design System Components Used

### Buttons
- Radial gradient background
- Gradient border using pseudo-elements
- Glass shine overlay
- Hover states with elevation
- Active/pressed states

### Cards
- Light gradient background for readability
- Purple glow on hover with multiple box-shadows
- Border transitions
- 3D layering with inset highlights

### Stepper
- Three states: Active (orange), Completed (purple ✓), Inactive (gray)
- Connecting lines between steps
- Scroll spy functionality
- Clickable navigation

## Color Variables

```css
--primary-bg: #141414     /* Main background */
--secondary-bg: #1a1a1a   /* Cards, sections */
--surface-bg: #2a2a2a     /* Elevated surfaces */
--border-color: #3a3a3a   /* Borders */
--text-primary: #ffffff   /* Headings, important text */
--text-secondary: #b0b0b0 /* Body text, secondary info */
--accent-orange: #FF8C42  /* Primary actions, active states */
--accent-purple: #667eea  /* Completed states, links */
```

## Motion Curves

- **Standard Effects Fast**: `cubic-bezier(0.31, 0.94, 0.34, 1.00)` - 150ms
- **Standard Effects Default**: `cubic-bezier(0.34, 0.80, 0.34, 1.00)` - 200ms
- **Standard Effects Slow**: `cubic-bezier(0.34, 0.88, 0.34, 1.00)` - 300ms

## Getting Started with Claude Code

To work on this portfolio in Claude Code:

1. Open your terminal
2. Navigate to this folder
3. Run `claude` to start Claude Code
4. You can now edit any of the HTML files
5. Open files in a browser to preview changes

## Customization

To customize this portfolio for yourself:

1. Update personal information in `index.html`, `about.html`
2. Add your own project images to replace emoji placeholders
3. Update case study content in `case-study-nao.html`
4. Add your own writing articles in `writing.html`
5. Update social links and contact information
6. Replace "John" with your own name throughout

## Browser Compatibility

- Modern Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- All styles are inline in each HTML file (no external CSS)
- JavaScript is minimal and embedded in each page
- Design system emphasizes physical, tactile interactions
- Focus on professional enterprise aesthetic (BNY Pershing style)
