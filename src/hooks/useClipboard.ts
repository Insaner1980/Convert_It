// src/hooks/useClipboard.ts
// Shared clipboard hook to eliminate duplicate code across screens

import { useState, useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { TIMING } from '../constants/ui';

interface UseClipboardReturn {
    copied: boolean;
    copyToClipboard: (text: string) => Promise<void>;
}

export const useClipboard = (duration: number = TIMING.COPIED_BADGE_DURATION): UseClipboardReturn => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            setCopied(true);
            setTimeout(() => setCopied(false), duration);
        } catch {
            // Clipboard operation failed silently - rare but possible on some devices
        }
    }, [duration]);

    return { copied, copyToClipboard };
};
