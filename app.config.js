// app.config.js
// Dynamic Expo configuration with environment variables support

export default {
    expo: {
        name: "UnitX",
        slug: "unitx",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#000000"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#141416"
            },
            edgeToEdgeEnabled: true,
            package: "com.unitx.app",
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION"
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            // API keys from environment variables with fallback defaults
            // In production, set these via: EXCHANGE_RATE_API_KEY=xxx expo start
            exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || '3c0edc65cf16a8ca8c3e5a41',
            usdaApiKey: process.env.USDA_API_KEY || 'sB18vYGMnhcTSZhVkJRgM4NhGduy9jgAs9luiKbE',
        }
    }
};
