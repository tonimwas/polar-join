import React, { useEffect } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const BannerAd = ({ adUnitId }) => {
  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      return; // AdMob does not work on web
    }

    const showBanner = async () => {
      try {
        const options = {
          adId: adUnitId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true, // IMPORTANT: Set to false for production
        };
        await AdMob.showBanner(options);
      } catch (error) {
        console.error('Error showing banner ad:', error);
      }
    };

    // Initialize and show banner
    AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true, // IMPORTANT: Set to false for production
    }).then(() => {
      showBanner();
    }).catch(err => console.error("Error initializing AdMob", err));


    return () => {
      // Hide banner on component unmount
      if (Capacitor.getPlatform() !== 'web') {
        AdMob.hideBanner().catch(err => console.error("Error hiding banner", err));
      }
    };
  }, [adUnitId]);

  return null; // This component does not render anything itself
};

export default BannerAd;
