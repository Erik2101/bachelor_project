import * as jspb from 'google-protobuf'



export class ChartDatasetRequest extends jspb.Message {
  getChartId(): number;
  setChartId(value: number): ChartDatasetRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChartDatasetRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChartDatasetRequest): ChartDatasetRequest.AsObject;
  static serializeBinaryToWriter(message: ChartDatasetRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChartDatasetRequest;
  static deserializeBinaryFromReader(message: ChartDatasetRequest, reader: jspb.BinaryReader): ChartDatasetRequest;
}

export namespace ChartDatasetRequest {
  export type AsObject = {
    chartId: number,
  }
}

export class Error extends jspb.Message {
  getId(): number;
  setId(value: number): Error;

  getPriority(): string;
  setPriority(value: string): Error;

  getKind(): string;
  setKind(value: string): Error;

  getDate(): string;
  setDate(value: string): Error;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    id: number,
    priority: string,
    kind: string,
    date: string,
  }
}

export class DeviceData extends jspb.Message {
  getUuid(): string;
  setUuid(value: string): DeviceData;

  getIsactive(): boolean;
  setIsactive(value: boolean): DeviceData;

  getIsusable(): boolean;
  setIsusable(value: boolean): DeviceData;

  getClasses(): string;
  setClasses(value: string): DeviceData;

  getErrorsList(): Array<Error>;
  setErrorsList(value: Array<Error>): DeviceData;
  clearErrorsList(): DeviceData;
  addErrors(value?: Error, index?: number): Error;

  getLocation(): string;
  setLocation(value: string): DeviceData;

  getStaff(): string;
  setStaff(value: string): DeviceData;

  getDepot(): string;
  setDepot(value: string): DeviceData;

  getEnsembleList(): Array<string>;
  setEnsembleList(value: Array<string>): DeviceData;
  clearEnsembleList(): DeviceData;
  addEnsemble(value: string, index?: number): DeviceData;

  getRuntimecurrent(): number;
  setRuntimecurrent(value: number): DeviceData;

  getRuntimemaintenance(): number;
  setRuntimemaintenance(value: number): DeviceData;

  getRuntimetotal(): number;
  setRuntimetotal(value: number): DeviceData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeviceData.AsObject;
  static toObject(includeInstance: boolean, msg: DeviceData): DeviceData.AsObject;
  static serializeBinaryToWriter(message: DeviceData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeviceData;
  static deserializeBinaryFromReader(message: DeviceData, reader: jspb.BinaryReader): DeviceData;
}

export namespace DeviceData {
  export type AsObject = {
    uuid: string,
    isactive: boolean,
    isusable: boolean,
    classes: string,
    errorsList: Array<Error.AsObject>,
    location: string,
    staff: string,
    depot: string,
    ensembleList: Array<string>,
    runtimecurrent: number,
    runtimemaintenance: number,
    runtimetotal: number,
  }
}

export class ChartDatasetResponse extends jspb.Message {
  getDevicedata(): DeviceData | undefined;
  setDevicedata(value?: DeviceData): ChartDatasetResponse;
  hasDevicedata(): boolean;
  clearDevicedata(): ChartDatasetResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChartDatasetResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChartDatasetResponse): ChartDatasetResponse.AsObject;
  static serializeBinaryToWriter(message: ChartDatasetResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChartDatasetResponse;
  static deserializeBinaryFromReader(message: ChartDatasetResponse, reader: jspb.BinaryReader): ChartDatasetResponse;
}

export namespace ChartDatasetResponse {
  export type AsObject = {
    devicedata?: DeviceData.AsObject,
  }
}

export class TestResponse extends jspb.Message {
  getHello(): string;
  setHello(value: string): TestResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TestResponse): TestResponse.AsObject;
  static serializeBinaryToWriter(message: TestResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TestResponse;
  static deserializeBinaryFromReader(message: TestResponse, reader: jspb.BinaryReader): TestResponse;
}

export namespace TestResponse {
  export type AsObject = {
    hello: string,
  }
}

export class StationHelperArray extends jspb.Message {
  getName(): string;
  setName(value: string): StationHelperArray;

  getShort(): string;
  setShort(value: string): StationHelperArray;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StationHelperArray.AsObject;
  static toObject(includeInstance: boolean, msg: StationHelperArray): StationHelperArray.AsObject;
  static serializeBinaryToWriter(message: StationHelperArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StationHelperArray;
  static deserializeBinaryFromReader(message: StationHelperArray, reader: jspb.BinaryReader): StationHelperArray;
}

export namespace StationHelperArray {
  export type AsObject = {
    name: string,
    pb_short: string,
  }
}

