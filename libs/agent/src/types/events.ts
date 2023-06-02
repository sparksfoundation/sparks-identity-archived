export type Event = {
  eventIndex: string;
  signatureThreshold: string;
  witnessThreshold: string;
  witnesses: string[];
  nextKeys?: string[];
  configuration: object | object[] | string[];
};

export type InceptionEvent = Event & { inceptionId: string }; // the additional objects are examples of what some additional fields could be, still figuring this out
export type RotationEvent = Event & { rotationId: string };
export type DeletionEvent = Event & { deletionId: string };
export type KeyEvents = InceptionEvent | RotationEvent | DeletionEvent;

export type AttestationEvent = { attestationId: string };
export type RevocationEvent = { revocationId: string };
export type CredentialEvents = AttestationEvent | RevocationEvent;

export type DisclosureEvent = { dId: string };
export type SelectiveDiscloureEvent = { sDId: string };
export type PredicateEvent = { pId: string };
export type VerificationEvents =
  | DisclosureEvent
  | SelectiveDiscloureEvent
  | PredicateEvent;

export type PaymentIssuedEvent = { piId: string };
export type PaymentRecievedEvent = { prId: string };
export type PaymentSettledEvent = { psId: string };
export type TransactionEvents =
  | PaymentIssuedEvent
  | PaymentRecievedEvent
  | PaymentSettledEvent;
