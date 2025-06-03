const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Validaciones para registro
const registerValidations = [
  check("name").notEmpty().withMessage("El nombre es requerido"),
  check("email").isEmail().withMessage("Email inválido"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

// Ruta de registro
router.post("/register", registerValidations, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "El usuario ya existe" });
    }

    // Crear nuevo usuario
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    await user.save();

    // Enviar correo de bienvenida
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "¡Bienvenido a NewLifeRun Club!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff69b4;">¡Bienvenido a NewLifeRun Club!</h1>
          <p>Hola ${name},</p>
          <p>¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte con nosotros.</p>
          <p>Con tu cuenta podrás:</p>
          <ul>
            <li>Acceder a entrenamientos personalizados</li>
            <li>Participar en eventos y competencias</li>
            <li>Conectar con otros corredores</li>
            <li>Seguir tu progreso</li>
          </ul>
          <p>¡Comienza tu viaje con nosotros ahora!</p>
          <a href="${process.env.WEBSITE_URL}" style="background: #ff69b4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Ir a NewLifeRun Club</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Si no creaste esta cuenta, por favor ignora este correo.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      user: { name, email },
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Ruta de login
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Email inválido"),
    check("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ success: false, message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Credenciales inválidas" });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Credenciales inválidas" });
      }

      res.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
        },
        message: "Login exitoso",
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  }
);

module.exports = router;
