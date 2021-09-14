import * as database from '../../../../common/framework/mysql/database';
import { Mock } from 'typemoq';
import { deleteTestResult } from '../delete-testResult-service';

describe('DeleteTestResultService', () => {
  const moqGetConnection = Mock.ofInstance(database.getConnection);
  const connectionPromiseStub = jasmine.createSpyObj('promise', ['query']);
  const connectionStub = {
    promise: () => connectionPromiseStub,
    end: jasmine.createSpy('end'),
    rollback: jasmine.createSpy('rollback'),
  };

  beforeEach(() => {
    moqGetConnection.reset();

    moqGetConnection.setup(x => x()).returns(() => connectionStub);

    spyOn(database, 'getConnection').and.callFake(moqGetConnection.object);
  });

  it('should return successfully when a single record is deleted', async () => {
    connectionPromiseStub.query.and.returnValue(Promise.resolve([{ affectedRows: 1 }]));
    await deleteTestResult();
  });

  it('should throw a warning when no records are deleted', async () => {
    connectionPromiseStub.query.and.returnValue(Promise.resolve([{ affectedRows: 0 }]));

    try {
      await deleteTestResult();
    } catch (err) {
      expect(connectionStub.rollback).toHaveBeenCalled();
      return;
    }
    fail('should have thrown due to no records deleted');
  });

});
