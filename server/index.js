const express = require('express');
const app = express();

const routeFootball = require('../route/football.js');

// Formateo Json.
app.use(express.json());

// Middleware - route.
app.use(routeFootball);

// Ejecución del server.
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado ${port}`);
});