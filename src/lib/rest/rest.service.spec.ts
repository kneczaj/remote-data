import {TestBed, async, inject} from '@angular/core/testing';
import {Injectable} from '@angular/core';
import {Http, HttpModule, XHRBackend, Response, ResponseOptions, RequestOptions, RequestMethod} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import 'rxjs/add/operator/map';
import {RestItem, RestService} from './rest.service';
import {forEach} from "@angular/router/src/utils/collection";

/**
 * Data format from the backend
 */
declare class SampleItemPayload {
  id: string | number;
  A: string | number;
}

/**
 * The proper class of the object with implemented load/dump to convert between the class and its payload format
 */
class SampleItem extends RestItem {
  a: number;

  load(id: number, data: SampleItemPayload) {
    this.a = Number(data.A);
    this.id = id;
  }

  dump() {
    return {
      A: this.a
    } as SampleItemPayload;
  }
}

/**
 * The proper service extending the "abstract" one
 */
@Injectable()
class SampleDataRestService extends RestService<SampleItem> {

  constructor(
    http: Http,
    requestOptions: RequestOptions
  ) {
    super(http, requestOptions, '/sample_data', SampleItem);
  }
}

const itemsDB: SampleItemPayload[] = [{
  id: '1',
  A: '1'
}, {
  id: '2',
  A: '100'
}];

describe('RestService - functional - with a SampleData', () => {
  let service: SampleDataRestService;
  let subscribeSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      declarations: [
      ],
      providers: [
        SampleDataRestService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });
    service = TestBed.get(SampleDataRestService);
    subscribeSpy = jasmine.createSpy('subscribeSpy');
  }));
  it(`creates`, async(() => {
    expect(TestBed.get(SampleDataRestService)).toBeTruthy();
  }));
  it('gets and item', async(inject([XHRBackend], (backend: MockBackend) => {
    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.url).toEqual('/sample_data/1');
      expect(connection.request.method).toEqual(RequestMethod.Get);
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: itemsDB[0]
      })));
    });

    service.get(1).subscribe((item) => {
      subscribeSpy();
      expect(item.a).toEqual(1);
      expect(item.id).toEqual(1);
    });
    expect(subscribeSpy).toHaveBeenCalled();
  })));

  it('gets all items', async(inject([XHRBackend], (backend: MockBackend) => {

    const queriedIds = new Set(itemsDB.map(item => Number(item.id)));

    backend.connections.subscribe((connection: MockConnection) => {
      expect(connection.request.url).toEqual('/sample_data');
      expect(connection.request.method).toEqual(RequestMethod.Get);
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: itemsDB
      })));
    });

    service.getAll().subscribe((items: Array<SampleItem>) => {
      subscribeSpy();
      expect(items.length).toEqual(itemsDB.length);
      items.map(item => Number(item.id)).forEach(id => queriedIds.delete(id));
      expect(queriedIds.size).toEqual(0, `Not all ids were fetched, left ${queriedIds}`);
    });
    expect(subscribeSpy).toHaveBeenCalled();
  })));

  it('saves a new object to the REST API', async(inject([XHRBackend], (backend: MockBackend) => {

    const postSpy = jasmine.createSpy('postSpy');
    backend.connections.subscribe((connection: MockConnection) => {
      postSpy();
      expect(connection.request.url).toEqual('/sample_data');
      expect(connection.request.method).toBe(RequestMethod.Post);
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: {
          id: itemsDB[0].id
        }
      })));
    });

    const newItem = TestBed.get(SampleDataRestService).createNew();
    newItem.a = 100;
    newItem.save();
    expect(postSpy).toHaveBeenCalled();
  })));

  describe('after getting an object with GET', () => {

    let item: SampleItem;
    let deleteSpy;
    let putSpy;

    beforeEach(async(inject([XHRBackend], (backend: MockBackend) => {
      deleteSpy = jasmine.createSpy('deleteSpy');
      putSpy = jasmine.createSpy('putSpy');
      backend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.url).toEqual('/sample_data/1');
        if (connection.request.method === RequestMethod.Delete) {
          deleteSpy();
        } else if (connection.request.method === RequestMethod.Put) {
          putSpy();
        } else {
          expect(connection.request.method).toEqual(RequestMethod.Get);
        }
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: itemsDB[0]
        })));
      });

      service.get(1).subscribe(newItem => {
        item = newItem;
        expect(item.a).toEqual(1);
        expect(item.id).toEqual(1);
      });
    })));

    it('it is possible to delete the object', async(() => {
      item.delete().subscribe(deleted => {
        subscribeSpy();
        expect(item.id).toBeNull();
      });
      expect(subscribeSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    }));

    it('save() produces PUT method on updated object', () => {
      item.save().subscribe(saved => {
        subscribeSpy();
      });
      expect(subscribeSpy).toHaveBeenCalled();
      expect(putSpy).toHaveBeenCalled();
    });
  });
});
