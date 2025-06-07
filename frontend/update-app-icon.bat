@echo off
echo Updating app icon for PolarJoin Calculator...

set ANDROID_RES=android\app\src\main\res
set SOURCE_LOGO=public\polarlogo.png

REM Create background color XML if it doesn't exist
if not exist "%ANDROID_RES%\values\ic_launcher_background.xml" (
  echo Creating background color XML...
  echo ^<?xml version="1.0" encoding="utf-8"?^> > "%ANDROID_RES%\values\ic_launcher_background.xml"
  echo ^<resources^> >> "%ANDROID_RES%\values\ic_launcher_background.xml"
  echo     ^<color name="ic_launcher_background"^>#FFFFFF^</color^> >> "%ANDROID_RES%\values\ic_launcher_background.xml"
  echo ^</resources^> >> "%ANDROID_RES%\values\ic_launcher_background.xml"
)

REM Copy logo to each mipmap directory
for %%d in (mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi) do (
  echo Copying logo to %%d...
  copy /Y "%SOURCE_LOGO%" "%ANDROID_RES%\%%d\ic_launcher.png"
  copy /Y "%SOURCE_LOGO%" "%ANDROID_RES%\%%d\ic_launcher_round.png"
  copy /Y "%SOURCE_LOGO%" "%ANDROID_RES%\%%d\ic_launcher_foreground.png"
)

echo App icon updated successfully!
echo.
echo Next steps:
echo 1. Run 'npx cap sync android' to sync changes
echo 2. Rebuild your APK using Android Studio or Capacitor build commands
echo.
