import { KeyPairs, PublicSigningKey } from '../forge/types.js';

declare type InceptProps = undefined | {
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers?: PublicSigningKey[];
};
declare type RotateProps = undefined | {
    keyPairs: KeyPairs;
    nextKeyPairs: KeyPairs;
    backers?: PublicSigningKey[];
};
interface IdentityInterface {
    incept(args?: InceptProps): void | never;
    rotate(args?: RotateProps): void | never;
    destroy(): void | never;
    encrypt({ data, publicKey, sharedKey }: {
        data: object | string;
        publicKey?: string;
        sharedKey?: string;
    }): string;
    decrypt({ data, publicKey, sharedKey }: {
        data: object | string;
        publicKey?: string;
        sharedKey?: string;
    }): string;
    sign({ message, detached }: {
        message: object | string;
        detached?: boolean;
    }): string;
    verify({ publicKey, signature, message }: {
        publicKey: string;
        signature: string;
        message: object | string;
    }): boolean | string;
    toJSON(): object;
    identifier: string;
    keyEventLog: object[];
}
declare class Identity implements IdentityInterface {
    #private;
    private __parseJSON;
    constructor();
    get identifier(): string;
    get keyEventLog(): object[];
    incept(args?: InceptProps): void;
    rotate(args?: RotateProps): void;
    destroy(): void;
    encrypt({ data, publicKey, sharedKey }: {
        data: object | string;
        publicKey?: string;
        sharedKey?: string;
    }): string;
    decrypt({ data, publicKey, sharedKey }: {
        data: object | string;
        publicKey?: string;
        sharedKey?: string;
    }): string;
    sign({ message, detached }: {
        message: object | string;
        detached?: boolean;
    }): string;
    verify({ publicKey, signature, message }: {
        publicKey: any;
        signature: any;
        message: any;
    }): any;
    toJSON(): {
        identifier: string;
        keyEventLog: object[];
    };
}

export { Identity };