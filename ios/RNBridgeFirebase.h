#import "RCTEventEmitter.h"

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTUtils.h"

@interface RNBridgeFirebase : RCTEventEmitter

extern NSString *const RCT_FIREBASE_EVENT_REGISTER_SETTINGS;
extern NSString *const RCT_FIREBASE_EVENT_DEVICE_REGISTERED;
extern NSString *const RCT_FIREBASE_EVENT_REGISTERED;
extern NSString *const RCT_FIREBASE_EVENT_FAILED_TO_REGISTER;
extern NSString *const RCT_FIREBASE_EVENT_REMOTE_NOTIFICATION;
extern NSString *const RCT_FIREBASE_EVENT_DATA_VALUE_CHANGED;
extern NSString *const RCT_FIREBASE_EVENT_DATA_CHILD_CHANGED;

extern NSString *const RCT_FIREBASE_ERROR_UNABLE_TO_REQUEST_PERMISSION;
extern NSString *const RCT_FIREBASE_ERROR_UNKNOWN;

extern NSString *const FIREBASE_EMIT_TO_JS;

+ (void)didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings;
+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification;

@end
