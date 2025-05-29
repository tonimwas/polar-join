package io.surveying.polarjoin;

import android.content.Context;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * JavaScript interface for file operations in WebView
 * This class provides methods that can be called from JavaScript in the WebView
 */
public class FileDownloadModule {
    private static final String TAG = "FileDownloadModule";
    private final Context context;

    public FileDownloadModule(Context context) {
        this.context = context;
    }

    /**
     * Save a file to the device's Download folder
     * This method can be called from JavaScript using window.AndroidWebView.saveFile()
     * 
     * @param fileName Name of the file to save
     * @param content Content to write to the file
     * @return Path where the file was saved
     */
    @JavascriptInterface
    public String saveFile(String fileName, String content) {
        try {
            String filePath = saveToDownloads(fileName, content);
            Toast.makeText(context, "File saved to: " + filePath, Toast.LENGTH_LONG).show();
            return filePath;
        } catch (Exception e) {
            Log.e(TAG, "Error saving file", e);
            Toast.makeText(context, "Error saving file: " + e.getMessage(), Toast.LENGTH_LONG).show();
            return null;
        }
    }

    /**
     * Save content to the Downloads folder
     * 
     * @param fileName Name of the file to save
     * @param content Content to write to the file
     * @return Path where the file was saved
     */
    private String saveToDownloads(String fileName, String content) throws IOException {
        File downloadsDir;
        
        // Always use the public Downloads directory
        downloadsDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "PolarJoin");
        
        // Ensure we have permission to write to external storage
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // For Android 10+, we might need additional handling, but we'll try the public directory first
            if (!downloadsDir.exists() && !downloadsDir.mkdirs()) {
                Log.w(TAG, "Failed to create public directory, falling back to app-specific directory");
                // Fallback to app-specific directory only if we can't create the public directory
                downloadsDir = new File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "PolarJoin");
            }
        }

        if (!downloadsDir.exists()) {
            boolean created = downloadsDir.mkdirs();
            if (!created) {
                Log.w(TAG, "Failed to create directory: " + downloadsDir.getAbsolutePath());
            }
        }

        File file = new File(downloadsDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(content.getBytes(StandardCharsets.UTF_8));
            fos.flush();
        }

        return file.getAbsolutePath();
    }
}
