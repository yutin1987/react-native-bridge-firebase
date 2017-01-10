import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Crash from '../Crash';

describe('Crash Library', () => {
  it('constructor', () => {
    expect(Crash.ERROR).toBe(RNBridgeFirebase.ERROR);
    expect(Crash.EVENT).toBe(RNBridgeFirebase.EVENT);
  });

  it('report', () => {
    const name = faker.lorem.word();

    RNBridgeFirebase.reportCrash.mockClear();
    Crash.report(name);
    expect(RNBridgeFirebase.reportCrash).lastCalledWith(name);
  });
});
