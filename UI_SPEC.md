# UnitX - UI Specification

**Version:** 4.1
**Date:** 2026-01-10
**Platform:** React Native (Expo) - Android (Google Pixel 9)

---

## Overview

**UnitX** is a premium conversion utility app with a warm dark design and copper/terracotta accent color. The app features unit conversion, size charts, kitchen tools, currency exchange, and utility tools.

**Tagline:** "Convert with precision"
**Design Theme:** Premium Warm Dark - Sophisticated, elegant design inspired by premium product showcases

---

## Color Scheme

### Core Colors
```typescript
{
  // Backgrounds - warm dark grays instead of pure black
  main: '#141416',        // Main background - warm charcoal
  card: '#1c1c1e',        // Card background - elevated surface
  input: '#242426',       // Input fields - subtle lift
  subtle: '#38383a',      // Borders - soft definition

  // Text
  primary: '#f5f5f7',     // Primary text - warm white
  secondary: '#86868b',   // Secondary text - balanced gray

  // Accent - warm copper/terracotta
  accent: '#c9785d',      // Primary accent - warm copper
  accentMuted: '#c9785d20', // Muted accent for backgrounds
  accentHover: '#b56a50', // Hover state

  // Utility
  overlay: 'rgba(0,0,0,0.75)', // Modal overlay

  // Additional depth colors
  elevated: '#2c2c2e',    // Elevated surfaces
  highlight: '#48484a',   // Highlights and focus states
}
```

### Usage Guidelines
- **Active states:** Copper background (`#c9785d`) with warm white text (`#f5f5f7`)
- **Inactive states:** Transparent background with gray text (`#86868b`)
- **Bottom tab bar:** `#1c1c1e` (card color)
- **Active tab icon:** `#c9785d` (copper)
- **Inactive tab icon:** `#86868b` (gray)
- **Copied badge:** Copper background with dark text
- **Tab/Category buttons:** Text only (no icons)
- **Add (+) icons:** Copper (`#c9785d`) - not white

### Shadows
Cards and buttons use subtle shadows for depth:
```typescript
shadows: {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  glow: {
    shadowColor: '#c9785d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
}
```

---

## Typography

### Font Family
- **Headers:** SF Mono (monospace) - screen titles only
- **Body text:** System default font
- **Numbers:** System font with tabular-nums

### Font Sizes
| Element | Size |
|---------|------|
| Screen title | 28px |
| Large input | 40-48px |
| Section label | 11px (uppercase, letter-spacing: 1) |
| Body text | 14-16px |
| Small/hint | 10-12px |
| Result display | 32-40px |

---

## Spacing & Layout

### Base Values
- **Screen padding:** 16px
- **Card padding:** 16px
- **Gap between elements:** 16px (or 12px, 8px for tighter)
- **Border radius (cards):** 16px
- **Border radius (inputs/pills):** 12px
- **Border width:** 1px

---

## Navigation Structure

### Bottom Navigation Bar (5 Tabs)

```
┌─────────────────────────────────────────────────┐
│  Convert   Sizes   Kitchen   Currency   Tools   │
└─────────────────────────────────────────────────┘
```

| Tab | Icon | Screen |
|-----|------|--------|
| Convert | ArrowLeftRight | Unit Converter |
| Sizes | Tag | Size Charts |
| Kitchen | ChefHat | Kitchen Tools |
| Currency | Banknote | Currency Converter |
| Tools | LayoutGrid | Utility Tools |

### Tab Bar Styling
```typescript
{
  backgroundColor: colors.card,  // #1c1c1e
  paddingTop: 12,
  paddingBottom: Math.max(insets.bottom, 16),
  height: 70 + Math.max(insets.bottom, 16),
  ...shadows.card,  // Subtle shadow for depth
}
```

---

## Screen Specifications

### 1. CONVERT (Unit Converter) - Main Screen

**Header:** Logo + "UnitX" (logo only on this screen)

**Sub-tabs:** Length | Weight | Temperature

**Features:**
- Large numeric input (40px font)
- FROM/TO unit pickers
- Swap button (animated)
- Result display with tap-to-copy
- "Copied!" badge feedback

**Units:**
- **Length:** mm, cm, m, km, inch, ft, yard, mile
- **Weight:** mg, g, kg, ton, oz, lb, stone
- **Temperature:** Celsius, Fahrenheit

---

### 2. SIZES (Size Charts)

**Gender selector:** Women | Men | Kids

**Categories per gender:**
- **Women:** Shoes, Tops, Bottoms, Bras (interactive calculator)
- **Men:** Shoes, Tops, Bottoms
- **Kids:** Shoes, Baby/Clothing

**Regions:** EU, US, UK, FR, AU

**BRA Calculator:**
- Input region selector
- Output region selector
- Band size picker
- Cup size picker
- Conversion table display

---

### 3. KITCHEN (Kitchen Tools)

**Sub-tabs:** Ingredients | Oven | Special

#### Ingredients
- USDA API integration (20,000+ ingredients)
- "Add from USDA" search modal
- Custom ingredients support
- Density display (g per cup)
- FROM/TO unit pickers
- Result with tap-to-copy

