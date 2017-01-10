import _ from 'lodash';
import faker from 'faker';
import RNBridgeFirebase from '../RNBridgeFirebase';
import Database, { valueHandler, childHandler } from '../Database';

jest.useFakeTimers();

const { EventEmitter } = RNBridgeFirebase;

const {
  addDataChild,
  setDataValue,
  getDataValue,
  removeDataValue,
  addDataValueListener,
  removeDataValueListener,
  addDataChildListener,
  removeDataChildListener,
  ERROR,
  EVENT,
  DATA_CHILD,
} = RNBridgeFirebase;

describe('Crash Library', () => {
  it('constructor', () => {
    expect(Database.ERROR).toBe(ERROR);
    expect(Database.EVENT).toBe(EVENT);
    expect(Database.DATA_CHILD).toBe(DATA_CHILD);
  });

  it('addChild', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const key = faker.lorem.word();

    addDataChild.mockClear();
    addDataChild.mockImplementation(() => new Promise((resolve) => resolve(key)));

    const reply = await new Database(path).addChild();
    expect(reply.getKey()).toBe(key);
    expect(reply.path).toBe(`${path}/${key}`);
    expect(addDataChild.mock.calls.length).toBe(1);
  });

  it('setValue', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const value = faker.helpers.userCard();

    setDataValue.mockClear();
    setDataValue.mockImplementation(() => new Promise((resolve) => resolve()));

    await new Database(path).setValue(value);
    expect(setDataValue.mock.calls.length).toBe(1);
    expect(setDataValue).lastCalledWith(path, { value });
  });

  it('getValue', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const value = faker.lorem.word();
    const child = faker.lorem.word();

    getDataValue.mockClear();
    getDataValue.mockImplementation(() => new Promise((resolve) => resolve({ value })));

    const reply1 = await new Database(path).getValue();
    expect(reply1).toBe(value);
    expect(getDataValue.mock.calls.length).toBe(1);
    expect(getDataValue).lastCalledWith(path);
    const reply2 = await new Database(path).getValue(child);
    expect(reply2).toBe(value);
    expect(getDataValue.mock.calls.length).toBe(2);
    expect(getDataValue).lastCalledWith(`${path}/${child}`);
  });

  it('removeValue', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;

    removeDataValue.mockClear();
    removeDataValue.mockImplementation(() => new Promise((resolve) => resolve()));

    await new Database(path).removeValue();
    expect(removeDataValue.mock.calls.length).toBe(1);
    expect(removeDataValue).lastCalledWith(path);
  });

  it('child', () => {
    const rootPath = faker.lorem.word();
    const childPath = faker.lorem.word();
    const root = new Database(rootPath);
    const child = root.child(childPath);

    expect(root.path).toBe(`/${rootPath}`);
    expect(child.path).toBe(`/${rootPath}/${childPath}`);
  });

  it('valueListener', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const otherPath = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const value = faker.lorem.word();
    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const handlerC = jest.fn();
    const valueChanged = { path, snapshot: { value } };
    const otherValueChanged = { path: otherPath, snapshot: { value } };

    valueHandler.removeAllListeners();
    addDataValueListener.mockClear();
    removeDataValueListener.mockClear();
    addDataValueListener.mockImplementation(() => new Promise((resolve) => resolve(true)));

    await new Database(path).addValueListener(handlerA);
    await new Database(path).addValueListener(handlerB);
    expect(addDataValueListener.mock.calls.length).toBe(1);
    expect(addDataValueListener).lastCalledWith(path);
    await new Database(otherPath).addValueListener(handlerC);
    expect(addDataValueListener.mock.calls.length).toBe(2);
    expect(addDataValueListener).lastCalledWith(otherPath);

    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, valueChanged);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(1);
    expect(handlerC.mock.calls.length).toBe(0);
    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, otherValueChanged);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(1);
    expect(handlerC.mock.calls.length).toBe(1);

    await new Database(path).removeValueListener(handlerA);
    expect(removeDataValueListener.mock.calls.length).toBe(0);

    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, valueChanged);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(2);
    expect(handlerC.mock.calls.length).toBe(1);

    await new Database(path).removeValueListener(handlerB);
    expect(removeDataValueListener.mock.calls.length).toBe(1);
    expect(removeDataValueListener).lastCalledWith(path);

    await new Database(otherPath).removeValueListener(handlerC);
    expect(removeDataValueListener.mock.calls.length).toBe(2);
    expect(removeDataValueListener).lastCalledWith(otherPath);

    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, valueChanged);
    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, otherValueChanged);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(2);
    expect(handlerC.mock.calls.length).toBe(1);

    await new Database(path).addValueListener(handlerA);
    expect(addDataValueListener.mock.calls.length).toBe(3);
    expect(addDataValueListener).lastCalledWith(path);
    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, valueChanged);
    expect(handlerA.mock.calls.length).toBe(2);
    await new Database(path).removeValueListener();
    EventEmitter.emit(EVENT.DATA_VALUE_CHANGED, valueChanged);
    expect(handlerA.mock.calls.length).toBe(2);
  });

  it('childListener', async () => {
    const path = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const type = faker.random.arrayElement(_.keys(DATA_CHILD));
    const otherPath = `/${faker.lorem.word()}/${faker.lorem.word()}`;
    const otherType = faker.random.arrayElement(_.pull(_.keys(DATA_CHILD), type));
    const key = faker.lorem.word();
    const value = faker.lorem.word();
    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const handlerC = jest.fn();
    const childChangedA = { path, type: DATA_CHILD[type], key, value };
    const childChangedB = { path, type: DATA_CHILD[otherType], key, value };
    const childChangedC = { path: otherPath, type: DATA_CHILD[otherType], key, value };

    childHandler.removeAllListeners();
    addDataChildListener.mockClear();
    removeDataChildListener.mockClear();
    addDataChildListener.mockImplementation(() => new Promise((resolve) => resolve(true)));

    await new Database(path).addChildListener(DATA_CHILD[type], handlerA);
    await new Database(path).addChildListener(DATA_CHILD[otherType], handlerB);
    expect(addDataChildListener.mock.calls.length).toBe(1);
    expect(addDataChildListener).lastCalledWith(path);
    await new Database(otherPath).addChildListener(DATA_CHILD[otherType], handlerC);
    expect(addDataChildListener.mock.calls.length).toBe(2);
    expect(addDataChildListener).lastCalledWith(otherPath);

    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedA);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(0);
    expect(handlerC.mock.calls.length).toBe(0);
    expect(handlerA).lastCalledWith({ key, value });
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedB);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(1);
    expect(handlerC.mock.calls.length).toBe(0);
    expect(handlerB).lastCalledWith({ key, value });
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedC);
    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(1);
    expect(handlerC.mock.calls.length).toBe(1);
    expect(handlerC).lastCalledWith({ key, value });

    await new Database(path).removeChildListener(DATA_CHILD[type], handlerA);
    expect(removeDataChildListener.mock.calls.length).toBe(0);
    await new Database(path).removeChildListener(DATA_CHILD[otherType], handlerB);
    expect(removeDataChildListener.mock.calls.length).toBe(1);
    expect(removeDataChildListener).lastCalledWith(path);
    await new Database(otherPath).removeChildListener(DATA_CHILD[otherType], handlerC);
    expect(removeDataChildListener.mock.calls.length).toBe(2);
    expect(removeDataChildListener).lastCalledWith(otherPath);

    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedA);
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedB);
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedC);

    expect(handlerA.mock.calls.length).toBe(1);
    expect(handlerB.mock.calls.length).toBe(1);
    expect(handlerC.mock.calls.length).toBe(1);

    await new Database(path).addChildListener(DATA_CHILD[type], handlerA);
    expect(addDataChildListener.mock.calls.length).toBe(3);
    expect(addDataChildListener).lastCalledWith(path);
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedA);
    expect(handlerA.mock.calls.length).toBe(2);
    await new Database(path).removeChildListener(DATA_CHILD[type]);
    EventEmitter.emit(EVENT.DATA_CHILD_CHANGED, childChangedA);
    expect(handlerA.mock.calls.length).toBe(2);
  });
});
