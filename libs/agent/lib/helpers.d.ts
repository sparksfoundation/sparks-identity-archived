import { KeyPair } from './index.js';

declare function randomKeyPair(): {
    encryption: {
        publicKey: string;
        secretKey: string;
    };
    signing: {
        publicKey: string;
        secretKey: string;
    };
};
declare function keyPairFromPassword({ nonce, password, signing }: {
    nonce: string;
    password: string;
    signing: boolean;
}): Promise<KeyPair>;
declare function nonceAndKeyPairFromPassword({ password }: {
    password: string;
}): Promise<(KeyPair & {
    nonce: string;
})>;
declare function decrypt(encrypted: string, keyPair: KeyPair): any;
declare function encrypt(decrypted: object, keyPair: any): string;

export { decrypt, encrypt, keyPairFromPassword, nonceAndKeyPairFromPassword, randomKeyPair };
