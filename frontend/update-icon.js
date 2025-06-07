const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source logo path
const sourceLogo = path.join(__dirname, 'public', 'polarlogo.png');

// Android resource directories for app icons
const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const mipmapDirs = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

// Copy the logo to each mipmap directory
mipmapDirs.forEach(dir => {
  const targetDir = path.join(androidResDir, dir);
  
  // Make sure directory exists
  if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy the logo as ic_launcher.png, ic_launcher_round.png, and ic_launcher_foreground.png
  ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'].forEach(iconName => {
    const targetPath = path.join(targetDir, iconName);
    fs.copyFileSync(sourceLogo, targetPath);
    console.log(`Copied logo to ${targetPath}`);
  });
});

// Update the background color in colors.xml
const colorsPath = path.join(androidResDir, 'values', 'ic_launcher_background.xml');
if (!fs.existsSync(path.dirname(colorsPath))) {
  fs.mkdirSync(path.dirname(colorsPath), { recursive: true });
}

// Create or update the background color file
fs.writeFileSync(colorsPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`);

console.log('App icon updated successfully!');
console.log('Now run "npx cap sync android" to sync the changes to the Android project');
