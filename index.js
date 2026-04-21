const express = require('express');
const app = express();
const port = process.env.PORT || 3500;
const cors = require('cors');

//add middleware
app.get(cors());
app.get(express.json())

app.get('/', (req, res) => {
  res.send('food review')
})
app.listen(port)
