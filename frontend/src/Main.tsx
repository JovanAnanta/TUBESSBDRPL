import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App'
import { Router } from './config/Route'
import { HomePage } from './page/HomePage'
import { LoginPage } from './page/LoginPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
