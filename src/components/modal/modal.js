import { eventBus } from '../../core/event-bus.js';
import { escapeHTML } from '../../utils/sanitize.js';

export class ModalComponent {
  constructor(root) {
    this.root = root;
    this.currentResolver = null;
    this.init();
  }

  init() {
    eventBus.on('modal:confirm', ({ title, message, confirmText = 'Confirm', isDanger = false, onConfirm }) => {
      this.open({ title, message, confirmText, isDanger, onConfirm });
    });
  }

  open({ title, message, confirmText = 'Confirm', isDanger = false, onConfirm }) {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="modal-dialog">
        <h2 style="font-size: 1.2rem; font-weight: 600;">${escapeHTML(title)}</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">${escapeHTML(message)}</p>
        <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-xs);">
          <button type="button" class="btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="button" class="${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${escapeHTML(confirmText)}</button>
        </div>
      </div>
    `;

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };

    overlay.querySelector('#modal-cancel-btn').addEventListener('click', () => this.close());
    overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => {
      this.close();
      if (typeof onConfirm === 'function') onConfirm();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.addEventListener('keydown', handleKeydown);
    this.activeOverlay = overlay;
    this.cleanupKeydown = () => document.removeEventListener('keydown', handleKeydown);

    this.root.appendChild(overlay);
    overlay.querySelector('#modal-confirm-btn').focus();
  }

  close() {
    if (this.cleanupKeydown) {
      this.cleanupKeydown();
      this.cleanupKeydown = null;
    }
    if (this.activeOverlay && this.activeOverlay.parentNode) {
      this.activeOverlay.parentNode.removeChild(this.activeOverlay);
      this.activeOverlay = null;
    }
  }
}
