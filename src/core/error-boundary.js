import { eventBus } from './event-bus.js';

export function setupErrorBoundary() {
  window.addEventListener('error', (event) => {
    console.error('Unhandled runtime error:', event.error || event.message);
    eventBus.emit('toast:show', {
      message: 'An unexpected application error occurred.',
      type: 'danger'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    eventBus.emit('toast:show', {
      message: 'Operation failed. Please check local data.',
      type: 'danger'
    });
  });
}
