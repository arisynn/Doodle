const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;
if (!port) throw new Error('PORT wajib dikonfigurasi');

app.use(express.static(path.join(__dirname, 'public'), { etag: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(__dirname + '/manifest.json');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
