// src/hooks/useClipboard.ts
// Shared clipboard hook to eliminate duplicate code across screens

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import { TIMING } from '../constants/ui';

interface UseClipboardReturn {
    copied: boolean;
    copyToClipboard: (text: string) => Promise<void>;
}

export const useClipboard = (duration: number = TIMING.COPIED_BADGE_DURATION): UseClipboardReturn => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            setCopied(true);

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setCopied(false);
                timeoutRef.current = null;
            }, duration);
        } catch {
            // Clipboard operation failed silently - rare but possible on some devices
        }
    }, [duration]);

    return { copied, copyToClipboard };
};
