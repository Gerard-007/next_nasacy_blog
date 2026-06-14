---
name: Prose & Clarity
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd8e4'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fe'
  surface-container: '#efecf8'
  surface-container-high: '#e9e6f3'
  surface-container-highest: '#e4e1ed'
  on-surface: '#1b1b23'
  on-surface-variant: '#464554'
  inverse-surface: '#303038'
  inverse-on-surface: '#f2effb'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#fcf8ff'
  on-background: '#1b1b23'
  surface-variant: '#e4e1ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.75'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  content-max: 720px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 20px
---

## Brand & Style
The design system focuses on a **refined minimalist** aesthetic tailored for a high-end, professional blogging environment. The brand personality is intellectual, focused, and dependable, designed to let content breathe without visual distraction.

The style leverages heavy whitespace, a disciplined color application, and subtle depth to guide the reader's eye. It avoids unnecessary ornamentation, opting instead for precision in typography and alignment. The target audience includes industry thought leaders, professional writers, and readers who value a premium, "zen-like" reading experience.

## Colors
The palette is rooted in a crisp white background to maximize legibility and "airiness." 
- **Primary Indigo** is reserved for high-priority actions and brand moments.
- **Secondary Teal** acts as a subtle accent for success states or category tags.
- **Surface Gray** creates soft containment for cards and secondary sidebars without breaking the flow of the page.
- **Text Tones** are carefully selected; the primary text uses a deep gray rather than pure black to reduce eye strain during long-form reading, while secondary text handles metadata and captions.

## Typography
This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian feel that scales perfectly from small labels to massive headlines. 

The core of the system is the `body-lg` role, optimized with a generous `1.75` line-height for maximum readability in long-form articles. Headlines use tighter tracking (letter-spacing) and heavier weights to provide a strong visual anchor against the lighter body text. On mobile, display sizes scale down to ensure titles remain visible within the viewport without excessive wrapping.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for content reading to prevent line lengths from becoming too wide, which fatigues the reader. 
- **Desktop:** A 12-column grid for landing pages, but article content is restricted to a centered 720px column.
- **Breakpoints:** Mobile (<768px), Tablet (768px - 1024px), Desktop (>1024px).
- **Rhythm:** Spacing follows a strict 8px linear scale. Use `32px` (4 units) for standard component spacing and `64px` (8 units) for section padding to reinforce the minimalist sense of scale.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and tonal layering. 
- **Level 0 (Background):** Pure White (#ffffff).
- **Level 1 (Cards/Surface):** Soft shadow (0px 4px 20px rgba(51, 65, 85, 0.05)) with an optional 1px border in Light Gray (#f1f5f9).
- **Level 2 (Hover/Modals):** More pronounced shadow (0px 10px 30px rgba(51, 65, 85, 0.1)) to indicate interactivity.

Sticky navigation elements should use a backdrop-blur (12px) with a semi-transparent white background (80% opacity) to maintain context of the scroll position without cluttering the view.

## Shapes
The shape language is consistently **Rounded (0.5rem)**. This provides a approachable, modern feel that softens the "serious" nature of professional content.
- Small components (Buttons, Inputs, Badges) use `0.5rem`.
- Large components (Cards, Feature Images) use `1rem` (rounded-lg).
- Interactive elements should never be sharp; even focus states should follow the container's radius.

## Components
- **Buttons:** Primary buttons use a solid Indigo fill with white text. Hover states transition to a slightly darker shade. Secondary buttons use a ghost style (Indigo border/text) or a light gray fill.
- **Cards:** Cards for blog posts should have a subtle Level 1 shadow and a 1px border. The image should be at the top with a `1rem` top-radius, while the container has a uniform `1rem` radius.
- **Sticky Navigation:** A slim top-bar (64px height) that stays fixed. Use a subtle bottom border (#f1f5f9) instead of a heavy shadow.
- **Input Fields:** Use the Surface color (#f8fafc) for the background with a 1px border that turns Indigo on focus. Labels should be small and bold (`label-md`).
- **Chips/Tags:** Small, pill-shaped elements with the Secondary Teal tint (#f0fdfa) and Teal text (#0d9488) to categorize content without drawing too much attention away from the title.