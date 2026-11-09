# Landing Page Rebuild Plan

## Goal Description

Rebuild the logic and UI/UX of the main landing page (`src/app/page.tsx`) for **Indigo Scholar**. The goal is to elevate the design from a standard template feel to a premium, modern consumer SaaS aesthetic using the guidelines from the `design-taste-frontend` skill. We will focus on typography, layout variance, tactile feedback, and purposeful motion.

## Design Read

**Reading this as**: Consumer SaaS landing page for IELTS students, with a premium, focused, and slightly playful language, leaning toward Tailwind utilities + Geist Sans + restrained motion (`motion/react`).

### The Three Dials

- **DESIGN_VARIANCE: 7** (Asymmetric layouts, strong bento grids, breaking away from standard centered blocks).
- **MOTION_INTENSITY: 6** (Purposeful scroll-reveals, tactile button feedback, smooth accordion transitions—no infinite spinners or generic parallax).
- **VISUAL_DENSITY: 3** (Generous whitespace, clear hierarchy, easily scannable value propositions).

---

## Proposed Changes

### 1. Typography & Global Styles

- **Headlines**: Enhance display typography using `GeistSans` with tight tracking (`tracking-tighter`) and tight line-height (`leading-[1.1]`).
- **Color Discipline**: Lock the primary accent to the brand's Indigo. Ensure no "warm beige/brass" slop is introduced. Check all button text contrast (WCAG AA).

### 2. Hero Section (`src/app/page.tsx`)

- **Layout**: Refine the split-screen layout to ensure the entire hero (headline, subtext, CTA, and image) fits comfortably within the initial desktop viewport (`min-h-[100dvh]`).
- **Top Padding**: Cap top padding at `pt-24` to prevent content from floating too far down.
- **CTAs**: Implement tactile feedback (`active:scale-[0.98]`) on the primary "Bắt đầu học" button.

### 3. Benefits Section (Bento Grid)

- **Visual Rhythm**: The current 4-item bento grid (7-col / 5-col split) will be polished with subtle hover elevation (`hover:-translate-y-1` and enhanced shadows).
- **Iconography**: Standardize icon `strokeWidth` (e.g., `1.5`) across all Bento cards.

### 4. Interactive Logic & Motion (`motion/react`)

- **Scroll Reveals**: Introduce a `RevealStagger` component for the "Một vòng học dễ duy trì" (Learning Rhythm) list. Items will fade and slide up gracefully as they enter the viewport.
- **Section Headers**: Add subtle `whileInView` entry animations for section titles to guide the user's eye.

### 5. FAQ Section

- **Smooth Accordion**: Upgrade the native HTML `<details>`/`<summary>` elements to a fully animated React component using `motion/react` (`AnimatePresence` and height animation) to prevent sudden layout jumps when opening answers.

---

## User Review Required

> [!IMPORTANT]  
> The plan introduces `motion/react` (Framer Motion) for scroll animations and smooth FAQ transitions. Please confirm if adding this dependency is acceptable for the landing page.

> [!TIP]  
> The current hero image is `/images/ielts-flow-hero-v2.webp`. We will keep this asset but refine its container's presentation. Let me know if you want to replace it.

## Verification Plan

### Automated Tests

- Run `npm run lint` and `npm run build` to ensure no regression or TS errors are introduced.

### Manual Verification

- Verify the Hero section fits in a standard 1080p desktop viewport without scrolling.
- Scroll down the page to verify the staggered entry animations on the Learning Rhythm section.
- Click the FAQ items to verify the smooth height transition (no layout snapping).
- Test primary CTAs for the tactile "push" effect (`:active`).
- View the page on a mobile device (or dev tools emulator) to ensure the Bento grid collapses gracefully to 1-column.
