import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {isNull} from 'util';
import 'rxjs/add/operator/map';
import {Subject} from 'rxjs/Subject';

/**
 * An abstract class for objects exchanged with a REST backend
 */
export abstract class RestItem {

  /**
   * To be assigned by the class factory
   *
   * TODO: encapsulate these three and let to set it just by the service
   */
  public static resourceUrl: string;
  public static http: Http;
  public static requestOptions: RequestOptions;

  private _id: number = null;

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
    const subject = new Subject<RestItem>();
    RestItem.http.delete(`${RestItem.resourceUrl}/${this.id}`, RestItem.requestOptions).subscribe(request => {
      this._id = null;
      subject.next(this);
    });
    return subject.asObservable();
  }

  public save(): Observable<RestItem> {
    if (!this._id) {
      return this.create();
    }
    this.update();
  }

  /**
   * Makes POST request to save the object to the DB and assign an ID.
   * @returns {Observable<RestItem>}
   */
  protected create(): Observable<RestItem> {
    const subject = new Subject<RestItem>();
    RestItem.http.post(RestItem.resourceUrl, this.dump(), RestItem.requestOptions).subscribe(request => {
      this.id = request.json().id;
      subject.next(this);
    });
    return subject.asObservable();
  }

  /**
   * Makes PUT request to save the object to the DB and assign an ID.
   * @returns {Observable<RestItem>}
   */
  protected update(): Observable<RestItem> {
    const subject = new Subject<RestItem>();
    RestItem.http.put(
      `${RestItem.resourceUrl}/${this.id}`,
      this.dump(),
      RestItem.requestOptions
    ).subscribe(() => {
      subject.next(this);
    });
    return subject.asObservable();
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
    this.ResourceClass.http = this.http;
    this.ResourceClass.resourceUrl = this.http;
    this.ResourceClass.requestOptions = this.requestOptions;
  }

  getAll(): Observable<Array<T>> {
    return this.http.get(this.resourceUrl).map(response => {
      const data = response.json();
      return data.map(this.create.bind(this));
    });
  }

  get(id: number): Observable<T> {
    return this.http.get(this.resourceUrl).map(response => this.create(response.json()));
  }

  private create(data: {}): T {
    const result = new this.ResourceClass();
    result.load(data);
    return result;
  }
}
