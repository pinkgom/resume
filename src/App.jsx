import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Components
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import ScrollToTop from './components/ScrollToTop'
import ThemeToggle from './components/ThemeToggle'

// Data
import portfolioData from '../data/portfolio-data.json'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
    })

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-300">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main>
        <Hero personalInfo={portfolioData.personalInfo} />
        <Timeline projects={portfolioData.projects} />
        <Projects 
          projects={portfolioData.projects} 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <Skills projects={portfolioData.projects} />
        <Contact personalInfo={portfolioData.personalInfo} />
      </main>
      
      <ScrollToTop />
    </div>
  )
}

export default App