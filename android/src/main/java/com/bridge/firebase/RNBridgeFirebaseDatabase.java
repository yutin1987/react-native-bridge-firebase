package com.react.bridge.firebase;

import android.util.Log;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.ChildEventListener;

import java.util.Map;
import java.util.HashMap;

import javax.annotation.Nullable;

public class RNBridgeFirebaseDatabase extends RNBridgeFirebase {

  private static final String TAG = "RNBridgeFirebaseDatabase";

  public static final int DATA_CHILD_ADDED = 1;
  public static final int DATA_CHILD_REMOVED = 2;
  public static final int DATA_CHILD_CHANGED = 3;
  public static final int DATA_CHILD_MOVED = 4;

  private DatabaseReference mDatabase;

  private HashMap<String, ValueEventListener> valueListener;

  private HashMap<String, ChildEventListener> childListener;

  public RNBridgeFirebaseDatabase(ReactApplicationContext reactContext) {
    super(reactContext);
    valueListener = new HashMap<String, ValueEventListener>();
    childListener = new HashMap<String, ChildEventListener>();
    mDatabase = FirebaseDatabase.getInstance().getReference();
  }

  @Override
  public String getName() {
    return "RNBridgeFirebaseDatabase";
  }

  public static final WritableMap toWritableMapDeep(
    WritableMap map,
    DataSnapshot snapshot,
    @Nullable String customKey
  ) {
    String key = customKey != null ? customKey : snapshot.getKey();

    if (!snapshot.hasChildren()) {
      Object value = snapshot.getValue();

      if (value == null) {
        map.putNull(key);
      } else if (value instanceof String) {
        map.putString(key, (String) value);
      } else if (value instanceof Number) {
        if (value instanceof Integer) {
          map.putInt(key, (Integer) value);
        } else {
          map.putDouble(key, ((Number) value).doubleValue());
        }
      } else if (value instanceof Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else {
        throw new IllegalArgumentException("Could not convert " + value.getClass());
      }

      return map;
    }

    WritableMap childMap = Arguments.createMap();
    for (DataSnapshot child : snapshot.getChildren()) {
      RNBridgeFirebaseDatabase.toWritableMapDeep(childMap, child, null);
    }
    map.putMap(key, childMap);
    return map;
  }


  public static final WritableMap toWritableMap(DataSnapshot data) {
    WritableMap map = RNBridgeFirebaseDatabase.toWritableMapDeep(Arguments.createMap(), data, "value");
    map.putString("key", data.getKey());
    map.putBoolean("hasChildren", data.hasChildren());
    map.putBoolean("exists", data.exists());
    map.putInt("childrenCount", (int) data.getChildrenCount());
    Object priority = data.getPriority();
    if (priority == null) {
      map.putNull("priority");
    } else {
      map.putString("priority", priority.toString());
    }

    return map;
  }

  public void addChild(String path, Promise promise) {
    String key = mDatabase.child(path).push().getKey();
    promise.resolve(key);
  }

  public void setValue(String path, ReadableMap data, final Promise promise) {
    Object value;
    switch (data.getType("value")) {
      case Boolean:
        value = data.getBoolean("value");
        break;
      case Number:
        value = data.getDouble("value");
        break;
      case String:
        value = data.getString("value");
        break;
      case Map:
        value = ((ReadableNativeMap) data).getMap("value").toHashMap();
        break;
      case Array:
        value = ((ReadableNativeMap) data).getArray("value").toArrayList();
        break;
      default:
        throw new IllegalArgumentException("Could not convert " + data.getType("value"));
    }

    mDatabase.child(path).setValue(value, new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
        if (databaseError != null) {
          promise.reject(databaseError.toException());
          return;
        }

        promise.resolve(true);
      }
    });
  }

  public void getValue(String path, final Promise promise) {
    final RNBridgeFirebaseDatabase self = this;

    mDatabase.child(path).addListenerForSingleValueEvent(
      new ValueEventListener() {
        @Override
        public void onDataChange(DataSnapshot data) {
          promise.resolve(RNBridgeFirebaseDatabase.toWritableMap(data));
        }
        @Override
        public void onCancelled(DatabaseError databaseError) {
          promise.reject(databaseError.toException());
        }
      }
    );
  }

  public void removeValue(String path, final Promise promise) {
    mDatabase.child(path).removeValue(new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
        if (databaseError != null) {
          promise.reject(databaseError.toException());
          return;
        }

        promise.resolve(true);
      }
    });
  }

  public void addValueListener(final String path, Promise promise) {
    final RNBridgeFirebaseDatabase self = this;

    ValueEventListener listener = new ValueEventListener() {
      @Override
      public void onDataChange(DataSnapshot data) {
        WritableMap map = RNBridgeFirebaseDatabase.toWritableMap(data);
        map.putString("path", path);
        self.emitToJS(RCT_EVENT_DATA_VALUE_CHANGED, map);
      }

      @Override
      public void onCancelled(DatabaseError databaseError) {
        Log.w(TAG, "loadPost:onCancelled", databaseError.toException());
      }
    };
    mDatabase.child(path).addValueEventListener(listener);

    valueListener.put(path, listener);
    promise.resolve(true);
  }

  public void addChildListener(final String path, Promise promise) {
    final RNBridgeFirebaseDatabase self = this;

    ChildEventListener listener = new ChildEventListener() {
      @Override
      public void onChildAdded(DataSnapshot data, String previousChildName) {
        WritableMap map = RNBridgeFirebaseDatabase.toWritableMap(data);
        map.putInt("type", RNBridgeFirebaseDatabase.DATA_CHILD_ADDED);
        map.putString("path", path);
        self.emitToJS(RCT_EVENT_DATA_CHILD_CHANGED, map);
      }

      @Override
      public void onChildChanged(DataSnapshot data, String previousChildName) {
        WritableMap map = RNBridgeFirebaseDatabase.toWritableMap(data);
        map.putInt("type", RNBridgeFirebaseDatabase.DATA_CHILD_CHANGED);
        map.putString("path", path);
        self.emitToJS(RCT_EVENT_DATA_CHILD_CHANGED, map);
      }

      @Override
      public void onChildRemoved(DataSnapshot data) {
        WritableMap map = RNBridgeFirebaseDatabase.toWritableMap(data);
        map.putInt("type", RNBridgeFirebaseDatabase.DATA_CHILD_REMOVED);
        map.putString("path", path);
        self.emitToJS(RCT_EVENT_DATA_CHILD_CHANGED, map);
      }

      @Override
      public void onChildMoved(DataSnapshot data, String previousChildName) {
        WritableMap map = RNBridgeFirebaseDatabase.toWritableMap(data);
        map.putInt("type", RNBridgeFirebaseDatabase.DATA_CHILD_MOVED);
        map.putString("path", path);
        self.emitToJS(RCT_EVENT_DATA_CHILD_CHANGED, map);
      }

      @Override
      public void onCancelled(DatabaseError databaseError) {
        Log.w(TAG, "postComments:onCancelled", databaseError.toException());
      }
    };
    mDatabase.child(path).addChildEventListener(listener);

    childListener.put(path, listener);
    promise.resolve(true);
  }

  public void removeValueListener(String path, Promise promise) {
    ValueEventListener listener = valueListener.get(path);
    mDatabase.removeEventListener(listener);
    promise.resolve(true);
  }

  public void removeChildListener(String path, Promise promise) {
    ChildEventListener listener = childListener.get(path);
    mDatabase.removeEventListener(listener);
    promise.resolve(true);
  }
}
