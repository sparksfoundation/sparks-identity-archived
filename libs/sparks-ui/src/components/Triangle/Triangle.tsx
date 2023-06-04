
import React from 'react';
import { clsxm } from "../../common/clsxm";
import { DivProps } from 'react-html-props'

const Solid = ({ className = '' }: DivProps) => (
  <div className={clsxm('absolute w-64 h-64 md:w-96 md:h-96 scale-105 opacity-60 dark:opacity-60 flex', className)}>
    <div className="absolute top-1/2 left-1/2 w-2/5 h-2/5 rounded-md bg-primary-500 bg-opacity-20" style={{ transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' }}></div>
    <div className="absolute top-1/2 left-1/2 w-3/5 h-3/5 rounded-md bg-primary-500 bg-opacity-20" style={{ transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' }}></div>
  </div>
)

const Outline = ({ className = '' }: DivProps) => (
  <div className={clsxm('absolute w-64 h-64 md:w-96 md:h-96 scale-105 opacity-60 dark:opacity-60 flex', className)}>
    <div className="absolute top-1/2 left-1/2 w-1/5 h-1/5 rounded-md border-8 border-primary-500/20" style={{ transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' }}></div >
    <div className="absolute top-1/2 left-1/2 w-2/5 h-2/5 rounded-md border-8 border-primary-500/20" style={{ transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' }}></div>
    <div className="absolute top-1/2 left-1/2 w-3/5 h-3/5 rounded-md border-8 border-primary-500/20" style={{ transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' }}></div>
  </div >
)

type TriangleProps = {
  solid?: boolean
} & DivProps

export const Triangle = ({ className = '', solid = false } : TriangleProps) => {
  return solid ? <Solid className={className} /> : <Outline className={className} />
}
