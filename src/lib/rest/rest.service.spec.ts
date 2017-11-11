import {TestBed, async, inject} from '@angular/core/testing';
import {Injectable} from '@angular/core';
import {Http, HttpModule, XHRBackend, Response, ResponseOptions, RequestOptions, RequestMethod} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import 'rxjs/add/operator/map';
import {RestItem, RestService} from './rest.service';

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

  load(data: SampleItemPayload) {
    this.a = Number(data.A);
    this.id = Number(data.id);
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
    });
    expect(subscribeSpy).toHaveBeenCalled();
  })));

  it('produces deletable objects', async(inject([XHRBackend], (backend: MockBackend) => {

    backend.connections.subscribe((connection: MockConnection) => {
      if (connection.request.method === RequestMethod.Get) {
        expect(connection.request.url).toEqual('/sample_data/1');
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: itemsDB[0]
        })));
      }
      if (connection.request.method === RequestMethod.Delete) {
        expect(connection.request.url).toEqual('/sample_data/1');
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: itemsDB[0]
        })));
      }
    });

    service.get(1).subscribe(item => {
      expect(item.a).toEqual(1);
      expect(item.id).toEqual(1);
      item.delete().subscribe(deleted => {
        subscribeSpy();
        expect(item.id).toBeNull();
      });
    });
    expect(subscribeSpy).toHaveBeenCalled();
  })));
});
