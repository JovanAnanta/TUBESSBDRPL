import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App'
import { Router } from './config/Route'

createRoot(document.getElementById('root')!).render(
    <App />
)
