import{j as a,c as l}from"./clsxm-e1834c90.js";const i=(e="#000")=>btoa(`
    <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>
        <filter id='noiseFilter'>
            <feTurbulence 
            type='fractalNoise' 
            baseFrequency='2.31' 
            numOctaves='6' 
            stitchTiles='stitch'/>
        </filter>
        <rect width='100%' height='100%' fill="${e}" filter='url(#noiseFilter)'/>
    </svg>
`),t=({shade:e="medium"})=>a("div",{className:l(" h-full w-full absolute top-0 left-0",e==="light"&&"bg-white dark:bg-bg-900",e==="medium"&&"bg-bg-200 dark:bg-bg-950",e==="dark"&&"bg-bg-300 dark:bg-black"),children:a("div",{className:l("h-full w-full absolute top-0 left-0 opacity-40 dark:opacity-10"),style:{background:`url(data:image/svg+xml;base64,${i()})`}})});try{t.displayName="NoiseBackground",t.__docgenInfo={description:"",displayName:"NoiseBackground",props:{shade:{defaultValue:{value:"medium"},description:"",name:"shade",required:!1,type:{name:"enum",value:[{value:'"light"'},{value:'"medium"'},{value:'"dark"'}]}}}}}catch{}export{t as N};
//# sourceMappingURL=NoiseBackground-e2b2a203.js.map
