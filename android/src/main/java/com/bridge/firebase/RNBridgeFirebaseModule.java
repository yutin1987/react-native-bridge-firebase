package com.react.bridge.firebase;

import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.app.Activity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;

public class RNBridgeFirebaseModule extends RNBridgeFirebase implements ActivityEventListener, LifecycleEventListener {

  private static final String TAG = "RNBridgeFirebaseModule";

  private RNBridgeFirebaseAnalytics analytics;
  private RNBridgeFirebaseMessage message;
  private RNBridgeFirebaseStorage storage;
  private RNBridgeFirebaseConfig config;
  private RNBridgeFirebaseDatabase database;

  @Override
  public String getName() {
    return "RNBridgeFirebase";
  }

  public RNBridgeFirebaseModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(this);
    reactContext.addLifecycleEventListener(this);

    analytics = new RNBridgeFirebaseAnalytics(reactContext);
    message = new RNBridgeFirebaseMessage(reactContext);
    storage = new RNBridgeFirebaseStorage(reactContext);
    config = new RNBridgeFirebaseConfig(reactContext);
    database = new RNBridgeFirebaseDatabase(reactContext);

    message.intentTokenRefreshHandler();
    message.intentMessageHandler();
  }

  protected List<RNBridgeFirebase> getModule() {
    return Arrays.<RNBridgeFirebase>asList(analytics, message, storage, config, database);
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    for (RNBridgeFirebase module : getModule())
      module.onActivityResult(requestCode, resultCode, data);
  }

  @Override
  public void onNewIntent(Intent intent) {
    for (RNBridgeFirebase module : getModule()) module.onNewIntent(intent);
  }

  @Override
  public void onHostResume() {
    for (RNBridgeFirebase module : getModule()) module.onHostResume();
  }

  @Override
  public void onHostPause() {
    for (RNBridgeFirebase module : getModule()) module.onHostPause();
  }

  @Override
  public void onHostDestroy() {
    for (RNBridgeFirebase module : getModule()) module.onHostDestroy();
  }

  // [START message]
  @ReactMethod
  public void registerDevice(ReadableMap params, Promise promise) {
    message.registerDevice(params, promise);
  }

  public void subscribeToTopic(String topic) {
    message.subscribeToTopic(topic);
  }

  public void unsubscribeFromTopic(String topic) {
    message.unsubscribeFromTopic(topic);
  }
  // [END message]

  // [START storage]
  @ReactMethod
  public void uploadJPG(ReadableMap params, Promise promise) {
    storage.uploadJPG(params, promise);
  }
  // [END storage]

  // [START analytics]
  @ReactMethod
  public void reportCrash(String message) {
    analytics.reportCrash(message);
  }

  @ReactMethod
  public void setUserId(String id) {
    analytics.setUserId(id);
  }

  @ReactMethod
  public void setUserProperty(String name, String property) {
    analytics.setUserProperty(name, property);
  }

  @ReactMethod
  public void logEvent(String name, ReadableMap parameters) {
    analytics.logEvent(name, parameters);
  }

  @ReactMethod
  public void setEnabled(Boolean enabled) {
    analytics.setEnabled(enabled);
  }
  // [END analytics]

  // [START config]
  @ReactMethod
  public void getStringConfig(String name, Promise promise) {
    config.getString(name, promise);
  }

  @ReactMethod
  public void getNumberConfig(String name, Promise promise) {
    config.getNumber(name, promise);
  }

  @ReactMethod
  public void getBooleanConfig(String name, Promise promise) {
    config.getBoolean(name, promise);
  }
  // [END analytics]

  // [START database]
  @ReactMethod
  public void addDataChild(String path, Promise promise) {
    database.addChild(path, promise);
  }

  @ReactMethod
  public void setDataValue(String path, ReadableMap data, Promise promise) {
    database.setValue(path, data, promise);
  }

  @ReactMethod
  public void getDataValue(String path, Promise promise) {
    database.getValue(path, promise);
  }

  @ReactMethod
  public void removeDataValue(String path, Promise promise) {
    database.removeValue(path, promise);
  }

  @ReactMethod
  public void addDataValueListener(String path, Promise promise) {
    database.addValueListener(path, promise);
  }

  @ReactMethod
  public void removeDataValueListener(String path, Promise promise) {
    database.removeValueListener(path, promise);
  }

  @ReactMethod
  public void addDataChildListener(String path, Promise promise) {
    database.addChildListener(path, promise);
  }

  @ReactMethod
  public void removeDataChildListener(String path, Promise promise) {
    database.removeChildListener(path, promise);
  }
  // [END database]

  @Override
  public @Nullable Map<String, Object> getConstants() {
    String token = FirebaseInstanceId.getInstance().getToken();

    ReactApplicationContext context = getReactApplicationContext();
    RNBridgeFirebaseDeviceName deviceName = new RNBridgeFirebaseDeviceName(context);
    RNBridgeFirebaseDeviceUid deviceUid = new RNBridgeFirebaseDeviceUid(context);

    HashMap<String, Object> constant = new HashMap<String, Object>();
    constant.put("deviceToken", token != null ? token : "");
    constant.put("firebaseToken", token != null ? token : "");
    constant.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
    constant.put("deviceName", deviceName.getDeviceName());
    constant.put("deviceUid", deviceUid.getDeviceUid().toString());
    constant.put("appVersion", BuildConfig.VERSION_NAME);

    HashMap<String, String> event = new HashMap<String, String>();
    event.put("DEVICE_REGISTERED", RCT_EVENT_DEVICE_REGISTERED);
    event.put("REGISTERED", RCT_EVENT_REGISTERED);
    event.put("FAILED_TO_REGISTER", RCT_EVENT_FAILED_TO_REGISTER);
    event.put("REMOTE_NOTIFICATION", RCT_EVENT_REMOTE_NOTIFICATION);
    event.put("DATA_VALUE_CHANGED", RCT_EVENT_DATA_VALUE_CHANGED);
    event.put("DATA_CHILD_CHANGED", RCT_EVENT_DATA_CHILD_CHANGED);
    constant.put("EVENT", event);

    HashMap<String, String> error = new HashMap<String, String>();
    error.put("UNKNOWN", RCT_ERROR_UNKNOWN);
    constant.put("ERROR", error);

    HashMap<String, Integer> configSource = new HashMap<String, Integer>();
    configSource.put("DEFAULT", FirebaseRemoteConfig.VALUE_SOURCE_DEFAULT);
    configSource.put("REMOTE", FirebaseRemoteConfig.VALUE_SOURCE_REMOTE);
    configSource.put("STATIC", FirebaseRemoteConfig.VALUE_SOURCE_STATIC);
    constant.put("CONFIG_SOURCE", configSource);

    HashMap<String, Integer> dataChild = new HashMap<String, Integer>();
    dataChild.put("ADDED", RNBridgeFirebaseDatabase.DATA_CHILD_ADDED);
    dataChild.put("REMOVED", RNBridgeFirebaseDatabase.DATA_CHILD_REMOVED);
    dataChild.put("CHANGED", RNBridgeFirebaseDatabase.DATA_CHILD_CHANGED);
    dataChild.put("MOVED", RNBridgeFirebaseDatabase.DATA_CHILD_MOVED);
    constant.put("DATA_CHILD", dataChild);

    return constant;
  }
}
