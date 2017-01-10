package com.react.bridge.firebase;

import android.util.Log;
import android.content.Context;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;

public class RNBridgeFirebaseConfig extends RNBridgeFirebase {

  private static final String TAG = "RNBridgeFirebaseConfig";

  private FirebaseRemoteConfig mRemoteConfig;

  @Override
  public String getName() {
    return "RNBridgeFirebaseConfig";
  }

  public RNBridgeFirebaseConfig(ReactApplicationContext reactContext) {
    super(reactContext);

    mRemoteConfig = FirebaseRemoteConfig.getInstance();

    FirebaseRemoteConfigSettings configSettings = new FirebaseRemoteConfigSettings
      .Builder()
      .setDeveloperModeEnabled(BuildConfig.DEBUG)
      .build();
    mRemoteConfig.setConfigSettings(configSettings);

    fetchConfig();
  }

  private void fetchConfig() {
    long cacheExpiration = 3600;
    if (mRemoteConfig.getInfo().getConfigSettings().isDeveloperModeEnabled()) {
        cacheExpiration = 0;
    }

    mRemoteConfig
      .fetch(cacheExpiration)
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {
          if (task.isSuccessful()) {
              mRemoteConfig.activateFetched();
          } else {
          }
        }
      });
  }

  public void getString(String name, Promise promise) {
    FirebaseRemoteConfigValue config = mRemoteConfig.getValue(name);

    WritableMap map = Arguments.createMap();
    map.putString("value", config.asString());
    map.putInt("source", config.getSource());
    promise.resolve(map);
  }

  public void getNumber(String name, Promise promise) {
    FirebaseRemoteConfigValue config = mRemoteConfig.getValue(name);

    WritableMap map = Arguments.createMap();
    map.putDouble("value", config.asDouble());
    map.putInt("source", config.getSource());
    promise.resolve(map);
  }

  public void getBoolean(String name, Promise promise) {
    FirebaseRemoteConfigValue config = mRemoteConfig.getValue(name);

    WritableMap map = Arguments.createMap();
    map.putBoolean("value", config.asBoolean());
    map.putInt("source", config.getSource());
    promise.resolve(map);
  }
}
