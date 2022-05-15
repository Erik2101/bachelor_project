/**
 * @fileoverview gRPC-Web generated client stub for frontendPackage
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as proto_frontend_pb from '../proto/frontend_pb';


export class DataServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodDescriptorConnectionTesting = new grpcWeb.MethodDescriptor(
    '/frontendPackage.DataService/ConnectionTesting',
    grpcWeb.MethodType.UNARY,
    proto_frontend_pb.ChartDatasetRequest,
    proto_frontend_pb.TestResponse,
    (request: proto_frontend_pb.ChartDatasetRequest) => {
      return request.serializeBinary();
    },
    proto_frontend_pb.TestResponse.deserializeBinary
  );

  connectionTesting(
    request: proto_frontend_pb.ChartDatasetRequest,
    metadata: grpcWeb.Metadata | null): Promise<proto_frontend_pb.TestResponse>;

  connectionTesting(
    request: proto_frontend_pb.ChartDatasetRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: proto_frontend_pb.TestResponse) => void): grpcWeb.ClientReadableStream<proto_frontend_pb.TestResponse>;

  connectionTesting(
    request: proto_frontend_pb.ChartDatasetRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: proto_frontend_pb.TestResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/frontendPackage.DataService/ConnectionTesting',
        request,
        metadata || {},
        this.methodDescriptorConnectionTesting,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/frontendPackage.DataService/ConnectionTesting',
    request,
    metadata || {},
    this.methodDescriptorConnectionTesting);
  }

  methodDescriptorChartDatasetGathering = new grpcWeb.MethodDescriptor(
    '/frontendPackage.DataService/ChartDatasetGathering',
    grpcWeb.MethodType.SERVER_STREAMING,
    proto_frontend_pb.ChartDatasetRequest,
    proto_frontend_pb.ChartDatasetResponse,
    (request: proto_frontend_pb.ChartDatasetRequest) => {
      return request.serializeBinary();
    },
    proto_frontend_pb.ChartDatasetResponse.deserializeBinary
  );

  chartDatasetGathering(
    request: proto_frontend_pb.ChartDatasetRequest,
    metadata?: grpcWeb.Metadata): grpcWeb.ClientReadableStream<proto_frontend_pb.ChartDatasetResponse> {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/frontendPackage.DataService/ChartDatasetGathering',
      request,
      metadata || {},
      this.methodDescriptorChartDatasetGathering);
  }

}

