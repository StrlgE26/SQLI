const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const queryText = `SELECT id, correo, rol FROM usuarios WHERE correo = '${correo}' AND password = '${password}';`;
        
        console.log("Consulta ejecutada en BD:", queryText);

        const result = await pool.query(queryText);

        if (result.rows.length > 0) {
            res.status(200).json({ mensaje: 'Acceso concedido', usuario: result.rows[0] });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error de SQL: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Aplicación vulnerable corriendo en el puerto ${PORT}`);
});