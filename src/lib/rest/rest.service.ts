import {Observable} from 'rxjs/Observable';
import {isNull, isNullOrUndefined} from 'util';
import 'rxjs/add/operator/map';
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
  constructor(
    public resourceUrl: string,
    public http: HttpClient
  ) {}

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
   * @param {number} id
   * @param {BackendPayload} data
   */
  abstract load(id: number | string, data: BackendPayload);

  /**
   * Makes DELETE request to delete the object from the DB, as the object gets deleted the ID is set to null
   * @returns {Observable<RestItem>}
   */
  public delete(): Observable< RestItem<BackendPayload> > {
    return this.http.delete(`${this.resourceUrl}/${this.id}`).map(request => {
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
    return this.http.post<BackendPayload>(this.resourceUrl, this.dump()).map(data => {
      this.id = data['id'];
      return this;
    });
  }

  /**
   * Makes PUT request to update the object in the DB.
   * @returns {Observable<RestItem>}
   */
  protected update(): Observable< RestItem<BackendPayload> > {
    return this.http.put<BackendPayload>(
      `${this.resourceUrl}/${this.id}`,
      this.dump()
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
 *
 * NOTE: this is an a class with no specified resourceUrl. It is useful to create REST services with non-standard
 * URLs e.g. with two levels of ids like /item1/<id>/item_property/<id2>
 */
export class RestServiceBase<T extends RestItem<any> > {
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
    return this.http.get(resourceUrl).map((data: Array<{}>) => {
      return data.map(itemData => {
        if (isNullOrUndefined(itemData['id'])) {
          throw `Id is not defined when getAll from ${resourceUrl} triggered`;
        }
        const id = itemData['id'];
        delete itemData['id'];
        return this.create(resourceUrl, id, itemData);
      });
    });
  }

  /**
   * Get one item with specified id
   * @param {number} id
   * @param {string} resourceUrl
   * @returns {Observable<T extends RestItem<any>>}
   */
  get(id: number | string, resourceUrl: string): Observable<T> {
    return this.http.get<{}>(`${resourceUrl}/${id}`).map(data => this.create(resourceUrl, id, data));
  }

  /**
   * Create a new item which is not taken from REST backend
   * @param {string} resourceUrl
   * @returns {T}
   */
  createNew(resourceUrl: string): T {
    return new this.ResourceClass(
      resourceUrl,
      this.http
    );
  }

  /**
   * Create a item loaded from REST backend
   * @param {string} resourceUrl
   * @param {number} id
   * @param {{}} data - data payload
   * @returns {T}
   */
  private create(resourceUrl: string, id: number | string, data: {}): T {
    const result = this.createNew(resourceUrl);
    result.load(id, data);
    return result;
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
    return super.createNew(this.resourceUrl);
  }
}
