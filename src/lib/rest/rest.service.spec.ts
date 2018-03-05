import {TestBed, async, inject} from '@angular/core/testing';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {RestItem, RestService} from './rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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
class SampleItem extends RestItem<SampleItemPayload> {
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
    http: HttpClient
  ) {
    super(http, SampleItem, '/sample_data');
  }
}

const itemsDBsource: SampleItemPayload[] = [{
  id: '0',
  A: '500'
}, {
  id: '1',
  A: '1'
}, {
  id: '2',
  A: '100'
}];

describe('RestService - functional - with a SampleData', () => {
  let service: SampleDataRestService;
  let subscribeSpy;
  let itemsDB;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    // clone itemsDB for tests: some queries modify the received objects, but it is not the case then they are taken
    // from HTTP - then they are copied every time
    itemsDB = itemsDBsource.map(item => Object.assign({}, item));
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
      ],
      providers: [
        SampleDataRestService
      ]
    });
    service = TestBed.get(SampleDataRestService);
    httpMock = TestBed.get(HttpTestingController);
    subscribeSpy = jasmine.createSpy('subscribeSpy');
  }));
  it(`creates`, async(() => {
    expect(TestBed.get(SampleDataRestService)).toBeTruthy();
  }));
  it('gets and item', () => {
    const queriedId = 0;

    service.get(queriedId).subscribe((item) => {
      subscribeSpy();
      expect(item.a).toEqual(Number(itemsDB[queriedId]['A']));
      expect(item.id).toEqual(Number(itemsDB[queriedId]['id']));
    });
    const req = httpMock.expectOne(`/sample_data/${queriedId}`);
    expect(req.request.method).toEqual('GET');
    req.flush(itemsDB[queriedId]);
    httpMock.verify();
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('gets all items', () => {

    const queriedIds = new Set(itemsDB.map(item => Number(item.id)));

    service.getAll().subscribe((items: Array<SampleItem>) => {
      subscribeSpy();
      expect(items.length).toEqual(itemsDB.length);
      items.map(item => Number(item.id)).forEach(id => queriedIds.delete(id));
      expect(queriedIds.size).toEqual(0, `Not all ids were fetched, left ${queriedIds}`);
    });

    const req = httpMock.expectOne(`/sample_data`);
    expect(req.request.method).toEqual('GET');
    req.flush(itemsDB);
    httpMock.verify();
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('saves a new object to the REST API', () => {

    const newItem = TestBed.get(SampleDataRestService).createNew();
    newItem.a = 100;
    newItem.save().subscribe();
    const req = httpMock.expectOne(`/sample_data`);
    expect(req.request.method).toEqual('POST');
    req.flush({
      id: itemsDB[0].id
    });
    httpMock.verify();
  });

  describe('after getting an object with GET', () => {

    let item: SampleItem;
    const queriedId = 0;

    beforeEach(() => {
      service.get(queriedId).subscribe(newItem => {
        item = newItem;
        expect(item.a).toEqual(Number(itemsDB[queriedId]['A']));
        expect(item.id).toEqual(Number(itemsDB[queriedId]['id']));
      });

      const req = httpMock.expectOne(`/sample_data/${queriedId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(itemsDB[queriedId]);
      httpMock.verify();
    });

    it('it is possible to delete the object', async(() => {
      item.delete().subscribe(deleted => {
        subscribeSpy();
        expect(item.id).toBeNull();
      });
      const req = httpMock.expectOne(`/sample_data/${queriedId}`);
      expect(req.request.method).toEqual('DELETE');
      req.flush({});
      expect(subscribeSpy).toHaveBeenCalled();
      httpMock.verify();
    }));

    it('save() produces PUT method on updated object', () => {
      item.save().subscribe(saved => {
        subscribeSpy();
      });
      const req = httpMock.expectOne(`/sample_data/${queriedId}`);
      expect(req.request.method).toEqual('PUT');
      req.flush({});
      expect(subscribeSpy).toHaveBeenCalled();
      httpMock.verify();
    });
  });
});
