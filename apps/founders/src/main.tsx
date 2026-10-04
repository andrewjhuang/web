import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Showcase } from './components/Showcase'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has('showcase') ? <Showcase /> : <App />}
  </StrictMode>,
)

