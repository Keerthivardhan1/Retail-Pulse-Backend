const express = require("express");
const jobRoutes = require("./routes/jobRoutes");

const app = express();
app.use(express.json());

app.use("/api", jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
