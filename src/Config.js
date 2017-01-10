/**
 * @providesModule react-native-bridge-firebase/Config
 */
import RNBridgeFirebase from './RNBridgeFirebase';

const { CONFIG_SOURCE } = RNBridgeFirebase;

export default class Config {

  static EVENT = RNBridgeFirebase.EVENT;

  static ERROR = RNBridgeFirebase.ERROR;

  static def = {}

  static setDefault(data: Object = {}) {
    Config.def = data;
  }

  static async getString(name: String, def: String = '') {
    const config = await RNBridgeFirebase.getStringConfig(name);

    if (config.source === CONFIG_SOURCE.REMOTE) return config.value;
    return def || Config.def[name] || '';
  }

  static async getNumber(name: String, def: Number = 0) {
    const config = await RNBridgeFirebase.getNumberConfig(name);

    if (config.source === CONFIG_SOURCE.REMOTE) return config.value;
    return def || Config.def[name] || 0;
  }

  static async getBoolean(name: String, def: Boolean = false) {
    const config = await RNBridgeFirebase.getBooleanConfig(name);

    if (config.source === CONFIG_SOURCE.REMOTE) return config.value;
    return def || Config.def[name] || false;
  }
}
