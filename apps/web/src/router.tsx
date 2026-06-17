import { createBrowserRouter } from 'react-router'
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import HomeownerDashboard from '@/pages/homeowner/DashboardPage'
import PostJobPage from '@/pages/homeowner/PostJobPage'
import JobDetailPage from '@/pages/homeowner/JobDetailPage'
import HomeownerProfilePage from '@/pages/homeowner/ProfilePage'
import FindProvidersPage from '@/pages/homeowner/FindProvidersPage'
import ServiceProviderDashboard from '@/pages/service-provider/DashboardPage'
import ServiceProviderJobDetailPage from '@/pages/service-provider/JobDetailPage'
import ServiceProviderProfilePage from '@/pages/service-provider/ProfilePage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/homeowner', element: <HomeownerDashboard /> },
          { path: '/homeowner/jobs/new', element: <PostJobPage /> },
          { path: '/homeowner/jobs/:id', element: <JobDetailPage /> },
          { path: '/homeowner/profile', element: <HomeownerProfilePage /> },
          { path: '/homeowner/find-providers', element: <FindProvidersPage /> },
          { path: '/service-provider', element: <ServiceProviderDashboard /> },
          { path: '/service-provider/jobs/:id', element: <ServiceProviderJobDetailPage /> },
          { path: '/service-provider/profile', element: <ServiceProviderProfilePage /> },
        ],
      },
    ],
  },
])
