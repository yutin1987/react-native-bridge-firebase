package com.react.bridge.firebase;

import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.content.Intent;
import android.content.res.Resources;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.net.Uri;
import android.util.Base64;
import android.app.Activity;
import android.app.NotificationManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.support.v4.app.NotificationCompat;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.UploadTask;

import java.util.Map;
import java.util.HashMap;
import java.util.Set;

import javax.annotation.Nullable;

public class RNBridgeFirebaseStorage extends RNBridgeFirebase {

  private static final String TAG = "RNBridgeFirebaseStorage";

  private Promise mUploadPromise;

  public RNBridgeFirebaseStorage(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "RNBridgeFirebaseStorage";
  }

  public void uploadJPG(ReadableMap params, Promise promise) {
    String path = params.getString("path");
    String base64 = params.getString("base64");

    StorageReference storageRef = FirebaseStorage.getInstance().getReference();
    StorageMetadata metadata = new StorageMetadata.Builder()
                                                  .setContentType("image/jpg")
                                                  .build();

    byte[] data = Base64.decode(base64, Base64.DEFAULT);
    StorageReference imagesRef = storageRef.child(path);
    UploadTask uploadTask = imagesRef.putBytes(data, metadata);

    mUploadPromise = promise;

    uploadTask
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception error) {
          mUploadPromise.reject(RCT_ERROR_UNKNOWN, "Failed to upload jpg", error);
        }
      })
      .addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
        @Override
        public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
          Uri downloadUrl = taskSnapshot.getDownloadUrl();
          mUploadPromise.resolve(downloadUrl.toString());
        }
      });
  }
}
