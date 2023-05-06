import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerSW } from "virtual:pwa-register";
import './index.css'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("update available - reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {},
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
