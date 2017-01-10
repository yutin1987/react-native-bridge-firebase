import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Storage from '../Storage';

describe('Storage Library', () => {
  it('constructor', () => {
    expect(Storage.ERROR).toBe(RNBridgeFirebase.ERROR);
    expect(Storage.EVENT).toBe(RNBridgeFirebase.EVENT);
  });

  it('uploadJPG', () => {
    const path = `${faker.lorem.word()}/${faker.lorem.word()}.jpg`;
    const base64 = new Buffer(faker.lorem.text()).toString('base64');

    RNBridgeFirebase.uploadJPG.mockClear();
    Storage.uploadJPG(path, base64);
    expect(RNBridgeFirebase.uploadJPG).lastCalledWith({ path, base64 });
  });
});
