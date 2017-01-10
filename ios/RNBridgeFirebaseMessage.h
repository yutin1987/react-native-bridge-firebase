#import <Foundation/Foundation.h>

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTUtils.h"

@interface RNBridgeFirebaseMessage : NSObject

- (void)registerDevice:(NSDictionary *)permissions resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)subscribeToTopic:(NSString*) topic;
- (void)unsubscribeFromTopic:(NSString*) topic;

@end
