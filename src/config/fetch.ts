// src/config/fetch.ts
// Fetch utility with timeout support for API calls

const DEFAULT_TIMEOUT = 10000; // 10 seconds

interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

/**
 * Fetch with timeout - prevents hanging on slow networks
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 10000)
 */
export const fetchWithTimeout = async (
    url: string,
    options?: FetchOptions,
    timeout: number = DEFAULT_TIMEOUT
) => {
    const controller = new globalThis.AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};
