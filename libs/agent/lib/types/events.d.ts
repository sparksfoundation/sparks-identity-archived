declare type Event = {
    eventIndex: string;
    signatureThreshold: string;
    witnessThreshold: string;
    witnesses: string[];
    nextKeys?: string[];
    configuration: object | object[] | string[];
};
declare type InceptionEvent = Event & {
    inceptionId: string;
};
declare type RotationEvent = Event & {
    identifier: string;
    eventType: string;
    signingKeys: string[];
    version: string;
    selfAddressingIdentifier: string;
};
declare type DeletionEvent = Event & {
    deletionId: string;
};
declare type KeyEvents = InceptionEvent | RotationEvent | DeletionEvent;
declare type AttestationEvent = {
    attestationId: string;
};
declare type RevocationEvent = {
    revocationId: string;
};
declare type CredentialEvents = AttestationEvent | RevocationEvent;
declare type DisclosureEvent = {
    dId: string;
};
declare type SelectiveDiscloureEvent = {
    sDId: string;
};
declare type PredicateEvent = {
    pId: string;
};
declare type VerificationEvents = DisclosureEvent | SelectiveDiscloureEvent | PredicateEvent;
declare type PaymentIssuedEvent = {
    piId: string;
};
declare type PaymentRecievedEvent = {
    prId: string;
};
declare type PaymentSettledEvent = {
    psId: string;
};
declare type TransactionEvents = PaymentIssuedEvent | PaymentRecievedEvent | PaymentSettledEvent;

export { AttestationEvent, CredentialEvents, DeletionEvent, DisclosureEvent, Event, InceptionEvent, KeyEvents, PaymentIssuedEvent, PaymentRecievedEvent, PaymentSettledEvent, PredicateEvent, RevocationEvent, RotationEvent, SelectiveDiscloureEvent, TransactionEvents, VerificationEvents };
