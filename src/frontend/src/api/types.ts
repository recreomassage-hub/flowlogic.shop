import { AxiosError } from 'axios';

/**
 * Типы для обработки ошибок API
 */

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
}

/**
 * Типизированная Axios ошибка с данными ответа
 */
export type ApiError = AxiosError<ApiErrorResponse>;

/**
 * Тип для проверки является ли ошибка API ошибкой
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Извлекает сообщение об ошибке из API ответа
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Тип для normalized_output в Assessment result
 */
export interface AssessmentNormalizedOutput {
  [key: string]: string | number | boolean | null | undefined;
}
