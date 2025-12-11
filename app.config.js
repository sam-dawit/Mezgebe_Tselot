import "dotenv/config";

export default {
    expo: {
        name: "Mezgebe Tselot",
        slug: "mezgebetselot",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "mezgebetselot",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        },
        android: {
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png",
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                },
            },
        },
        web: {
            output: "static",
            bundler: "metro",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: {
                        backgroundColor: "#000000",
                    },
                },
            ],
            "expo-web-browser",
            "expo-secure-store",
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
        extra: {
            eas: {
                projectId: "5005b27b-e984-4461-8a69-97338b55a66f",
            },
        },
    },
};
