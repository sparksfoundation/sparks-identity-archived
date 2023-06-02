export type KeyPair = {
  publicKey: string;
  secretKey: string;
};

export type PublicKeys = {
  encryption: string;
  signing: string;
};

export type SecretKeys = {
  encryption: string;
  signing: string;
};

export type KeyPairs = {
  encryption: KeyPair;
  signing: KeyPair;
};
