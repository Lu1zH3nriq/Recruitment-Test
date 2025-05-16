const express = require("express");
const router = express.Router();
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });

const { container } = require('../../db_config/db_config.js');

router.post("/ideiaDeVideo", async (req, res) => {
    const { nome, email, IdeiasVideos } = req.body;

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.nome = @nome AND c.email = @email",
            parameters: [
                { name: "@nome", value: nome },
                { name: "@email", value: email }
            ]
        };
        const { resources } = await container.items.query(querySpec).fetchAll();

        if (resources.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const user = resources[0];
        user.IdeiasVideos = IdeiasVideos;
        const randomToken = crypto.randomBytes(16).toString("hex");
        const tokenHash = await bcrypt.hash(randomToken, 10);
        user.token = tokenHash;
        const randomPassword = crypto.randomBytes(6).toString("base64").slice(0, 8);
        user.randomPassword = randomPassword;
        const passHash = await bcrypt.hash(randomPassword, 10);
        user.pass = passHash;

        await container.item(user.id, user.id).replace(user);

        await mg.messages.create(process.env.MAILGUN_DOMAIN || 'resposta20.resultadoleitura.online', {
            from: "Gerador de Roteiros <postmaster@resposta20.resultadoleitura.online>",
            to: [email],
            subject: "Parabéns! Seu roteiro está sendo gerado",
            text: `Parabéns, seu roteiro está sendo gerado! Basta acessar sua conta para acompanhar o progresso.\n\nUsuário: ${email}\nSenha: ${randomPassword}`,
            html: `<h2>Parabéns, seu roteiro está sendo gerado!</h2>
               <p>Basta acessar sua conta para acompanhar o progresso.</p>
               <p><b>Usuário:</b> ${email}<br/>
               <b>Senha:</b> <code>${randomPassword}</code></p>`
        });

        return res.status(200).json({ message: "Ideia de vídeo recebida com sucesso!" });
    } catch (error) {
        console.error("Erro ao processar ideia de vídeo:", error.message);
        return res.status(500).json({ message: "Erro ao processar ideia de vídeo." });
    }
});

module.exports = router;