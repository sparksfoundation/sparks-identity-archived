import { KeyPairs } from './index.js';

declare const signingKeysFromRandom: () => Promise<{
    publicKey: string;
    secretKey: string;
}>;
declare const encryptionKeysFromRandom: () => Promise<{
    publicKey: string;
    secretKey: string;
}>;
declare const keyPairsFromRandom: () => Promise<KeyPairs>;
declare const signingKeysFromPassword: ({ password, salt: noise }: {
    password: any;
    salt: any;
}) => Promise<{
    publicKey: string;
    secretKey: string;
}>;
declare const encryptionKeysFromPassword: ({ password, salt: noise }: {
    password: any;
    salt: any;
}) => Promise<{
    publicKey: string;
    secretKey: string;
}>;
declare const keyPairsFromPassword: ({ password, salt }: {
    password: any;
    salt: any;
}) => Promise<{
    signing: {
        publicKey: string;
        secretKey: string;
    };
    encryption: {
        publicKey: string;
        secretKey: string;
    };
}>;
declare const randomSalt: (len?: number) => string;

export { encryptionKeysFromPassword, encryptionKeysFromRandom, keyPairsFromPassword, keyPairsFromRandom, randomSalt, signingKeysFromPassword, signingKeysFromRandom };
