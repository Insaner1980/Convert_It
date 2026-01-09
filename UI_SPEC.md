# Convert It - UI Specification

**Version:** 3.0
**Date:** 2026-01-09
**Platform:** React Native (Expo) - Android (Google Pixel 9)

---

## Overview

**Convert It** is a premium conversion utility app with a dark monochromatic design and red accent color. The app features unit conversion, size charts, kitchen tools, currency exchange, and utility tools.

**Tagline:** "Convert with precision"

---

## Color Scheme

### Core Colors
```typescript
{
  main: '#000000',        // Pure black (app background)
  card: '#0f0f0f',        // Very dark gray (cards, bottom bar)
  input: '#1a1a1a',       // Slightly lighter (input fields)
  subtle: '#262626',      // Subtle borders
  primary: '#ffffff',     // Bright white (primary text)
  secondary: '#6b6b6b',   // Medium gray (secondary text)
  accent: '#A30000',      // Red (active states, buttons, highlights)
  accentHover: '#7a0000', // Darker red (hover/press states)
  overlay: 'rgba(0,0,0,0.7)', // Modal overlay
}
```

### Usage Guidelines
- **Active states:** Red background (`#A30000`) with black text (`#000000`)
- **Inactive states:** Card/input background with gray text
- **Bottom tab bar:** `#0f0f0f` (card color)
- **Active tab icon:** `#A30000` (red)
- **Inactive tab icon:** `#6b6b6b` (gray)
- **Copied badge:** Red background with black text

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
  backgroundColor: colors.card,  // #0f0f0f
  borderTopColor: colors.subtle, // #262626
  borderTopWidth: 0.5,
  paddingTop: 12,
  paddingBottom: Math.max(insets.bottom, 16),
  height: 70 + Math.max(insets.bottom, 16),
}
```

---

## Screen Specifications

### 1. CONVERT (Unit Converter)

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
- Currency symbol display (€, $, £, ¥)
- Large input with symbol
- FROM/TO currency pickers
- Swap button
- Result with tap-to-copy
- Subtitle: "Rates are approximate"

**Currencies:** EUR, USD, GBP, JPY, SEK, NOK, CHF, CAD, AUD, CNY, INR, etc.

---

### 5. TOOLS (Utility Tools)

**Sub-tabs:** Colors | Text | Numbers | Data | Time | Dev

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
  backgroundColor: colors.accent,  // #A30000
  paddingHorizontal: 8-12,
  paddingVertical: 2-4,
  borderRadius: 8-12,
  zIndex: 1,
},
copiedText: {
  color: colors.main,  // #000000
  fontSize: 10-12,
  fontWeight: '600',
}
```

---

## UI Components

### Cards
```typescript
{
  backgroundColor: colors.input,  // #1a1a1a
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.subtle,  // #262626
  padding: 16,
}
```

### Input Fields
```typescript
{
  backgroundColor: colors.input,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.subtle,
  color: colors.primary,
  fontSize: 16-40,
  padding: 12-16,
}
```

### Active Pills/Tabs
```typescript
{
  backgroundColor: colors.accent,  // #A30000
  borderRadius: 8-12,
  paddingHorizontal: 12-24,
  paddingVertical: 8-12,
}
// Text
{
  color: colors.main,  // #000000
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
  color: colors.secondary,  // #6b6b6b
  fontWeight: '600',
}
```

### Result Containers
```typescript
{
  backgroundColor: colors.input,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.subtle,
  padding: 16,
  alignItems: 'center',
}
```

---

## Modals

### Picker Modal
```typescript
overlay: {
  backgroundColor: colors.overlay,  // rgba(0,0,0,0.7)
}
content: {
  backgroundColor: colors.card,  // #0f0f0f
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: '60%',
}
header: {
  borderBottomWidth: 1,
  borderBottomColor: colors.subtle,
  padding: 20,
}
```

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
src/
├── components/
│   ├── AnimatedInput.tsx
│   ├── AnimatedPressable.tsx
│   ├── AnimatedResult.tsx
│   ├── AnimatedTabButton.tsx
│   ├── PickerButton.tsx
│   ├── PickerModal.tsx
│   ├── index.ts
│   ├── kitchen/
│   │   ├── YeastConverter.tsx
│   │   ├── ButterConverter.tsx
│   │   └── ServingSizeAdjuster.tsx
│   └── tools/
│       ├── TextCaseConverter.tsx
│       ├── PercentageCalculator.tsx
│       ├── NumberBaseConverter.tsx
│       ├── FractionDecimalConverter.tsx
│       ├── UnixTimestampConverter.tsx
│       └── DurationCalculator.tsx
├── screens/
│   ├── ConverterScreen.tsx
│   ├── SizesScreen.tsx
│   ├── KitchenScreen.tsx
│   ├── CurrencyScreen.tsx
│   └── ToolsScreen.tsx
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── index.ts
├── constants/
│   └── index.ts
└── types/
    └── index.ts
```

---

## Accessibility

- **Touch targets:** Minimum 44px
- **Contrast:** High contrast (white on black/dark gray)
- **Font sizes:** Minimum 10px, recommended 14px+
- **Safe areas:** Respect all device insets

---

## Platform Notes

- **Target device:** Google Pixel 9 (Android)
- **Keyboard:** Numeric keyboards for number inputs
- **Permissions:** Location (World Time GPS)
- **Orientation:** Portrait only

---

**Last Updated:** 2026-01-09
