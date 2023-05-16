enum environment {
  development = 'DEVELOPMENT',
  production = 'PRODUCTION',
}

enum eventTypes {
  initialize = 'METAHI_SDK__INITIALIZE',
  show = 'METAHI_SDK__SHOW',
}

enum screenTypes {
  collections = 'COLLECTIONS',
  collection = 'COLLECTION',
  assets = 'ASSETS',
  asset = 'ASSET',
}

enum receiveEventTypes {
  initialized = 'INITIALIZED',
  loaded = 'LOADED',
}

interface options {
  partner_id?: string
  container_id?: string
  environment?: environment
  origin?: string
  width?: number
  height?: number
  autosize?: boolean
  debug?: boolean;
  onLoaded?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}

interface eventOptions {
  type: string
  origin?: string
  data?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
  }
}

type customListener = (data: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}) => void;

type openProps = {
  name: screenTypes;
  params?: { [x: string]: string|number }
  query?: { [x: string]: string|number|boolean };
};

class MetahiSDK {

  partner_id?: string;
  container_id?: string;
  origin: string;
  width?: number;
  height?: number;
  listeners: {
    [x: string]: customListener;
  };
  widgetWindow: Window | null;
  checkIntervalId: number | undefined;
  ready: boolean;
  debug: boolean;
  openOnHold?: openProps;
  onLoaded?: () => void;

  constructor(givenOptions: options = {}) {
    const options: options = { ...givenOptions };

    this.partner_id = options.partner_id;
    this.container_id = options.container_id;
    this.origin = options.origin || (options.environment === environment.production ? 'https://metahi.world' : 'https://metahi.dev');
    this.width = options.autosize ? undefined : options.width;
    this.height = options.autosize ? undefined : options.height;
    this.listeners = options.listeners || {};
    this.widgetWindow = null;
    this.checkIntervalId = undefined;
    this.ready = false;
    this.debug = options.debug || false;
    this.onLoaded = options.onLoaded || undefined;
    this.mount();
  }

  destroy(): void {
    this.unlistenWidget();
  }

  open(options: openProps): void {
    const { name, params, query } = options;
    if (!this.ready) {
      this.openOnHold = { name, params, query };
      return;
    }
    if (this.debug) {
      console.log(`[debug] show ${name} params=${JSON.stringify(params)}`);
    }
    this.sendEvent({
      type: eventTypes.show,
      data: { name, params, query },
      origin: this.origin,
    });
  }

  mount(): void {
    if (!this.container_id) {
      throw Error('No container_id was provided');
    }

    const containerEl = document.querySelector('#' + this.container_id);

    if (!containerEl) {
      throw Error('Container wasn\'t found');
    }

    this.unlistenWidget();

    const iframe = document.createElement('iframe');

    iframe.style.border = 'none';
    iframe.style.width = this.width ? (this.width + 'px') : '100%';
    iframe.style.height = this.height ? (this.height + 'px') : '100%';
    iframe.setAttribute('src', this.getEmbedUrl());
    iframe.setAttribute('allow', 'camera *; microphone *');
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-same-origin');

    containerEl.innerHTML = '';
    containerEl.appendChild(iframe);

    this.widgetWindow = iframe.contentWindow;

    iframe.onload = () => {
      this.sendEvent({
        type: eventTypes.initialize,
        data: {
          partnerId: this.partner_id,
        },
      });
    }

    this.listenWidget();
  }

  private listenWidget(): void {
    window.addEventListener('message', this.onMessage);

    const checkLiveness = (): void => {
      const alive = this.widgetWindow && !this.widgetWindow.closed;

      if (alive) return;

      this.unlistenWidget();
    };

    this.checkIntervalId = window.setInterval(checkLiveness, 200);
  }

  private unlistenWidget(): void {
    if (!this.checkIntervalId) return;

    clearInterval(this.checkIntervalId);

    this.checkIntervalId = undefined;

    window.removeEventListener('message', this.onMessage);

  }

  private onMessage = (event: MessageEvent): void => {
    const thisWidgetEvent = event.source === this.widgetWindow;
    const isDataObject = typeof event.data === 'object';

    if (!thisWidgetEvent || !isDataObject) return;

    if (this.debug) {
      console.info('[debug] onMessage', event.data.type);
    }

    switch (event.data.type) {
      case receiveEventTypes.initialized:
        this.ready = true;
        if (this.openOnHold) {
          this.open(this.openOnHold);
          this.openOnHold = undefined;
        }
        break;
      default:
        break;
    }

    const customListener = this.listeners[event.data.type];
    customListener?.(event.data.data);
  }

  private sendEvent(options: eventOptions): void {
    if (this.debug) {
      console.info('[debug] sendEvent', options.type);
    }
    // if (!options.data) return;

    this.widgetWindow?.postMessage({
      type: options.type,
      data: options.data,
    }, options.origin || this.origin);
  }

  private getEmbedUrl(): string {
    return `${this.origin}/iframe`;
  }
}

export = MetahiSDK;