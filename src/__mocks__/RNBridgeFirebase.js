import EventEmitter from 'EventEmitter';
import faker from 'faker';

const RNBridgeFirebase = jest.genMockFromModule('../RNBridgeFirebase');

RNBridgeFirebase.EVENT = {
  DEVICE_REGISTERED: 'RCT_EVENT_DEVICE_REGISTERED',
  REGISTERED: 'RCT_EVENT_REGISTERED',
  FAILED_TO_REGISTER: 'RCT_EVENT_FAILED_TO_REGISTER',
  REMOTE_NOTIFICATION: 'RCT_EVENT_REMOTE_NOTIFICATION',
  DATA_VALUE_CHANGED: 'RCT_EVENT_DATA_VALUE_CHANGED',
  DATA_CHILD_CHANGED: 'RCT_EVENT_DATA_CHILD_CHANGED',
};

RNBridgeFirebase.ERROR = {
  UNKNOWN: 'RCT_ERROR_UNKNOWN',
};

// Analytics
RNBridgeFirebase.setUserId = jest.fn();
RNBridgeFirebase.setUserProperty = jest.fn();
RNBridgeFirebase.logEvent = jest.fn();
RNBridgeFirebase.setEnabled = jest.fn();
RNBridgeFirebase.reportCrash = jest.fn();

// Message
RNBridgeFirebase.EventEmitter = new EventEmitter();
RNBridgeFirebase.registerDevice = jest.fn();
RNBridgeFirebase.subscribeToTopic = jest.fn();
RNBridgeFirebase.unsubscribeFromTopic = jest.fn();

RNBridgeFirebase.deviceToken = '';
RNBridgeFirebase.firebaseToken = faker.random.uuid();
RNBridgeFirebase.appVersion = faker.name.findName();
RNBridgeFirebase.deviceModel = faker.random.word();
RNBridgeFirebase.deviceName = faker.random.word();
RNBridgeFirebase.deviceUid = faker.random.uuid();

// Storage
RNBridgeFirebase.uploadJPG = jest.fn();

// Config
RNBridgeFirebase.getStringConfig = jest.fn();
RNBridgeFirebase.getNumberConfig = jest.fn();
RNBridgeFirebase.getBooleanConfig = jest.fn();

RNBridgeFirebase.CONFIG_SOURCE = { DEFAULT: 1, STATIC: 2, REMOTE: 0 };

// Database
RNBridgeFirebase.addDataChild = jest.fn();
RNBridgeFirebase.setDataValue = jest.fn();
RNBridgeFirebase.getDataValue = jest.fn();
RNBridgeFirebase.removeDataValue = jest.fn();
RNBridgeFirebase.addDataValueListener = jest.fn();
RNBridgeFirebase.removeDataValueListener = jest.fn();
RNBridgeFirebase.addDataChildListener = jest.fn();
RNBridgeFirebase.removeDataChildListener = jest.fn();
RNBridgeFirebase.DATA_CHILD = {
  ADDED: 0, REMOVED: 1, CHANGED: 2, MOVED: 3,
};

export default RNBridgeFirebase;
