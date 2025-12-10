const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

//entry points here

//Server Start
app.listen(PORT, () => {
  console.log(`Server is running on [http://localhost:${PORT}]`);
});