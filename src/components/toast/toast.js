import { eventBus } from '../../core/event-bus.js';
import { escapeHTML } from '../../utils/sanitize.js';

export class ToastComponent {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    eventBus.on('toast:show', ({ message, type = 'info', duration = 3000 }) => {
      this.show(message, type, duration);
    });
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let iconColor = 'var(--accent-color)';
    if (type === 'danger') iconColor = 'var(--danger-color)';
    if (type === 'success') iconColor = 'var(--success-color)';

    toast.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${iconColor};"></span>
      <span>${escapeHTML(message)}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
      setTimeout(() => {
        if (toast.parentNode === this.container) {
          this.container.removeChild(toast);
        }
      }, 200);
    }, duration);
  }
}
