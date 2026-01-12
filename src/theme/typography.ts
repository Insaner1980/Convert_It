// src/theme/typography.ts
// Premium Monochrome Typography - SF Mono for precision

import { Platform, TextStyle } from 'react-native';

// SF Mono is system font on iOS, use monospace on Android
export const fontFamily = Platform.select({
    ios: 'SF Mono',
    android: 'monospace',
    default: 'monospace',
});

// Base text style with tabular-nums for all numbers
export const baseTextStyle: TextStyle = {
    fontFamily,
    // Note: React Native doesn't support font-variant-numeric directly
    // Monospace fonts naturally have tabular nums
};

// Font sizes from UI_SPEC.md
export const fontSize = {
    tiny: 10,       // Labels, badges
    small: 12,      // Secondary info
    body: 14,       // Body text
    label: 16,      // Form labels, buttons
    subtitle: 18,   // Subheadings
    heading: 28,    // Screen titles
    large: 32,      // Large numbers
    input: 48,      // Input values
    display: 64,    // Big clocks, main displays
};

// Font weights
export const fontWeight = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// Pre-built text styles
export const textStyles = {
    heading: {
        fontFamily,
        fontSize: fontSize.heading,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    subtitle: {
        fontFamily,
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    body: {
        fontFamily,
        fontSize: fontSize.body,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    label: {
        fontFamily,
        fontSize: fontSize.label,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    small: {
        fontFamily,
        fontSize: fontSize.small,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    tiny: {
        fontFamily,
        fontSize: fontSize.tiny,
        fontWeight: fontWeight.semibold,
        letterSpacing: 1,
        textTransform: 'uppercase',
    } as TextStyle,

    // Number styles with tabular alignment
    inputValue: {
        fontFamily,
        fontSize: fontSize.input,
        fontWeight: fontWeight.light,
    } as TextStyle,

    resultValue: {
        fontFamily,
        fontSize: fontSize.input,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    displayValue: {
        fontFamily,
        fontSize: fontSize.display,
        fontWeight: fontWeight.light,
        letterSpacing: 2,
    } as TextStyle,
};

/**
 * Get dynamic font size based on text length
 * Ensures long numbers fit in the display without overflow
 * @param text - The text/number to display
 * @param baseSize - Default font size for short text (default: 48)
 * @param compact - Use aggressive scaling for narrow containers (default: false)
 * @returns Appropriate font size
 */
export const getDynamicFontSize = (text: string, baseSize: number = 48, compact: boolean = false): number => {
    const len = text.length;

    if (compact) {
        // Aggressive scaling for narrow containers (like fraction inputs)
        if (len > 10) return Math.max(baseSize * 0.35, 14);
        if (len > 8) return Math.max(baseSize * 0.45, 16);
        if (len > 6) return Math.max(baseSize * 0.55, 18);
        if (len > 4) return Math.max(baseSize * 0.7, 22);
        return baseSize;
    }

    // Normal scaling for full-width inputs and result displays
    if (len > 20) return Math.max(baseSize * 0.4, 14);
    if (len > 16) return Math.max(baseSize * 0.5, 16);
    if (len > 12) return Math.max(baseSize * 0.65, 20);
    return baseSize;
};
