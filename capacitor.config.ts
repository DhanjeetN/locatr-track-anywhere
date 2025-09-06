import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.201299cba53a475f9565107ae6dcc5e6',
  appName: 'locatr-track-anywhere',
  webDir: 'dist',
  server: {
    url: 'https://201299cb-a53a-475f-9565-107ae6dcc5e6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: "always"
      }
    }
  }
};

export default config;