/**
 * @providesModule react-native-bridge-firebase/Crash
 */
import RNBridgeFirebase from './RNBridgeFirebase';

export default class Crash {

  static EVENT = RNBridgeFirebase.EVENT;

  static ERROR = RNBridgeFirebase.ERROR;

  static report(message) {
    RNBridgeFirebase.reportCrash(message);
  }
}
