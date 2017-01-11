# react-native-bridge-firebase

Can easy to use Analytics/Crash/Config/Message of Firebase on ReactNative

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## iOS Setup

1. install react-native-bridge-firebase

`/> yarn add react-native-bridge-firebase`

2. download GoogleService-Info.plist save to ios/[project name] folder and add to xcode

3. link package

`/> react-native link react-native-bridge-firebase`

## Android Setup

1. install react-native-bridge-firebase

`/> yarn add react-native-bridge-firebase`

2. download google-services.json save to android/add folder

3. link package

`/> react-native link react-native-bridge-firebase`

## Run example

### iOS

1. GoTo Firebase console
2. Download GoogleService-Info.plist file and save to example/ios folder
3. `cd example && react-native run-ios` or Command+R run on Simulator

### Android

1. GoTo Firebase console
2. Download google-services.json file and save to example/android/add folder
3. `cd android && ./gradlew clean`
4. `cd example && react-native run-android`
