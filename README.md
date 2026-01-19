<p align="center">
  <a href="https://connectrpc.com"><img src="./connect-logo.png" width="120" alt="ConnectRPC Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This is an example of production integration of [ConnectRPC](https://github.com/connectrpc/connect-es) for Nodejs into 
[Nest](https://github.com/nestjs/nest) framework.

Start reading from `src/app.module.ts`

### Features
This example shows:
* rpc with simple request and response messages
* rpc with stream in response
* rpc with stream in request
* how to use middlewares
* how to use global guards

*RPC with bidirectional stream is out of current scope because it requires HTTP/2 which is unstable in public networks. Practice demostrates more consistent performance over HTTP/1.*

## Prerequisites
* Nodejs
* Nest + Fastify server

## Project setup

```bash
$ pnpm install
```

To compile proto files if you change them
```bash
$ pnpm run compile-proto
```

## Compile and run the test

```bash
$ pnpm run test
```

## Test output
![](image.png)
![](image-1.png)
![](image-2.png)
![](image-3.png)