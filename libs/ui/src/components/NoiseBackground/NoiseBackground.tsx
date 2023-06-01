import React from 'react'
import { clsxm } from "../../common/clsxm"
import { DivProps } from 'react-html-props';

const specks = (color = "#000") => (btoa(`
    <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
        <filter id='noiseFilter'>
            <feTurbulence
            type='fractalNoise'
            baseFrequency='2.31'
            numOctaves='6'
            stitchTiles='stitch'/>
        </filter>
        <rect width='100%' height='100%' fill="${color}" filter='url(#noiseFilter)'/>
    </svg>
`))

type NoiseBackgroundProps = {
    shade?: 'light' | 'medium' | 'dark';
} & DivProps

export const NoiseBackground = ({ shade = 'medium' }: NoiseBackgroundProps) => {
    return (
        <div
            className={clsxm(
                'h-full w-full absolute top-0 left-0',
                shade === 'light' && 'bg-white dark:bg-bg-900',
                shade === 'medium' && 'bg-bg-200 dark:bg-bg-950',
                shade === 'dark' && 'bg-bg-300 dark:bg-black',
            )}
        >
            <div
                className={clsxm("h-full w-full absolute top-0 left-0 opacity-40 dark:opacity-10")}
                style={{ background: `url(data:image/svg+xml;base64,${specks()})` }}
            />
        </div>
    )
}