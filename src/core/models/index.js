import EventEmitter from 'eventemitter3';

var fullState = {};

function importAll(r) {
  r.keys().forEach(key => (fullState[r(key).default.namespace] = r(key).default));
}

importAll(require.context('./states/', true, /\.js$/));

class Manager extends EventEmitter {
  constructor() {
    super();
    this.models = fullState;
  }

  initialize(initState) {
    Object.keys(this.models).forEach(namespace => {
      const { state, initialize } = this.models[namespace];
      if (typeof initialize === 'function') {
        this.models[namespace].state = initialize(state, initState[namespace]);
      } else {
        this.models[namespace].state = { ...state, ...initState[namespace] };
      }
    });
    this.emit('update', this.state);
  }

  setState(type, action) {
    const [namespace, reducer] = type.split('/');
    if (!namespace || !reducer) {
      console.error('invalid setState type should be namespace/reducer');
    }
    const model = this.models[namespace];
    if (!model) {
      console.error(`the namespace ${namespace} is not exist.`);
    }
    const func = model.reducers[reducer];
    if (!func) {
      console.error(`the reducer ${reducer} is not exist`);
    }

    const newState = func(model.state, action);
    this.models[namespace].state = newState;
    this.emit(`${namespace}:update`, newState);
    this.emit('update', this.state);
  }

  // subscribe to changes
  subscribe(handler) {
    this.on('update', handler);
  }

  // unsubscribe to changes
  unsubscribe(handler) {
    this.removeListener('update', handler);
  }

  get persist() {
    const p = {};
    Object.keys(this.models).forEach(namespace => {
      const model = this.models[namespace];
      if (typeof model.filter === 'function') {
        p[namespace] = model.filter(model.state);
      } else {
        p[namespace] = { ...model.state };
      }
    });
    return p;
  }

  get state() {
    const copy = {};
    Object.keys(this.models).forEach(ns => {
      copy[ns] = { ...this.models[ns].state };
    });
    return copy;
  }

  set state(val) {
    throw Error('should not modify read only state.');
  }
}

const manager = new Manager();

export default manager;
