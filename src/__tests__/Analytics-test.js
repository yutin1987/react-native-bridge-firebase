import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Analytics from '../Analytics';

describe('Analytics Library', () => {
  it('constructor', () => {
    expect(Analytics.ERROR).toBe(RNBridgeFirebase.ERROR);
    expect(Analytics.EVENT).toBe(RNBridgeFirebase.EVENT);
  });

  it('setUserId', () => {
    const userId = faker.random.number();

    RNBridgeFirebase.setUserId.mockClear();
    Analytics.setUserId(userId);
    expect(RNBridgeFirebase.setUserId).lastCalledWith(userId);
  });

  it('setUserProperty', () => {
    const name = faker.lorem.word();
    const property = faker.lorem.word();

    RNBridgeFirebase.setUserProperty.mockClear();
    Analytics.setUserProperty(name, property);
    expect(RNBridgeFirebase.setUserProperty).lastCalledWith(name, property);
  });

  it('logEvent', () => {
    const name = faker.lorem.word();
    const parameters = faker.helpers.userCard();

    RNBridgeFirebase.logEvent.mockClear();
    Analytics.logEvent(name, parameters);
    expect(RNBridgeFirebase.logEvent).lastCalledWith(name, parameters);
  });

  it('setEnabled', () => {
    const enabled = faker.random.boolean();

    RNBridgeFirebase.setEnabled.mockClear();
    Analytics.setEnabled(enabled);
    expect(RNBridgeFirebase.setEnabled).lastCalledWith(enabled);
  });
});
