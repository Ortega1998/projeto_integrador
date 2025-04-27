CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    quantidade INTEGER,
    preco NUMERIC(10, 2),
    preco_venda NUMERIC(10, 2),
    categoria VARCHAR(255),
    validade DATE,
    descricao TEXT,
    imagem TEXT
);

ALTER TABLE produtos ADD COLUMN nome_da_coluna tipo_de_dado;

