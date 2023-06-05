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
declare type SecretSigningKey = string;
declare type PublicEncryptionKey = string;
declare type SecretEncryptionKey = string;
declare type RandomForge = () => KeyPairs;
declare type PasswordForge = (args: {
    password: string;
    identity: any;
}) => Promise<KeyPairs>;

export { KeyPair, KeyPairs, PasswordForge, PublicEncryptionKey, PublicKeys, PublicSigningKey, RandomForge, SecretEncryptionKey, SecretKeys, SecretSigningKey };
