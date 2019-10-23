import BaseService from './base/BaseService';

export default class PreferencesService extends BaseService {
  constructor(models, ruban) {
    super();
    this._initModels(models);
    this.ruban = ruban;
    this.models.on('network:update', this.getDefaultGasPrice.bind(this));
  }

  setLocale(locale) {
    this.models.setState('preferences/update', { locale });
  }

  async getDefaultGasPrice() {
    const price = await this.ruban.fra.getGasPrice();
    this.models.setState('preferences/update', { defaultGasPrice: price });
    return price;
  }
}
