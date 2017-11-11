import {Synchronizer} from "./synchronizer";

class RemoteDataStub {
  update() {}
}

describe('Synchronizer', () => {

  beforeEach(() => {
    this.data = new RemoteDataStub();
    this.synchronizer = new Synchronizer(this.data, 0.1);
  });
  it(`is not started by default`, () => {
    expect(this.synchronizer.isInSynch()).toBeFalsy();
  });
  it('is started after starting', () => {
    this.synchronizer.start();
    expect(this.synchronizer.isInSynch()).toBeTruthy();
  });
  it('is stopped after stopping', () => {
    this.synchronizer.start();
    this.synchronizer.stop();
    expect(this.synchronizer.isInSynch()).toBeFalsy();
  });
  it('updates', () => {
    spyOn(this.data, 'update');
    this.synchronizer.start();
    setTimeout(expect(this.data.update).toHaveBeenCalled(), 200);
  });
});
