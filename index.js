"use strict";
var eventTypes;
(function (eventTypes) {
    eventTypes["initialize"] = "METAHI_SDK__INITIALIZE";
    eventTypes["customize"] = "METAHI_SDK__CUSTOMIZE";
    eventTypes["navigate"] = "METAHI_SDK__NAVIGATE";
    eventTypes["action"] = "METAHI_SDK__ACTION";
})(eventTypes || (eventTypes = {}));
var receiveEventTypes;
(function (receiveEventTypes) {
    receiveEventTypes["initialized"] = "INITIALIZED";
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
                    if (this.customizeOnHold) {
                        this.customize(this.customizeOnHold);
                        this.customizeOnHold = undefined;
                    }
                    if (this.navigateOnHold) {
                        this.navigate(this.navigateOnHold);
                        this.navigateOnHold = undefined;
                    }
                    if (this.actionOnHold) {
                        this.action(this.actionOnHold);
                        this.actionOnHold = undefined;
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
        this.origin = options.origin || 'https://metahi.dev';
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
    customize(options) {
        const { branding = null, palette = null } = options;
        if (!this.ready) {
            this.customizeOnHold = { branding, palette };
            return;
        }
        if (this.debug) {
            console.log(`[debug] customize`);
        }
        this.sendEvent({
            type: eventTypes.customize,
            data: { branding, palette },
            origin: this.origin,
        });
    }
    navigate(options) {
        const { name, params } = options;
        if (!this.ready) {
            this.navigateOnHold = { name, params };
            return;
        }
        if (this.debug) {
            console.log(`[debug] navigate name=${name} params=${JSON.stringify(params)}`);
        }
        this.sendEvent({
            type: eventTypes.navigate,
            data: { name, params },
            origin: this.origin,
        });
    }
    action(options) {
        const { name, params } = options;
        if (!this.ready) {
            this.actionOnHold = { name, params };
            return;
        }
        if (this.debug) {
            console.log(`[debug] action name=${name} params=${JSON.stringify(params)}`);
        }
        this.sendEvent({
            type: eventTypes.action,
            data: { name, params },
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
        return `${this.origin}`;
    }
}
module.exports = MetahiSDK;
