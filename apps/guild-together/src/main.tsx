import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setupEmbed } from './embed'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

setupEmbed()
