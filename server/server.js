const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  
const multer = require('multer');
const axios = require("axios");
const authenticateJWT = require('./authMiddleware');
const path = require('path');
const jwtDecode = require('jwt-decode');
const { Configuration, OpenAIApi, OpenAI } = require("openai");
const app = express();
const PORT = 8000;

const fs=require('fs')




// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYmVoZXJ5b21qYXIyQGdtYWlsLmNvbSIsImlhdCI6MTczMzYxNTIyNCwiZXhwIjoxNzMzNjE4ODI0fQ.oATMbq-Hs2zmhI__PCE8PaRk0KwTnZw8ij0ZgEB-MpI';
// try {
//   const decoded = jwt.decode(token);
//   console.log('Decoded token:', decoded);
// } catch (error) {
//   console.error('Error decoding JWT:', error);
// }

app.use(bodyParser.json({ limit: '10mb' })); // or another suitable size
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS for all requests
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware to parse JSON bodies
app.use(bodyParser.json());

const { Client } = require('pg');

// Database connection details
const client = new Client({
  host: 'roboclaim.cdce4cckkhgv.us-east-1.rds.amazonaws.com', 
  port: 5432,               // Default PostgreSQL port
  user: 'omar',            // RDS username
  password: 'ROBOCLAIMpass-123', //  RDS password
  database: 'postgres',   // database name
  ssl: { rejectUnauthorized: false }
});
const JWT_SECRET = 'roboclaim';
// Connect to the PostgreSQL database
// (async () => {
//   try {
//     await client.connect();
//     console.log('Connected to PostgreSQL database!');

//     // SQL query to create the `users` table
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         username VARCHAR(100) NOT NULL,
//         password VARCHAR(100) NOT NULL,
//         role VARCHAR(50) NOT NULL
//       );
//     `;

//     // Execute the query
//     await client.query(createTableQuery);
//     console.log('Table "users" has been created (if not exists).');

//     // Optionally, insert a sample user
//     const insertUserQuery = `
//       INSERT INTO users (username, password, role)
//       VALUES ('john_doe', 'password123', 'admin')
//       ON CONFLICT DO NOTHING;
//     `;
//     await client.query(insertUserQuery);
//     console.log('Sample user added to the "users" table.');
//   } catch (err) {
//     console.error('Error connecting to the database:', err.stack);
//   } finally {
//     // Close the connection
//     await client.end();
//     console.log('Disconnected from PostgreSQL database.');
//   }
// })();




client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL!');
    return client.query('SELECT * FROM users;');
  })
  .then(res => {
    console.table(res.rows); // Display rows in a table format
  
  })
  .catch(err => {
    console.error('Error querying the database:', err.stack);
    client.end();
  });




  const openai = new OpenAI({
    apiKey: "your-api-key",
  });


  app.post("/sum", async (req, res) => {
    console.log(req.body);
    const text = req.body.text;
    const request=req.body.request;
  console.log(text);
  
    const summurized = await summarizeArticle(text,request);
  
    res.json({ summurized });
  });


  async function summarizeArticle(string,request) {
    // const article = await axios.get(url);
    // const $ = cheerio.load(article.data);
    // const articleText = $("article").text();
  console.log(request);
  
    const prompt = [
      {
        role: "user",
        content: `Summarize  the following text and give me a statistic table with flow charts about its content and ${request}:\n\n${string}`,
      },
    ];
  console.log(prompt[0].content);
  
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: prompt,
  
      temperature: 0.7,
    });
    console.log(response.choices[0].message.content);
      return response.choices[0].message.content;}



  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await client.query(query, [email]);
  
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }
  
      const user = result.rows[0];
  
      // Compare the hashed password with the input password
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }
  
      // Generate a JWT token if login is successful
      const token = jwt.sign(
        { userId: user.id, email: user.username },  // Payload (you can include more info here if needed)
        JWT_SECRET,  // Secret key to sign the token
        { expiresIn: '1h' }  // Token expiration (optional)
      );
  
      // Send the token in the response
      return res.status(200).json({ message: 'Login successful!', token });
  
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'An error occurred during login' });
    }
  });





// Configure Multer to handle file uploads
const storage = multer.memoryStorage(); // Store files in memory as a buffer
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/upload', upload.single('file'), async (req, res) => {

  
  const file = req.file;

  const fileType = file.mimetype;
  // const filePath = path.join(__dirname, 'uploads', file.filename);
  const user = req.user;


// if (fileType === 'text/plain') {
//       // Read the text file content asynchronously
//       const data = file.buffer.toString()
//       console.log(data);
      
//   // Store text content
//       // Save the file data to the database (e.g., fileData as a document in MongoDB)
//       res.status(200).json(data); // Send response after reading the file
//     } 

  const token = req.headers.authorization?.split(' ')[1]; // Extract JWT from Authorization header
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.decode(token);
    console.log(decodedToken);
    
    const username = decodedToken.email;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = req.file.buffer.toString(); // File content
    const fileName = req.file.originalname; // File name

    // Ensure the uploads table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        filename VARCHAR(255),
        filedata BYTEA,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert file data into the uploads table
    await client.query(
      'INSERT INTO uploads (username, filename, filedata) VALUES ($1, $2, $3)',
      [username, fileName, fileData]
    );
    const result = await client.query('SELECT id, username, filename, uploaded_at FROM uploads ORDER BY uploaded_at DESC');

    console.log('Current uploads table:');
    console.table(result.rows); // Log the table contents in a tabular format
    res.json({ message: 'File uploaded successfully!' });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


  async function signup(req, res) {
    const { email, password, role } = req.body;
  
    try {
      // Check if the username already exists
      const checkQuery = 'SELECT * FROM users WHERE username = $1';
      const checkResult = await client.query(checkQuery, [email]);
  
      if (checkResult.rows.length > 0) {
        // Username already exists, send response
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user into the users table
      const query = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *`;
      const values = [email, hashedPassword, role];
      
      const result = await client.query(query, values); // Rename query result to 'result'
  
      console.log('User created successfully:', result.rows[0]);
      return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error inserting user into database:', error.stack);
      return res.status(500).json({ error: 'Error during signup' });
    }
  }
  // server.js
// Fetch files uploaded by the user
app.get('/files', authenticateJWT, async (req, res) => {
  const { email } = req.user; // Get username from JWT
console.log(email);

  try {
    // Fetch files uploaded by this user from the database
    const result = await client.query('SELECT * FROM uploads WHERE username = $1', [email]);
   
    if (result.rows.length > 0) {
       
      res.json(result.rows)
      // const filesWithBase64 = result.rows.map(file => {
      //   const base64Data = file.filedata.toString('base64'); // Convert buffer to Base64
    
        
        
      //   return {
      //     ...file,
      //     filedata: base64Data, // Assuming image is JPEG, adjust accordingly
      //   };
      // });
  
      // res.json(filesWithBase64); // Return the list of files
    } else {
      res.status(404).json({ message: 'No files found for this user.' });
    }
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

  // Express.js route to handle signup
  app.post('/signup', signup);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

