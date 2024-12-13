import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation

const Navbar = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [loggedIn, setLoggedIn] = useState(false);

  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    navLinks: {
      display: 'flex',
      gap: '20px',
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    linkHover: {
      textDecoration: 'underline',
    },
  };

  // Function to check if JWT exists in localStorage
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setLoggedIn(!!token); // Set loggedIn to true if token exists
  };

  // Use useEffect to check for JWT token in localStorage when the component mounts
  useEffect(() => {
    checkLoginStatus();

    // Listen for changes to the JWT token in localStorage
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    // Listen to localStorage changes (this is crucial for listening to login/logout actions)
    window.addEventListener('storage', handleStorageChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty array means this effect runs only once after initial mount

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT from localStorage
    setLoggedIn(false); // Update the state to reflect logout
    navigate('/'); // Navigate to home page after logout
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>MyWebsite</div>
      <div style={styles.navLinks}>
        {/* If the user is not logged in, show the Signup and Login links */}
        {!loggedIn ? (
          <>
            <Link
              to="/signup"
              style={styles.link}
              onMouseEnter={(e) => (e.target.style.textDecoration = styles.linkHover.textDecoration)}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              Signup
            </Link>
            <Link
              to="/"
              style={styles.link}
              onMouseEnter={(e) => (e.target.style.textDecoration = styles.linkHover.textDecoration)}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              Login
            </Link>
          </>
        ) : (
          // If the user is logged in, show the Logout link
          <>
          
          <span   style={styles.link}
          onClick={()=>{navigate('/files')}}
          onMouseEnter={(e) => (e.target.style.textDecoration = styles.linkHover.textDecoration)}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}>
          files
          </span>
          <span
            style={styles.link}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.textDecoration = styles.linkHover.textDecoration)}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Logout
          </span>
          </>
    
        )}
      </div>
    </nav>
  );
};

export default Navbar;
