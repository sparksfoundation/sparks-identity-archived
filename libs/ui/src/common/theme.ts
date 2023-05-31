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
            opacity: {
                '1': '0.01',
                '2': '0.02',
                '4': '0.04',
                '6': '0.06',
                '8': '0.08',
            },
        }
    }
}
