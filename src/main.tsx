import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { root } from './libs/store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={root}>
      <App />
    </Provider>
  </StrictMode>,
)
