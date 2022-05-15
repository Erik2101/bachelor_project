// Original file: proto/frontend.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { ChartDatasetRequest as _frontendPackage_ChartDatasetRequest, ChartDatasetRequest__Output as _frontendPackage_ChartDatasetRequest__Output } from '../frontendPackage/ChartDatasetRequest';
import type { ChartDatasetResponse as _frontendPackage_ChartDatasetResponse, ChartDatasetResponse__Output as _frontendPackage_ChartDatasetResponse__Output } from '../frontendPackage/ChartDatasetResponse';
import type { TestResponse as _frontendPackage_TestResponse, TestResponse__Output as _frontendPackage_TestResponse__Output } from '../frontendPackage/TestResponse';

export interface DataServiceClient extends grpc.Client {
  ChartDatasetGathering(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_frontendPackage_ChartDatasetResponse__Output>;
  ChartDatasetGathering(argument: _frontendPackage_ChartDatasetRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_frontendPackage_ChartDatasetResponse__Output>;
  chartDatasetGathering(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_frontendPackage_ChartDatasetResponse__Output>;
  chartDatasetGathering(argument: _frontendPackage_ChartDatasetRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_frontendPackage_ChartDatasetResponse__Output>;
  
  ConnectionTesting(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  ConnectionTesting(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  ConnectionTesting(argument: _frontendPackage_ChartDatasetRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  ConnectionTesting(argument: _frontendPackage_ChartDatasetRequest, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  connectionTesting(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  connectionTesting(argument: _frontendPackage_ChartDatasetRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  connectionTesting(argument: _frontendPackage_ChartDatasetRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  connectionTesting(argument: _frontendPackage_ChartDatasetRequest, callback: (error?: grpc.ServiceError, result?: _frontendPackage_TestResponse__Output) => void): grpc.ClientUnaryCall;
  
}

export interface DataServiceHandlers extends grpc.UntypedServiceImplementation {
  ChartDatasetGathering: grpc.handleServerStreamingCall<_frontendPackage_ChartDatasetRequest__Output, _frontendPackage_ChartDatasetResponse>;
  
  ConnectionTesting: grpc.handleUnaryCall<_frontendPackage_ChartDatasetRequest__Output, _frontendPackage_TestResponse>;
  
}

export interface DataServiceDefinition extends grpc.ServiceDefinition {
  ChartDatasetGathering: MethodDefinition<_frontendPackage_ChartDatasetRequest, _frontendPackage_ChartDatasetResponse, _frontendPackage_ChartDatasetRequest__Output, _frontendPackage_ChartDatasetResponse__Output>
  ConnectionTesting: MethodDefinition<_frontendPackage_ChartDatasetRequest, _frontendPackage_TestResponse, _frontendPackage_ChartDatasetRequest__Output, _frontendPackage_TestResponse__Output>
}
