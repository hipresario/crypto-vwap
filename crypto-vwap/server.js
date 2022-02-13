const express = require('express');
const setupProxy = require('./src/setupProxy');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.resolve(__dirname, './build')));

setupProxy(app);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
