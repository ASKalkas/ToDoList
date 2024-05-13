import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'

function NavigationBar() {
    const handleLogout = () => {
        console.log("logout")
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">ToDoList</Link>
            <ul className="nav-links">
                <li className="nav-item">
                    <Link to="/users" className="nav-link">Users</Link>
                </li>
                <li className="nav-item">
                    <Link to="/profile" className="nav-link">Profile</Link>
                </li>

                <li className="nav-item">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
}

export default NavigationBar;
