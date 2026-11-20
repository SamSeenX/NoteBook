# RULES.md - Project Specific Constraints

## 1. 200-Line Code Rule
- Every JavaScript module (`.js`) and CSS stylesheet (`.css`) must stay under 200 lines.
- Split files proactively once they reach approximately 180 lines.

## 2. Zero Runtime Dependencies
- No frontend frameworks (React, Vue, Svelte, Angular).
- No CSS utility frameworks (Tailwind, Bootstrap).
- Standard Vanilla JavaScript (ES6 Modules) and standard modern CSS.

## 3. Storage Hierarchy
- Lightweight UI config in `localStorage`.
- Heavy document data in `IndexedDB`.
- Never block rendering on storage writes; use debounced asynchronous writes.

## 4. Touch & Accessibility
- Minimum 48px touch targets for all interactive buttons and inputs.
- Safe area inset padding for modern mobile displays (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- Accessible keyboard shortcuts for core workflows.
