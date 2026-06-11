import React, { useState, useEffect } from "react";
import "./style/Navbar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthPopup from "./AuthPopup"; // Import popup

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

const handleGoogleLogin = () => {
  window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
};

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    }
  };

  // Auth Guard Function
  const handleProtectedNavigation = (item, path) => {
    if (!isLoggedIn) {
      setShowAuthPopup(true);
      setIsMenuOpen(false);
    } else {
      navigate(path);
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = (item) => {
    console.log(`Navigating to: ${item}`);

    if (item === "Home") {
      navigate("/");
    } else if (item === "Goals") {
      handleProtectedNavigation("Goals", "/goals");
    } else if (item === "Notes") {
      handleProtectedNavigation("Notes", "/notes");
    } else if (item === "AI Assistant") {
      handleProtectedNavigation("AI Assistant", "/ai-assistant");
    }
    setIsMenuOpen(false);
  };

  const closeAuthPopup = () => {
    setShowAuthPopup(false);
     
  };

  const handlePopupLogin = () => {
    setShowAuthPopup(false);
    handleGoogleLogin();
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <div className="logo" onClick={() => handleNavClick("Home")}>
          ExpenseTracker
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links & Buttons */}
        <div className={`nav-container ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li className="nav-link" onClick={() => handleNavClick("Goals")}>
              Goals
            </li>
            <div className="vertical-separator"></div>
            <li className="nav-link" onClick={() => handleNavClick("Notes")}>
              Notes
            </li>
            <div className="vertical-separator"></div>
            <li
              className="nav-link"
              onClick={() => handleNavClick("AI Assistant")}
            >
              AI Assistant
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="auth-buttons">
            {!isLoggedIn ? (
              <button className="btn-google" onClick={handleGoogleLogin}>
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  className="google-icon"
                />
                Continue with Google
              </button>
            ) : (
              <div className="user-profile">
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="user-avatar"
                  />
                )}
                <span className="user-name">{user?.name || user?.email}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

      {/* Auth Popup */}
      {showAuthPopup && (
        <AuthPopup onClose={closeAuthPopup} onLogin={handlePopupLogin} />
      )}
    </>
  );
};

export default Navbar;
