'use strict';

const http = require("http");
const fs = require("fs");
const path = require("path");

// Content type mapping
const CONTENT_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".txt": "text/plain"
};

// Basic security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block'
};

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalize file path
  let filePath = path.normalize(path.join(".", req.url));

  // Default to index.html for root
  if (filePath === "." || filePath === "./") {
    filePath = "./index.html";
  }

  // Get file extension for content type
  const extname = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[extname] || "application/octet-stream";

  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File not found
        fs.readFile("./404.html", (err, content) => {
          if (err) {
            // 404 page not found, fallback to basic response
            res.writeHead(404, { "Content-Type": "text/html", ...SECURITY_HEADERS });
            res.end("<html><body><h1>404 Not Found</h1></body></html>", "utf-8");
          } else {
            res.writeHead(404, { "Content-Type": "text/html", ...SECURITY_HEADERS });
            res.end(content, "utf-8");
          }
        });
      } else {
        // Server error
        console.error(`Server error: ${err.code} for ${filePath}`);
        res.writeHead(500, { "Content-Type": "text/html", ...SECURITY_HEADERS });
        res.end(`<html><body><h1>500 Internal Server Error</h1><p>${err.code}</p></body></html>`, "utf-8");
      }
    } else {
      // Successful response
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": extname === ".html" ? "no-cache" : "max-age=86400",
        ...SECURITY_HEADERS
      });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
