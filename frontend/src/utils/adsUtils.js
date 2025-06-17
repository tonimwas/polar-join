import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Initialize AdMob
export const initializeAdMob = async () => {
  if (Capacitor.getPlatform() === 'android') {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      initializeForTesting: true,
    });
  }
};

// Banner ad configuration
const bannerConfig = {
  adId: 'ca-app-pub-3940256099942544/6300978111', // Replace with your actual ad unit ID
  position: 'BOTTOM_CENTER',
  margin: 0,
  isTesting: false, // Set to false in production
};

// Interstitial ad configuration
const interstitialConfig = {
  adId: 'ca-app-pub-3940256099942544/1033173712', // Replace with your actual ad unit ID
  isTesting: false, // Set to false in production
};

// Show banner ad
export const showBannerAd = async () => {
  try {
    await AdMob.showBanner(bannerConfig);
  } catch (error) {
    console.error('Error showing banner ad:', error);
  }
};

// Hide banner ad
export const hideBannerAd = async () => {
  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('Error hiding banner ad:', error);
  }
};

// Load and show interstitial ad
export const showInterstitialAd = async () => {
  try {
    await AdMob.prepareInterstitial(interstitialConfig);
    await AdMob.showInterstitial();
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
  }
}; 