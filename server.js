const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./DataBase/db"); // Importa la conexión de la base de datos
const pool = require("./DataBase/db"); // Importa el pool desde el archivo de conexión

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

/* ENDPOINTS TABLA DE EQUIPOS */

// Endpoint para obtener todos los equipos
app.get("/equipos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM equipos");
    res.json({
      message: "success",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para agregar un nuevo equipo
app.post("/equipos", async (req, res) => {
  try {
    const {
      nombre_dueno,
      apellido_dueno,
      modelo,
      fecha_ingreso,
      telefono,
      fallo,
    } = req.body;
    const sql = `INSERT INTO equipos (nombre_dueno, apellido_dueno, modelo, fecha_ingreso, telefono, fallo) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      nombre_dueno,
      apellido_dueno,
      modelo,
      fecha_ingreso,
      telefono,
      fallo,
    ];

    const [result] = await db.query(sql, params);

    res.json({
      message: "Equipo agregado con éxito",
      data: { id: result.insertId, ...req.body },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para actualizar un equipo
app.put("/equipos/:id", async (req, res) => {
  try {
    const {
      nombre_dueno,
      apellido_dueno,
      modelo,
      fecha_ingreso,
      telefono,
      fallo,
    } = req.body;
    const { id } = req.params;
    const sql = `UPDATE equipos SET nombre_dueno = ?, apellido_dueno = ?, modelo = ?, fecha_ingreso = ?, telefono = ?, fallo = ? WHERE id = ?`;
    const params = [
      nombre_dueno,
      apellido_dueno,
      modelo,
      fecha_ingreso,
      telefono,
      fallo,
      id,
    ];

    await db.query(sql, params);

    res.json({
      message: "Equipo actualizado con éxito",
      data: { id, ...req.body },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para eliminar un equipo
app.delete("/equipos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM equipos WHERE id = ?`;

    await db.query(sql, [id]);

    // Comprobar si ya no hay registros en la tabla
    const [remainingEquipos] = await db.query(
      "SELECT COUNT(*) as count FROM equipos"
    );

    if (remainingEquipos[0].count === 0) {
      // Reiniciar la secuencia del ID si no hay registros
      await db.query("ALTER TABLE equipos AUTO_INCREMENT = 1");
    }

    res.json({ message: "Equipo eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un equipo por ID
app.get("/equipos/:id", async (req, res) => {
  const id = req.params.id; // Obtener el ID de los parámetros de la URL
  try {
    const [rows] = await pool.query("SELECT * FROM equipos WHERE id = ?", [id]);

    // Verificar si se encontró un equipo
    if (rows.length === 0) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    // Devolver los datos del equipo encontrado
    res.json({ data: rows[0] });
  } catch (error) {
    console.error("Error al obtener el equipo:", error); // Log para verificar el error
    res
      .status(500)
      .json({ message: "Error al obtener el equipo", error: error.message });
  }
});

/* ENDPOINTS SISTEMA DE LOGIN */
const bcrypt = require('bcrypt');

// Endpoint para registrar usuarios
app.post('/register', async (req, res) => {
  const { nombreusuario, email, password } = req.body;

  // Verificar si el correo ya está registrado
  const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    return res.status(400).json({ message: 'Este correo ya está registrado' });
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar el usuario en la base de datos
  try {
    const [result] = await pool.query('INSERT INTO usuarios (nombreusuario, email, password) VALUES (?, ?, ?)', [nombreusuario, email, hashedPassword]);
    res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error });
  }
});

// Endpoint para iniciar sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario por email
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
  }

  const user = rows[0];

  // Comparar la contraseña encriptada
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
  }

  // Respuesta
  res.json({ message: 'Inicio de sesión exitoso' });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
