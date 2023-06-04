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

export type RandomForge = {
  signingKeyPair(): Promise<KeyPair>;
  encryptionKeyPair(): Promise<KeyPair>;
  keyPairs(): Promise<KeyPairs>;
}

export type PasswordForge = {
  signingKeyPair(args: { password: string, identity: any }): Promise<KeyPair>;
  encryptionKeyPair(args: { password: string, identity: any }): Promise<KeyPair>;
  keyPairs(args: { password: string, identity: any }): Promise<KeyPairs>;
}