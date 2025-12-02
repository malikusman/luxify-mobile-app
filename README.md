Luxify

This is a cross-platform mobile application built with React Native and the Expo framework, using Expo Router for navigation.

🚀 Quick Setup

To get started quickly, follow these steps:

1. Prerequisites

Make sure you have Node.js and the Expo CLI installed globally:

npm install -g expo-cli


2. Installation

Clone the repository and install the project dependencies:

npm install --legacy-peer-deps

3. Running the App

Start the development server. This will open a browser window with the Metro bundler.

expo start


4. Testing

Use the Expo Go app on your phone to scan the QR code displayed in the terminal or browser, or press i for iOS Simulator or a for Android Emulator.

📁 Key Directories

app/: Contains all screen files, defining the routes and navigation using Expo Router.

src/: Contains all reusable code (components, hooks, services, theme, and constants).

assets/: Holds static files like images and fonts.

📦 Building for Production

To create an installable app bundle for the App Store or Google Play:

eas build --platform all
