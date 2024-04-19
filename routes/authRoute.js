const express = require('express');
const rutas = express.Router();
const Usuario = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// registrar usuarios 
rutas.post('/registro', async (req, res) =>{
    try {
        const {user, email, pass} = req.body;
        const usuario = new Usuario ({user, email, pass});
        await usuario.save();
        res.status(201).json({mensaje: 'Usuario registrado exitosamente'});
    }
    catch(error){
        res.status(404).json({mensaje: error.message});
    }
});
// iniciar sesion
rutas.post('/login', async (req, res) =>{
    try {
        const {email, pass} = req.body;
        const usuario = await Usuario.findOne({ email });
        //encontrar al usuario
        if (!usuario){
            res.status(401).json({mensaje: 'Usuario no encotrado. Credencial incorrecto'});
        }
        //Comparar contrasena 
        const validarContrasena = await usuario.comparePassword(pass);
        if (!validarContrasena){
            res.status(401).json({mensaje: 'Credencial incorrecto. Vuelva a intentarlo'});
        }
       const token = jwt.sign( { userId: usuario._id }, 'clave_secreta_servidor',{expiresIn: '1h'});
        res.json(token);
    }
    catch(error){
        res.status(404).json({mensaje: error.message});
    }
});
let blacklistedTokens = [];

// Ruta para cerrar sesión y deshabilitar el token
rutas.post('/logout', (req, res) => {
    const token = req.headers.authorization;

    // Agregar el token a la lista negra
    blacklistedTokens.push(token);

    // Enviar una respuesta al cliente indicando que la sesión se ha cerrado correctamente
    res.json({ mensaje: "Sesión cerrada correctamente" });
});
rutas.post('/recuperar-contraseña', async (req, res) => {
    const { email } = req.body;

    try {
        // Buscar al usuario por su correo electrónico
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: "El usuario no existe" });
        }
        res.json({ mensaje: "Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});
module.exports = rutas;