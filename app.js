const express = require('express');
const app = express();
const port = 3009; // Porta que a aplicação irá escutar

const path = require('path');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// Middleware para permitir o uso do req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar o EJS como view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Simulação de uma lista de usuários (pode ser substituída por um banco de dados)
let users = [
    { id: 1, nome: 'Usuário 1', email: 'usuario1@gmail.com', dataNascimento: '1990-01-01', sexo: 'Masculino' },
    { id: 2, nome: 'Usuário 2', email: 'usuario2@gmail.com', dataNascimento: '1995-05-05', sexo: 'Feminino' }
];

// Função para validar o CPF
function validarCPF(cpf) {
    // Remove todos os caracteres que não são dígitos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Calcula os dígitos verificadores
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}


// Função para validar a data de nascimento
function validarDataNascimento(dataNascimento) {
    const dataAtual = new Date();
    const dataNascimentoObj = new Date(dataNascimento);
    return dataNascimentoObj < dataAtual;
}

// Rota para renderizar a página de listagem de usuários
app.get('/usuarios', (req, res) => {
    res.render('users', { users });
});
// Rota para processar a exclusão de usuários
app.delete('/usuarios/:id', (req, res) => {
    const userId = parseInt(req.params.id); // Convertendo o ID para inteiro
    users = users.filter(user => user.id !== userId); // Filtrando os usuários para remover o usuário com o ID fornecido
    // Reatribuindo IDs aos usuários restantes
    users.forEach((user, index) => {
        user.id = index + 1;
    });
    res.redirect('/usuarios'); // Redireciona de volta para a página de usuários após a exclusão
});


// Função para validar a renda mensal (apenas valores numéricos e com até duas casas decimais)
function validarRendaMensal(rendaMensal) {
    // Verifica se é um número válido com até duas casas decimais
    return /^\d+(\.\d{1,2})?$/.test(rendaMensal);
}

// Função para validar o número
function validarNumero(numero) {
    return /^[0-9]+$/.test(numero);
}

// Função para validar o complemento (aceita texto livre)
function validarComplemento(complemento) {
    // Não é necessário validação específica, pois aceita texto livre
    return true;
}






// Rota para renderizar a página de cadastro de usuário
app.get('/cadastro', (req, res) => {
    res.render('cadastro', { mensagemErro: '', dadosFormulario: {} }); // Inicializa a variável dadosFormulario
});

// Rota para processar os dados do formulário de cadastro
app.post('/usuarios', (req, res) => {
    const { nome, cpf, dataNascimento, sexo, estadoCivil, rendaMensal, logradouro, estado, cidade, numero, complemento } = req.body;

    // Validação do nome
    if (nome.length < 3) {
        return res.render('cadastro', { mensagemErro: 'Nome deve conter no mínimo 3 caracteres.', dadosFormulario: req.body });
    }

    // Validação do CPF
    if (!validarCPF(cpf)) {
        return res.render('cadastro', { mensagemErro: 'CPF inválido. O CPF deve estar no formato XXX.XXX.XXX-XX.', dadosFormulario: req.body });
    }

    // Validação da data de nascimento
    if (!validarDataNascimento(dataNascimento)) {
        return res.render('cadastro', { mensagemErro: 'Data de nascimento inválida.', dadosFormulario: req.body });
    }

    // Validação do estado civil
    const estadosCivisValidos = ['Solteiro(a)', 'Casado(a)', 'Separado(a)', 'Divorciado(a)', 'Viúvo(a)'];
    if (!estadosCivisValidos.includes(estadoCivil)) {
        return res.render('cadastro', { mensagemErro: 'Estado civil inválido.', dadosFormulario: req.body });
    }

    // Validação da renda mensal
    if (!validarRendaMensal(rendaMensal)) {
        return res.render('cadastro', { mensagemErro: 'Renda mensal inválida. Insira apenas valores numéricos com até duas casas decimais.', dadosFormulario: req.body });
    }

    // Validação do logradouro
    if (logradouro.length < 3) {
        return res.render('cadastro', { mensagemErro: 'Logradouro deve conter no mínimo 3 caracteres.', dadosFormulario: req.body });
    }

    // Validação do número
    if (!validarNumero(numero)) {
        return res.render('cadastro', { mensagemErro: 'Número inválido. Insira apenas números inteiros.', dadosFormulario: req.body });
    }

    // Validação da cidade
    if (cidade.length < 3) {
        return res.render('cadastro', { mensagemErro: 'Cidade deve conter no mínimo 3 caracteres.', dadosFormulario: req.body });
    }

    // Adicionar usuário à lista de usuários
    const newUser = { id: users.length + 1, nome, email: `${nome.toLowerCase().replace(/\s+/g, '')}@gmail.com`, dataNascimento, sexo, estadoCivil, rendaMensal, logradouro, estado, cidade, numero, complemento };
    users.push(newUser);
    res.redirect('/usuarios');
});

app.get('/completed', (req, res) => {
    res.render('completed');
});



app.delete('/usuarios/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(user => user.id !== userId);
    users.forEach((user, index) => {
        user.id = index + 1;
    });
    res.redirect('/usuarios');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});