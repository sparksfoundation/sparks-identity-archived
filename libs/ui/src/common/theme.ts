// @ts-ignore
import chroma from 'chroma-js'

function saturation(colors: object, amnt = 0) {
    return Object.fromEntries(Object.entries(colors)
        .map(([key, val]) => {
            const update = amnt < 0 ?
                chroma(val).desaturate(amnt * -1) :
                chroma(val).saturate(amnt);
            return [key, update.toString()]
        }))
}

export function getTheme({ defaultTheme, defaultColors }: { defaultTheme: any, defaultColors: any }) {
    return {
        extend: {
            animation: {
              'fade-in': 'fadeIn 500ms linear',
            },
            keyframes: {
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              }
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: saturation(defaultColors.indigo, -2),
                secondary: saturation(defaultColors.sky, -.5),
                warning: saturation(defaultColors.orange, -1.5),
                danger: saturation(defaultColors.red, -.75),
                success: saturation(defaultColors.emerald, -1),
                disabled: defaultColors.zinc,
                fg: defaultColors.zinc,
                bg: defaultColors.zinc,
            },
            borderRadius: {
                '4xl': '2rem',
            },
            maxWidth: {
                '1/4': '25%',
                '1/3': '33.333%',
                '5/12': '41.666%',
                '1/2': '50%',
                '7/12': '58.333%',
                '2/3': '66.666%',
                '3/4': '75%',
            },
            maxHeight: {
                '1/4': '25%',
                '1/3': '33.333%',
                '5/12': '41.666%',
                '1/2': '50%',
                '7/12': '58.333%',
                '2/3': '66.666%',
                '3/4': '75%',
            },
            screens: {
                '800': '800px',
                '500': '500px',
            },
            opacity: {
                '1': '0.01',
                '2': '0.02',
                '4': '0.04',
                '6': '0.06',
                '8': '0.08',
            },
            backdropBlur: {
                '2xs': '1px',
                'xs': '2px',
            }
        }
    }
}

export const safelist = [
    {
        pattern: /(divide|border|bg|text|ring|shadow|caret|accent)-(primary|secondary|warning|danger|success|disabled|fg|bg)-.*/,
        variants: [
            'hover', 'focus', 'disabled', 'invalid', 'dark',
            'dark:hover', 'darks:focus', 'dark:disabled', 'darks:invalid',
            'focus:invalid', 'hover:invalid'
        ]
    }
]
