const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Valores permitidos para o status
const STATUS_OPCOES = ['ATIVO', 'INATIVO', 'FORMADO', 'GRADUANDO'];

// Função de validação do nome
function validarNome(nome) {
  return nome && nome.trim().length > 0;
}

// Função de validação da data de nascimento
function validarDataNascimento(dataNascimento) {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // formato yyyy-mm-dd
  if (!dataNascimento.match(regex)) return false;
  const data = new Date(dataNascimento);
  const hoje = new Date();
  return data instanceof Date && !isNaN(data) && data < hoje;
}

// Função de validação da matrícula
function validarMatricula(matricula) {
  return matricula && matricula.length === 6;
}

// Função de validação do status
function validarStatus(status) {
  return STATUS_OPCOES.includes(status);
}

// Função de validação do e-mail
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && regex.test(email);
}

// CREATE - Adicionar um novo aluno
app.post('/alunos', (req, res) => {
  const { nome, data_nascimento, matricula, status, email } = req.body;

  // Validação do nome
  if (!validarNome(nome)) {
    return res.status(400).json({ error: 'O nome não pode ser nulo ou composto apenas de espaços.' });
  }

  // Validação da data de nascimento
  if (!validarDataNascimento(data_nascimento)) {
    return res.status(400).json({ error: 'A data de nascimento deve ser válida e anterior à data atual.' });
  }

  // Validação da matrícula
  if (!validarMatricula(matricula)) {
    return res.status(400).json({ error: 'A matrícula deve ter exatamente 6 caracteres.' });
  }

  // Validação do status
  if (!validarStatus(status)) {
    return res.status(400).json({ error: 'O status deve ser um dos seguintes: ATIVO, INATIVO, FORMADO, GRADUANDO.' });
  }

  // Validação do e-mail
  if (!validarEmail(email)) {
    return res.status(400).json({ error: 'O e-mail não pode ser nulo e deve ser um e-mail válido.' });
  }

  const sql = `INSERT INTO alunos (nome, data_nascimento, matricula, status, email) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [nome, data_nascimento, matricula, status, email], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Aluno adicionado com sucesso' });
  });
});

// READ - Obter todos os alunos
app.get('/alunos', (req, res) => {
  const sql = `SELECT * FROM alunos`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// READ - Obter um aluno pelo ID
app.get('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM alunos WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json(row);
  });
});

// UPDATE - Atualizar um aluno pelo ID
app.put('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, data_nascimento, matricula, status, email } = req.body;

  // Validação do nome
  if (!validarNome(nome)) {
    return res.status(400).json({ error: 'O nome não pode ser nulo ou composto apenas de espaços.' });
  }

  // Validação da data de nascimento
  if (!validarDataNascimento(data_nascimento)) {
    return res.status(400).json({ error: 'A data de nascimento deve ser válida e anterior à data atual.' });
  }

  // Validação da matrícula
  if (!validarMatricula(matricula)) {
    return res.status(400).json({ error: 'A matrícula deve ter exatamente 6 caracteres.' });
  }

  // Validação do status
  if (!validarStatus(status)) {
    return res.status(400).json({ error: 'O status deve ser um dos seguintes: ATIVO, INATIVO, FORMADO, GRADUANDO.' });
  }

  // Validação do e-mail
  if (!validarEmail(email)) {
    return res.status(400).json({ error: 'O e-mail não pode ser nulo e deve ser um e-mail válido.' });
  }

  const sql = `
    UPDATE alunos
    SET nome = ?, data_nascimento = ?, matricula = ?, status = ?, email = ?
    WHERE id = ?
  `;
  db.run(sql, [nome, data_nascimento, matricula, status, email, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json({ message: 'Aluno atualizado com sucesso' });
  });
});

// DELETE - Remover um aluno pelo ID
app.delete('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM alunos WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json({ message: 'Aluno removido com sucesso' });
  });
});

// Roteamento para arquivos estáticos (frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});