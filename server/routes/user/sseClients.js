const clients = {};

function userUpdatesSSE(req, res) {
    const email = req.query.email;
    if (!email) return res.status(400).end();

    req.socket.setTimeout(0);
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    clients[email] = res;

    req.on('close', () => {
        delete clients[email];
    });
}

function sendUserUpdate(email, userData) {
    const res = clients[email];
    if (res) {
        res.write(`data: ${JSON.stringify(userData)}\n\n`);
    }
}

module.exports = { clients, userUpdatesSSE, sendUserUpdate };