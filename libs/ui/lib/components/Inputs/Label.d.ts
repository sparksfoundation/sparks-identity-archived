/// <reference types="react" />
import { LabelProps } from 'react-html-props';
type LabelExtendedProps = {
    id?: string;
    children: string;
} & LabelProps;
export declare const Label: ({ id, children, ...props }: LabelExtendedProps) => JSX.Element;
export {};
