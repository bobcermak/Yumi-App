export default {
  expo: {
    name: "Yumi - AI Calorie Tracker",
    slug: "yumi",
    description: "Your AI buddy for calorie tracking. Snap your food, track calories, and take care of your avocado Yumi!",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "yumi",
    userInterfaceStyle: "automatic",
    androidStatusBar: {
      barStyle: "dark-content",
      backgroundColor: "#121212",
      translucent: true,
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "cz.yumi.app",
      infoPlist: {
        UIStatusBarStyle: "UIStatusBarStyleDefault",
        UIViewControllerBasedStatusBarAppearance: false,
      },
    },
    android: {
      package: "cz.yumi.app",
      adaptiveIcon: {
        backgroundColor: "#121212",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-screen.png",
          resizeMode: "cover",
          backgroundColor: "#121212",
        },
      ],
      "expo-web-browser",
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission: "Yumi uses your camera to scan and recognise your food.",
          recordAudioAndroid: false,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Yumi uses your photos so you can add pictures of your meals.",
        },
      ],
      "expo-image",
      "expo-status-bar",
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
};