export interface ResponseModelCore<T> {
  success: boolean;
  status: number;
  error: string;
  data: T;
}
