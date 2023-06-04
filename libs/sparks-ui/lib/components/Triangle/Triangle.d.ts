/// <reference types="react" />
import { DivProps } from 'react-html-props';
type TriangleProps = {
    solid?: boolean;
} & DivProps;
export declare const Triangle: ({ className, solid }: TriangleProps) => JSX.Element;
export {};
