package io.surveying.polarjoin;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register our plugins
        registerPlugin(FileDownloadPlugin.class);
        
        // Add JavaScript interface to the WebView after the bridge is initialized
        Bridge bridge = this.getBridge();
        WebView webView = bridge.getWebView();
        
        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        
        // Add our JavaScript interface
        webView.addJavascriptInterface(new FileDownloadModule(this), "AndroidWebView");
    }
}
