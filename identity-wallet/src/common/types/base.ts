export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = Nullable<Optional<T>>;
export type UnknownObject = Record<string, unknown>;
export type UnknownFunction = (...args: unknown[]) => unknown;