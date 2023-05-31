import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import "@fontsource/inter";
import './index.css'
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("update available - reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() { console.log("<-----TODO------>") },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
