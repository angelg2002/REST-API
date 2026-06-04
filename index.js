require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


app.use(express.json());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


// API PARA LA PARTE DE USUARIOS Y AUTENTICACION
app.post('/registro', async (req, res) => {
    //aca va la logica para registrar un usuario
    const { name, email, password } = req.body;
    //aqui se guardaria el usuario en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)';
    db.execute(query, [name, email, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ message: 'Error al registrar usuario' });
        }
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    })
});


app.post('/login', async (req, res) => {
    //aca va la logica para iniciar sesion
    const { email, password } = req.body;
    const query = "SELECT *  FROM usuarios WHERE correo = ?";
    db.execute(query, [email], async (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            return res.status(500).json({ message: 'Error al iniciar sesión' });
        } else if (results.length === 0) {
            return res.status(401).json({ message: 'Correo no encontrado' });
        }
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    });
});

//API PARA LA PARTE DE PRODUCTOS

//para agregar un nuevo articulo a la base de datos

app.post('/articulos', (req, res) => {
    const { product, price, stock } = req.body;
    const query = 'INSERT INTO articulos (producto, valor, stock) VALUES (?, ?, ?)';
    db.execute(query, [product, price, stock], (err, results) => {
        if (err) {
            console.error('Error al agregar artículo:', err);
            return res.status(500).json({ message: 'Error al agregar artículo' });
        }
        res.status(201).json({ message: 'Artículo agregado exitosamente' });
    });
});

//para obtener todos los articulos de la base de datos

app.get('/articulos', (req, res) => {
    const query = 'SELECT * FROM articulos';
    db.execute(query, (err, results) => {
        if (err) {
            console.error('Error al obtener artículos:', err);
            return res.status(500).json({ message: 'Error al obtener artículos' });
        }
        res.status(200).json({ message: 'Artículos obtenidos exitosamente', data: results });
    });
});


// para actualizar un articulo de la base de datos
app.put('/articulos/:id', (req, res) => {
    const { id } = req.params;
    const { product, price, stock } = req.body;
    const query = 'UPDATE articulos SET producto = ?, valor = ?, stock = ? WHERE id = ?';
    db.execute(query, [product, price, stock, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar artículo:', err);
            return res.status(500).json({ message: 'Error al actualizar artículo' });
        }
        res.status(200).json({ message: 'Artículo actualizado exitosamente' });
    });
});

// para eliminar un articulo de la base de datos    
app.delete('/articulos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM articulos WHERE id = ?'
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar artículo:', err);
            return res.status(500).json({ message: 'Error al eliminar artículo' });
        }
        res.status(200).json({ message: 'Artículo eliminado exitosamente' });
    });
});