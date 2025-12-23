# Santa Tracker Mobile App

Your Santa Tracker is now a mobile app for iOS and Android!

## Prerequisites

### For iOS Development
- macOS with Xcode installed
- Xcode Command Line Tools
- CocoaPods (usually comes with Xcode)

### For Android Development
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 17 or higher

## Available Commands

### Sync Web Build to Mobile
```bash
npm run mobile:sync
```
Builds your web app and syncs it to both iOS and Android platforms.

### Open in Xcode (iOS)
```bash
npm run mobile:ios
```
Opens the iOS project in Xcode for testing and deployment.

### Open in Android Studio
```bash
npm run mobile:android
```
Opens the Android project in Android Studio for testing and deployment.

### Run on iOS Device/Simulator
```bash
npm run mobile:run:ios
```
Builds, syncs, and runs the app on an iOS simulator or connected device.

### Run on Android Device/Emulator
```bash
npm run mobile:run:android
```
Builds, syncs, and runs the app on an Android emulator or connected device.

## Development Workflow

1. Make changes to your React code in the `src/` directory
2. Run `npm run mobile:sync` to build and sync changes
3. Run `npm run mobile:ios` or `npm run mobile:android` to open in native IDEs
4. Build and run from Xcode or Android Studio

## Permissions Configured

The app has been configured with the following permissions:

### iOS (Info.plist)
- Microphone access for calling Santa

### Android (AndroidManifest.xml)
- Internet access
- Microphone recording
- Audio settings modification

## Testing on Devices

### iOS
1. Connect your iPhone/iPad via USB
2. Open Xcode: `npm run mobile:ios`
3. Select your device from the device menu
4. Click Run button or press Cmd+R

### Android
1. Enable Developer Mode on your Android device
2. Enable USB Debugging
3. Connect your device via USB
4. Open Android Studio: `npm run mobile:android`
5. Select your device and click Run

## Building for Production

### iOS App Store
1. Open project in Xcode: `npm run mobile:ios`
2. Configure signing with your Apple Developer account
3. Select "Any iOS Device" as target
4. Product > Archive
5. Follow Apple's submission process

### Google Play Store
1. Open project in Android Studio: `npm run mobile:android`
2. Build > Generate Signed Bundle/APK
3. Follow the wizard to create a keystore and sign your app
4. Upload the generated AAB file to Google Play Console

## Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

These are automatically included in the mobile build.

## Troubleshooting

### iOS Build Errors
- Make sure you have Xcode installed
- Run `pod install` in the `ios/App` directory if you encounter pod errors
- Clean build folder in Xcode: Shift+Cmd+K

### Android Build Errors
- Make sure Android SDK is properly configured
- Check that JAVA_HOME is set correctly
- Sync Gradle files in Android Studio

### App Not Updating
- Always run `npm run mobile:sync` after making code changes
- Clean and rebuild in Xcode/Android Studio if changes aren't appearing

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Deployment Guide](https://capacitorjs.com/docs/ios)
- [Android Deployment Guide](https://capacitorjs.com/docs/android)
