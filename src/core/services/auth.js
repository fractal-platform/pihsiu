import StatableEmitter from './base/StatableEmitter';

export default class Auth extends StatableEmitter {
  constructor(opts) {
    super(opts.models);
    this.platform = opts.platform;
  }

  addCandidates(siteMeta) {
    this.models.setState('auth/addCandidates', siteMeta);
    this.platform.showpopup('/notify/newsite', `origin=${siteMeta.origin}`);

    return new Promise((resolve, reject) => {
      const handle = auth => {
        if (auth.passes[siteMeta.origin]) {
          resolve();
          this.models.off('auth:update', handle);
        } else if (!auth.candidates[siteMeta.origin]) {
          reject();
          this.models.off('auth:update', handle);
        }
      };
      this.models.on('auth:update', handle);
    });
  }

  passDomain(origin) {
    this.platform.closepopup().then(() => {
      this.models.setState('auth/passDomain', origin);
    });
  }

  rejectDomain(origin) {
    this.platform.closepopup().then(() => {
      this.models.setState('auth/rejectDomain', origin);
    });
  }

  check(origin) {
    const { passes } = this.models.state.auth;
    return !!passes[origin];
  }
}
