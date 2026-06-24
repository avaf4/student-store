const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3038;

// Root route — used to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "Student Store API is running 🛍️" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

