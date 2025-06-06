import React from 'react'
import { motion } from 'framer-motion'
import { FaSun, FaMoon } from 'react-icons/fa'

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.button
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed top-20 right-4 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {darkMode ? (
          <FaSun className="text-yellow-500 text-xl" />
        ) : (
          <FaMoon className="text-gray-700 text-xl" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle