/**
 * @providesModule react-native-bridge-firebase/Message
 */
import Events from 'EventEmitter';
import forEach from 'lodash/forEach';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import RNBridgeFirebase from './RNBridgeFirebase';
import EventTypeError from './error/EventTypeError';

const { EventEmitter, EVENT, ERROR } = RNBridgeFirebase;
export const eventHandler = new Events();

export default class Message {

  static EVENT = EVENT;

  static ERROR = ERROR;

  static deviceInfo = {
    deviceToken: RNBridgeFirebase.deviceToken,
    firebaseToken: RNBridgeFirebase.firebaseToken,
    appVersion: RNBridgeFirebase.appVersion,
    deviceModel: RNBridgeFirebase.deviceModel,
    deviceName: RNBridgeFirebase.deviceName,
    deviceUid: RNBridgeFirebase.deviceUid,
  };

  constructor(parame: Object = {}) {
    forEach(parame, (value, key) => (this[key] = value));
  }

  static triggerEventRegistered = debounce(() => {
    eventHandler.emit(EVENT.REGISTERED, Message.deviceInfo);
  }, 3000);

  static async registerDevice() {
    await RNBridgeFirebase.registerDevice({
      alert: true,
      badge: true,
      sound: true,
    });
  }

  static addEventListener(type: String, handler: Function) {
    if (!(
      type === EVENT.REMOTE_NOTIFICATION ||
      type === EVENT.REGISTERED
    )) throw new EventTypeError('Message event only supports `REMOTE_NOTIFICATION` and `REGISTERED` events');

    const listener = eventHandler.addListener(type, handler);

    if (type === EVENT.REGISTERED) Message.triggerEventRegistered();

    return listener;
  }

  static removeEventListener(type: String, handler: Function = () => {}) {
    if (!(
      type === EVENT.REMOTE_NOTIFICATION ||
      type === EVENT.REGISTERED
    )) throw new EventTypeError('Message event only supports `REMOTE_NOTIFICATION` and `REGISTERED` events');

    eventHandler.removeListener(type, handler);
  }

  static subscribeToTopic(topic: String) {
    return RNBridgeFirebase.subscribeToTopic(topic);
  }

  static unsubscribeFromTopic(topic: String) {
    return RNBridgeFirebase.unsubscribeFromTopic(topic);
  }

  static notify(message: Object) {
    RNBridgeFirebase.notify(message);
  }
}

let lastMessageId;
if (EventEmitter) {
  EventEmitter.addListener(EVENT.REMOTE_NOTIFICATION, (data) => {
    const messageId = data['gcm.message_id'] || data['google.message_id'];

    if (lastMessageId === messageId) return;
    lastMessageId = messageId;

    const alert = data.aps && data.aps.alert;
    const notification = data.notification;

    const title = data.title || (alert && alert.title) || (notification && notification.title);
    const body = data.body || (alert && alert.body) || (notification && notification.body);

    const message = omit(data, ['gcm.message_id', 'google.message_id', 'aps', 'notification']);
    eventHandler.emit(
      EVENT.REMOTE_NOTIFICATION,
      new Message({ ...message, messageId, title, body }),
    );
  });

  EventEmitter.addListener(EVENT.DEVICE_REGISTERED, (data) => {
    if (data.deviceToken) {
      Message.deviceInfo.deviceToken = data.deviceToken;
      Message.triggerEventRegistered();
    }
  });

  EventEmitter.addListener(EVENT.REGISTERED, (data) => {
    if (data.firebaseToken) {
      RNBridgeFirebase.subscribeToTopic('/topics/all');
      Message.deviceInfo.firebaseToken = data.firebaseToken;
      Message.triggerEventRegistered();
    }
  });

  EventEmitter.addListener(EVENT.FAILED_TO_REGISTER, (data) => {
    console.log('error', data);
  });
}
