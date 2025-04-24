import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"

import { store } from "./app/store"
import {HeroUIProvider} from '@heroui/react'
import "./index.css"
import { ThemeProvider } from "./components/theme-provider"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Layout } from "./components/layout"
import { Auth } from "./pages/auth"
import { AuthGuard } from "./features/user/authGuard"
import { HomePage } from "./pages/home"

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: (
      <AuthGuard>
          <Layout />
      </AuthGuard>
    ),
    children: [
      {
        path: "profile",
        element: <HomePage />, 
      }
    ],
  },
])



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <HeroUIProvider>
            <RouterProvider router={router} />
        </HeroUIProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
