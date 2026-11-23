
const pool = require('./config/database');

async function testarConexao() {
    try {
        const resultado = await pool.query('SELECT NOW()');

        console.log('Conexão com PostgreSQL realizada com sucesso!');
        console.log('Horário do banco:', resultado.rows[0].now);

    } catch (erro) {
        console.error('Erro ao conectar com o banco:', erro.message);
    } finally {
        await pool.end();
    }
}

testarConexao();
