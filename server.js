// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer to handle file uploads
const upload = multer({ dest: process.env.DESTINATION_PATH || '/tmp' });

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/simple.min.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple.min.css'));
  });

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const tempFilePath = req.file.path;
  const originalFileName = req.file.originalname;
  const destinationFilePath = path.join(process.env.DESTINATION_PATH || '/tmp', originalFileName);

  fs.rename(tempFilePath, destinationFilePath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      res.status(500).send('Error moving file');
    } else {
      console.log('File saved successfully:', destinationFilePath);
      res.status(200).send('File uploaded successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
