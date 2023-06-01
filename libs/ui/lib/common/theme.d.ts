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
        borderRadius: {
            '4xl': string;
        };
        maxWidth: {
            '1/4': string;
            '1/3': string;
            '5/12': string;
            '1/2': string;
            '7/12': string;
            '2/3': string;
            '3/4': string;
        };
        maxHeight: {
            '1/4': string;
            '1/3': string;
            '5/12': string;
            '1/2': string;
            '7/12': string;
            '2/3': string;
            '3/4': string;
        };
        screens: {
            '800': string;
            '500': string;
        };
        opacity: {
            '1': string;
            '2': string;
            '4': string;
            '6': string;
            '8': string;
        };
        backdropBlur: {
            '2xs': string;
            xs: string;
        };
    };
};
export declare const safelist: {
    pattern: RegExp;
    variants: string[];
}[];
