// import "@/style.css";
// import vueSvg from "@/assets/vue.svg?raw";

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

/**
 * Utility function to add replaceable CSS.
 * @param {string} styleString
 */
const addStyle = (() => {
  const style = document.createElement("style");
  document.head.appendChild(style);
  return (styleString: string) => (style.textContent = styleString);
})();

interface ConsoleOverlay {
  overlay: HTMLElement;
  code: HTMLElement;
  buttonParent: HTMLElement;
  toggle: HTMLButtonElement;
  clear: HTMLButtonElement;
}

interface Bounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

type Optional<T> = {
  [key in keyof T]?: T[key];
};

type ValueMap<T, V> = {
  [key in keyof T]: V;
};

enum KeyBindings {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface Config {
  step: number;
}

class HTMLConsole {
  static instance: HTMLConsole;
  static createInterval: number;
  private _console?: ConsoleOverlay;
  private _bounds?: Bounds;
  private _config: Config = {
    step: 1,
  };

  static init(config?: Config) {
    if (HTMLConsole.instance) {
      return HTMLConsole.instance;
    }

    HTMLConsole.instance = new HTMLConsole();
    if (config) {
      HTMLConsole.instance._config = config;
    }

    console.log("Try create HTMLConsole instance");
    const tryCreateInstance = () => {
      if (!document.body) {
        if (!HTMLConsole.createInterval) {
          HTMLConsole.createInterval = setInterval(tryCreateInstance, 1000);
        }
        return false;
      }

      const createBtn = (name: string, callback: (ev: MouseEvent) => any) => {
        const btn = document.createElement("button");
        btn.innerText = name;
        btn.addEventListener("click", callback.bind(HTMLConsole.instance));
        return btn;
      };

      const createConsole = (
        toggle: HTMLButtonElement,
        clear: HTMLButtonElement
      ) => {
        const buttonParent = document.createElement("div");
        const overlay = document.createElement("pre");
        const code = document.createElement("code");
        overlay.appendChild(code);
        document.body.appendChild(overlay);
        overlay.classList.add("overlay");
        buttonParent.classList.add("overlay-btn");
        buttonParent.appendChild(toggle);
        buttonParent.appendChild(clear);
        document.body.appendChild(buttonParent);

        HTMLConsole.instance._console = {
          overlay,
          code,
          buttonParent,
          toggle,
          clear,
        };
        HTMLConsole.instance._bounds = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };
        HTMLConsole.instance.resize(HTMLConsole.instance._bounds);
      };

      const toggleBtn = createBtn("HTMLConsole", HTMLConsole.instance.ontoggle);
      const clearBtn = createBtn("Clear", HTMLConsole.instance.clearLogs);
      createConsole(toggleBtn, clearBtn);

      clearInterval(HTMLConsole.createInterval);
      addStyle(`
        .overlay {
          position:absolute;
          background-color:rgba(0, 0, 0, 0.85);
          background: url(data:;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAABl0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuNUmK/OAAAAATSURBVBhXY2RgYNgHxGAAYuwDAA78AjwwRoQYAAAAAElFTkSuQmCC) repeat scroll transparent; /* ie fallback png background image */
          z-index:9999;
          color:white;
          -ms-user-select: all !important;
          -moz-user-select: all !important;
          -webkit-user-select: all !important;
          user-select: all !important;
          cursor: auto !important;
        }
        .overlay-btn {
          position:absolute;
          top:0;
          z-index:10000;
        }
      `);

      const e = new Event("success");
      // HTMLConsole.instance.dispatchEvent(e);
      HTMLConsole.instance.onsuccess(e);
      return true;
    };

    setTimeout(tryCreateInstance, 0);
    return HTMLConsole.instance;
  }

  registerKeyEvents = (bindings: ValueMap<Optional<Bounds>, string>) => {
    console.log("REGISTER");
    window.addEventListener("keydown", (e) => {
      if (!this._console || this._console.overlay.hidden) {
        return;
      }

      const sign = e.shiftKey ? -1 : 1;
      if (e.key.toLowerCase() === bindings.top) {
        this.resize({ top: this._config.step * sign });
      } else if (e.key.toLowerCase() === bindings.bottom) {
        this.resize({ bottom: this._config.step * sign });
      } else if (e.key.toLowerCase() === bindings.right) {
        this.resize({ right: this._config.step * sign });
      } else if (e.key.toLowerCase() === bindings.left) {
        this.resize({ left: this._config.step * sign });
      }
    });
  };

  resize({ top, left, bottom, right }: Optional<Bounds>) {
    if (!this._console?.overlay) {
      return;
    }

    if (!this._bounds) {
      this._bounds = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      };
    }

    if (top !== undefined) {
      this._bounds.top =
        this._bounds.top + top + this._bounds.bottom > 100
          ? this._bounds.top
          : this._bounds.top + top;
      this._bounds.top = this._bounds.top < 0 ? 0 : this._bounds.top;
      this._console.overlay.style.top = `${this._bounds.top}vh`;
    }
    if (bottom !== undefined) {
      this._bounds.bottom =
        this._bounds.bottom + bottom + this._bounds.top > 100
          ? this._bounds.bottom
          : this._bounds.bottom + bottom;
      this._bounds.bottom = this._bounds.bottom < 0 ? 0 : this._bounds.bottom;
      this._console.overlay.style.bottom = `${this._bounds.bottom}vh`;
    }
    if (left !== undefined) {
      this._bounds.left =
        this._bounds.left + left + this._bounds.right > 100
          ? this._bounds.left
          : this._bounds.left + left;
      this._bounds.left = this._bounds.left < 0 ? 0 : this._bounds.left;
      this._console.overlay.style.left = `${this._bounds.left}vw`;
    }
    if (right !== undefined) {
      this._bounds.right =
        this._bounds.right + right + this._bounds.left > 100
          ? this._bounds.right
          : this._bounds.right + right;
      this._bounds.right = this._bounds.right < 0 ? 0 : this._bounds.right;
      this._console.overlay.style.right = `${this._bounds.right}vw`;
    }
  }

  ontoggle(this: HTMLConsole, event: Event) {
    if (!this._console?.overlay) {
      return false;
    }
    this._console.overlay.hidden = !this._console.overlay.hidden;
  }

  onsuccess(this: HTMLConsole, event: Event) {}

  private append(message: string) {
    const span = document.createElement("span");
    span.innerText = message;
    this._console?.code.appendChild(span);
  }

  clearLogs() {
    if (!this._console?.overlay) {
      return false;
    }

    while (this._console.code.firstChild) {
      this._console.code.removeChild(this._console.code.firstChild);
    }
  }

  log(...args: any[]) {
    for (const arg of args) {
      if (typeof arg === "string") {
        this.append(arg);
      } else if (typeof arg === "object") {
        this.append(JSON.stringify(arg, getCircularReplacer(), 2));
      }
    }
  }
}

// alert("test");
// alert(vueSvg);

let htmlConsole: HTMLConsole = HTMLConsole.init({ step: 5 });
htmlConsole.onsuccess = (e) => {
  console.log = htmlConsole.log.bind(htmlConsole);
  // console.log(window);
  htmlConsole.registerKeyEvents({
    bottom: "j",
    left: "h",
    right: "l",
    top: "k",
  });
  // htmlConsole.log(window);
};
window.htmlConsole = htmlConsole;

// const asd = indexedDB.open("");
// asd.onsuccess;
