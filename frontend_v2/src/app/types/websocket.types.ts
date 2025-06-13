export interface WebsocketResponse {
  type: 'loading' | 'complete',
  progress: number,
  message: string,
  upload_id: string,
}

export interface WebsocketMessageRequest {
  type: 'start' | 'validate';
}
