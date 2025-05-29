// fileUtils.js - Utilities for file operations in different environments
import { Capacitor } from '@capacitor/core';

/**
 * Detects the current platform/environment
 * @returns {Object} Object with platform detection flags
 */
export const detectPlatform = () => {
  const isNative = Capacitor.isNativePlatform();
  const isAndroid = isNative && Capacitor.getPlatform() === 'android';
  const isIOS = isNative && Capacitor.getPlatform() === 'ios';
  const isWeb = !isNative;
  
  return {
    isNative,
    isAndroid,
    isIOS,
    isWeb
  };
};

/**
 * Saves a file to the device's Download folder (Android) or downloads it (Web)
 * @param {string} fileName - Name of the file to save
 * @param {string} content - Content to write to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Path where the file was saved
 */
export const saveFile = async (fileName, content, mimeType = 'text/csv') => {
  const platform = detectPlatform();
  
  try {
    // Android implementation
    if (platform.isAndroid) {
      // Try React Native FS if available
      if (typeof window.ReactNativeWebView !== 'undefined') {
        return new Promise((resolve, reject) => {
          // Set up a listener for the response
          const messageHandler = (event) => {
            try {
              const response = JSON.parse(event.data);
              if (response.type === 'SAVE_CSV_RESULT') {
                window.removeEventListener('message', messageHandler);
                if (response.success) {
                  resolve(response.filePath);
                } else {
                  reject(new Error(response.error || 'Failed to save file'));
                }
              }
            } catch (err) {
              // Not our message or invalid JSON
            }
          };
          
          // Add listener for response
          window.addEventListener('message', messageHandler);
          
          // Send request to save file
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'SAVE_CSV',
              fileName,
              content,
              mimeType
            })
          );
          
          // Set timeout to prevent hanging
          setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('Timeout waiting for file save response'));
          }, 10000);
        });
      }
      
      // Fallback to legacy AndroidWebView if available
      if (typeof window.AndroidWebView !== 'undefined') {
        try {
          const result = window.AndroidWebView.saveFile(fileName, content);
          return Promise.resolve(result || `/Download/PolarJoin/${fileName}`);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      // If we get here, we're on Android but neither interface is available
      // Try to use the Capacitor Filesystem plugin if it's been imported elsewhere
      if (typeof window.Capacitor !== 'undefined' && 
          typeof window.Capacitor.Plugins !== 'undefined' && 
          typeof window.Capacitor.Plugins.Filesystem !== 'undefined') {
        
        const { Filesystem, Directory } = window.Capacitor.Plugins;
        
        // For Android, try to use the public Downloads directory
        // We'll use the FileDownloadPlugin we created
        if (typeof window.Capacitor.Plugins.FileDownload !== 'undefined') {
          try {
            const result = await window.Capacitor.Plugins.FileDownload.saveFile({
              fileName,
              content,
              mimeType
            });
            
            return result.filePath || '/storage/emulated/0/Download/PolarJoin/' + fileName;
          } catch (err) {
            console.error('Error using FileDownload plugin:', err);
            // Fall through to standard Filesystem API
          }
        }
        
        // Fallback to standard Capacitor Filesystem API
        // Ensure the directory exists
        try {
          await Filesystem.mkdir({
            path: 'PolarJoin',
            directory: Directory.External,  // Use External instead of Documents to access public storage
            recursive: true
          });
        } catch (e) {
          // Directory might already exist, that's fine
          console.log('Directory creation result:', e);
        }
        
        // Write the file
        try {
          const result = await Filesystem.writeFile({
            path: `PolarJoin/${fileName}`,
            data: content,
            directory: Directory.External,  // Use External instead of Documents
            encoding: 'utf8'
          });
          
          return `/storage/emulated/0/Download/PolarJoin/${fileName}`;
        } catch (writeErr) {
          console.error('Error writing to external storage:', writeErr);
          
          // Last resort: try Documents directory
          try {
            await Filesystem.mkdir({
              path: 'PolarJoin',
              directory: Directory.Documents,
              recursive: true
            });

            const result = await Filesystem.writeFile({
              path: `PolarJoin/${fileName}`,
              data: content,
              directory: Directory.Documents,
              encoding: 'utf8'
            });

            return `${Directory.Documents}/PolarJoin/${fileName}`;
          } catch (finalErr) {
            console.error('Error writing to documents directory:', finalErr);
            throw finalErr;
          }
        }
      }
    }
    // Web implementation (fallback for all platforms)
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return 'Downloaded to your device';
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};
