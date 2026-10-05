// Types for win95.js. The script adds one global, `W95`, and a handful of DOM events.

export type W95Scheme = 'standard' | 'desert' | 'rainy-day' | 'eggplant' | 'high-contrast';

export interface W95API {
  /** Open a window by id (or element), give it a taskbar button and bring it to the front. */
  open(id: string | HTMLElement): void;
  /** Close a window and remove its taskbar button. */
  close(id: string | HTMLElement): void;
  /** Bring a window to the front without opening it. */
  focus(id: string | HTMLElement): void;
  /** Show the "It's now safe to turn off your computer" screen. */
  shutdown(): void;
  /** Read the colour scheme, or set it on <html>. `standard` removes the attribute. */
  scheme(name?: W95Scheme): W95Scheme;
  /** The schemes win95.css ships. */
  readonly schemes: readonly W95Scheme[];
  /** Open a .w95-menu as a right-click menu at viewport coordinates. */
  contextMenu(menu: string | HTMLElement, x: number, y: number): void;
  /** Close every open menu, submenu and right-click menu. */
  closeMenus(): void;
}

declare global {
  interface Window {
    W95: W95API;
  }
  const W95: W95API;

  interface HTMLElementEventMap {
    /** Fired on a .w95-window after it opens. Bubbles. */
    'w95:open': CustomEvent<void>;
    /** Fired on a .w95-window after it closes. Bubbles. */
    'w95:close': CustomEvent<void>;
    /** Fired on a .w95-menu when it opens as a right-click menu. `target` is what was clicked. */
    'w95:contextmenu': CustomEvent<{ target: EventTarget | null }>;
  }
  interface DocumentEventMap {
    /** Fired on document when W95.scheme() changes the colour scheme. */
    'w95:scheme': CustomEvent<{ scheme: W95Scheme }>;
  }
}

export {};
