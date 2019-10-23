import { EventEmitter } from 'eventemitter3';

class BlockTracker extends EventEmitter {
  constructor(props) {
    super();
    this.ruban = props.ruban;
    this.models = props.models;
    this.interval = props.interval || 3 * 1000;
    this.lastBlock = null;

    this._intervalId = setInterval(this._fetch.bind(this), this.interval);
  }

  async fetchImmediately() {
    this.lastBlock = null;
    await this._fetch();
  }

  stop() {
    clearInterval(this._intervalId);
  }

  async _fetch() {
    if (this.models.state.network.chainId === 'loading') {
      return;
    }
    if (this.lastBlock) {
      const block = await this.ruban.fra.getBlockByHeight(this.lastBlock.height + 1);
      if (block) {
        this.lastBlock = block;
        this.emit('latest', block);
      }
    } else {
      const height = await this.ruban.fra.getBlockHeight();
      this.lastBlock = await this.ruban.fra.getBlockByHeight(height);
      this.emit('latest', this.lastBlock);
    }
  }
}

export default BlockTracker;
