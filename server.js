// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Added for Zipkin Traces
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');

const app = express();
const PORT = process.env.PORT || 3000;


// Create a Zipkin tracer
const zipkinBaseUrl = process.env.ZIPKIN_ENDPOINT || 'http://localhost:9411'; // Replace with your Zipkin server address
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: `${zipkinBaseUrl}/api/v2/spans`,
    jsonEncoder
: jsonEncoder.JSON_V2,
  }),
});
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: recorder,
  localServiceName: 'express-uploader', // Name of your service
});

// Middleware to create a Zipkin span for each request
app.use((req, res, next) => {
  const traceId = tracer.createRootId();
  const span = tracer.startSpan('request', { childOf: traceId });
  span.setTag('http.method', req.method);
  span.setTag('http.path', req.path);
  res.on('finish', () => {
    span.setTag('http.status_code', res.statusCode);
    span.finish();
  });
  // Store the span in the request context for later use
  req.zipkinSpan = span;
  next();
});

// Set up multer to handle file uploads
const upload = multer({ dest: process.env.DESTINATION_PATH || '/tmp' });

// Serve the HTML form
app.get('/', (req, res) => {
  const span = tracer.startSpan('handle_root', { childOf: req.zipkinSpan });
  span.finish();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/simple.min.css', (req, res) => {
    const span = tracer.startSpan('handle_root', { childOf: req.zipkinSpan });
    span.finish();
    res.sendFile(path.join(__dirname, 'simple.min.css'));
  });

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const tempFilePath = req.file.path;
  const originalFileName = req.file.originalname;
  const destinationFilePath = path.join(process.env.DESTINATION_PATH || '/tmp', originalFileName);

  const span = tracer.startSpan('handle_root', { childOf: req.zipkinSpan });
  fs.rename(tempFilePath, destinationFilePath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      span.finish();
      res.status(500).send('Error moving file');
    } else {
      console.log('File saved successfully:', destinationFilePath);
      span.finish();
      res.status(200).send('File uploaded successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
