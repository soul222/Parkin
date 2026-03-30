export async function startGRPCServer(port = 50051) {
  console.log(`ℹgRPC server not started (optional feature)`);
  console.log(`To enable: Install @grpc/grpc-js and @grpc/proto-loader`);
  return Promise.resolve();
}
