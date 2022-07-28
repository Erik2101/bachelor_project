import path from "path"
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import { ProtoGrpcType } from "./proto/frontend"
import { DataServiceHandlers } from "./proto/frontendPackage/DataService"
import { ChartDatasetResponse } from "./proto/frontendPackage/ChartDatasetResponse"
import { DeviceData } from "./proto/frontendPackage/DeviceData"
import { TestResponse } from "./proto/frontendPackage/TestResponse"

const PORT = 8082
const PROTO_FILE = './proto/frontend.proto'

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType
const frontendPackage = grpcObj.frontendPackage

type PulledData = {
  "data" : Array<DeviceData>,
  "helper" : Array<[string, string]>
}

function main() {
  const server = getServer()

  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(`Your server as started on port ${port}`)
    server.start()
  })
}

function getServer() {
  const server = new grpc.Server()
  server.addService(frontendPackage.DataService.service, {

    ConnectionTesting: (call, callback) => {
      const requestId = call.request.chartId || 0
      if (!requestId) callback(new Error("requestID is required."))
        const ret = {
          "hello": "RPC war erfolgreich."
        } as TestResponse
      return callback(null, ret)
    },

    ChartDatasetGathering: (call) => {
      const requestId = call.request.chartId || 0
      let activityData: Array<DeviceData> = []
      if (!requestId) return call.end();
      let pulled_data : PulledData
      pulled_data = (requestId === 1) ? require("./data/deviceDummyV4.a.json") : require("./data/deviceDummyV4.b.json")
      activityData = pulled_data.data
      for (const item of activityData) {
        const ret: ChartDatasetResponse = { "DeviceData": item }
        call.write(ret);
      }
      call.on('cancelled', () => {
      })
      call.end();
    }

  } as DataServiceHandlers)

  return server
}

main()