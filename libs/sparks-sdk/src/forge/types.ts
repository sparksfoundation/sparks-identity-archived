export type KeyPair = {
  publicKey: string;
  secretKey: string;
}

export type PublicKeys = {
  signing: string;
  encryption: string;
}

export type SecretKeys = {
  signing: string;
  encryption: string;
}

export type KeyPairs = {
  signing: KeyPair;
  encryption: KeyPair;
}

export type PublicSigningKey = string;
export type SecretSigningKey = string;
export type PublicEncryptionKey = string;
export type SecretEncryptionKey = string;

export type RandomForge = () => KeyPairs;
export type PasswordForge = (args: { password: string, identity: any }) => Promise<KeyPairs>;