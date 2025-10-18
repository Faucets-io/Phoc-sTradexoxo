# Design Guidelines: CEX Trading Platform

## Design Approach

**Primary Reference**: Binance, Coinbase Pro, and Kraken with Material Design system principles for consistency.

**Rationale**: Financial trading platforms require high trust, data clarity, and operational efficiency. We'll blend the professional polish of established exchanges with modern web design patterns.

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (Trading Interface):
- Background: 210 20% 8% (Deep navy-black)
- Surface: 210 18% 12% (Elevated panels)
- Surface Elevated: 210 16% 16% (Cards, modals)
- Border: 210 15% 20% (Subtle divisions)

**Accent Colors**:
- Primary/Brand: 200 100% 45% (Professional cyan-blue)
- Success/Buy: 145 65% 45% (Green for buy orders)
- Danger/Sell: 0 70% 55% (Red for sell orders)
- Warning: 35 90% 55% (Amber for alerts)
- Neutral: 210 10% 70% (Text secondary)

**Light Mode** (Landing Page):
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text: 210 25% 15%
- Primary: 200 100% 40%

### B. Typography

**Font Stack**:
- Primary: 'Inter' (UI, body text, trading data)
- Display: 'Plus Jakarta Sans' (Landing page headlines)
- Monospace: 'JetBrains Mono' (Prices, numbers, order data)

**Type Scale**:
- Display: text-5xl to text-6xl (Landing headlines)
- Heading: text-2xl to text-3xl (Section titles)
- Body: text-base (16px default)
- Small: text-sm (Tables, labels)
- Tiny: text-xs (Timestamps, metadata)
- Numbers: Tabular nums, medium weight for price data

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy**:
- Landing Page: max-w-7xl with px-6 to px-12 horizontal padding
- Trading Interface: Full-width with internal grid-based divisions
- Forms: max-w-md for login/signup

**Grid System**:
- Landing: 12-column responsive grid
- Trading Dashboard: Fixed sidebar (240px) + flexible main area
- Charts/Data: CSS Grid with fr units for proportional scaling

### D. Component Library

**Navigation**:
- Landing: Transparent-to-solid on scroll, blur backdrop, centered logo, right-aligned CTA
- Trading: Persistent top bar with ticker tape, user menu, notifications

**Buttons**:
- Primary: Filled with brand color, medium rounded (rounded-lg)
- Secondary: Outline with border-2
- Danger/Success: Contextual colors for buy/sell actions
- Sizes: sm, default, lg

**Cards**:
- Landing: Elevated shadow-xl, rounded-2xl, p-8 to p-12
- Trading: Minimal shadow-sm, rounded-lg, p-4 to p-6, dark borders

**Forms**:
- Input fields: Rounded-lg, dark backgrounds with lighter borders
- Focus states: Ring-2 in primary color
- Labels: text-sm, mb-2, medium weight
- Validation: Inline error messages in danger color

**Data Display**:
- Tables: Striped rows, hover states, sticky headers
- Order Book: Two-column layout, color-coded buy/sell
- Price Tickers: Horizontal scroll, monospace, real-time updates

**Trading Components**:
- Chart Container: TradingView-style with dark theme
- Order Entry: Tabbed interface (Market/Limit), numeric inputs with +/- controls
- Portfolio Cards: Grid layout showing balances, 24h change with sparklines

**Overlays**:
- Modals: Centered, max-w-2xl, backdrop blur
- Dropdowns: Shadow-xl, rounded-lg, slide-in animation
- Tooltips: Dark bg, text-xs, rounded

### E. Animations

Use extremely sparingly:
- Page transitions: Subtle fade (150ms)
- Hover states: scale-105 on cards (200ms)
- Loading: Skeleton screens, not spinners
- Price updates: Brief flash animation on value change

---

## Landing Page Specifications

**Layout Structure** (7 sections):

1. **Hero Section** (90vh):
   - Full-width split: Left = Headline + CTA, Right = Live trading preview/screenshot
   - Gradient overlay: 200 100% 45% to 260 90% 50%
   - Trust indicators: "Trusted by 100K+ traders" below headline

2. **Live Ticker Bar** (Below hero):
   - Horizontal scroll of top crypto prices
   - Auto-updating, smooth animations

3. **Features Grid** (3 columns):
   - Icon + Title + Description cards
   - Features: Lightning-fast trades, Advanced charts, Secure wallets, Low fees, 24/7 support, Mobile app
   - Hover: lift effect (translateY -4px)

4. **Trading Interface Preview**:
   - Full-width screenshot/mockup of actual platform
   - Annotated callouts highlighting key features
   - Dark mode showcase

5. **Stats Section** (4 columns):
   - Trading Volume, Active Users, Supported Coins, Countries Served
   - Large numbers in display font, animated count-up on scroll

6. **Security & Trust**:
   - 2-column: Left = Security features list, Right = Certification badges
   - Icons for: 2FA, Cold storage, Insurance, Compliance

7. **CTA Section**:
   - Centered, gradient background
   - "Start Trading Today" headline
   - Email input + "Create Account" button combo
   - Footer: Links, social, disclaimer

**Color Usage**: Bold cyan-blue primary, conservative use of gradients only in hero and final CTA. Generous whitespace (py-20 to py-32 between sections).

---

## Trading Interface Specifications

**Layout**: 
- Fixed header (64px)
- Left sidebar (240px, collapsible): Market list, favorites
- Main area divided: Chart (60% height), Order entry (40% height)
- Right sidebar (300px): Order book, recent trades

**Dashboard Grid**:
- Portfolio overview: 3-column card grid
- Recent orders: Full-width table
- Quick actions: Fixed bottom bar on mobile

**Color-Coding System**:
- Positive values: Success green
- Negative values: Danger red
- Neutral: Text secondary
- Current price: Primary brand color

---

## Images

**Landing Page**:
1. **Hero Image**: Full-width, right-aligned screenshot of trading interface in action (charts, order book visible), showing professional dark-themed UI
2. **Feature Icons**: Use Heroicons for all feature cards (no custom SVGs)
3. **Security Badges**: Standard trust logos (SSL, compliance marks)
4. **Trading Preview**: Full-screen mockup of platform with annotated features

**Trading Interface**:
- No decorative images; focus on data visualization
- User avatars: Circular, 32px to 40px
- Cryptocurrency logos: Via CoinGecko API

---

## Key Principles

1. **Trust First**: Professional, stable design; no experimental patterns in trading UI
2. **Data Clarity**: High contrast for numbers, color-coded for quick comprehension
3. **Responsive Breakpoints**: Desktop-first for trading (min-width: 1024px), mobile-optimized landing
4. **Performance**: Minimize animations in trading interface, prioritize data updates
5. **Accessibility**: WCAG AA contrast ratios, keyboard navigation for all trading actions