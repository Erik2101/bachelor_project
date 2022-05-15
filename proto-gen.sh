#!/bin/bash

yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto

mkdir -p ./ui/src/proto
protoc -I=. ./proto/*.proto \
    --js_out=import_style=commonjs:./ui/src \
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:./ui/src