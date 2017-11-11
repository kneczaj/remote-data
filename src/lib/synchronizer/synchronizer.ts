import {RemoteData} from '../remote-data/remote-data';
import {isNull} from 'util';

/**
 * A class to synchronize RemoteData
 */
export class Synchronizer<T> {

  private _id: number = null;

  /**
   * Constructor.
   * Run start to start synchronization.
   * @param {RemoteData<T>} data - the data to synchronize
   * @param {number} timeout - delay between update queries
   */
  constructor(private data: RemoteData<T>, private timeout: number) {}

  /**
   * Start synchronization
   */
  start() {
    this._id = setInterval(this.data.update(), this.timeout);
  }

  /**
   * Stop synchronization
   */
  stop() {
    clearInterval(this._id);
    this._id = null;
  }

  /**
   * Is the object in synch
   * @returns {boolean}
   */
  isInSynch() {
    return !isNull(this._id);
  }
}
