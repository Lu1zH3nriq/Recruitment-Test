const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();
const cron = require('node-cron');
const { container } = require('./db_config/db_config.js');
const { renewUserCreditsIfNeeded } = require('./utils/creditRenewal');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


const userRoutes = require("./routes/user/routes");
const videoRoutes = require("./routes/video/routes");
const planRoutes = require("./routes/plans/routes");
const adminRoutes = require('./routes/admin/routes');


app.use('/admin', adminRoutes);
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

cron.schedule('* 1 0 5 0', async () => {
  console.log('Iniciando renovação mensal de créditos...');
  try {
    const { resources: users } = await container.items.query('SELECT * FROM c').fetchAll();

    for (const user of users) {
      if (user.licensed && user.licensed.licenssType && user.licensed.licenssType !== 'free') {
        const updatedUser = renewUserCreditsIfNeeded(user);
        await container.item(user.id, user.id).replace(updatedUser);
      }
    }
    console.log('Renovação mensal de créditos concluída!');
  } catch (err) {
    console.error('Erro ao renovar créditos:', err.message);
  }
});