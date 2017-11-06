import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Serializable} from './serializable';

/**
 * A class to communicate with rest interface
 *
 * TODO: inject the service to objects to be able to save them with T.save() method of the object
 */
@Injectable()
export class RestService<T> {
  constructor(private http: Http, private resourceUrl: string) {

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
    // TODO: find proper way to create the object
    const result = new T.constructor();
    (result as Serializable).load(data);
    return result;
  }
}
