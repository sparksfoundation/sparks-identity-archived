declare type KeyPair = {
    publicKey: string;
    secretKey: string;
};
declare type PublicKeys = {
    encryption: string;
    signing: string;
};
declare type SecretKeys = {
    encryption: string;
    signing: string;
};
declare type KeyPairs = {
    encryption: KeyPair;
    signing: KeyPair;
};

export { KeyPair, KeyPairs, PublicKeys, SecretKeys };
