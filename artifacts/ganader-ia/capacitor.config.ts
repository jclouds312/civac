import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.civac.ganaderia",
  appName: "CIVAC Ganadería",
  webDir: "../../public",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: "#07131b",
      showSpinner: false,
    },
  },
};

export default config;
