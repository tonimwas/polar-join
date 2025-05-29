import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileDownloader from '../utils/fileDownloader';

const WebViewWithDownload = ({ source, style, ...props }) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleWebViewMessage = useCallback(async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'SAVE_CSV') {
        const { fileName, content } = message;
        
        // Check and request storage permission
        const hasPermission = await FileDownloader.requestStoragePermission();
        
        if (!hasPermission) {
          FileDownloader.showPermissionAlert();
          return;
        }
        
        // Show loading alert
        Alert.alert(
          'Saving File',
          'Please wait while the file is being saved...',
          [{ text: 'OK' }],
          { cancelable: false }
        );
        
        // Save the file
        const result = await FileDownloader.saveFile(fileName, content);
        
        if (result.success) {
          FileDownloader.showSuccessAlert(
            `File saved successfully!\n\nLocation: ${result.path}\n\nYou can find it in your Downloads/PolarJoin folder.`,
            () => console.log('File saved successfully')
          );
        } else {
          FileDownloader.showErrorAlert(
            `Failed to save file: ${result.message}\n\nPlease make sure you have granted storage permissions and try again.`
          );
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      FileDownloader.showErrorAlert('Failed to process the download request. Please try again.');
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={source}
        onMessage={handleWebViewMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
        {...props}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default WebViewWithDownload;
