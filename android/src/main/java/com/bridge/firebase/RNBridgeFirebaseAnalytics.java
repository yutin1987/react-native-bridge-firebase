package com.react.bridge.firebase;

import android.util.Log;
import android.content.Context;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;

import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.crash.FirebaseCrash;

public class RNBridgeFirebaseAnalytics extends RNBridgeFirebase {

  private static final String TAG = "RNBridgeFirebaseAnalytics";

  public RNBridgeFirebaseAnalytics(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "RNBridgeFirebaseAnalytics";
  }

  public void reportCrash(String message) {
    FirebaseCrash.log(message);
  }

  public void setUserId(String id) {
    final Context context = getReactApplicationContext();
    FirebaseAnalytics.getInstance(context).setUserId(id);
  }

  public void setUserProperty(String name, String property) {
    final Context context = getReactApplicationContext();
    FirebaseAnalytics.getInstance(context).setUserProperty(name, property);
  }

  public void logEvent(String name, ReadableMap parameters) {
    final Context context = getReactApplicationContext();
    FirebaseAnalytics.getInstance(context).logEvent(name, Arguments.toBundle(parameters));
  }

  public void setEnabled(Boolean enabled) {
    final Context context = getReactApplicationContext();
    FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(enabled);
  }
}
