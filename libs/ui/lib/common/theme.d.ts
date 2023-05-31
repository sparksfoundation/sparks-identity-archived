export declare function getTheme({ defaultTheme, defaultColors }: {
    defaultTheme: any;
    defaultColors: any;
}): {
    extend: {
        fontFamily: {
            sans: any[];
        };
        colors: {
            primary: {
                [k: string]: any;
            };
            secondary: {
                [k: string]: any;
            };
            warning: {
                [k: string]: any;
            };
            danger: {
                [k: string]: any;
            };
            success: {
                [k: string]: any;
            };
            disabled: any;
            fg: any;
            bg: any;
        };
        opacity: {
            '1': string;
            '2': string;
            '4': string;
            '6': string;
            '8': string;
        };
    };
};
export declare const safelist: {
    pattern: RegExp;
    variants: string[];
}[];
