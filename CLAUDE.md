# Claude AI - UnitX Project Guide

**Project:** UnitX - Premium Mobile Conversion Utility
**Platform:** React Native (Expo) + TypeScript
**Last Updated:** 2026-01-12

---

## Quick Reference

**Before making ANY changes, read:**
1. `UI_SPEC.md` - The single source of truth for UI design
2. This file - Working guidelines
3. `TROUBLESHOOTING.md` - Common issues and solutions

**Expo Development Server:**
- DO NOT start Expo (`npm start`) - the user will start it manually
- When ready to test, tell the user "Valmis testattavaksi" and they will handle Expo

**Code Quality (ESLint):**
- Run `npm run lint` before delivering code
- Fix any errors before saying "Valmis testattavaksi"
- Use `npm run lint:fix` to auto-fix simple issues

**UI Changes (IMPORTANT):**
- When the user requests UI changes, ALWAYS use the `/frontend-design` skill
- This ensures high-quality, production-grade UI design
- Examples: new components, layout changes, styling updates, visual improvements

---

## Project Overview

UnitX is a **premium warm dark-themed mobile app** with copper/terracotta accent color for unit conversions, size charts, kitchen tools, currency exchange, and utility tools.

**Design Principles:**
- **Minimalism** - Clean, distraction-free interface
- **Precision** - Accurate calculations, professional typography
- **Speed** - Fast, responsive, 60fps animations
- **Privacy** - No tracking, no server dependencies (except APIs)
- **Depth** - Subtle shadows for visual hierarchy

**Target Device:** Google Pixel 9 (Android)
**Design Language:** Premium Warm Dark with copper (#c9785d) accent
**Logo:** Two arrows (→←) - shown only on main screen header

---

## Architecture

### Directory Structure
```
UnitX/
├── assets/
│   ├── adaptive-icon.png       # App logo (two arrows)
│   ├── splash-arrow-right.png  # Splash animation arrow →
│   ├── splash-arrow-left.png   # Splash animation arrow ←
│   └── ...
├── src/
│   ├── components/
│   │   ├── AnimatedInput.tsx
│   │   ├── AnimatedPressable.tsx
│   │   ├── AnimatedResult.tsx
│   │   ├── AnimatedSplash.tsx      # Animated splash screen
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

### Key Principles

1. **Component Isolation**
   - Each screen is self-contained
   - Shared components in `/components`
   - Tool-specific components in `/components/tools/` and `/components/kitchen/`
   - **IMPORTANT:** Never define components inside other components (causes keyboard issues)

2. **State Management**
   - React hooks only (`useState`, `useMemo`, `useEffect`)
   - NO Redux, MobX, or external state libraries
   - Session-only data (resets on app close)

3. **Styling**
   - Use `StyleSheet.create()` from React Native
   - Reference `colors.ts` for ALL colors
   - NO inline styles (except dynamic values)
   - NO hardcoded colors

4. **Tap-to-Copy**
   - All result displays support tap-to-copy
   - Shows "Copied!" badge for 1.5 seconds
   - Uses expo-clipboard

---

## Color System

**Always import colors and shadows:**
```typescript
import { colors } from '../theme/colors';
import { shadows } from '../theme';
```

```typescript
// colors.ts - Premium Warm Dark theme
{
  // Backgrounds - warm dark grays (not pure black)
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
  overlay: 'rgba(0,0,0,0.75)',
  elevated: '#2c2c2e',    // Elevated surfaces
  highlight: '#48484a',   // Focus states
}
```

**Active/Inactive Pattern:**
- Active: `backgroundColor: colors.accent` (copper), `color: colors.primary` (warm white)
- Inactive: `backgroundColor: transparent`, `color: colors.secondary`

**Add (+) Icons:**
- Use `colors.accent` (copper) for Plus/Minus icons - NOT `colors.primary`

**Shadows (import from theme):**
```typescript
shadows.card   // Cards, inputs - subtle depth
shadows.button // Buttons - lighter shadow
shadows.glow   // Accent elements - copper glow
```

### Spacing
- Screen padding: **16px**
- Card padding: **16px**
- Gaps: **16px** (or 12px, 8px for tighter spacing)
- Border radius: **16px** (cards), **12px** (inputs/pills)

---

## Common Patterns

### Tap-to-Copy Implementation

```typescript
import { TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// State
const [copied, setCopied] = useState(false);

// Function
const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
};

// JSX
<TouchableOpacity onPress={() => copyToClipboard(result)} activeOpacity={0.7}>
    {copied && (
        <View style={styles.copiedBadge}>
            <Text style={styles.copiedText}>Copied!</Text>
        </View>
    )}
    <Text style={styles.resultValue}>{result}</Text>
</TouchableOpacity>

// Styles
copiedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
    ...shadows.glow,  // Copper glow effect
},
copiedText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
},
```

### Component Outside Pattern (IMPORTANT!)

**Never define components with TextInput inside other components:**

```typescript
// BAD - causes keyboard to dismiss
export const ParentComponent = () => {
    const ChildInput = () => (  // ❌ Recreated on every render!
        <TextInput ... />
    );
    return <ChildInput />;
};

// GOOD - stable component
const ChildInput = () => (  // ✅ Defined outside
    <TextInput ... />
);

export const ParentComponent = () => {
    return <ChildInput />;
};
```

### Styling a New Component

```typescript
import { colors } from '../theme/colors';
import { shadows } from '../theme';

