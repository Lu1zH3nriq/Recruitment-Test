const express = require("express");
const router = express.Router();
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const { userUpdatesSSE, sendUserUpdate } = require('../user/sseClients.js');
const { openai } = require('../../openai_config/openai_config.js');
const { container } = require('../../db_config/db_config.js');

router.post("/ideiaDeVideo", async (req, res) => {
    const { nome, email, IdeiaVideos } = req.body;

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

        if (
            !user.licensed ||
            typeof user.licensed.credits !== 'number' ||
            user.licensed.credits <= 0
        ) {
            return res.status(403).json({ message: "Usuário não possui mais créditos para criar roteiro de vídeo." });
        }
        if (!Array.isArray(user.IdeiasVideos)) {
            user.IdeiasVideos = [];
        }
        const isPrimeiraIdeia = user.IdeiasVideos.length === 0;


        const novaIdeia = { ...IdeiaVideos, roteiro: "", state: "pending" };
        user.IdeiasVideos.push(novaIdeia);
        user.licensed.credits = user.licensed.credits - 1;


        await container.item(user.id, user.id).replace(user);

        // Retorna resposta imediata para o frontend (opcional, pode aguardar o roteiro se preferir)
        // res.status(202).json({ message: "Roteiro em geração. Aguarde..." });


        let roteiroGerado = '';
        try {
            const prompt = `
                Gere um roteiro de vídeo para o seguinte tema:
                Tema: ${IdeiaVideos.tema}
                Formato: ${IdeiaVideos.formato}
                Tempo: ${IdeiaVideos.tempo} minutos
                Ideias: ${IdeiaVideos.ideias}

                O roteiro deve ser detalhado, criativo e adequado ao tempo informado.
            `;
            const completion = await openai.chat.completions.create({
                model: "gpt-4.1",
                messages: [
                    { role: "system", content: "Você é um assistente que cria roteiros de vídeo." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 800
            });
            roteiroGerado = completion.choices[0].message.content;
        } catch (err) {
            console.error("Erro ao gerar roteiro com OpenAI:", err.message);
            roteiroGerado = "Não foi possível gerar o roteiro automaticamente. Tente novamente mais tarde.";
        }


        const idx = user.IdeiasVideos.findIndex(
            v =>
                v.tema === IdeiaVideos.tema &&
                v.formato === IdeiaVideos.formato &&
                v.tempo === IdeiaVideos.tempo &&
                v.state === "pending"
        );
        if (idx !== -1) {
            user.IdeiasVideos[idx].roteiro = roteiroGerado;
            user.IdeiasVideos[idx].state = "complete";
        }


        await container.item(user.id, user.id).replace(user);
        if (user.email) {
            const userToSend = { ...user };
            delete userToSend.pass;
            delete userToSend.randomPassword;
            sendUserUpdate(user.email, userToSend);
        }

        if (isPrimeiraIdeia) {
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
        }

        return res.status(200).json({ message: "Roteiro gerado com sucesso!", roteiro: roteiroGerado });
    } catch (error) {
        console.error("Erro ao processar ideia de vídeo:", error.message);
        return res.status(500).json({ message: "Erro ao processar ideia de vídeo." });
    }
});

router.post("/regenerateRoteiro", async (req, res) => {
    const { nome, email, video } = req.body;

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


        if (
            !user.licensed ||
            typeof user.licensed.credits !== 'number' ||
            user.licensed.credits <= 0
        ) {
            return res.status(403).json({ message: "Usuário não possui mais créditos para regerar roteiro de vídeo." });
        }

        if (!Array.isArray(user.IdeiasVideos)) {
            user.IdeiasVideos = [];
        }

        const idx = user.IdeiasVideos.findIndex(
            v =>
                v.tema === video.tema &&
                v.formato === video.formato &&
                v.tempo === video.tempo
        );

        if (idx === -1) {
            return res.status(404).json({ message: "Ideia de vídeo não encontrada para regeração." });
        }

        const roteiroAnterior = user.IdeiasVideos[idx].roteiro || "";

        user.IdeiasVideos[idx].roteiro = "";
        user.IdeiasVideos[idx].state = "pending";

        user.licensed.credits = user.licensed.credits - 1;
        await container.item(user.id, user.id).replace(user);


        let roteiroGerado = '';
        try {
            const prompt = `
                Você receberá um roteiro de vídeo já gerado anteriormente. 
                Refine, melhore e reescreva esse roteiro, tornando-o mais criativo, envolvente e adequado ao tempo informado, sem perder o contexto original.
                
                Tema: ${video.tema}
                Formato: ${video.formato}
                Tempo: ${video.tempo} minutos
                Ideias: ${video.ideias}

                Roteiro anterior:
                ${roteiroAnterior}
            `;
            const completion = await openai.chat.completions.create({
                model: "gpt-4.1",
                messages: [
                    { role: "system", content: "Você é um assistente que refina roteiros de vídeo." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 800
            });
            roteiroGerado = completion.choices[0].message.content;
        } catch (err) {
            console.error("Erro ao regerar roteiro com OpenAI:", err.message);
            roteiroGerado = "Não foi possível regerar o roteiro automaticamente. Tente novamente mais tarde.";
        }

        user.IdeiasVideos[idx].roteiro = roteiroGerado;
        user.IdeiasVideos[idx].state = "complete";

        await container.item(user.id, user.id).replace(user);

        if (user.email) {
            const userToSend = { ...user };
            delete userToSend.pass;
            delete userToSend.randomPassword;
            sendUserUpdate(user.email, userToSend);
        }

        return res.status(200).json({ success: true, message: "Roteiro regenerado com sucesso!", roteiro: roteiroGerado });
    } catch (error) {
        console.error("Erro ao regerar roteiro:", error.message);
        return res.status(500).json({ success: false, message: "Erro ao regerar roteiro." });
    }
});


module.exports = router;