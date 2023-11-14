import {convertInterfaceIdToInterfaceType, InterfaceTypes} from '../interface-types';

describe('Interface Types', () => {
  describe('convertInterfaceIdToInterfaceType', () => {
    it('should return string of TARS', () => {
      const intType = convertInterfaceIdToInterfaceType(0);
      expect(intType).toEqual(InterfaceTypes.TARS);
    });
    it('should return string of RSIS', () => {
      const intType = convertInterfaceIdToInterfaceType(1);
      expect(intType).toEqual(InterfaceTypes.RSIS);
    });
    it('should return string of NOTIFY', () => {
      const intType = convertInterfaceIdToInterfaceType(2);
      expect(intType).toEqual(InterfaceTypes.NOTIFY);
    });
  });
});
