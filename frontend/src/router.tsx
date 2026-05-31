import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const HomePage = lazy(() => import('@/pages/home'))
const LoginPage = lazy(() => import('@/pages/login'))
const ProposalsPage = lazy(() => import('@/pages/proposals'))
const ProposalDetailPage = lazy(() => import('@/pages/proposal-detail'))
const MyApplicationsPage = lazy(() => import('@/pages/my-applications'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))

const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <SiteHeader />
      <main>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </ErrorBoundary>
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/entrar',
  component: LoginPage,
})

const proposalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas',
  component: ProposalsPage,
})

const proposalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas/$id',
  component: ProposalDetailPage,
})

const myApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/minhas-candidaturas',
  component: MyApplicationsPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  proposalsRoute,
  proposalDetailRoute,
  myApplicationsRoute,
  dashboardRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
