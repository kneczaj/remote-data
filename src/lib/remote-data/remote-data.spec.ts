import {TestBed, async, inject} from '@angular/core/testing';
import {RemoteData} from './remote-data';
import {Injectable} from '@angular/core';
import {Http, HttpModule, XHRBackend, Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import 'rxjs/add/operator/map';

class Data {
  a: number;

  constructor(data: {
    a: string | number
  }) {
    this.a = Number(data.a);
  }
}

@Injectable()
class SampleService {
  data: RemoteData<Data>;

  constructor(private http: Http) {
    this.data = new RemoteData<Data>(this.fetch.bind(this));
  }

  fetch() {
    return this.http.get('/data').map((response) => {
      return new Data(response.json());
    });
  }
}

describe('RemoteData - funcional - with a sample service', () => {
  let service: SampleService;
  let subscribeSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      declarations: [
      ],
      providers: [
        SampleService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });
    service = TestBed.get(SampleService);
    subscribeSpy = jasmine.createSpy('subscribeSpy');
  }));
  it(`has initial value of undefined`, async(() => {
    expect(TestBed.get(SampleService).data.value).toEqual(undefined);
  }));
  it('has value set after fetching', async(inject([XHRBackend], (backend: MockBackend) => {
    const response = { a: '1' };

    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: response
      })));
    });

    service.data.update().subscribe(() => {
      subscribeSpy();
      expect(service.data.value.a).toEqual(1);
    });
    expect(subscribeSpy).toHaveBeenCalled();
  })));
  it('provides observable to sync with the changes', async(inject([XHRBackend], (backend: MockBackend) => {
    const response = { a: '1' };

    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: response
      })));
    });

    service.data.observable.subscribe((value: Data) => {
      subscribeSpy();
      expect(value.a).toEqual(1);
    });

    service.data.update();
    expect(subscribeSpy).toHaveBeenCalled();
  })));
  it('works with multiple updates', async(inject([XHRBackend], (backend: MockBackend) => {
    const aValues = [1, 2];
    const responses = aValues.map(a => {
      return {'a': String(a)};
    });

    backend.connections.subscribe((connection: MockConnection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: responses.pop()
      })));
    });

    service.data.observable.subscribe((value: Data) => {
      expect(value.a).toEqual(aValues.pop());
    });

    service.data.update();
    service.data.update();
    expect(responses.length).toEqual(0);
    expect(aValues.length).toEqual(0);
  })));
});