const styles = StyleSheet.create({
    container: { gap: 16 },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        ...shadows.card,  // Always add shadow for depth
    },
    activeButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    activeButtonText: {
        color: colors.primary,  // Warm white on copper
        fontWeight: '600',
    },
});
```

### Pill/Tab Button Pattern (IMPORTANT!)

**Always use TouchableOpacity for pill buttons, not View + Text with onPress:**

```typescript
// BAD - borderRadius won't apply to active background correctly
<View style={[styles.pill, isActive && styles.pillActive]}>
    <Text onPress={handlePress}>{label}</Text>  // ❌
</View>

// GOOD - borderRadius works correctly
<TouchableOpacity
    style={[styles.pill, isActive && styles.pillActive]}
    onPress={handlePress}  // ✅
    activeOpacity={0.7}
>
    <Text>{label}</Text>
</TouchableOpacity>
```

### Dynamic Button Sizing (flexGrow)

**Use `flexGrow: 1` instead of `flex: 1` for tab/category buttons:**

```typescript
// BAD - flex: 1 makes all buttons same width (cramps long text)
tabButton: {
    flex: 1,  // ❌ All buttons same size
    ...
}

// GOOD - flexGrow: 1 fills space but respects content width
tabButton: {
    flexGrow: 1,  // ✅ Buttons fill space proportionally
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
}
```

This ensures:
- Buttons fill the full container width (no empty space on right)
- Longer labels ("Temperature") get proportionally more space than short ones ("Speed")
- Text is never cramped against edges

### ConfirmDialog Usage

**Use ConfirmDialog instead of Alert.alert for destructive actions:**

```typescript
import { ConfirmDialog } from '../components/ConfirmDialog';

// State
const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    id: '',
    name: '',
});

// Show dialog
const handleRemove = (id: string, name: string) => {
    setConfirmDialog({ visible: true, id, name });
};

// JSX
<ConfirmDialog
    visible={confirmDialog.visible}
    title="Remove Item"
    message={`Remove ${confirmDialog.name}?`}
    confirmText="Remove"
    cancelText="Cancel"
    onConfirm={() => {
        // Do removal
        setConfirmDialog({ visible: false, id: '', name: '' });
    }}
    onCancel={() => setConfirmDialog({ visible: false, id: '', name: '' })}
    destructive
/>
```

---

## NEVER DO THIS

1. ❌ **Don't hardcode colors** - Always use `colors.xxx`
2. ❌ **Don't define components inside components** - Causes keyboard issues
3. ❌ **Don't use AsyncStorage** - Session-only data
4. ❌ **Don't remove advanced features** - USDA API, GPS, etc.
5. ❌ **Don't merge Currency into Convert** - Keep 5 tabs
6. ❌ **Don't add new bottom tabs** - Use horizontal pills instead
7. ❌ **Don't animate width/height** - Only `transform` and `opacity`
8. ❌ **Don't use View + Text onPress for pills** - Use TouchableOpacity (borderRadius issue)
9. ❌ **Don't use Alert.alert for destructive actions** - Use ConfirmDialog component
10. ❌ **Don't add icons to tab/category buttons** - Text only for consistent spacing
11. ❌ **Don't use black text on red background** - Use white (`colors.primary`)
12. ❌ **Don't use `flex: 1` for tab buttons** - Use `flexGrow: 1` for dynamic sizing
13. ❌ **Don't use white for + icons** - Use `colors.accent` (red)

---

## Bottom Navigation (5 Tabs)

```
1. Convert   (ArrowLeftRight)  - ConverterScreen
2. Sizes     (Tag)             - SizesScreen
3. Kitchen   (ChefHat)         - KitchenScreen
4. Currency  (Banknote)        - CurrencyScreen
5. Tools     (LayoutGrid)      - ToolsScreen
```

---

## Dependencies

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

---

## External APIs

### ExchangeRate-API
- **File:** `CurrencyScreen.tsx`
- **Endpoint:** `https://v6.exchangerate-api.com/v6/{API_KEY}`
- **Usage:** Real-time currency exchange rates (156 currencies)
- **API Key:** Stored in component (free tier: 1500 requests/month)

### USDA FoodData Central
- **File:** `KitchenScreen.tsx`
- **Endpoint:** `https://api.nal.usda.gov/fdc/v1/foods/search`
- **Usage:** Ingredient density lookup

### Open-Meteo Geocoding API
- **File:** `ToolsScreen.tsx`
- **Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`
- **Usage:** City search for World Time

### expo-location (GPS)
- **File:** `ToolsScreen.tsx`
- **Usage:** User location detection for World Time

---

## Testing Checklist

Before delivering:

- [ ] App runs without errors
- [ ] All 5 bottom tabs work
- [ ] All sub-tabs/pills work
- [ ] Input fields accept correct values
- [ ] Keyboard doesn't dismiss unexpectedly
- [ ] Tap-to-copy works on results
- [ ] No TypeScript errors
- [ ] Colors from theme only

---

## When in Doubt

1. Check `UI_SPEC.md`
2. Check `TROUBLESHOOTING.md` if something breaks
3. Check existing code patterns
4. Use `colors.ts` for all colors
5. Define sub-components outside parent components
6. Ask the user before major changes

---

**Last Updated:** 2026-01-12
