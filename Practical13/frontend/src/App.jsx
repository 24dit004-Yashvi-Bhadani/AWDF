import { lazy, memo, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import About from './components/about'
import Footer from './components/footer'
import Header from './components/header'
import LoadingFallback from './components/LoadingFallback'
import NavBar from './components/NavBar'
import Skills from './components/skills'
import Home from './pages/Home'

const Projects = lazy(() => import('./pages/Project'))
const Contact = lazy(() => import('./pages/Contact'))
const Tasks = lazy(() => import('./pages/Tasks'))
const AddTask = lazy(() => import('./pages/AddTask'))
const TaskDetails = lazy(() => import('./pages/TaskDetails'))
const NotFound = lazy(() => import('./pages/NotFound'))

const skillList = ['JavaScript', 'React', 'CPP', 'Communication']

const IntroSection = memo(function IntroSection() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <section>
      <button className="toggle-btn" onClick={() => setShowIntro((visible) => !visible)}>
        {showIntro ? 'Hide Intro' : 'Show Intro'}
      </button>

      {showIntro && (
        <>
          <Header />
          <About />
          <Skills skillList={skillList} />
          <Footer />
        </>
      )}
    </section>
  )
})

const AppRoutes = memo(function AppRoutes({ isDarkMode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tasks" element={<Tasks isDarkMode={isDarkMode} />} />
        <Route path="/tasks/add" element={<AddTask />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/Project" element={<Navigate to="/projects" replace />} />
        <Route path="/Contect" element={<Navigate to="/contact" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
})

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className={isDarkMode ? 'app dark' : 'app light'}>
      <NavBar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((darkMode) => !darkMode)}
      />

      <AppRoutes isDarkMode={isDarkMode} />
    </div>
  )
}

export default App
