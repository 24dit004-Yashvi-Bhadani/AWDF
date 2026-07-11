import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Skills from './components/skills'
import Header from './components/header'
import Footer  from './components/footer'
import About from './components/about'
import NavBar from './components/navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <Header themeColor='purple' />
      <NavBar activeSection="About" />
      <About />
      < Skills skillList={['JavaScript', 'React','CPP','Communation']} />
      <Footer />

    </div>
  
    </>
  )
}

export default App
