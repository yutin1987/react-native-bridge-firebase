#import "RNBridgeFirebaseAnalytics.h"

#import "Firebase.h"
#import "RNBridgeFirebase.h"

@implementation RNBridgeFirebaseAnalytics

- (void)setUserId:(NSString*)userId
{
    [FIRAnalytics setUserID:userId];
}

- (void)setUserProperty:(NSString*)name property:(NSString*)property
{
    [FIRAnalytics setUserPropertyString:property forName:name];
}

- (void)logEvent:(NSString*)name property:(NSDictionary*)parameters
{
    [FIRAnalytics logEventWithName:name parameters:parameters];
}

- (void)setEnabled:(BOOL)enabled
{
    [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
}

@end
