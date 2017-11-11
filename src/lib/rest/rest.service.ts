import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {isNull} from 'util';
import 'rxjs/add/operator/map';

/**
 * An abstract class for objects exchanged with a REST backend
 */
export abstract class RestItem {

  private _id: number = null;

  /**
   * The values are to assigned by the class factory
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
   *
   */
  abstract dump(): {};

  /**
   * Create object from backend data.
   *
   * NOTE: should set the id;
   */
  abstract load(data: {});

  /**
   * Makes DELETE request to delete the object from the DB, as the object gets deleted the ID is set to null
   * @returns {Observable<RestItem>}
   */
  public delete(): Observable<RestItem> {
    return this.http.delete(`${this.resourceUrl}/${this.id}`, this.requestOptions).map(request => {
      // TODO: this will work if any subscribe is done, find a way to make it independent
      this._id = null;
      return this;
    });
  }

  public save(): Observable<RestItem> {
    if (!this._id) {
      return this.create();
    }
    return this.update();
  }

  /**
   * Makes POST request to save the object to the DB and assign an ID.
   *
   * @returns {Observable<RestItem>}
   */
  protected create(): Observable<RestItem> {
    return this.http.post(this.resourceUrl, this.dump(), this.requestOptions).map(request => {
      this.id = request.json().id;
      return this;
    });
  }

  /**
   * Makes PUT request to save the object to the DB and assign an ID.
   * @returns {Observable<RestItem>}
   */
  protected update(): Observable<RestItem> {
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
 */
export class RestService<T extends RestItem> {
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

  getAll(): Observable<Array<T>> {
    return this.http.get(this.resourceUrl).map(response => {
      const data = response.json();
      return data.map(this.create.bind(this));
    });
  }

  get(id: number): Observable<T> {
    return this.http.get(`${this.resourceUrl}/${id}`).map(response => this.create(response.json()));
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
   * @returns {T}
   */
  private create(data: {}): T {
    const result = this.createNew();
    result.load(data);
    return result;
  }
}
