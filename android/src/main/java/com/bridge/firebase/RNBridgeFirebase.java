package com.react.bridge.firebase;

import android.app.Activity;
import android.util.Log;
import android.content.Intent;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import javax.annotation.Nullable;

public abstract class RNBridgeFirebase extends ReactContextBaseJavaModule {

  private static final String TAG = "RNBridgeFirebase";

  public static final String INTENT_REMOTE_NOTIFICATION = "com.react.bridge.firebase.refreshedToken";
  public static final String INTENT_REGISTERED = "com.react.bridge.firebase.registered";

  protected static final String RCT_EVENT_DEVICE_REGISTERED = "FirebaseDeviceRegistered";
  protected static final String RCT_EVENT_REGISTERED = "FirebaseRegistered";
  protected static final String RCT_EVENT_FAILED_TO_REGISTER = "FirebaseFailedToRegister";
  protected static final String RCT_EVENT_REMOTE_NOTIFICATION = "FirebaseRemoteNotificationReceived";
  protected static final String RCT_EVENT_DATA_VALUE_CHANGED = "FirebaseDataValueChanged";
  protected static final String RCT_EVENT_DATA_CHILD_CHANGED = "FirebaseDataChildChanged";

  protected static final String RCT_ERROR_UNKNOWN = "ERROR_UNKNOWN";
  protected static final String RCT_ERROR_UNABLE_TO_REQUEST_PERMISSION = "ERROR_UNABLE_TO_REQUEST_PERMISSION";

  public RNBridgeFirebase(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  public void onActivityResult(int requestCode, int resultCode, Intent data) {
  }

  public void onNewIntent(Intent intent) {
  }

  public void onHostResume() {
  }

  public void onHostPause() {
  }

  public void onHostDestroy() {
  }

  protected void emitToJS(String name, Object params) {
    getReactApplicationContext()
      .getJSModule(RCTNativeAppEventEmitter.class)
      .emit(name, params);
  }
}
