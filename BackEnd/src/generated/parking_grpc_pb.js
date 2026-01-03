// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var parking_pb = require('./parking_pb.js');

function serialize_parking_AuthResponse(arg) {
  if (!(arg instanceof parking_pb.AuthResponse)) {
    throw new Error('Expected argument of type parking.AuthResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_AuthResponse(buffer_arg) {
  return parking_pb.AuthResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_DetectionResponse(arg) {
  if (!(arg instanceof parking_pb.DetectionResponse)) {
    throw new Error('Expected argument of type parking.DetectionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_DetectionResponse(buffer_arg) {
  return parking_pb.DetectionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_LoginRequest(arg) {
  if (!(arg instanceof parking_pb.LoginRequest)) {
    throw new Error('Expected argument of type parking.LoginRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_LoginRequest(buffer_arg) {
  return parking_pb.LoginRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_LogoutRequest(arg) {
  if (!(arg instanceof parking_pb.LogoutRequest)) {
    throw new Error('Expected argument of type parking.LogoutRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_LogoutRequest(buffer_arg) {
  return parking_pb.LogoutRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_LogoutResponse(arg) {
  if (!(arg instanceof parking_pb.LogoutResponse)) {
    throw new Error('Expected argument of type parking.LogoutResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_LogoutResponse(buffer_arg) {
  return parking_pb.LogoutResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_LogsRequest(arg) {
  if (!(arg instanceof parking_pb.LogsRequest)) {
    throw new Error('Expected argument of type parking.LogsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_LogsRequest(buffer_arg) {
  return parking_pb.LogsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_LogsResponse(arg) {
  if (!(arg instanceof parking_pb.LogsResponse)) {
    throw new Error('Expected argument of type parking.LogsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_LogsResponse(buffer_arg) {
  return parking_pb.LogsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_MonitoringRequest(arg) {
  if (!(arg instanceof parking_pb.MonitoringRequest)) {
    throw new Error('Expected argument of type parking.MonitoringRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_MonitoringRequest(buffer_arg) {
  return parking_pb.MonitoringRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_Settings(arg) {
  if (!(arg instanceof parking_pb.Settings)) {
    throw new Error('Expected argument of type parking.Settings');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_Settings(buffer_arg) {
  return parking_pb.Settings.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_SettingsRequest(arg) {
  if (!(arg instanceof parking_pb.SettingsRequest)) {
    throw new Error('Expected argument of type parking.SettingsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_SettingsRequest(buffer_arg) {
  return parking_pb.SettingsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_SettingsResponse(arg) {
  if (!(arg instanceof parking_pb.SettingsResponse)) {
    throw new Error('Expected argument of type parking.SettingsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_SettingsResponse(buffer_arg) {
  return parking_pb.SettingsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_StatsRequest(arg) {
  if (!(arg instanceof parking_pb.StatsRequest)) {
    throw new Error('Expected argument of type parking.StatsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_StatsRequest(buffer_arg) {
  return parking_pb.StatsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_TokenRequest(arg) {
  if (!(arg instanceof parking_pb.TokenRequest)) {
    throw new Error('Expected argument of type parking.TokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_TokenRequest(buffer_arg) {
  return parking_pb.TokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_TokenValidation(arg) {
  if (!(arg instanceof parking_pb.TokenValidation)) {
    throw new Error('Expected argument of type parking.TokenValidation');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_TokenValidation(buffer_arg) {
  return parking_pb.TokenValidation.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_VehicleDetection(arg) {
  if (!(arg instanceof parking_pb.VehicleDetection)) {
    throw new Error('Expected argument of type parking.VehicleDetection');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_VehicleDetection(buffer_arg) {
  return parking_pb.VehicleDetection.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_parking_VehicleStats(arg) {
  if (!(arg instanceof parking_pb.VehicleStats)) {
    throw new Error('Expected argument of type parking.VehicleStats');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_parking_VehicleStats(buffer_arg) {
  return parking_pb.VehicleStats.deserializeBinary(new Uint8Array(buffer_arg));
}


// ============================================
// Vehicle Detection Service
// ============================================
var VehicleServiceService = exports.VehicleServiceService = {
  // Streaming detections from YOLO to Server
streamDetections: {
    path: '/parking.VehicleService/StreamDetections',
    requestStream: true,
    responseStream: false,
    requestType: parking_pb.VehicleDetection,
    responseType: parking_pb.DetectionResponse,
    requestSerialize: serialize_parking_VehicleDetection,
    requestDeserialize: deserialize_parking_VehicleDetection,
    responseSerialize: serialize_parking_DetectionResponse,
    responseDeserialize: deserialize_parking_DetectionResponse,
  },
  // Bidirectional streaming untuk real-time updates
liveMonitoring: {
    path: '/parking.VehicleService/LiveMonitoring',
    requestStream: true,
    responseStream: true,
    requestType: parking_pb.MonitoringRequest,
    responseType: parking_pb.VehicleStats,
    requestSerialize: serialize_parking_MonitoringRequest,
    requestDeserialize: deserialize_parking_MonitoringRequest,
    responseSerialize: serialize_parking_VehicleStats,
    responseDeserialize: deserialize_parking_VehicleStats,
  },
  // Get current statistics
getStats: {
    path: '/parking.VehicleService/GetStats',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.StatsRequest,
    responseType: parking_pb.VehicleStats,
    requestSerialize: serialize_parking_StatsRequest,
    requestDeserialize: deserialize_parking_StatsRequest,
    responseSerialize: serialize_parking_VehicleStats,
    responseDeserialize: deserialize_parking_VehicleStats,
  },
  // Get vehicle logs with pagination
getLogs: {
    path: '/parking.VehicleService/GetLogs',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.LogsRequest,
    responseType: parking_pb.LogsResponse,
    requestSerialize: serialize_parking_LogsRequest,
    requestDeserialize: deserialize_parking_LogsRequest,
    responseSerialize: serialize_parking_LogsResponse,
    responseDeserialize: deserialize_parking_LogsResponse,
  },
};

exports.VehicleServiceClient = grpc.makeGenericClientConstructor(VehicleServiceService, 'VehicleService');
// ============================================
// Settings Service
// ============================================
var SettingsServiceService = exports.SettingsServiceService = {
  getSettings: {
    path: '/parking.SettingsService/GetSettings',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.SettingsRequest,
    responseType: parking_pb.Settings,
    requestSerialize: serialize_parking_SettingsRequest,
    requestDeserialize: deserialize_parking_SettingsRequest,
    responseSerialize: serialize_parking_Settings,
    responseDeserialize: deserialize_parking_Settings,
  },
  updateSettings: {
    path: '/parking.SettingsService/UpdateSettings',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.Settings,
    responseType: parking_pb.SettingsResponse,
    requestSerialize: serialize_parking_Settings,
    requestDeserialize: deserialize_parking_Settings,
    responseSerialize: serialize_parking_SettingsResponse,
    responseDeserialize: deserialize_parking_SettingsResponse,
  },
  streamSettingsUpdates: {
    path: '/parking.SettingsService/StreamSettingsUpdates',
    requestStream: false,
    responseStream: true,
    requestType: parking_pb.SettingsRequest,
    responseType: parking_pb.Settings,
    requestSerialize: serialize_parking_SettingsRequest,
    requestDeserialize: deserialize_parking_SettingsRequest,
    responseSerialize: serialize_parking_Settings,
    responseDeserialize: deserialize_parking_Settings,
  },
};

exports.SettingsServiceClient = grpc.makeGenericClientConstructor(SettingsServiceService, 'SettingsService');
// ============================================
// Authentication Service
// ============================================
var AuthServiceService = exports.AuthServiceService = {
  login: {
    path: '/parking.AuthService/Login',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.LoginRequest,
    responseType: parking_pb.AuthResponse,
    requestSerialize: serialize_parking_LoginRequest,
    requestDeserialize: deserialize_parking_LoginRequest,
    responseSerialize: serialize_parking_AuthResponse,
    responseDeserialize: deserialize_parking_AuthResponse,
  },
  logout: {
    path: '/parking.AuthService/Logout',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.LogoutRequest,
    responseType: parking_pb.LogoutResponse,
    requestSerialize: serialize_parking_LogoutRequest,
    requestDeserialize: deserialize_parking_LogoutRequest,
    responseSerialize: serialize_parking_LogoutResponse,
    responseDeserialize: deserialize_parking_LogoutResponse,
  },
  validateToken: {
    path: '/parking.AuthService/ValidateToken',
    requestStream: false,
    responseStream: false,
    requestType: parking_pb.TokenRequest,
    responseType: parking_pb.TokenValidation,
    requestSerialize: serialize_parking_TokenRequest,
    requestDeserialize: deserialize_parking_TokenRequest,
    responseSerialize: serialize_parking_TokenValidation,
    responseDeserialize: deserialize_parking_TokenValidation,
  },
};

exports.AuthServiceClient = grpc.makeGenericClientConstructor(AuthServiceService, 'AuthService');
