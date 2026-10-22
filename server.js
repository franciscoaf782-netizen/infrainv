const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "mi_clave_secreta_jwt";

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: "127.0.0.1",
    port: 3307, 
    user: "root",
    password: "72218503g",
    database: "infrainv" 
});

conexion.connect((err) => {
    if (err) return console.error("❌ Error DB:", err.message);
    console.log("✅ Conectado a MySQL");
    crearAdmin();
});

const crearAdmin = () => {
    const adminEmail = "admin@infrainv.com";
    conexion.query("SELECT * FROM usuarios WHERE email = ?", [adminEmail], async (err, res) => {
        if (res && res.length === 0) {
            const hash = await bcrypt.hash("1234", 10);
            conexion.query("INSERT INTO usuarios (nombre, email, password, rol) VALUES ('Admin', ?, ?, 'Admin')", [adminEmail, hash], () => {
                console.log("✅ Admin creado: admin@infrainv.com / 1234");
            });
        }
    });
};

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: "Faltan datos" });

    conexion.query("SELECT * FROM usuarios WHERE email = ?", [email], async (error, resultado) => {
        if (error) return res.status(500).json(error);
        if (resultado.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        
        const usuario = resultado[0];
        const valida = await bcrypt.compare(password, usuario.password);
        if (!valida) return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: "8h" });
        
        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    });
});

app.get("/prestamos", (req, res) => {
    const sql = `
        SELECT p.id, u.nombre AS utensilio, us.nombre AS usuario, p.fecha_prestamo, p.estado 
        FROM prestamos p
        JOIN utensilios u ON p.utensilio_id = u.id
        JOIN usuarios us ON p.usuario_id = us.id
        ORDER BY p.fecha_prestamo DESC
    `;
    conexion.query(sql, (error, resultado) => {
        if (error) return res.status(500).json({ mensaje: "Error en la base de datos", error });
        res.json(resultado);
    });
});

app.listen(3000, () => console.log("🚀 Servidor backend en el puerto 3000"));