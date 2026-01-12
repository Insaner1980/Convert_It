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
 * Ensures long numbers (like 0.000002204) fit in the display
 * @param text - The text/number to display
 * @param baseSize - Default font size for short text (default: 48)
 * @returns Appropriate font size
 */
export const getDynamicFontSize = (text: string, baseSize: number = 48): number => {
    const length = text.length;
    if (length > 15) return Math.min(baseSize, 20);
    if (length > 10) return Math.min(baseSize, 28);
    return baseSize;
};
