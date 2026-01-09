# Troubleshooting Guide

Common issues encountered during development and their solutions.

---

## Keyboard Issues

### Keyboard dismisses while typing

**Symptoms:**
- Keyboard closes immediately after pressing a key
- Input loses focus unexpectedly
- Can't type more than one character

**Cause:**
Component with `TextInput` is defined inside another component. React recreates it on every render, causing focus loss.

**Bad:**
```typescript
export const ParentScreen = () => {
    const InputComponent = () => (  // Recreated every render!
        <TextInput value={value} onChangeText={setValue} />
    );
    return <InputComponent />;
};
```

**Fix:**
```typescript
// Define outside parent component
const InputComponent = ({ value, onChangeText }) => (
    <TextInput value={value} onChangeText={onChangeText} />
);

export const ParentScreen = () => {
    return <InputComponent value={value} onChangeText={setValue} />;
};
```

---

## Styling Issues

### Color doesn't change after updating theme

**Symptoms:**
- Changed color in `colors.ts` but UI still shows old color
- Some components use new color, others don't

**Cause:**
Hardcoded hex value instead of using theme colors.

**Bad:**
```typescript
backgroundColor: '#FF0000',  // Hardcoded!
```

**Fix:**
```typescript
import { colors } from '../theme/colors';

backgroundColor: colors.accent,  // Uses theme
```

**Tip:** Search codebase for hex patterns like `#[0-9A-Fa-f]{6}` to find hardcoded colors.

---

### Active/inactive button colors look wrong

**Symptoms:**
- Active button doesn't stand out
- Colors seem inverted

**Cause:**
Using wrong color combination for active/inactive states.

**Fix:**
```typescript
// Active state
activeButton: {
    backgroundColor: colors.accent,  // Red background
},
activeButtonText: {
    color: colors.main,  // Black text
},

// Inactive state
inactiveButton: {
    backgroundColor: 'transparent',  // No background
},
inactiveButtonText: {
    color: colors.secondary,  // Gray text
},
```

---

## Animation Issues

### Animation is choppy/janky

**Symptoms:**
- Animation stutters
- Frame drops during transitions
- UI feels sluggish

**Cause:**
Animating `width`, `height`, or other layout properties directly. These trigger layout recalculations.

**Bad:**
```typescript
width: animatedValue,
height: animatedValue,
```

**Fix:**
```typescript
// Use transform and opacity only
transform: [{ scale: animatedValue }],
opacity: animatedValue,
```

---

## Expo / Build Issues

### Expo fails to start

**Symptoms:**
- `npm start` crashes
- Metro bundler errors
- "Cannot find module" errors

**Possible causes & fixes:**

1. **Corrupted node_modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Expo cache issues:**
   ```bash
   npx expo start -c
   ```

3. **Wrong dependency versions:**
   Check that dependency versions match Expo SDK version. Run:
   ```bash
   npx expo doctor
   ```

---

### App crashes on device but works in development

**Symptoms:**
- Works fine with Expo Go
- Crashes in production/preview build

**Possible causes:**

1. **Missing native dependency:** Some packages need native code that Expo Go includes but standalone builds don't.

2. **Environment variables:** Production builds might not have access to `.env` values.

3. **Console.log with circular references:** Remove or guard debug logs.

---

## TypeScript Issues

### Type error with navigation/route props

**Symptoms:**
- Red squiggly lines on `navigation` or `route` props
- "Property does not exist" errors

**Fix:**
Define proper types or use type assertion:
```typescript
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<RootTabParamList, 'ScreenName'>;

export const MyScreen = ({ navigation, route }: Props) => {
    // ...
};
```

---

## Clipboard / Copy Issues

### Tap-to-copy doesn't work

**Symptoms:**
- Pressing result does nothing
- "Copied!" badge never appears

**Possible causes:**

1. **Missing expo-clipboard:**
   ```bash
   npx expo install expo-clipboard
   ```

2. **Wrong import:**
   ```typescript
   // Correct
   import * as Clipboard from 'expo-clipboard';

   // Wrong
   import Clipboard from 'expo-clipboard';
   ```

3. **Async not awaited:**
   ```typescript
   // Correct
   await Clipboard.setStringAsync(text);

   // Wrong - might not complete
   Clipboard.setStringAsync(text);
   ```

---

## Modal Issues

### Modal doesn't cover bottom navigation

**Symptoms:**
- Bottom tabs visible behind modal
- Modal overlay doesn't reach screen edges

**Cause:**
Modal rendered inside screen component instead of at root level, or wrong positioning.

**Fix:**
```typescript
<Modal transparent visible={isVisible}>
    <View style={styles.overlay}>
        <View style={styles.modalContent}>
            {/* content */}
        </View>
    </View>
</Modal>

// Styles
overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
},
```

---

## API Issues

### USDA/Currency API returns error

**Symptoms:**
- Network request fails
- "API key invalid" or rate limit errors

**Possible causes:**

1. **API key issues:** Check if API key is valid and not expired.

2. **Rate limiting:** Wait and retry, or implement caching.

3. **CORS (web only):** APIs might block web requests. Works fine on native.

4. **Network connectivity:** Check device has internet access.

---

## General Debugging Tips

1. **Check console logs:** Run `npx expo start` and watch terminal for errors.

2. **React Native Debugger:** Shake device → "Debug Remote JS" for breakpoints.

3. **Component isolation:** If something breaks, isolate the component to find the issue.

4. **Git diff:** Compare with last working commit to find what changed.

5. **ESLint:** Run `npm run lint` - many issues are caught by linter.

---

## Adding New Issues

When you encounter a new issue, document it here with:

1. **Clear title**
2. **Symptoms** - What did you observe?
3. **Cause** - Why did it happen?
4. **Fix** - How to solve it (with code examples if applicable)

---

*Last Updated: 2026-01-09*
