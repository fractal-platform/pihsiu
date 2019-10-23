import BackgroundConnection from '../core/engine/BackgroundConnection';
import PortConnector from '../core/engine/portConnector';

const bc = new BackgroundConnection(new PortConnector());

export default bc;
