import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Skills from './components/skills'
import Header from './components/header'
import Footer from './components/footer'
import About from './components/about'
import NavBar from './components/navbar'
import Home from './pages/Home'
import Project from './pages/Project'
import Contect from './pages/Contect'
import NotFound from './pages/NotFound'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  return (
    <div className={isDarkMode ? 'app dark' : 'app light'}>
      <NavBar />

      <button className="toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Project' element={<Project />} />
        <Route path='/Contect' element={<Contect />} />
        <Route path='*' element={<NotFound />} />
      </Routes>

      <div>
        <button className="toggle-btn" onClick={() => setShowIntro(!showIntro)}>
          {showIntro ? 'Hide Intro' : 'Show Intro'}
        </button>

        {showIntro && (
          <>
            <Header  />
            <About />
            <Skills skillList={['JavaScript', 'React', 'CPP', 'Communication']} />
            <Footer />
          </>
        )}
      </div>
    </div>
  )
}

export default App
