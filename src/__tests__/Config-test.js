import _ from 'lodash';
import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Config from '../Config';

jest.useFakeTimers();

const {
  getStringConfig,
  getNumberConfig,
  getBooleanConfig,
  CONFIG_SOURCE,
} = RNBridgeFirebase;

describe('Config Library', () => {
  it('constructor', () => {
    expect(Config.ERROR).toBe(RNBridgeFirebase.ERROR);
    expect(Config.EVENT).toBe(RNBridgeFirebase.EVENT);
  });

  it('getString', async () => {
    const key = faker.lorem.word();
    const value = faker.lorem.word();

    getStringConfig.mockClear();
    getStringConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value, source: CONFIG_SOURCE.REMOTE,
      }))
    ));

    const reply = await Config.getString(key);
    expect(reply).toBe(value);
    expect(getStringConfig).lastCalledWith(key);
  });

  it('getString from default value', async () => {
    const key = faker.lorem.word();
    const value = faker.lorem.word();

    getStringConfig.mockClear();
    getStringConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.lorem.word(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));

    const reply = await Config.getString(key, value);
    expect(reply).toBe(value);
  });

  it('getNumber', async () => {
    const key = faker.lorem.word();
    const value = faker.random.number();

    getNumberConfig.mockClear();
    getNumberConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value, source: CONFIG_SOURCE.REMOTE,
      }))
    ));

    const reply = await Config.getNumber(key);
    expect(reply).toBe(value);
    expect(getNumberConfig).lastCalledWith(key);
  });

  it('getNumber from default value', async () => {
    const key = faker.lorem.word();
    const value = faker.random.number();

    getNumberConfig.mockClear();
    getNumberConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.random.number(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));

    const reply = await Config.getString(key, value);
    expect(reply).toBe(value);
  });

  it('getBoolean', async () => {
    const key = faker.lorem.word();
    const value = faker.random.boolean();

    getBooleanConfig.mockClear();
    getBooleanConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value, source: CONFIG_SOURCE.REMOTE,
      }))
    ));

    const reply = await Config.getBoolean(key);
    expect(reply).toBe(value);
    expect(getBooleanConfig).lastCalledWith(key);
  });

  it('getBoolean from default value', async () => {
    const key = faker.lorem.word();
    const value = faker.random.boolean();

    getBooleanConfig.mockClear();
    getBooleanConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.random.number(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));

    const reply = await Config.getBoolean(key, value);
    expect(reply).toBe(value);
  });

  it('setDefault', async () => {
    const keys = _.union(faker.lorem.words(10).split(' '));
    const sKey = keys[0];
    const sValue = faker.lorem.word();
    const nKey = keys[1];
    const nValue = faker.random.number();
    const bKey = keys[2];
    const bValue = faker.random.boolean();

    getStringConfig.mockClear();
    getStringConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.lorem.word(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));
    getNumberConfig.mockClear();
    getNumberConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.random.number(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));
    getBooleanConfig.mockClear();
    getBooleanConfig.mockImplementation(() => (
      new Promise((resolve) => resolve({
        value: faker.random.boolean(),
        source: CONFIG_SOURCE.STATIC,
      }))
    ));

    expect(await Config.getString(sKey)).toBe('');
    expect(await Config.getNumber(nKey)).toBe(0);
    expect(await Config.getBoolean(bKey)).toBe(false);

    const defObj = {};
    defObj[sKey] = sValue;
    defObj[nKey] = nValue;
    defObj[bKey] = bValue;
    Config.setDefault(defObj);

    expect(await Config.getString(sKey)).toBe(sValue);
    expect(await Config.getNumber(nKey)).toBe(nValue);
    expect(await Config.getBoolean(bKey)).toBe(bValue);
  });
});
