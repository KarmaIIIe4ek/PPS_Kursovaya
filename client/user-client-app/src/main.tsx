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
import { GroupPage } from "./pages/groups"
import { Support } from "./pages/support"
import { ModifyGroup } from "./pages/modufy-group"
import { PurchasePage } from "./pages/purchase"
import { ResultsPage } from "./pages/results"
import { HomePage } from "./pages/home"
import { SelfResultsPage } from "./pages/self-results"
import { TeacherGuard } from "./features/user/roleGuard"
import { MakeTask } from "./pages/makeTask"
import { VirtualLab } from "./pages/virtual-lab-1"
import { VirtualLab2 } from "./pages/virtual-lab-2"
import { VirtualLab3 } from "./pages/virtual-lab-3"

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/main",
    element: <Main/>
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
      },
      {
        path: "myGroup",
        element: <GroupPage />, 
      },
      {
        path: "selfResults",
        element: <SelfResultsPage />, 
      },
      {
        path: "support",
        element: <Support />, 
      },
      {
        path: "makeTask",
        element: <MakeTask />, 
      },
      {
        path: "task/1",
        element: <VirtualLab />, 
      },
      {
        path: "task/2",
        element: <VirtualLab2 />, 
      },
      {
        path: "task/3",
        element: <VirtualLab3 />, 
      },
      
      // Teacher-only routes
      {
        path: "purchase",
        element: (
          <TeacherGuard>
            <PurchasePage />
          </TeacherGuard>
        ), 
      },
      {
        path: "results",
        element: (
          <TeacherGuard>
            <ResultsPage />
          </TeacherGuard>
        ), 
      },
      {
        path: "modifyGroup",
        element: (
          <TeacherGuard>
            <ModifyGroup />
          </TeacherGuard>
        ), 
      },
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
