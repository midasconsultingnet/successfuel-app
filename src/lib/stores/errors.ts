// Error handling and user feedback system for SuccessFuel ERP
import { writable, derived } from 'svelte/store';
import type { Writable } from 'svelte/store';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  duration?: number; // Auto-dismiss after this time (ms), 0 means no auto-dismiss
  persistent?: boolean; // Whether the message should persist until manually dismissed
  action?: {
    label: string;
    callback: () => void;
  };
}

interface ErrorState {
  messages: ErrorMessage[];
}

const initialState: ErrorState = {
  messages: []
};

function createErrorStore() {
  const { subscribe, update, set }: Writable<ErrorState> = writable(initialState);

  return {
    subscribe,
    
    // Add a new error message
    add(message: Omit<ErrorMessage, 'id' | 'timestamp'>): string {
      const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: ErrorMessage = {
        id,
        message: message.message,
        type: message.type,
        timestamp: new Date(),
        duration: message.duration,
        persistent: message.persistent,
        action: message.action
      };

      update(state => ({
        ...state,
        messages: [...state.messages, newMessage]
      }));

      // Auto-dismiss if duration is specified
      if (newMessage.duration && newMessage.duration > 0) {
        setTimeout(() => {
          this.dismiss(id);
        }, newMessage.duration);
      }

      return id;
    },

    // Dismiss a specific error message
    dismiss(id: string): void {
      update(state => ({
        ...state,
        messages: state.messages.filter(msg => msg.id !== id)
      }));
    },

    // Dismiss all error messages
    dismissAll(): void {
      update(state => ({
        ...state,
        messages: []
      }));
    },

    // Show an error message
    showError(message: string, duration?: number): string {
      return this.add({
        message,
        type: 'error',
        duration: duration || 5000, // Default 5 seconds for errors
        persistent: false
      });
    },

    // Show a warning message
    showWarning(message: string, duration?: number): string {
      return this.add({
        message,
        type: 'warning',
        duration: duration || 5000, // Default 5 seconds for warnings
        persistent: false
      });
    },

    // Show an info message
    showInfo(message: string, duration?: number): string {
      return this.add({
        message,
        type: 'info',
        duration: duration || 3000, // Default 3 seconds for info
        persistent: false
      });
    },

    // Show a success message
    showSuccess(message: string, duration?: number): string {
      return this.add({
        message,
        type: 'success',
        duration: duration || 3000, // Default 3 seconds for success
        persistent: false
      });
    },

    // Show a persistent error that requires user action
    showPersistentError(message: string, action?: { label: string; callback: () => void }): string {
      return this.add({
        message,
        type: 'error',
        duration: 0, // No auto-dismiss
        persistent: true,
        action
      });
    }
  };
}

export const errors = createErrorStore();

// Derived store for just the messages
export const errorMessages = derived(
  errors,
  $errors => $errors.messages
);

// Derived store for just error count
export const errorCount = derived(
  errors,
  $errors => $errors.messages.length
);

// Derived store for just error types
export const errorTypes = derived(
  errors,
  $errors => {
    const counts: Record<string, number> = { error: 0, warning: 0, info: 0, success: 0 };
    $errors.messages.forEach(msg => counts[msg.type]++);
    return counts;
  }
);

// Global error handler
export class GlobalErrorHandler {
  static handle(error: any, context?: string): void {
    let message = 'An unknown error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = JSON.stringify(error);
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    errors.showError(message);
    console.error('Global error handler:', error);
  }

  static handleApiError(error: any, fallbackMessage: string = 'API request failed'): void {
    let message = fallbackMessage;
    
    if (error && typeof error === 'object') {
      // Handle different API error formats
      if (error.error) {
        message = error.error;
      } else if (error.message) {
        message = error.message;
      } else if (error.data && error.data.message) {
        message = error.data.message;
      } else if (error.statusText) {
        message = `${error.status}: ${error.statusText}`;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    errors.showError(message);
  }
}

// Error boundary component functionality
export class ErrorBoundary {
  static handleError(error: any, errorInfo: any): void {
    console.error('Error caught by boundary:', error, errorInfo);
    GlobalErrorHandler.handle(error, 'Error boundary');
  }
}