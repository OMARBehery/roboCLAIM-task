import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [textContent, setTextContent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [request,setRequest]=useState('')

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchFiles(token);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchFiles = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/files', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Fetched files:', data);
      setFiles(data); // Store the files in state
    } catch (error) {
      console.error('Error fetching files:', error);
      setError("Failed to fetch files");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleFileClick = (file) => {
    if (file.filename.endsWith(".txt")) {
      // Convert the buffer to a string
      const decoder = new TextDecoder();
      const text = decoder.decode(new Uint8Array(file.filedata.data));
      console.log(text);
      
      setTextContent({ name: file.filename, content: text });
    }
  };

  const summarize = (text) => {
    console.log(JSON.stringify(text));
    
    fetch('http://localhost:8000/sum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "text": text,
        "request":request
      }),
    })
    .then(res => res.json())
    .then(response => {
      console.log(response);
      setSummary(response.summurized);
    });
  };
const handleChange=(e)=>{

  
  
setRequest(e.target.value)
console.log(request);

}
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Files</h2>
      {error && <p style={styles.error}>{error}</p>}
      
      <ul style={styles.fileList}>
        {files.map((file, index) => (
          <li key={index} style={styles.listItem}>
            <span
              style={styles.fileName}
              onClick={() => handleFileClick(file)}
            >
              {file.filename}
            </span>
          </li>
        ))}
      </ul>

      {/* Display text content if a text file is clicked */}
      {textContent && (
        <div style={styles.fileContent}>
          <h3 style={styles.fileName}>Content of {textContent.name}:</h3>
          <pre style={styles.pre}>{textContent.content}</pre>
          
          <div style={styles.buttonsContainer}>
      
            <input type="text"
            onChange={handleChange}
            placeholder='add any extra request on processing the file' 
            style={styles.input}/>
            <button style={styles.button} onClick={() => summarize(textContent.content)}>
              Summarize
            </button>
            <button style={styles.button} onClick={() => { setTextContent(null); setSummary(null); }}>
            Close
          </button>
          </div>
          
          {summary && <pre style={styles.pre}>{summary}</pre>}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  input:{
    padding: '10px 20px',
    width:'300px',
    margin:'0px 10px'
  },
  heading: {
    color: '#333',
    fontSize: '24px',
    marginBottom: '20px',
  },
  fileList: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    margin: '10px 0',
  },
  fileName: {
    color: '#007BFF',
    cursor: 'pointer',
    fontSize: '18px',
    textDecoration: 'underline',
  },
  fileContent: {
    marginTop: '20px',
  },
  pre: {
    backgroundColor: '#f5f5f5',
    padding: '30px',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  buttonsContainer: {
    marginTop: '10px',
  },
  button: {
    padding: '10px 20px',
    marginRight: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  error: {
    color: 'red',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
};

export default Files;
