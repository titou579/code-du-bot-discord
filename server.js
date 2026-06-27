const express = require('express');
const app = express();

function keepAlive() {
    app.get('/', (req, res) => {
        res.send("Le serveur web du bot est actif et en ligne !");
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur Express connecté sur le port ${PORT}`);
    });
}

module.exports = keepAlive;
