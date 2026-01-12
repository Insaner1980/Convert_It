// src/theme/index.ts
// Central export for all theme tokens

export { colors } from './colors';
export {
    fontFamily,
    fontSize,
    fontWeight,
    textStyles,
    baseTextStyle,
    getDynamicFontSize
} from './typography';

// Shadow styles for depth
export const shadows = {
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
};

// Border radius tokens
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

// Spacing tokens
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};
