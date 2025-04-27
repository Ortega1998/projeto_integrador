// Declaração das variáveis
let BtCadastrar = document.querySelectorAll('#botoes button')[0];
let BtExcluir = document.querySelectorAll('#botoes button')[1];
let botaoSaida = document.querySelectorAll('#botoes button')[2]; // Botão "Saída"
let nome = document.getElementById('nomeProduto');
let quantidade = document.getElementById('quantidadeProduto');
let precoProduto = document.getElementById('precoProduto');
let categoria = document.getElementById('categoria');
let validade = document.getElementById('validadeProduto');
let descricao = document.getElementById('descricaoProduto');
let tabela = document.querySelector('#saida table');

// Função para carregar produtos do backend
async function carregarProdutos() {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        const produtos = await response.json();
        montarTabela(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        tabela.innerHTML = '<tr><td colspan="8">Erro ao carregar os produtos!</td></tr>';
    }
}

// Função para montar a tabela com os dados
function montarTabela(listaProdutos) {
    let tabelaHTML = `<tr>
        <td width="30px"></td>
        <td>Nome</td>
        <td>Quant.</td>
        <td>Preço</td>
        <td>Preço Venda</td>
        <td>Categoria</td>
        <td>Validade</td>
        <td>Descrição</td>
    </tr>`;
    listaProdutos.forEach(produto => {
        const validadeFormatada = produto.validade ? new Date(produto.validade).toLocaleDateString('pt-BR') : 'Sem validade';
        tabelaHTML += `<tr>
            <td width="30px"><input type="checkbox" id="${produto.id}"></td>
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${produto.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${produto.categoria}</td>
            <td>${validadeFormatada}</td>
            <td>${produto.descricao || 'Sem descrição'}</td>
        </tr>`;
    });
    tabela.innerHTML = tabelaHTML;
}

// Função para cadastrar um produto
BtCadastrar.onclick = async function () {
    // Validação dos campos
    if (!nome.value || !quantidade.value || !precoProduto.value || !categoria.value || !validade.value) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    let produto = {
        nome: nome.value.trim(),
        quantidade: parseInt(quantidade.value),
        preco: parseFloat(precoProduto.value),
        precoVenda: (parseFloat(precoProduto.value) * 1.5).toFixed(2),
        categoria: categoria.value,
        validade: validade.value,
        descricao: descricao.value.trim(),
    };

    console.log('Dados do produto a ser enviado:', produto);

    try {
        const response = await fetch('http://localhost:3000/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto),
        });

        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
            carregarProdutos();
            limparCampos();
        } else {
            alert('Erro ao cadastrar o produto!');
        }
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
    }
};

// Função para excluir produtos selecionados
BtExcluir.onclick = async function () {
    const checkboxes = document.querySelectorAll('#saida table tr td input[type="checkbox"]:checked');
    const idsSelecionados = Array.from(checkboxes).map(checkbox => checkbox.id);

    if (idsSelecionados.length === 0) {
        alert('Por favor, selecione um produto para excluir!');
        return;
    }

    try {
        await Promise.all(
            idsSelecionados.map(async (id) => {
                const response = await fetch(`http://localhost:3000/produtos/${id}`, { method: 'DELETE' });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Erro ao excluir produto ID ${id}:`, errorText);
                }
            })
        );
        alert('Produtos excluídos com sucesso!');
        carregarProdutos();
    } catch (error) {
        console.error('Erro ao excluir produtos:', error);
        alert('Erro ao excluir os produtos!');
    }
};

// Função para reduzir a quantidade de produtos no estoque (Saída)
botaoSaida.onclick = async function () {
    const checkboxes = document.querySelectorAll('#saida table tr td input[type="checkbox"]:checked');
    const idsSelecionados = Array.from(checkboxes).map(checkbox => checkbox.id);
    const quantidadeSaida = parseInt(quantidade.value);

    if (idsSelecionados.length === 0) {
        alert('Por favor, selecione um produto para realizar a saída!');
        return;
    }

    if (isNaN(quantidadeSaida) || quantidadeSaida <= 0) {
        alert('Por favor, insira uma quantidade válida para a saída!');
        return;
    }

    console.log(`Tentando enviar saída - Produtos: ${idsSelecionados} | Quantidade: ${quantidadeSaida}`);

    try {
        await Promise.all(
            idsSelecionados.map(async (id) => {
                const response = await fetch(`http://localhost:3000/produtos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantidadeSaida }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Erro ao atualizar produto ${id}:`, errorText);
                }
            })
        );

        alert('Saída realizada com sucesso!');
        carregarProdutos(); // Atualiza a tabela
    } catch (error) {
        console.error('Erro ao realizar a saída:', error);
        alert('Erro ao realizar a saída!');
    }
};


// Função para limpar os campos
function limparCampos() {
    nome.value = '';
    quantidade.value = '';
    precoProduto.value = '';
    validade.value = '';
    descricao.value = '';
}

// Chama a função para carregar produtos ao carregar a página
window.onload = carregarProdutos;