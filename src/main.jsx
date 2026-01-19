import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/MapMarker.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.DEV ? '/' : (import.meta.env.VITE_BASENAME || '/')}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

