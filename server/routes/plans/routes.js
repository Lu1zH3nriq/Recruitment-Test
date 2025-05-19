const express = require("express");
const router = express.Router();
const axios = require("axios");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const { container } = require('../../db_config/db_config.js');
const { clients } = require('../user/sseClients');

router.post("/subscribeToPlan", async (req, res) => {
    console.log("Iniciando pagamento...");

    const { email, name, planType } = req.body;

    const payload = {
        transaction_token: `FAKEPAY-${Date.now()}`,
        method: "credit_card",
        user_ip: "198.181.0.1",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        total_price: "23600",
        checkout_tax_amount: "354",
        checkout_tax_percentage: "1.5",
        status: "approved",
        order_url: "https://seudominio.com/order/2ZyyEbKZ",
        checkout_url: "https://seudominio.com/recovery/2ZyyEbKZ",
        billet_url: "https://seudominio.com/order/2ZyyEbKZ/download-boleto",
        billet_digitable_line: "34191090657279875620016155530005993770000022900",
        billet_due_date: "2023-06-10 00:00:00",
        pix_code: "00020101021226860014br.gov.bcb.pix2564qrpix.bradesco.com.br/qr/v2/743baefb-a188-4f04-a634-22ae30a873285204000053039865406105.365802BR5905ASAAS6009JOINVILLE62070503***630470B5",
        pix_code_image64: "",
        created_at: "2022-07-29 11:43:57",
        updated_at: "2022-07-29 18:43:57",
        approved_at: "2022-07-29 18:43:57",
        refunded_at: "2022-07-29 18:43:57",
        checkout: {
            src: "",
            fbclid: "",
            ttclid: "",
            click_id: "",
            utm_source: "",
            utm_medium: "",
            utm_campaign: "",
            utm_term: "",
            utm_content: ""
        },
        customer: {
            name: name,
            document: "60002212820",
            email: email,
            phone: "(24) 99440-5665"
        },
        address: {
            street: "Avenida General Afonseca",
            number: "1475",
            district: "Manejo",
            zip_code: "27520174",
            city: "Resende",
            state: "RJ",
            country: "BR",
            complement: "Casa 1"
        },
        products: [
            {
                code: "3L78P3",
                brand: null,
                model: null,
                title: planType,
                amount: 23600,
                version: null,
                quantity: 1,
                description: null
            }
        ]
    };


    res.status(200).json({
        message: "Pedido realizado com sucesso! Aguarde a confirmação do pagamento. Confira seu email e acompanhe o pedido!",
        payment: {
            payment_token: payload.transaction_token,
            ...payload
        }
    });


    try {
        const webhookPayload = {
            ...payload,
            status: "approved"
        };

        await axios.post(
            `http://localhost:${process.env.PORT || 3001}/plans/webhook/payment`,
            webhookPayload,
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Erro ao iniciar pagamento:", error.message);
    }
});

router.post("/webhook/payment", async (req, res) => {
    try {
        const payload = req.body;

        if (payload.status === "approved" && payload.customer?.email) {
            const email = payload.customer.email;
            const nome = payload.customer.name;
            const planType = payload.products?.[0]?.title;

            let _credits = 0;
            let _licenssType = "";

            if (planType === "premium") {
                _credits = 5;
                _licenssType = "premium";
            }
            else if (planType === "basic") {
                _credits = 2;
                _licenssType = "basic";
            }

            const querySpec = {
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email }]
            };
            const { resources } = await container.items.query(querySpec).fetchAll();

            if (resources.length > 0) {
                const user = resources[0];

                user.licensed = {
                    vip: true,
                    credits: _credits,
                    licenssType: _licenssType,
                };

                await container.item(user.id, user.id).replace(user);



                delete user.randomPassword;
                delete user.pass;

                await mg.messages.create(process.env.MAILGUN_DOMAIN || 'resposta20.resultadoleitura.online', {
                    from: "Equipe Gerador de Roteiros <postmaster@resposta20.resultadoleitura.online>",
                    to: [email],
                    subject: "Pagamento aprovado! Bem-vindo ao VIP",
                    text: `Olá, ${nome}! Seu pagamento foi aprovado e agora você é membro VIP (${_licenssType.toUpperCase()}). Aproveite seus créditos!`,
                    html: `<h2>Olá, ${nome}!</h2>
           <p>Seu pagamento foi aprovado e agora você é membro <b>VIP</b> (${_licenssType.toUpperCase()}).</p>
           <p>Aproveite seus créditos e gere seus roteiros!</p>`
                });

                if (clients && clients[email]) {
                    clients[email].write(`data: ${JSON.stringify(user)}\n\n`);
                }

                return res.status(200).json({ received: true, user: user });
            }
        }

        return res.status(200).json({ received: true, user: null });
    } catch (error) {
        console.error("Erro no webhook de pagamento:", error.message);
        return res.status(500).json({ message: "Erro ao processar webhook." });
    }
});

module.exports = router;