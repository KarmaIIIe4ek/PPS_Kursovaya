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
import { Main } from "./pages/main"
import { AuthGuard } from "./features/user/authGuard"
import { Group } from "./pages/groups"
import { Support } from "./pages/support"
import { ModifyGroup } from "./pages/modufy-group"
import { PurchasePage } from "./pages/purchase"

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />, // Страница авторизации
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
        path: "",
        element: <Main />, 
      },
      {
        path: "myGroup",
        element: <Group />, 
      },
      {
        path: "modifyGroup",
        element: <ModifyGroup />, 
      },
      {
        path: "support",
        element: <Support />, 
      },
      {
        path: "purchase",
        element: <PurchasePage />, 
      }
      // другие защищенные маршруты
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
