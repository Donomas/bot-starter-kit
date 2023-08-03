export interface QueueItem {
    phone: string;
    promises: { resolve: (value: any) => void, type: string }[];
}

export interface IUserConstructor {
    id: number;
    user_name?: string;
}

export interface ITelegramAccountConnector {
    api_id: number;
    api_hash: string;
    phone: string;
    proxy: any;
    key: string
}

export interface AccountConnectionPermissionQueue {
    promise: Promise<any>;
    resolve: (value: any) => void;
}

export interface ISpamObject {
    date: number;
    notification: boolean;
}