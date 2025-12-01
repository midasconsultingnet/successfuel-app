// API error handling utilities for SuccessFuel ERP
import { errors } from '$lib/stores/errors';
import type { ErrorMessage } from '$lib/stores/errors';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Handle API errors with appropriate user feedback
 */
export function handleApiError(error: any, customMessage?: string): void {
  let message = customMessage || 'An API error occurred';
  let status = 0;

  // Handle different error formats
  if (error.status) {
    status = error.status;
  } else if (error.code) {
    status = error.code;
  }

  // Extract message based on error type
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    if (error.message) {
      message = error.message;
    } else if (error.error) {
      message = error.error;
    } else if (error.data?.message) {
      message = error.data.message;
    } else {
      // Try to format the error object
      try {
        message = JSON.stringify(error);
      } catch (e) {
        message = 'Unknown API error';
      }
    }
  }

  // Customize message based on status code
  if (status === 401) {
    message = 'Authentication failed. Please log in again.';
  } else if (status === 403) {
    message = 'Access denied. You do not have permission to perform this action.';
  } else if (status === 404) {
    message = 'The requested resource was not found.';
  } else if (status === 500) {
    message = 'A server error occurred. Please try again later.';
  } else if (status === 0) {
    message = 'Network error. Please check your connection.';
  }

  // Add to error store
  errors.showError(message);
}

/**
 * Handle authentication errors specifically
 */
export function handleAuthError(error: any): void {
  let message = 'Authentication error';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    if (error.message) {
      message = error.message;
    } else if (error.error) {
      message = error.error;
    }
  }

  errors.showError(message);
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): void {
  const message = 'Network error. Please check your connection and try again.';
  errors.showError(message);
}

/**
 * Handle validation errors from forms
 */
export function handleValidationError(errorsMap: Record<string, string[]>): void {
  // Combine all validation errors into a single message
  const allErrors = Object.values(errorsMap).flat();
  const message = `Validation failed: ${allErrors.join(', ')}`;
  
  errors.showWarning(message, 10000); // Show for 10 seconds
}

/**
 * Create a custom error message
 */
export function createErrorMessage(message: string, type: ErrorMessage['type'] = 'error'): string {
  return errors.add({
    message,
    type,
    duration: type === 'error' ? 5000 : type === 'warning' ? 5000 : 3000
  });
}

/**
 * Handle errors with retry capability
 */
export async function handleRetryableError<T>(
  operation: () => Promise<T>,
  onError: (error: any) => void,
  maxRetries: number = 3
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        // Last attempt - show error to user
        onError(error);
        return null;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  return null;
}

/**
 * Format error for display
 */
export function formatError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.detail) return error.detail;
  }
  
  return 'An unknown error occurred';
}

/**
 * Log error for debugging purposes
 */
export function logError(error: any, context?: string): void {
  console.group('Error Log');
  console.error('Context:', context || 'No context provided');
  console.error('Error:', error);
  console.error('Timestamp:', new Date().toISOString());
  console.groupEnd();
}