/// <reference types="react" />
import { DivProps } from 'react-html-props';
type NoiseBackgroundProps = {
    shade?: 'light' | 'medium' | 'dark';
} & DivProps;
export declare const NoiseBackground: ({ shade }: NoiseBackgroundProps) => JSX.Element;
export {};
