import EventEmitter from 'eventemitter3';
import { mix } from '../../utils';
import BaseService from './BaseService';

export default class StatableEmitter extends mix(BaseService, EventEmitter) {
  constructor(models) {
    super();
    this._initModels(models);
  }
}
