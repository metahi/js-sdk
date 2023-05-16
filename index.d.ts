declare enum environment {
    development = "DEVELOPMENT",
    production = "PRODUCTION"
}
declare enum screenTypes {
    collections = "COLLECTIONS",
    collection = "COLLECTION",
    assets = "ASSETS",
    asset = "ASSET"
}
interface options {
    partner_id?: string;
    container_id?: string;
    environment?: environment;
    origin?: string;
    width?: number;
    height?: number;
    autosize?: boolean;
    debug?: boolean;
    onLoaded?: () => void;
    [x: string]: any;
}
type customListener = (data: {
    [x: string]: any;
}) => void;
type openProps = {
    name: screenTypes;
    params?: {
        [x: string]: string | number;
    };
    query?: {
        [x: string]: string | number | boolean;
    };
};
declare class MetahiSDK {
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
    constructor(givenOptions?: options);
    destroy(): void;
    open(options: openProps): void;
    mount(): void;
    private listenWidget;
    private unlistenWidget;
    private onMessage;
    private sendEvent;
    private getEmbedUrl;
}
export = MetahiSDK;
