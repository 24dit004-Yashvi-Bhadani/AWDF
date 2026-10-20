import { memo } from 'react'
import { Link } from 'react-router-dom'
import './navbar.css'

function NavBar({ isDarkMode, onToggleTheme }) {
    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/projects">Projects</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/tasks">Tasks</Link>
            </div>
            <button
                className="navbar-theme-button"
                type="button"
                onClick={onToggleTheme}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                aria-pressed={isDarkMode}
            >
                {isDarkMode ? '☀ Light' : '☾ Dark'}
            </button>
        </nav>
    )
}

export default memo(NavBar)