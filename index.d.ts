interface options {
    partner_id?: string;
    container_id?: string;
    origin?: string;
    width?: number;
    height?: number;
    autosize?: boolean;
    debug?: boolean;
    onLoaded?: () => void;
    [x: string]: any;
}
declare type customListener = (data: {
    [x: string]: any;
}) => void;
declare type customizeProps = {
    branding: any;
    palette: any;
};
declare type navigateProps = {
    name: string;
    params?: {
        [x: string]: string | number | boolean;
    };
};
declare type actionProps = {
    name: string;
    params?: {
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
    customizeOnHold?: customizeProps;
    navigateOnHold?: navigateProps;
    actionOnHold?: actionProps;
    onLoaded?: () => void;
    constructor(givenOptions?: options);
    destroy(): void;
    customize(options: customizeProps): void;
    navigate(options: navigateProps): void;
    action(options: actionProps): void;
    mount(): void;
    private listenWidget;
    private unlistenWidget;
    private onMessage;
    private sendEvent;
    private getEmbedUrl;
}
export = MetahiSDK;
