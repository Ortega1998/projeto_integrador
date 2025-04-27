const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // Substitua 'public' pela pasta do seu HTML

app.listen(5500, () => {
    console.log('Servidor rodando em http://127.0.0.1:5500');
});
