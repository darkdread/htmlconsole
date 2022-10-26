export {};

declare global {
  interface Window {
    htmlConsole: any;
  }
}

export interface ConsoleOverlay {
  overlay: HTMLElement;
  code: HTMLElement;
}