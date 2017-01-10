#import "RNBridgeFirebaseConfig.h"

#import "Firebase.h"
#import "RNBridgeFirebase.h"

@implementation RNBridgeFirebaseConfig
{
    FIRRemoteConfig *remoteConfig;
}

- (id)init
{
    remoteConfig = [FIRRemoteConfig remoteConfig];
    
    #ifdef DEBUG
        FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:YES];
        remoteConfig.configSettings = remoteConfigSettings;
    #endif
    
    [self fetchConfig];
    
    return self;
}

- (void)fetchConfig
{
    long expirationDuration = 3600;
    if (remoteConfig.configSettings.isDeveloperModeEnabled) {
        expirationDuration = 0;
    }
    
    [remoteConfig fetchWithExpirationDuration:expirationDuration completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *error) {
        if (status == FIRRemoteConfigFetchStatusSuccess) {
            NSLog(@"Config fetched!");
            [remoteConfig activateFetched];
        } else {
            NSLog(@"Config not fetched");
            NSLog(@"Error %@", error.localizedDescription);
        }
    }];
}

- (void)getString:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject
{
    FIRRemoteConfigValue *config = [remoteConfig configValueForKey: name];

    resolve(@{
              @"value": config.stringValue,
              @"source": [NSNumber numberWithInt:config.source]
              });
}

- (void)getNumber:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject
{
    FIRRemoteConfigValue *config = [remoteConfig configValueForKey: name];

    resolve(@{
              @"value": config.numberValue,
              @"source": [NSNumber numberWithInteger:config.source]
              });
}

- (void)getBoolean:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject
{
    FIRRemoteConfigValue *config = [remoteConfig configValueForKey: name];
    
    resolve(@{
              @"value": [NSNumber numberWithBool:remoteConfig[name].boolValue],
              @"source": [NSNumber numberWithInteger:config.source]
              });
}

@end
