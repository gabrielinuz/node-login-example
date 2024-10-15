// Importamos las bibliotecas necesarias
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Inicializamos la aplicación de Express
const app = express();

// Middlewares para manejar JSON y permitir CORS (para conectar frontend y backend)
app.use(express.json());
app.use(cors());

// Configurar strictQuery según el comportamiento deseado
mongoose.set('strictQuery', true); // Opción recomendada si deseas mantener el comportamiento actual
// mongoose.set('strictQuery', false); // Opción recomendada si deseas prepararte para el cambio

// Conectamos a MongoDB
mongoose.connect('mongodb://localhost:27017/userAuth')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definimos el esquema y modelo de usuario en Mongoose
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Ruta de registro (POST): aquí los usuarios se registran
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validamos si el usuario ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    // Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el nuevo usuario
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
});

// Ruta de login (POST): aquí los usuarios inician sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verificamos si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparamos la contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generamos un token JWT
    const token = jwt.sign({ userId: user._id }, 'mi_secreto', { expiresIn: '1h' });

    res.status(200).json({ token, message: 'Inicio de sesión exitoso' });
});

// Inicializamos el servidor en el puerto 5000
app.listen(5000, () => console.log('Servidor escuchando en el puerto 5000'));
