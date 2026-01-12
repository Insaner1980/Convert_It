// src/hooks/useMounted.ts
// Hook to track component mount status and provide safe state updates

import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a ref that tracks whether the component is mounted.
 * Use this to prevent state updates after unmount.
 */
export const useMounted = () => {
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted;
};

/**
 * Returns a setTimeout wrapper that auto-clears on unmount.
 * Prevents "setState on unmounted component" warnings.
 */
export const useSafeTimeout = () => {
    const timeoutIds = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    useEffect(() => {
        // Capture ref value for cleanup
        const ids = timeoutIds.current;
        return () => {
            // Clear all pending timeouts on unmount
            ids.forEach(id => clearTimeout(id));
            ids.clear();
        };
    }, []);

    const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
        const id = setTimeout(() => {
            timeoutIds.current.delete(id);
            callback();
        }, delay);
        timeoutIds.current.add(id);
        return id;
    }, []);

    const clearSafeTimeout = useCallback((id: ReturnType<typeof setTimeout>) => {
        clearTimeout(id);
        timeoutIds.current.delete(id);
    }, []);

    return { safeSetTimeout, clearSafeTimeout };
};
