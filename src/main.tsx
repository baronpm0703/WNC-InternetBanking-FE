import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { root } from './libs/store.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router/Routes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={root}>
      {/* <UserProvider>
        <App />
      </UserProvider> */}
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
