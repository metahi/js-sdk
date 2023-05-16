"use strict";
var environment;
(function (environment) {
    environment["development"] = "DEVELOPMENT";
    environment["production"] = "PRODUCTION";
})(environment || (environment = {}));
var eventTypes;
(function (eventTypes) {
    eventTypes["initialize"] = "METAHI_SDK__INITIALIZE";
    eventTypes["show"] = "METAHI_SDK__SHOW";
})(eventTypes || (eventTypes = {}));
var screenTypes;
(function (screenTypes) {
    screenTypes["collections"] = "COLLECTIONS";
    screenTypes["collection"] = "COLLECTION";
    screenTypes["assets"] = "ASSETS";
    screenTypes["asset"] = "ASSET";
})(screenTypes || (screenTypes = {}));
var receiveEventTypes;
(function (receiveEventTypes) {
    receiveEventTypes["initialized"] = "INITIALIZED";
    receiveEventTypes["loaded"] = "LOADED";
})(receiveEventTypes || (receiveEventTypes = {}));
class MetahiSDK {
    constructor(givenOptions = {}) {
        this.onMessage = (event) => {
            const thisWidgetEvent = event.source === this.widgetWindow;
            const isDataObject = typeof event.data === 'object';
            if (!thisWidgetEvent || !isDataObject)
                return;
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
            customListener === null || customListener === void 0 ? void 0 : customListener(event.data.data);
        };
        const options = Object.assign({}, givenOptions);
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
    destroy() {
        this.unlistenWidget();
    }
    open(options) {
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
    mount() {
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
        };
        this.listenWidget();
    }
    listenWidget() {
        window.addEventListener('message', this.onMessage);
        const checkLiveness = () => {
            const alive = this.widgetWindow && !this.widgetWindow.closed;
            if (alive)
                return;
            this.unlistenWidget();
        };
        this.checkIntervalId = window.setInterval(checkLiveness, 200);
    }
    unlistenWidget() {
        if (!this.checkIntervalId)
            return;
        clearInterval(this.checkIntervalId);
        this.checkIntervalId = undefined;
        window.removeEventListener('message', this.onMessage);
    }
    sendEvent(options) {
        var _a;
        if (this.debug) {
            console.info('[debug] sendEvent', options.type);
        }
        // if (!options.data) return;
        (_a = this.widgetWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
            type: options.type,
            data: options.data,
        }, options.origin || this.origin);
    }
    getEmbedUrl() {
        return `${this.origin}/iframe`;
    }
}
module.exports = MetahiSDK;
