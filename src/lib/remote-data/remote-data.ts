import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

/**
 * A class to represent a remote resource which value can be updated by fetching the recent state from an Observable on
 * demand.
 */
export class RemoteData<T> {

  private _subject: Subject<T> = new Subject<T>();
  private _value = undefined;

  /**
   * Constructor
   * @param {() => Observable<T>} updateFunction - a function to update the value
   */
  constructor(
    private updateFunction: () => Observable<T>
  ) {
  }

  /**
   * An observable to track the updates
   * @returns {Observable<T>}
   */
  get observable(): Observable<T> {
    return this._subject.asObservable();
  }

  /**
   * The current value
   * @returns {T}
   */
  get value(): T {
    return this._value;
  }

  /**
   * A function to trigger async update
   * @returns {Observable<T>}
   */
  update(): Observable<T> {
    const observable = this.updateFunction();
    observable.subscribe((data: T) => {
      this._value = data;
      this._subject.next(data);
    });
    return observable;
  }
}
