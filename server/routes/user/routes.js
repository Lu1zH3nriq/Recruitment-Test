const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });
const { userUpdatesSSE } = require("./sseClients");
const { container } = require('../../db_config/db_config.js');

router.post("/cadastro", async (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios." });
    }

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const { resources } = await container.items.query(querySpec).fetchAll();

        if (resources.length > 0) {
            return res.status(200).json({
                message: "Usuário já cadastrado.",
                user: resources[0]
            });
        }
        const userBody = {
            nome: nome,
            email: email,
            licensed: {
                state: false,
                credits: 1,
                licenssType: "free"
            }
        };

        const { resource } = await container.items.create(userBody);


        await mg.messages.create(process.env.MAILGUN_DOMAIN || 'resposta20.resultadoleitura.online', {
            from: "Gerador de Roteiros <postmaster@resposta20.resultadoleitura.online>",
            to: [email],
            subject: "Bem-vindo ao Gerador de Roteiros!",
            text: `Olá ${nome},\n\nSeu cadastro foi Registrado sucesso!\n\n\n`,
            html: `<h2>Olá ${nome},</h2>
                   <p>Seu cadastro foi Registrado sucesso!!</p>`
        });

        return res.status(200).json({
            message: "Cadastro realizado com sucesso! A senha foi enviada para o e-mail.",
            user: resource
        });
    } catch (error) {
        console.error("Erro ao cadastrar usuário no CosmosDB ou enviar e-mail:", error.message);
        return res.status(500).json({ error: "Erro ao cadastrar usuário ou enviar e-mail." });
    }
});

router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const { resources } = await container.items.query(querySpec).fetchAll();

        if (resources.length === 0) {
            return res.status(401).json({ message: "Usuário não encontrado." });
        }

        const user = resources[0];
        if (!user.pass) {
            return res.status(401).json({ message: "Senha não cadastrada para este usuário." });
        }

        const senhaCorreta = await bcrypt.compare(senha, user.pass);
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Senha incorreta." });
        }

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                licensed: user.licensed,
                IdeiasVideos: user.IdeiasVideos || [],
                token: user.token || ''
            }
        });
    } catch (error) {
        console.error("Erro ao realizar login:", error.message);
        return res.status(500).json({ message: "Erro ao realizar login." });
    }
});

router.get("/getUserData", async (req, res) => {
    const { nome, email } = req.query;

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

        delete user.randomPassword;
        delete user.pass;

        return res.status(200).json({
            message: "Usuário encontrado.",
            user: user
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error.message);
        return res.status(500).json({ message: "Erro ao buscar usuário." });
    }
});

router.get('/user-updates', userUpdatesSSE);

module.exports = router;