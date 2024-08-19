const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascimento TEXT NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);
});

module.exports = db;