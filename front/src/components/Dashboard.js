import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // for redirecting to login if no JWT
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  // Check if the JWT exists on component mount



  useEffect(() => {
    const jwt = localStorage.getItem('token');
    if (jwt) {
      setIsAuthenticated(true);
      try {
        const decodedToken = jwtDecode(jwt);
        console.log(decodedToken);
        
        setUsername(decodedToken.email || 'User'); // Assuming the JWT contains a 'username' field
      } catch (error) {
        console.error('Error decoding JWT:', error);
        setUsername('User'); // Fallback if decoding fails
      }
    }
  }, []);






  useEffect(() => {
    const jwt = localStorage.getItem('token');
    if (jwt) {
      setIsAuthenticated(true); // User is logged in
    } else {
      if (!isAuthenticated) {
        return <Navigate to="/" />; // Redirect to login page if no JWT
      } // No JWT, user is not logged in
    }
  }, []);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
 console.log(file.name.endsWith(".jpg"));
 if(file.name.endsWith(".jpg")){

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result.split(",")[1]; // Remove the Base64 prefix
    try {
      const response = await fetch("http://localhost:8000/uploadimg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "exampleUser", imageData: base64Image }),
      });
      const result = await response.json();
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  reader.readAsDataURL(file);
 }

  // if(file.name.endsWith(".jpg")){
  //   const reader = new FileReader();
  //   reader.onloadend = async () => {
  //     const base64String = reader.result; // This is the Base64 encoded string

  //     try {
  //       const response = await fetch("http://localhost:8000/upload", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           fileName: file.name,
  //           fileContent: base64String,
  //         }),
  //       });

  //       const data = await response.json();
  //       console.log("Upload successful:", data);
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //     }
  //   };
    
  // }
    

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed.');
    }
  };


  return (
    <div style={styles.dashboard}>
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard,{username}</p>

    {/* File upload section */}
    <div style={styles.uploadSection}>
      <input
        type="file"
        onChange={handleFileChange}
        style={styles.fileInput}
        accept="*/*" // Accept all file formats
      />
      <button
        onClick={handleUpload}
        style={styles.uploadButton}
      >
        Upload
      </button>
    </div>
  </div>
  );
  
};
const styles = {
  dashboard: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  uploadSection: {
    marginTop: '20px',
  },
  fileInput: {
    marginRight: '10px',
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  uploadButtonHover: {
    backgroundColor: '#0056b3',
  },
};

export default Dashboard;
