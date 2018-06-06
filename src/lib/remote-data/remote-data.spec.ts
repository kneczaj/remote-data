import {TestBed, async} from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {RemoteData} from './remote-data';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

class DataPayload {
  a: string | number;
}

class Data {
  a: number;

  constructor(data: DataPayload) {
    this.a = Number(data.a);
  }
}

@Injectable()
class SampleService {
  data: RemoteData<Data>;

  constructor(private http: HttpClient) {
    this.data = new RemoteData<Data>(this.fetch.bind(this));
  }

  fetch() {
    return this.http.get<DataPayload>('/data').pipe(map(payload => {
      return new Data(payload);
    }));
  }
}

describe('RemoteData - functional - with a sample service', () => {
  let service: SampleService;
  let httpMock: HttpTestingController;
  let subscribeSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
      ],
      providers: [
        SampleService
      ]
    });
    service = TestBed.get(SampleService);
    httpMock = TestBed.get(HttpTestingController);
    subscribeSpy = jasmine.createSpy('subscribeSpy');
  }));
  it(`has initial value of undefined`, async(() => {
    expect(TestBed.get(SampleService).data.value).toEqual(undefined);
  }));
  it('has value set after fetching', () => {
    const response = { a: '1' };

    service.data.update();
    service.data.observable.subscribe(() => {
      subscribeSpy();
      expect(service.data.value.a).toEqual(1);
    });

    const req = httpMock.expectOne('/data');
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(subscribeSpy).toHaveBeenCalled();
    httpMock.verify();
  });
  it('provides observable to sync with the changes', () => {
    const response = { a: '1' };

    service.data.observable.subscribe((value: Data) => {
      subscribeSpy();
      expect(value.a).toEqual(1);
    });

    service.data.update();
    const req = httpMock.expectOne('/data');
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    httpMock.verify();
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('works with multiple updates', () => {
    const aValues = [1, 2];
    const responses = aValues.map(a => {
      return {'a': String(a)};
    });

    service.data.observable.subscribe((value: Data) => {
      expect(value.a).toEqual(aValues.pop());
    });

    service.data.update();
    let req = httpMock.expectOne('/data');
    expect(req.request.method).toEqual('GET');
    req.flush(responses.pop());

    service.data.update();
    req = httpMock.expectOne('/data');
    expect(req.request.method).toEqual('GET');
    req.flush(responses.pop());

    expect(responses.length).toEqual(0);
    expect(aValues.length).toEqual(0);
    httpMock.verify();
  });
});
