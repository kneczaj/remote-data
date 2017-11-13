import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {isNull, isNullOrUndefined} from 'util';
import 'rxjs/add/operator/map';

/**
 * An abstract class for objects exchanged with a REST backend
 *
 * @param BackendPayload - payload format exchanged with the backend
 */
export abstract class RestItem<BackendPayload> {

  private _id: number = null;

  /**
   * The values are to assign by the class factory
   */
  constructor(
    public resourceUrl: string,
    public http: Http,
    public requestOptions: RequestOptions
  ) {}

  get id() {
    return this._id;
  }

  set id(value: number) {
    if (isNull(this._id)) {
      this._id = value;
    } else {
      throw `Error: cannot set the id for an object with id ${this._id}`;
    }
  }

  /**
   * Serializes object to backend data format
   * @returns {BackendPayload}
   */
  abstract dump(): BackendPayload;

  /**
   * Create object from backend data.
   *
   * NOTE: should set the id.
   * @param {number} id
   * @param {BackendPayload} data
   */
  abstract load(id: number, data: BackendPayload);

  /**
   * Makes DELETE request to delete the object from the DB, as the object gets deleted the ID is set to null
   * @returns {Observable<RestItem>}
   */
  public delete(): Observable< RestItem<BackendPayload> > {
    return this.http.delete(`${this.resourceUrl}/${this.id}`, this.requestOptions).map(request => {
      // TODO: this will work if any subscribe is done, find a way to make it independent
      this._id = null;
      return this;
    });
  }

  /**
   * Saves the item in backend's DB using according request.
   * @returns {Observable<RestItem<BackendPayload>>}
   */
  public save(): Observable< RestItem<BackendPayload> > {
    if (isNull(this._id)) {
      return this.create();
    }
    return this.update();
  }

  /**
   * Makes POST request to save the object to the DB and assign an ID.
   * @returns {Observable<RestItem>}
   */
  protected create(): Observable< RestItem<BackendPayload> > {
    return this.http.post(this.resourceUrl, this.dump(), this.requestOptions).map(request => {
      this.id = request.json().id;
      return this;
    });
  }

  /**
   * Makes PUT request to update the object in the DB.
   * @returns {Observable<RestItem>}
   */
  protected update(): Observable< RestItem<BackendPayload> > {
    return this.http.put(
      `${this.resourceUrl}/${this.id}`,
      this.dump(),
      this.requestOptions
    ).map(() => {
      return this;
    });
  }
}

/**
 * A class to communicate with rest interface
 *
 * This class acts as a factory for RestItems which may be save/deleted with affect to backend's DB content. Usually it
 * should be extended by a child class to specify the resource URL and the class of the objects which will be created by
 * the service.
 */
export class RestService<T extends RestItem<any> > {
  /**
   * Constructor
   * @param {Http} http
   * @param {RequestOptions} requestOptions
   * @param {string} resourceUrl
   * @param {any} ResourceClass - the same class as the generic T
   */
  constructor(
    private http: Http,
    private requestOptions: RequestOptions,
    private resourceUrl: string,
    private ResourceClass: any
  ) {
  }

  /**
   * Get all items from the resource
   * @returns {Observable<Array<T extends RestItem<any>>>}
   */
  getAll(): Observable<Array<T>> {
    return this.http.get(this.resourceUrl).map(response => {
      const data = response.json();
      return data.map(itemData => {
        if (isNullOrUndefined(itemData.id)) {
          throw `Id is not defined when getAll from ${this.resourceUrl} triggered`;
        }
        const id = Number(itemData.id);
        delete itemData.id;
        return this.create(id, itemData);
      });
    });
  }

  /**
   * Get one item with specified id
   * @param {number} id
   * @returns {Observable<T extends RestItem<any>>}
   */
  get(id: number): Observable<T> {
    return this.http.get(`${this.resourceUrl}/${id}`).map(response => this.create(id, response.json()));
  }

  /**
   * Create a new item which is not taken from REST backend
   * @returns {T}
   */
  createNew(): T {
    return new this.ResourceClass(
      this.resourceUrl,
      this.http,
      this.requestOptions
    );
  }

  /**
   * Create a item loaded from REST backend
   * @param {number} id
   * @param {{}} data - data payload
   * @returns {T}
   */
  private create(id: number, data: {}): T {
    const result = this.createNew();
    result.load(id, data);
    return result;
  }
}
