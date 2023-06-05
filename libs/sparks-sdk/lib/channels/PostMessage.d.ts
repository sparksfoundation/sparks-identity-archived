import { PublicKeys } from '../forge/types.js';

declare class PostMessage {
    #private;
    target: Window;
    origin: string;
    publicKeys: PublicKeys;
    static generateSharedKey({ keyPairs, publicKeys }: {
        keyPairs: any;
        publicKeys: any;
    }): string;
    constructor({ keyPairs, encrypt, decrypt, sign, verify }: {
        keyPairs: any;
        encrypt: any;
        decrypt: any;
        sign: any;
        verify: any;
    });
    accept({ url }: {
        url: any;
    }): Promise<unknown>;
    connect({ url }: {
        url: any;
    }): Promise<unknown>;
    disconnect(): Promise<unknown>;
    send(data: any): Promise<unknown>;
    on(eventType: any, callback: any): void;
}

export { PostMessage };
