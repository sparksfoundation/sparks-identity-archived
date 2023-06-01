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
declare type InceptionEvent = {};
declare type RotationEvent = {};
declare type DeletionEvent = {};
declare type KeyEvents = InceptionEvent | RotationEvent | DeletionEvent;
declare type AttestationEvent = {};
declare type RevocationEvent = {};
declare type CredentialEvents = AttestationEvent | RevocationEvent;
declare type DisclosureEvent = {};
declare type SelectiveDiscloureEvent = {};
declare type PredicateEvent = {};
declare type VerificationEvents = DisclosureEvent | SelectiveDiscloureEvent | PredicateEvent;
declare type PaymentIssuedEvent = {};
declare type PaymentRecievedEvent = {};
declare type PaymentSettledEvent = {};
declare type TransactionEvents = PaymentIssuedEvent | PaymentRecievedEvent | PaymentSettledEvent;

export { AttestationEvent, CredentialEvents, DeletionEvent, DisclosureEvent, InceptionEvent, KeyEvents, KeyPair, KeyPairs, PaymentIssuedEvent, PaymentRecievedEvent, PaymentSettledEvent, PredicateEvent, PublicKeys, RevocationEvent, RotationEvent, SecretKeys, SelectiveDiscloureEvent, TransactionEvents, VerificationEvents };
