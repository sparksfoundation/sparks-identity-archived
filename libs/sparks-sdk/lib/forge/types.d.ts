declare type KeyPair = {
    publicKey: string;
    secretKey: string;
};
declare type PublicKeys = {
    signing: string;
    encryption: string;
};
declare type SecretKeys = {
    signing: string;
    encryption: string;
};
declare type KeyPairs = {
    signing: KeyPair;
    encryption: KeyPair;
};
declare type PublicSigningKey = string;
declare type RandomForge = {
    signingKeyPair(): Promise<KeyPair>;
    encryptionKeyPair(): Promise<KeyPair>;
    keyPairs(): Promise<KeyPairs>;
};
declare type PasswordForge = {
    signingKeyPair(args: {
        password: string;
        identity: any;
    }): Promise<KeyPair>;
    encryptionKeyPair(args: {
        password: string;
        identity: any;
    }): Promise<KeyPair>;
    keyPairs(args: {
        password: string;
        identity: any;
    }): Promise<KeyPairs>;
};

export { KeyPair, KeyPairs, PasswordForge, PublicKeys, PublicSigningKey, RandomForge, SecretKeys };
