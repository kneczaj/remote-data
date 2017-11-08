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
  public resourceUrl: string;
  public http: Http;
  public requestOptions: RequestOptions;

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
   *
   * TODO: check if on save according to REST conventions the id should be dumped too
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
    this.http.delete(`${this.resourceUrl}/${this.id}`, this.requestOptions).subscribe(request => {
      this._id = null;
      subject.next(this);
    });
    // TODO: this subject seems to be not subscribable
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
   *
   * TODO: this does not work for now, because an object which does not has resource url assigned (constructed outside)
   *  the rest service cannot communicate with BE. A solution may be to make a factory which creates the service and
   *  the item class at once, or to move the communication methods to the service...
   *
   * @returns {Observable<RestItem>}
   */
  protected create(): Observable<RestItem> {
    const subject = new Subject<RestItem>();
    this.http.post(this.resourceUrl, this.dump(), this.requestOptions).subscribe(request => {
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
    this.http.put(
      `${this.resourceUrl}/${this.id}`,
      this.dump(),
      this.requestOptions
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

  private create(data: {}): T {
    const result = new this.ResourceClass();
    result.http = this.http;
    result.resourceUrl = this.resourceUrl;
    result.requestOptions = this.requestOptions;
    result.load(data);
    return result;
  }
}
