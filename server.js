const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: "estoque_web;", // Nome do banco corrigido com aspas duplas
    password: '695847',
    port: 5432,
});

// Configuração do CORS: permite acesso apenas do frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Permite apenas o Live Server
}));

// Middleware para JSON
app.use(express.json());

// Testando a conexão com o banco de dados
pool.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no banco de dados:', err);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
});

// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err.message);
        res.status(500).send('Erro ao buscar produtos no banco de dados');
    }
});

// Rota para cadastrar produtos
app.post('/produtos', async (req, res) => {
    const { nome, quantidade, preco, precoVenda, categoria, validade, descricao } = req.body;

    console.log('Dados recebidos no backend:', req.body);

    try {
        const query = `
            INSERT INTO produtos (nome, quantidade, preco, preco_venda, categoria, validade, descricao)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await pool.query(query, [nome, quantidade, preco, precoVenda, categoria, validade, descricao]);
        res.status(201).send('Produto cadastrado com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir produto:', err.message);
        res.status(500).send('Erro ao cadastrar o produto!');
    }
});
// Rota para reduzir a quantidade de produtos no estoque (Saída)
app.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { quantidadeSaida } = req.body;

    console.log(`Recebido pedido de saída para produto ID: ${id}, Quantidade: ${quantidadeSaida}`);

    try {
        const query = `
            UPDATE produtos
            SET quantidade = quantidade - $1
            WHERE id = $2 AND quantidade >= $1
        `;
        const result = await pool.query(query, [quantidadeSaida, id]);

        if (result.rowCount > 0) {
            console.log(`Quantidade atualizada para produto ID ${id}`);
            res.status(200).send('Estoque atualizado com sucesso!');
        } else {
            console.log(`Produto com ID ${id} não encontrado ou quantidade insuficiente.`);
            res.status(400).send('Produto não encontrado ou quantidade insuficiente!');
        }
    } catch (err) {
        console.error('Erro ao atualizar estoque:', err.message);
        res.status(500).send('Erro ao atualizar o estoque!');
    }
});

// Rota para excluir um produto
app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    console.log(`Recebido pedido para excluir o produto com ID: ${id}`);

    try {
        const result = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

        if (result.rowCount > 0) {
            console.log(`Produto com ID ${id} excluído do banco!`);
            res.status(200).send('Produto excluído com sucesso!');
        } else {
            console.log(`Produto com ID ${id} não encontrado.`);
            res.status(404).send('Produto não encontrado!');
        }
    } catch (err) {
        console.error('Erro ao excluir produto:', err.message);
        res.status(500).send('Erro ao excluir o produto!');
    }
});


// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