**Units:** ml, dl, l, g, kg, tsp, tbsp, fl oz, cup, pint, quart, gallon, oz, lb

#### Oven Temperature
- Mode switcher: Conventional | Fan | Fahrenheit
- +/- temperature adjustment
- Auto-calculation (Fan = Conventional - 20°C)
- Tap inactive card to switch modes

#### Special
- **Yeast Converter:** Fresh ↔ Active Dry ↔ Instant (tap-to-copy)
- **Butter Converter:** Sticks ↔ Tbsp ↔ Cups ↔ Grams ↔ Oz (tap-to-copy)
- **Serving Size Adjuster:** Scale recipe amounts (tap-to-copy)

---

### 4. CURRENCY (Currency Converter)

**Full-screen view (no sub-tabs)**

**Features:**
- ExchangeRate-API integration (156 currencies, real-time rates)
- Currency symbol display (€, $, £, ¥)
- Large input with symbol
- FROM/TO currency pickers (long press to remove)
- Swap button
- Result with tap-to-copy
- "MY CURRENCIES" section with favorite currency pills
- "Add Currency" button with search modal
- "NEW" badge for recently added currencies (1.5s)
- Custom ConfirmDialog for removal confirmation
- Subtitle: "Rates are approximate"

**Default Currencies:** EUR, USD, GBP, JPY, SEK, NOK, CHF, CAD, AUD, CNY

---

### 5. TOOLS (Utility Tools)

**Sub-tabs:** Colors | Text | Numbers | Data | Time (all on one row)

#### Colors (RGB Converter)
- Custom gesture-based sliders (Pan + Tap)
- RGB value inputs
- Color preview (tap-to-copy HEX)
- HEX display (tap-to-copy)
- HSL display (tap-to-copy)

#### Text
- **Text Case Converter:** lowercase, UPPERCASE, Title Case, Sentence case, camelCase, snake_case, kebab-case
- Each result tappable to copy

#### Numbers
- **Percentage Calculator:** 3 modes (X% of Y, X is ?% of Y, % Change)
- **Fraction ↔ Decimal Converter:** Both directions with mixed number display
- All results tap-to-copy

#### Data
- **Data Size Converter:** bytes, KB, MB, GB, TB, PB
- Tap-to-copy results

#### Time
- **Unix Timestamp Converter:** Timestamp ↔ Human-readable
  - Current Unix time display (tap-to-copy)
  - "Use Now" button
  - LOCAL, UTC, ISO 8601, RELATIVE outputs (all tap-to-copy)
- **Duration Calculator:** 3 modes
  - Breakdown: seconds → days/hours/minutes/seconds
  - Add: duration1 + duration2
  - Difference: end - start
  - Result tap-to-copy
- **World Time:** GPS location, city search, smart sort, time zones

#### Dev
- **Number Base Converter:** Decimal, Binary, Octal, Hex
- All conversions displayed, each tap-to-copy

---

## Tap-to-Copy Feature

All result displays support tap-to-copy:

### Behavior
1. User taps result area
2. Value copied to clipboard
3. "Copied!" badge appears (1.5 seconds)
4. Badge fades out

### Styling
```typescript
copiedBadge: {
  position: 'absolute',
  top: 4-8,
  right: 4-8,
  backgroundColor: colors.accent,  // #c9785d
  paddingHorizontal: 8-12,
  paddingVertical: 2-4,
  borderRadius: 8-12,
  zIndex: 1,
  ...shadows.glow,  // Copper glow effect
},
copiedText: {
  color: colors.primary,  // #f5f5f7
  fontSize: 10-12,
  fontWeight: '600',
}
```

---

## UI Components

### Cards
```typescript
{
  backgroundColor: colors.card,  // #1c1c1e
  borderRadius: 16,
  padding: 16,
  ...shadows.card,  // Subtle shadow for depth
}
```

### Input Fields
```typescript
{
  backgroundColor: colors.card,  // #1c1c1e
  borderRadius: 12,
  color: colors.primary,  // #f5f5f7
  fontSize: 16-40,
  padding: 12-16,
  ...shadows.card,
}
```

### Active Pills/Tabs
```typescript
{
  backgroundColor: colors.accent,  // #c9785d (copper)
  borderRadius: 8-12,
  paddingHorizontal: 12-24,
  paddingVertical: 8-12,
}
// Text
{
  color: colors.primary,  // #f5f5f7 (warm white on copper)
  fontWeight: '600',
}
```

### Inactive Pills/Tabs
```typescript
{
  backgroundColor: 'transparent',
  borderRadius: 8-12,
  paddingHorizontal: 12-24,
  paddingVertical: 8-12,
}
// Text
{
  color: colors.secondary,  // #86868b
  fontWeight: '600',
}
```

### Dynamic Button Sizing (flexGrow)
Tab/category buttons use `flexGrow: 1` (not `flex: 1`) to:
- Fill the full container width (no empty space)
- Allow longer labels to have proportionally more space
- Prevent text cramping on longer labels like "Temperature"

