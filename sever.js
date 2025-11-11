// server.js
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK')); // uptime responde 200
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
