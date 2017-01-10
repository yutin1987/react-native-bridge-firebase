package com.react.bridge.firebase;

import android.util.Log;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;

public class RNBridgeFirebaseMessage extends RNBridgeFirebase {

  private static final String TAG = "RNBridgeFirebaseMessage";

  public RNBridgeFirebaseMessage(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "RNBridgeFirebaseMessage";
  }

  @Override
  public void onNewIntent(Intent intent) {
    Bundle extras = intent.getExtras();

    if (extras != null && extras.get("google.message_id") != null) {
      WritableMap params = Arguments.createMap();
      for (String key : extras.keySet()) {
        Object value = extras.get(key);
        params.putString(key, value.toString());
      }

      emitToJS(RCT_EVENT_REMOTE_NOTIFICATION, params);
    }
  }

  @Override
  public void onHostResume() {
    Bundle extras = getCurrentActivity().getIntent().getExtras();

    if (extras != null && extras.get("google.message_id") != null) {
      WritableMap params = Arguments.createMap();
      for (String key : extras.keySet()) {
        Object value = extras.get(key);
        params.putString(key, value.toString());
      }

      emitToJS(RCT_EVENT_REMOTE_NOTIFICATION, params);
    }
  }

  public void intentTokenRefreshHandler() {
    IntentFilter intentFilter = new IntentFilter(INTENT_REGISTERED);

    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          // registered
          WritableMap firebaseParams = Arguments.createMap();
          firebaseParams.putString("firebaseToken", intent.getStringExtra("token"));
          emitToJS(RCT_EVENT_REGISTERED, firebaseParams);
          // device registered
          WritableMap deviceParams = Arguments.createMap();
          deviceParams.putString("deviceToken", intent.getStringExtra("token"));
          emitToJS(RCT_EVENT_DEVICE_REGISTERED, deviceParams);
        }
      }
    }, intentFilter);
  }

  public void intentMessageHandler() {
    IntentFilter intentFilter = new IntentFilter(INTENT_REMOTE_NOTIFICATION);

    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          RemoteMessage message = intent.getParcelableExtra("data");
          WritableMap params = Arguments.createMap();

          // notification
          RemoteMessage.Notification notification = message.getNotification();
          if (notification != null) {
            WritableMap notice = Arguments.createMap();
            notice.putString("title", notification.getTitle());
            notice.putString("body", notification.getBody());
            params.putMap("notification", notice);
          }

          // message
          if (message.getData() != null) {
            Map<String, String> data = message.getData();
            Set<String> keysIterator = data.keySet();
            for(String key: keysIterator) {
              params.putString(key, data.get(key));
            }

            params.putString("collapse_key", message.getCollapseKey());
            params.putString("google.message_id", message.getMessageId());
            params.putString("google.sent_time", Long.toString(message.getSentTime()));
            params.putString("from", message.getFrom());

            emitToJS(RCT_EVENT_REMOTE_NOTIFICATION, params);
          }
        }
      }
    }, intentFilter);
  }

  public void subscribeToTopic(String topic) {
    FirebaseMessaging.getInstance().subscribeToTopic(topic);
  }

  public void unsubscribeFromTopic(String topic) {
    FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
  }

  public void registerDevice(ReadableMap params, Promise promise) {
    WritableMap map = Arguments.createMap();
    promise.resolve(map);
  }
}
