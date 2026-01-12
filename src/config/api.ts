// src/config/api.ts
// API configuration using expo-constants for secure key management

import Constants from 'expo-constants';

// API keys loaded from app.config.js extra field
// Set environment variables for production: EXCHANGE_RATE_API_KEY=xxx USDA_API_KEY=xxx expo start
const extra = Constants.expoConfig?.extra ?? {};

export const API_CONFIG = {
    // ExchangeRate-API - Get your key at: https://www.exchangerate-api.com/
    EXCHANGE_RATE_API_KEY: extra.exchangeRateApiKey as string,
    EXCHANGE_RATE_BASE_URL: 'https://v6.exchangerate-api.com/v6',

    // USDA FoodData Central - Get your key at: https://fdc.nal.usda.gov/api-key-signup.html
    USDA_API_KEY: extra.usdaApiKey as string,
    USDA_BASE_URL: 'https://api.nal.usda.gov/fdc/v1',

    // Open-Meteo Geocoding (no key required)
    GEOCODING_BASE_URL: 'https://geocoding-api.open-meteo.com/v1',
} as const;

// API endpoints
export const API_ENDPOINTS = {
    exchangeRates: (base: string) =>
        `${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${API_CONFIG.EXCHANGE_RATE_API_KEY}/latest/${base}`,

    usdaSearch: (query: string) =>
        `${API_CONFIG.USDA_BASE_URL}/foods/search?api_key=${API_CONFIG.USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=20`,

    usdaFoodDetail: (fdcId: number) =>
        `${API_CONFIG.USDA_BASE_URL}/food/${fdcId}?api_key=${API_CONFIG.USDA_API_KEY}`,

    geocodingSearch: (name: string) =>
        `${API_CONFIG.GEOCODING_BASE_URL}/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`,
} as const;
