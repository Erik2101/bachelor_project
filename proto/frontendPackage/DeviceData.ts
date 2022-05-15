// Original file: proto/frontend.proto

import type { Error as _frontendPackage_Error, Error__Output as _frontendPackage_Error__Output } from '../frontendPackage/Error';

export interface DeviceData {
  'uuid'?: (string);
  'isActive'?: (boolean);
  'isUsable'?: (boolean);
  'classes'?: (string);
  'errors'?: (_frontendPackage_Error)[];
  'location'?: (string);
  'staff'?: (string);
  'depot'?: (string);
  'ensemble'?: (string)[];
  'runtimeCurrent'?: (number);
  'runtimeMaintenance'?: (number);
  'runtimeTotal'?: (number);
}

export interface DeviceData__Output {
  'uuid'?: (string);
  'isActive'?: (boolean);
  'isUsable'?: (boolean);
  'classes'?: (string);
  'errors'?: (_frontendPackage_Error__Output)[];
  'location'?: (string);
  'staff'?: (string);
  'depot'?: (string);
  'ensemble'?: (string)[];
  'runtimeCurrent'?: (number);
  'runtimeMaintenance'?: (number);
  'runtimeTotal'?: (number);
}
