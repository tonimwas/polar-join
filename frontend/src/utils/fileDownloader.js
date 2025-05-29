// Check if we're in a web environment
const isWeb = typeof window !== 'undefined' && window.document;

// Web implementation
const downloadFileWeb = async (fileName, content) => {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, path: fileName };
  } catch (error) {
    console.error('Web download error:', error);
    return { success: false, error: error.message };
  }
};

// Web-compatible functions
const webExports = {
  requestStoragePermission: async () => true,
  saveFile: downloadFileWeb,
  showPermissionAlert: (onPressSettings) => {
    alert('Please allow storage permissions in your browser settings to save files.');
    onPressSettings?.();
  },
  showSuccessAlert: (message) => alert(`Success: ${message}`),
  showErrorAlert: (message) => alert(`Error: ${message}`)
};

// If we're in a web environment, use the web implementation
if (isWeb) {
  module.exports = webExports;
} else {
  // Try to load native modules dynamically
  let nativeModulesLoaded = false;
  let nativeExports = {};
  
  try {
    const { Platform, PermissionsAndroid, Alert, Linking } = require('react-native');
    const RNFS = require('react-native-fs');
    
    const requestStoragePermission = async () => {
      if (Platform.OS !== 'android') return true;
      
      try {
        const granted = await PermissionsAndroid.request(
          'android.permission.WRITE_EXTERNAL_STORAGE',
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === 'granted' || granted === 'never_ask_again';
      } catch (error) {
        console.error('Error requesting storage permission:', error);
        return false;
      }
    };

    const saveFile = async (fileName, content) => {
      try {
        // Get the public downloads directory
        const downloadDir = RNFS.DownloadDirectoryPath;
        
        // Create a PolarJoin directory if it doesn't exist
        const polarJoinDir = `${downloadDir}/PolarJoin`;
        const dirExists = await RNFS.exists(polarJoinDir);
        if (!dirExists) {
          await RNFS.mkdir(polarJoinDir);
        }
        
        // Save file in the PolarJoin directory
        const filePath = `${polarJoinDir}/${fileName}`;
        
        // Write the file
        await RNFS.writeFile(filePath, content, 'utf8');
        
        // Make sure the file is visible in Downloads app
        await RNFS.scanFile(filePath);
        
        return {
          success: true,
          path: filePath,
          message: `File saved to Downloads/PolarJoin/${fileName}`
        };
      } catch (error) {
        console.error('Error saving file:', error);
        return {
          success: false,
          error: error.message,
          message: `Failed to save file: ${error.message}`
        };
      }
    };

    const showPermissionAlert = (onPressSettings) => {
      Alert.alert(
        'Storage Permission Required',
        'This app needs access to your storage to save files. Please grant the storage permission in the next screen.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                await Linking.openSettings();
              } catch (error) {
                console.error('Error opening settings:', error);
              }
              onPressSettings?.();
            },
          },
        ]
      );
    };

    const showSuccessAlert = (message, onPressOK) => {
      Alert.alert(
        'Success',
        message,
        [
          {
            text: 'OK',
            onPress: () => onPressOK?.(),
          },
        ]
      );
    };

    const showErrorAlert = (message) => {
      Alert.alert('Error', message);
    };

    nativeExports = {
      requestStoragePermission,
      saveFile,
      showPermissionAlert,
      showSuccessAlert,
      showErrorAlert
    };
    
    nativeModulesLoaded = true;
  } catch (error) {
    console.warn('Native modules not available, falling back to web implementation', error);
    nativeExports = webExports;
  }
  
  module.exports = nativeExports;
}
