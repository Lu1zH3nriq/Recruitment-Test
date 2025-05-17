const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


const userRoutes = require("./routes/user/routes");
const videoRoutes = require("./routes/video/routes");
const planRoutes = require("./routes/plans/routes");


app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/plans", planRoutes);


app.use(express.static(path.join(__dirname, "..", "webapp", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "webapp", "build", "index.html"));
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});