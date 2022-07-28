import type * as grpc from '@grpc/grpc-js';
import type { ServiceDefinition, EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { DataServiceClient as _frontendPackage_DataServiceClient, DataServiceDefinition as _frontendPackage_DataServiceDefinition } from './frontendPackage/DataService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  frontendPackage: {
    ChartDatasetRequest: MessageTypeDefinition
    ChartDatasetResponse: MessageTypeDefinition
    DataService: SubtypeConstructor<typeof grpc.Client, _frontendPackage_DataServiceClient> & { service: _frontendPackage_DataServiceDefinition }
    DeviceData: MessageTypeDefinition
    Error: MessageTypeDefinition
    StationHelperArray: MessageTypeDefinition
    TestResponse: MessageTypeDefinition
  }
}

