import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Message, { eventHandler } from '../Message';
import EventTypeError from '../error/EventTypeError';

jest.useFakeTimers();

const { EventEmitter } = RNBridgeFirebase;
const { triggerEventRegistered } = Message;
const { EVENT } = Message;

describe('Message Library', () => {
  it('constructor', () => {
    const title = faker.lorem.word();
    const body = faker.lorem.paragraph();
    const firebaseMessage = new Message({ title, body });
    expect(firebaseMessage.title).toBe(title);
    expect(firebaseMessage.body).toBe(body);
  });

  it('registerDevice', () => {
    RNBridgeFirebase.registerDevice.mockClear();
    Message.registerDevice();
    expect(RNBridgeFirebase.registerDevice).toBeCalled();
  });

  it('addEventListener for REMOTE_NOTIFICATION', () => {
    const handler = jest.fn();
    const title = faker.lorem.word();
    const body = faker.lorem.paragraph();
    const messageId = [faker.random.number(), faker.random.number()];

    Message.addEventListener(EVENT.REMOTE_NOTIFICATION, handler);

    EventEmitter.emit(EVENT.REMOTE_NOTIFICATION, {
      'gcm.message_id': messageId[0], aps: { alert: { title, body } },
    });
    EventEmitter.emit(EVENT.REMOTE_NOTIFICATION, {
      'gcm.message_id': messageId[0], aps: { alert: { title, body } },
    });
    expect(handler).lastCalledWith({ messageId: messageId[0], title, body });

    EventEmitter.emit(EVENT.REMOTE_NOTIFICATION, {
      'google.message_id': messageId[1], notification: { title, body },
    });
    EventEmitter.emit(EVENT.REMOTE_NOTIFICATION, {
      'google.message_id': messageId[1], notification: { title, body },
    });
    expect(handler).lastCalledWith({ messageId: messageId[1], title, body });

    expect(handler.mock.calls.length).toBe(2);
    expect(handler.mock.calls[0][0] instanceof Message).toBe(true);
    expect(handler.mock.calls[1][0] instanceof Message).toBe(true);
  });

  it('addEventListener for REGISTERED', () => {
    const deviceTokenHandler = jest.fn();
    const deviceToken = faker.random.uuid();
    const firebaseTokenHandler = jest.fn();
    const firebaseToken = faker.random.uuid();
    setTimeout.mockClear();

    expect(Message.deviceInfo.deviceToken).toBe(RNBridgeFirebase.deviceToken);
    expect(Message.deviceInfo.firebaseToken).toBe(RNBridgeFirebase.firebaseToken);
    expect(Message.deviceInfo.appVersion).toBe(RNBridgeFirebase.appVersion);
    expect(Message.deviceInfo.deviceModel).toBe(RNBridgeFirebase.deviceModel);
    expect(Message.deviceInfo.deviceName).toBe(RNBridgeFirebase.deviceName);
    expect(Message.deviceInfo.deviceUid).toBe(RNBridgeFirebase.deviceUid);

    Message.addEventListener(EVENT.REGISTERED, deviceTokenHandler);
    EventEmitter.emit(EVENT.DEVICE_REGISTERED, { deviceToken });

    expect(setTimeout.mock.calls[0][1]).toBe(3000);

    expect(deviceTokenHandler).not.toBeCalled();
    triggerEventRegistered.flush();
    expect(deviceTokenHandler).toBeCalled();

    expect(deviceTokenHandler).lastCalledWith(Message.deviceInfo);
    expect(Message.deviceInfo.deviceToken).toBe(deviceToken);
    expect(RNBridgeFirebase.subscribeToTopic).not.toBeCalled();

    Message.addEventListener(EVENT.REGISTERED, firebaseTokenHandler);
    EventEmitter.emit(EVENT.REGISTERED, { firebaseToken });

    expect(setTimeout.mock.calls[1][1]).toBe(3000);

    expect(firebaseTokenHandler).not.toBeCalled();
    triggerEventRegistered.flush();
    expect(firebaseTokenHandler).toBeCalled();

    expect(firebaseTokenHandler).lastCalledWith(Message.deviceInfo);
    expect(Message.deviceInfo.firebaseToken).toBe(firebaseToken);
    expect(RNBridgeFirebase.subscribeToTopic).lastCalledWith('/topics/all');
  });

  it('addEventListener error type', () => {
    const handler = jest.fn();
    const type = faker.lorem.word();

    eventHandler.removeAllListeners();
    let error;
    try {
      Message.addEventListener(type, handler);
    } catch (e) {
      error = e;
    } finally {
      expect(error instanceof EventTypeError).toBe(true);
      expect(eventHandler.listeners(type).length).toBe(0);
    }
  });

  it('removeEventListener when has listener', () => {
    const handler = () => {};

    eventHandler.removeAllListeners();
    Message.addEventListener(EVENT.REGISTERED, handler);
    expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(1);
    Message.removeEventListener(EVENT.REGISTERED, handler);
    expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(0);
  });

  it('removeEventListener when no listener', () => {
    const handler = () => {};

    eventHandler.removeAllListeners();
    Message.addEventListener(EVENT.REGISTERED, handler);
    expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(1);
    Message.removeEventListener(EVENT.REMOTE_NOTIFICATION, handler);
    expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(1);
    Message.removeEventListener(EVENT.REGISTERED, () => {});
    expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(1);
  });

  it('removeEventListener error type', () => {
    const handler = () => {};

    eventHandler.removeAllListeners();
    Message.addEventListener(EVENT.REGISTERED, handler);

    let error;
    const type = faker.lorem.word();
    try {
      Message.removeEventListener(type, handler);
    } catch (e) {
      error = e;
    } finally {
      expect(error instanceof EventTypeError).toBe(true);
      expect(eventHandler.listeners(EVENT.REGISTERED).length).toBe(1);
    }
  });

  it('subscribeToTopic', () => {
    const topic = `/topics/${faker.lorem.word()}`;

    RNBridgeFirebase.subscribeToTopic.mockClear();
    expect(RNBridgeFirebase.subscribeToTopic).not.toBeCalled();

    Message.subscribeToTopic(topic);
    expect(RNBridgeFirebase.subscribeToTopic).toBeCalled();
  });

  it('unsubscribeFromTopic', () => {
    const topic = `/topics/${faker.lorem.word()}`;

    RNBridgeFirebase.unsubscribeFromTopic.mockClear();
    expect(RNBridgeFirebase.unsubscribeFromTopic).not.toBeCalled();

    Message.unsubscribeFromTopic(topic);
    expect(RNBridgeFirebase.unsubscribeFromTopic).toBeCalled();
  });
});
