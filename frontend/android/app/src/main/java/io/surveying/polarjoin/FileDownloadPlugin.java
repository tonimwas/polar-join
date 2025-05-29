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
        
        // Create PolarJoin directory in public Downloads
        downloadsDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "PolarJoin");

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
