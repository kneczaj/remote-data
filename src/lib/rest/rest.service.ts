import {Observable} from 'rxjs';
import {isNull} from 'util';
import {map, mapTo, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

/**
 * An abstract class for objects exchanged with a REST backend
 *
 * @param BackendPayload - payload format exchanged with the backend
 */
export abstract class RestItem<BackendPayload> {

  private _id: number | string | null = null;

  /**
   * The values are to assign by the class factory
   */
  protected constructor(
    public resourceUrl: string,
    private restService: RestService<RestItem<BackendPayload>>
  ) {}

  get itemUrl(): string {
    return `${this.resourceUrl}/${this.id}`;
  }

  setId(payload: BackendPayload) {
    this._id = payload['id'];
  }

  get id(): number | string {
    return this._id;
  }

  set id(value: number | string) {
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
   * @param {BackendPayload} data
   */
  abstract load(data: BackendPayload): void | Observable<any>;

  /**
   * Makes DELETE request to delete the object from the DB, as the object gets deleted the ID is set to null
   * @returns {Observable<RestItem<BackendPayload>>}
   */
  public delete(): Observable<RestItem<BackendPayload>> {
    return this.restService.delete(this).pipe<RestItem<BackendPayload>>(
      tap(() => { this._id = null; })
    );
  }

  /**
   * Saves the item in backend's DB using according request.
   * @returns {Observable<RestItem<BackendPayload>>}
   */
  public save(): Observable<RestItem<BackendPayload>> {
    if (isNull(this._id)) {
      return this.restService.post(this).pipe<BackendPayload, RestItem<BackendPayload>>(
        tap((payload: BackendPayload) => this.setId(payload)),
        mapTo(this)
      );
    }
    return this.restService.put(this).pipe<RestItem<BackendPayload>>(mapTo(this));
  }
}

/**
 * A class to communicate with rest interface
 *
 * This class acts as a factory for RestItems which may be save/deleted with affect to backend's DB content. Usually it
 * should be extended by a child class to specify the resource URL and the class of the objects which will be created by
 * the service.
 *
 * NOTE: this is an a class with no specified resourceUrl. It is useful to create REST services with non-standard
 * URLs e.g. with two levels of ids like /item1/<id>/item_property/<id2>
 */
export class RestServiceBase<T extends RestItem<BackendPayload>, BackendPayload = any> {
  /**
   * Constructor
   * @param {HttpClient} http
   * @param {any} ResourceClass - the same class as the generic T
   */
  constructor(
    protected http: HttpClient,
    protected ResourceClass: any
  ) {
  }

  /**
   * Get all items from the resource
   * @param {string} resourceUrl
   * @returns {Observable<Array<T extends RestItem<any>>>}
   */
  getAll(resourceUrl: string): Observable<Array<T>> {
    return this.http.get(resourceUrl).pipe(map((data: Array<BackendPayload>) => {
      return data.map(itemData => this.create(resourceUrl, itemData));
    }));
  }

  /**
   * Get one item with specified id
   * @param {number} id
   * @param {string} resourceUrl
   * @returns {Observable<T extends RestItem<any>>}
   */
  get(id: number | string, resourceUrl: string): Observable<T> {
    return this.http.get<BackendPayload>(`${resourceUrl}/${id}`).pipe(map(data => this.create(resourceUrl, data)));
  }

  /**
   * Create a new item which is not taken from REST backend
   * @param {string} resourceUrl
   * @returns {T}
   */
  createNew(resourceUrl: string): T {
    return new this.ResourceClass(
      resourceUrl,
      this
    );
  }

  /**
   * Create a item loaded from REST backend
   * @param {string} resourceUrl
   * @param {{}} data - data payload
   * @returns {T}
   */
  private create(resourceUrl: string, data: BackendPayload): T {
    const result = this.createNew(resourceUrl);
    result.load(data);
    return result;
  }

  /**
   * Makes POST request to save the object to the DB and assign an ID.
   * @returns {Observable<BackendPayload>} at least part of full payload so that it is possible to extract id from it
   */
  public post(item: T): Observable<BackendPayload> {
    return this.http.post<BackendPayload>(item.resourceUrl, item.dump());
  }

  /**
   * Makes PUT request to update the object in the DB.
   * @returns {Observable<BackendPayload>} at least part of updated full payload so that it is possible to extract id from it
   */
  public put(item: T): Observable<BackendPayload> {
    return this.http.put<BackendPayload>(
      item.itemUrl,
      item.dump(),
    );
  }

  /**
   * Makes DELETE request to save the object to the DB and assign an ID.
   * @returns {Observable<T>} deleted object
   */
  public delete(item: T): Observable<T> {
    return this.http.delete(item.itemUrl).pipe(mapTo(item));
  }
}

/**
 * A class to communicate with rest interface
 *
 * This class acts as a factory for RestItems which may be save/deleted with affect to backend's DB content. Usually it
 * should be extended by a child class to specify the resource URL and the class of the objects which will be created by
 * the service.
 *
 * From RestServiceBase it differs by holding a constant resourceUrl inside.
 */
export class RestService<T extends RestItem<any> > extends RestServiceBase<T> {
  /**
   * Constructor
   * @param {HttpClient} http
   * @param {any} ResourceClass - the same class as the generic T
   * @param {string} resourceUrl
   */
  constructor(
    http: HttpClient,
    ResourceClass: any,
    protected resourceUrl: string
  ) {
    super(http, ResourceClass);
  }

  /**
   * Get all items from the resource
   * @returns {Observable<Array<T extends RestItem<any>>>}
   */
  getAll(): Observable<Array<T>> {
    return super.getAll(this.resourceUrl);
  }

  /**
   * Get one item with specified id
   * @param {number} id
   * @returns {Observable<T extends RestItem<any>>}
   */
  get(id: number | string): Observable<T> {
    return super.get(id, this.resourceUrl);
  }

  /**
   * Create a new item which is not taken from REST backend
   * @returns {T}
   */
  createNew(): T {
    // T and ResourceClass which creates new items must be same, but typescript doesn't now as ResourceClass is
    // a variable, so its value is not available at compile time
    return super.createNew(this.resourceUrl) as T;
  }
}
