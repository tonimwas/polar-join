package io.surveying.polarjoin;

import android.content.Context;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "FileDownload")
public class FileDownloadPlugin extends Plugin {
    private static final String TAG = "FileDownloadPlugin";

    @PluginMethod
    public void saveFile(PluginCall call) {
        String fileName = call.getString("fileName");
        String content = call.getString("content");
        String mimeType = call.getString("mimeType", "text/csv");

        if (fileName == null || content == null) {
            call.reject("fileName and content are required");
            return;
        }

        try {
            String filePath = saveToDownloads(getContext(), fileName, content);
            JSObject ret = new JSObject();
            ret.put("filePath", filePath);
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error saving file", e);
            call.reject("Error saving file: " + e.getMessage(), e);
        }
    }

    private String saveToDownloads(Context context, String fileName, String content) throws IOException {
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