```typescript
tabButton: {
  flexGrow: 1,           // Grow to fill space, but start at content width
  paddingVertical: 12-14,
  paddingHorizontal: 8,
  alignItems: 'center',
  borderRadius: 12,
}
```

### Add Button Icon
The "+" button in modals uses accent color icon on dark background:
```typescript
addButtonIcon: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.card,  // Dark background
  alignItems: 'center',
  justifyContent: 'center',
}
// Icon
<Plus size={18} color={colors.accent} />  // Red icon
```

### Result Containers
```typescript
{
  backgroundColor: colors.card,  // #1c1c1e
  borderRadius: 16,
  padding: 16,
  alignItems: 'center',
  ...shadows.card,
}
```

---

## Modals

### Picker Modal
```typescript
overlay: {
  backgroundColor: colors.overlay,  // rgba(0,0,0,0.75)
}
content: {
  backgroundColor: colors.card,  // #1c1c1e
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: '60%',
}
header: {
  borderBottomWidth: 1,
  borderBottomColor: colors.subtle,  // #38383a
  padding: 20,
}
```

### Confirm Dialog
Custom styled confirmation dialog (replaces native Alert.alert for destructive actions):
```typescript
dialog: {
  backgroundColor: colors.card,  // #1c1c1e
  borderRadius: 16,
  padding: 24,
  ...shadows.card,
}
cancelButton: {
  backgroundColor: colors.input,  // #242426
  borderRadius: 12,
}
confirmButton: {
  backgroundColor: colors.accent,  // #c9785d (copper)
}
confirmText: {
  color: colors.primary,  // #f5f5f7
}
```

---

## Splash Screen

### Animated Splash
Custom animated splash screen with sliding arrows:

**Animation sequence:**
1. [0-400ms] Top arrow (→) slides in from right
2. [0-400ms] Bottom arrow (←) slides in from left
3. [400-700ms] Pause (arrows in center)
4. [700-1000ms] Fade out to app

**Assets:**
- `assets/splash-arrow-right.png` - Right arrow
- `assets/splash-arrow-left.png` - Left arrow
- `assets/adaptive-icon.png` - Combined logo (used in header)

**Implementation:** `src/components/AnimatedSplash.tsx`

---

## Animations

### Button Press
- Scale: 1.0 → 0.95 (press) → 1.0 (release)
- Duration: 100ms

### Tab Switch
- Color transition: 150ms ease-in-out

### Result Update
- Opacity fade for smooth transitions

**Library:** react-native-reanimated
**Rules:**
- Only animate `transform` and `opacity`
- Keep durations under 300ms
- Use `useNativeDriver: true`

---

## Technical Stack

### Dependencies
```json
{
  "expo": "~54.0.30",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "expo-location": "~19.0.8",
  "expo-clipboard": "~8.0.8",
  "expo-splash-screen": "~0.30.8",
  "lucide-react-native": "^0.562.0",
  "@react-navigation/bottom-tabs": "^7.9.0"
}
```

### State Management
- React hooks only (`useState`, `useMemo`, `useEffect`, `useCallback`)
- Session-only data (resets on app close)
- No external state libraries

---

## File Structure

```
UnitX/
├── assets/
│   ├── adaptive-icon.png      # App logo (two arrows)
│   ├── splash-arrow-right.png # Splash animation arrow →
│   ├── splash-arrow-left.png  # Splash animation arrow ←
│   ├── icon.png
│   ├── favicon.png
│   └── splash-icon.png
├── src/
│   ├── components/
│   │   ├── AnimatedInput.tsx
│   │   ├── AnimatedPressable.tsx
│   │   ├── AnimatedResult.tsx
│   │   ├── AnimatedSplash.tsx    # Animated splash screen
│   │   ├── AnimatedTabButton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PickerButton.tsx
│   │   ├── PickerModal.tsx
│   │   ├── index.ts
│   │   ├── kitchen/
│   │   │   ├── YeastConverter.tsx
│   │   │   ├── ButterConverter.tsx
│   │   │   └── ServingSizeAdjuster.tsx
│   │   └── tools/
│   │       ├── TextCaseConverter.tsx
│   │       ├── PercentageCalculator.tsx
│   │       ├── NumberBaseConverter.tsx
│   │       ├── FractionDecimalConverter.tsx
│   │       ├── UnixTimestampConverter.tsx
│   │       └── DurationCalculator.tsx
│   ├── screens/
│   │   ├── ConverterScreen.tsx
│   │   ├── SizesScreen.tsx
│   │   ├── KitchenScreen.tsx
│   │   ├── CurrencyScreen.tsx
│   │   └── ToolsScreen.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── App.tsx
├── UI_SPEC.md
└── CLAUDE.md
```

---

## Accessibility

- **Touch targets:** Minimum 44px
- **Contrast:** High contrast (warm white on warm dark grays)
- **Font sizes:** Minimum 10px, recommended 14px+
- **Safe areas:** Respect all device insets

---

## Platform Notes

- **Target device:** Google Pixel 9 (Android)
- **Keyboard:** Numeric keyboards for number inputs
- **Permissions:** Location (World Time GPS)
- **Orientation:** Portrait only

---

**Last Updated:** 2026-01-10
