// src/constants/ui.ts
// UI-related constants to eliminate magic numbers

export const TIMING = {
    // Badge durations
    COPIED_BADGE_DURATION: 1500,
    TOAST_DURATION: 2500,
    ADDED_BADGE_DURATION: 1500,

    // Animation durations
    ANIMATION_FAST: 100,
    ANIMATION_NORMAL: 200,
    ANIMATION_SLOW: 300,

    // Debounce delays
    SEARCH_DEBOUNCE: 500,
    LONG_PRESS_DELAY: 500,
} as const;

export const SPACING = {
    // Screen padding
    SCREEN_PADDING: 16,

    // Card padding
    CARD_PADDING: 16,
    CARD_PADDING_LARGE: 24,

    // Gaps
    GAP_SMALL: 8,
    GAP_MEDIUM: 12,
    GAP_LARGE: 16,
    GAP_XLARGE: 24,

    // Border radius
    BORDER_RADIUS_SMALL: 8,
    BORDER_RADIUS_MEDIUM: 12,
    BORDER_RADIUS_LARGE: 16,
    BORDER_RADIUS_XLARGE: 24,
} as const;

export const BOTTOM_TAB = {
    // Bottom navigation
    HEIGHT: 70,
    PADDING_BOTTOM_EXTRA: 120,
} as const;
