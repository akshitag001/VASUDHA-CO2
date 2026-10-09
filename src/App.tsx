import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './state/AppState'
import ErrorBoundary from './ui/ErrorBoundary'
import Layout, { RequireVillage } from './ui/Layout'
import Landing from './pages/Landing'

// Every page except the landing page is code-split so the first load stays small.
const Select = lazy(() => import('./pages/Select'))
const Overview = lazy(() => import('./pages/Overview'))
const Carbon = lazy(() => import('./pages/Carbon'))
const Methodology = lazy(() => import('./pages/Methodology'))
const Money = lazy(() => import('./pages/Money'))
const Offer = lazy(() => import('./pages/Offer'))
const Pooling = lazy(() => import('./pages/Pooling'))
const Readiness = lazy(() => import('./pages/Readiness'))
const Brief = lazy(() => import('./pages/Brief'))
const Assumptions = lazy(() => import('./pages/Assumptions'))
const DataSources = lazy(() => import('./pages/DataSources'))
const Guide = lazy(() => import('./pages/Guide'))
const About = lazy(() => import('./pages/About'))

function Loading() {
  const { t } = useApp()
  return (
    <p className="muted py-10" role="status">
      {t('app.loading')}
    </p>
  )
}

function PageBoundary({ children }: { children: ReactNode }) {
  const { t } = useApp()
  return (
    <ErrorBoundary
      fallback={(reset) => (
        <div className="alarm" role="alert">
          <p className="font-semibold">{t('app.error')}</p>
          <p className="mb-3">{t('app.errorBody')}</p>
          <button type="button" className="btn" onClick={reset}>
            {t('app.reload')}
          </button>
        </div>
      )}
    >
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

const guarded = (el: ReactNode) => (
  <RequireVillage>
    <PageBoundary>{el}</PageBoundary>
  </RequireVillage>
)
const open = (el: ReactNode) => <PageBoundary>{el}</PageBoundary>

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/select" element={open(<Select />)} />
            <Route element={<Layout />}>
              <Route path="/overview" element={guarded(<Overview />)} />
              <Route path="/carbon" element={guarded(<Carbon />)} />
              <Route path="/methodology" element={guarded(<Methodology />)} />
              <Route path="/money" element={guarded(<Money />)} />
              <Route path="/offer" element={guarded(<Offer />)} />
              <Route path="/pooling" element={guarded(<Pooling />)} />
              <Route path="/readiness" element={guarded(<Readiness />)} />
              <Route path="/brief" element={guarded(<Brief />)} />
              <Route path="/assumptions" element={open(<Assumptions />)} />
              <Route path="/data" element={open(<DataSources />)} />
              <Route path="/guide" element={open(<Guide />)} />
              <Route path="/about" element={open(<About />)} />
            </Route>
            {/* old routes from the previous version */}
            <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
            <Route path="/baseline" element={<Navigate to="/carbon" replace />} />
            <Route path="/viability" element={<Navigate to="/money" replace />} />
            <Route path="/aggregation" element={<Navigate to="/pooling" replace />} />
            <Route path="/decision" element={<Navigate to="/brief" replace />} />
            <Route path="/data-sources" element={<Navigate to="/data" replace />} />
            <Route path="/manual" element={<Navigate to="/guide" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
