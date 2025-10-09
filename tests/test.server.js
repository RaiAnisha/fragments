const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello EC2!'));

const port = 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on 0.0.0.0:${port}`);
});
