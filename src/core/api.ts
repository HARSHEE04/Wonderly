export type SessionStatus =
  | 'created'
  | 'scene_received'
  | 'challenge_selected'
  | 'in_progress'
  | 'completed'
  | 'abandoned';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    details?: Record<string, unknown>;
  };
}
