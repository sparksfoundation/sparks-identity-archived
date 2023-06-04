/// <reference types="react" />
import { LabelProps } from 'react-html-props';
type LabelExtendedProps = {
    id?: string;
    children: string;
    className?: string;
} & LabelProps;
export declare const Label: ({ id, children, className, ...props }: LabelExtendedProps) => JSX.Element;
export {};
