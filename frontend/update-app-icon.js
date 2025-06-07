const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define the source logo path
const sourceLogoPath = path.join(__dirname, 'public', 'polarlogo.png');

// Define the target sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Define the Android resource directory
const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Function to create resized icons
async function createAppIcons() {
  try {
    console.log('Starting icon generation process...');
    
    // Check if source logo exists
    if (!fs.existsSync(sourceLogoPath)) {
      console.error(`Source logo not found at: ${sourceLogoPath}`);
      return;
    }
    
    // Process each icon size
    for (const [folder, size] of Object.entries(iconSizes)) {
      const targetDir = path.join(androidResDir, folder);
      
      // Check if target directory exists
      if (!fs.existsSync(targetDir)) {
        console.log(`Creating directory: ${targetDir}`);
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Generate regular icon
      const regularIconPath = path.join(targetDir, 'ic_launcher.png');
      await sharp(sourceLogoPath)
        .resize(size, size)
        .toFile(regularIconPath);
      
      // Generate round icon (same as regular for now)
      const roundIconPath = path.join(targetDir, 'ic_launcher_round.png');
      await sharp(sourceLogoPath)
        .resize(size, size)
        .toFile(roundIconPath);
      
      // Generate foreground icon (slightly smaller for padding)
      const foregroundIconPath = path.join(targetDir, 'ic_launcher_foreground.png');
      await sharp(sourceLogoPath)
        .resize(Math.floor(size * 0.75), Math.floor(size * 0.75))
        .toFile(foregroundIconPath);
      
      console.log(`Created icons for ${folder} at ${size}x${size}px`);
    }
    
    console.log('App icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating app icons:', error);
  }
}

// Run the icon generation
createAppIcons();
