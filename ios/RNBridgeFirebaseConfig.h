#import <Foundation/Foundation.h>

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTUtils.h"

@interface RNBridgeFirebaseConfig : NSObject

- (void)getString:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)getNumber:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)getBoolean:(NSString*)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;

@end
