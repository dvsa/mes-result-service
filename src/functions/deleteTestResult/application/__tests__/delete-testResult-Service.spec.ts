import * as database from '../../../../common/framework/mysql/database';
import { Mock } from 'typemoq';
import { deleteTestResult } from '../delete-test-result-service';
import { deleteTestResultRecord } from '../../framework/database/query-builder';
import { NoDeleteWarning } from '../../domain/NoDeleteWarning';
import * as mysql from 'mysql2';

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

    moqGetConnection.setup(x => x()).returns(() => connectionStub as unknown as mysql.Connection);

    spyOn(database, 'getConnection').and.callFake(moqGetConnection.object);

    connectionPromiseStub.query.calls.reset();
  });

  it('should fail when no update queue records deleted', async () => {
    connectionPromiseStub.query.and.callFake((value) => {
      if (value === deleteTestResultRecord()) {
        return Promise.resolve([{ affectedRows: 1 }]);
      }
      return Promise.resolve([{ affectedRows: 0 }]);
    });
    try {
      await deleteTestResult();
    } catch (err) {
      expect(err).toEqual(jasmine.any(NoDeleteWarning));
    } finally {
      expect(connectionStub.rollback).toHaveBeenCalled();
      expect(connectionPromiseStub.query).toHaveBeenCalledTimes(2);
    }
  });

  it('should fail when no test result records deleted', async () => {
    connectionPromiseStub.query.and.callFake((value) => {
      if (value === deleteTestResultRecord()) {
        return Promise.resolve([{ affectedRows: 0 }]);
      }
      return Promise.resolve([{ affectedRows: 1 }]);
    });
    try {
      await deleteTestResult();
    } catch (err) {
      expect(err).toEqual(jasmine.any(NoDeleteWarning));
    } finally {
      expect(connectionStub.rollback).toHaveBeenCalled();
      expect(connectionPromiseStub.query).toHaveBeenCalledTimes(2);
    }
  });

  it('should pass when test result and update queue records deleted', async () => {
    connectionPromiseStub.query.and.returnValue(Promise.resolve([{ affectedRows: 1 }]));
    try {
      await deleteTestResult();
    } finally {
      expect(connectionPromiseStub.query).toHaveBeenCalledTimes(2);
    }
  });
});
