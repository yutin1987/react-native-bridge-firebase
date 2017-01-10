#import "RNBridgeFirebaseMessage.h"

#import "Firebase.h"
#import "RNBridgeFirebase.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone  UIRemoteNotificationTypeNone
#define UIUserNotificationType      UIRemoteNotificationType

#endif

@implementation RNBridgeFirebaseMessage
{
    RCTPromiseResolveBlock _requestPermissionsResolveBlock;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}


- (id)init
{
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegisterUserNotificationSettings:)
                                                 name:RCT_FIREBASE_EVENT_REGISTER_SETTINGS
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleDeviceRegistered:)
                                                 name:RCT_FIREBASE_EVENT_DEVICE_REGISTERED
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegistered:)
                                                 name:kFIRInstanceIDTokenRefreshNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleFailToRemoteRegistered:)
                                                 name:RCT_FIREBASE_EVENT_FAILED_TO_REGISTER
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRemoteNotificationReceived:)
                                                 name:RCT_FIREBASE_EVENT_REMOTE_NOTIFICATION
                                               object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleConnectMessage)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleDisconnectMessage)
                                                 name:UIApplicationDidEnterBackgroundNotification
                                               object:nil];

    return self;
}

- (void)handleRegisterUserNotificationSettings:(NSNotification *)notification
{
    if (_requestPermissionsResolveBlock == nil) {
        return;
    }

    UIUserNotificationSettings *notificationSettings = notification.userInfo[@"notificationSettings"];
    NSDictionary *notificationTypes = @{
                                        @"alert": @((notificationSettings.types & UIUserNotificationTypeAlert) > 0),
                                        @"sound": @((notificationSettings.types & UIUserNotificationTypeSound) > 0),
                                        @"badge": @((notificationSettings.types & UIUserNotificationTypeBadge) > 0),
                                        };

    _requestPermissionsResolveBlock(notificationTypes);
    _requestPermissionsResolveBlock = nil;
}

- (void)handleDeviceRegistered:(NSNotification *)notification
{
    NSString *token = [notification.userInfo valueForKey:@"token"];

    [[FIRInstanceID instanceID] setAPNSToken:token type:FIRInstanceIDAPNSTokenTypeUnknown];

    NSString *deviceToken = [[token description]
                             stringByTrimmingCharactersInSet: [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
    deviceToken = [deviceToken stringByReplacingOccurrencesOfString:@" " withString:@""];

    [[NSNotificationCenter defaultCenter] postNotificationName:FIREBASE_EMIT_TO_JS
                                                        object:self
                                                      userInfo:@{
                                                                 @"name": RCT_FIREBASE_EVENT_DEVICE_REGISTERED,
                                                                 @"body": @{@"deviceToken" : deviceToken}
                                                                 }];
}

- (void)handleRegistered:(NSNotification *)notification
{
    NSString *firebaseToken = [[FIRInstanceID instanceID] token];

    [[NSNotificationCenter defaultCenter] postNotificationName:FIREBASE_EMIT_TO_JS
                                                        object:self
                                                      userInfo:@{
                                                                 @"name": RCT_FIREBASE_EVENT_REGISTERED,
                                                                 @"body": @{@"firebaseToken" : firebaseToken}
                                                                 }];
}

- (void)handleFailToRemoteRegistered:(NSNotification *)notification
{
    [[NSNotificationCenter defaultCenter] postNotificationName:FIREBASE_EMIT_TO_JS
                                                        object:self
                                                      userInfo:@{
                                                                 @"name": RCT_FIREBASE_EVENT_FAILED_TO_REGISTER,
                                                                 @"body": notification.userInfo
                                                                 }];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification
{
    [[NSNotificationCenter defaultCenter] postNotificationName:FIREBASE_EMIT_TO_JS
                                                        object:self
                                                      userInfo:@{
                                                                 @"name": RCT_FIREBASE_EVENT_REMOTE_NOTIFICATION,
                                                                 @"body": notification.userInfo
                                                                 }];
}

- (void)handleConnectMessage
{
    [[FIRMessaging messaging] connectWithCompletion:^(NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Unable to connect to FCM. %@", error);
        } else {
            NSLog(@"Connected to FCM.");
        }
    }];
}

- (void)handleDisconnectMessage
{
    [[FIRMessaging messaging] disconnect];
    NSLog(@"Disconnected from FCM");
}

- (void)registerDevice:(NSDictionary *)permissions
              resolver:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject
{
    if (RCTRunningInAppExtension()) {
        reject(RCT_FIREBASE_ERROR_UNABLE_TO_REQUEST_PERMISSION, nil, RCTErrorWithMessage(@"Requesting push notifications is currently unavailable in an app extension"));
        return;
    }

    if (_requestPermissionsResolveBlock != nil) {
        RCTLogError(@"Cannot call requestPermissions twice before the first has returned.");
        return;
    }

    _requestPermissionsResolveBlock = resolve;

    UIUserNotificationType types = UIUserNotificationTypeNone;
    if (permissions) {
        if ([RCTConvert BOOL:permissions[@"alert"]]) {
            types |= UIUserNotificationTypeAlert;
        }
        if ([RCTConvert BOOL:permissions[@"badge"]]) {
            types |= UIUserNotificationTypeBadge;
        }
        if ([RCTConvert BOOL:permissions[@"sound"]]) {
            types |= UIUserNotificationTypeSound;
        }
    } else {
        types = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
    }

    UIApplication *app = RCTSharedApplication();
    if ([app respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        UIUserNotificationSettings *notificationSettings =
        [UIUserNotificationSettings settingsForTypes:(NSUInteger)types categories:nil];
        [app registerUserNotificationSettings:notificationSettings];
    } else {
        [app registerForRemoteNotificationTypes:(NSUInteger)types];
    }
}


- (void)subscribeToTopic: (NSString*) topic
{
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

- (void)unsubscribeFromTopic: (NSString*) topic
{
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
}

@end
