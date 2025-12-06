
export type apiResponse<T> = {
  status: true | false;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
};
