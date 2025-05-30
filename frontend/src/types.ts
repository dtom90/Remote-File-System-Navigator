export interface Server {
  id: string;
  name: string;
  hostname: string;
  port: string;
  // Add other server properties as needed
}

export interface SSHConnectRequest {
  hostname: string;
  port: number;
  username: string;
  password: string;
}

export interface SSHConnectResponse {
  message: string;
  sessionID: string;
}

export interface SSHDisconnectResponse {
  message: string;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  isDir: boolean;
  modTime: string;
}
