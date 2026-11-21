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
    eventBus.on('modal:help', () => this.openHelp());
    document.getElementById('btn-help')?.addEventListener('click', () => this.openHelp());
  }

  openHelp() {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const isMac = navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? '⌘' : 'Ctrl';

    overlay.innerHTML = `
      <div class="modal-dialog modal-help">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
          <h2 style="font-size:1.05rem; font-weight:700;">Shortcuts & Overview</h2>
          <button type="button" class="icon-btn-sm" id="modal-close-help" title="Close" aria-label="Close">✕</button>
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-row"><span>New Note</span><span class="keys"><kbd>${cmdKey}</kbd> + <kbd>N</kbd> or <kbd>Alt</kbd> + <kbd>N</kbd></span></div>
          <div class="shortcut-row"><span>Toggle Sidebar</span><span class="keys"><kbd>${cmdKey}</kbd> + <kbd>\\</kbd> or <kbd>|</kbd></span></div>
          <div class="shortcut-row"><span>Search Notes</span><span class="keys"><kbd>${cmdKey}</kbd> + <kbd>K</kbd></span></div>
          <div class="shortcut-row"><span>Focus Mode</span><span class="keys"><kbd>${cmdKey}</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></span></div>
          <div class="shortcut-row"><span>Export PDF</span><span class="keys"><kbd>${cmdKey}</kbd> + <kbd>P</kbd></span></div>
          <div class="shortcut-row"><span>Help Cheatsheet</span><span class="keys"><kbd>?</kbd> or <kbd>${cmdKey}</kbd> + <kbd>/</kbd></span></div>
          <div class="shortcut-row"><span>Dismiss / Exit Focus</span><span class="keys"><kbd>Esc</kbd></span></div>
        </div>
        <div class="help-info-footer">
          <p>Offline-First • IndexedDB • 5 Themes (Folio, Resin, Longhorn, Studio, Mac 1984)</p>
        </div>
      </div>
    `;

    const handleKeydown = (e) => { if (e.key === 'Escape') this.close(); };
    overlay.querySelector('#modal-close-help').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    document.addEventListener('keydown', handleKeydown);
    this.activeOverlay = overlay;
    this.cleanupKeydown = () => document.removeEventListener('keydown', handleKeydown);
    this.root.appendChild(overlay);
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
