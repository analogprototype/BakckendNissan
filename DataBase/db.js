const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Configura los parámetros de la conexión a la base de datos usando variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Usar variable de entorno para el host
  user: process.env.DB_USER, // Usar variable de entorno para el usuario
  password: process.env.DB_PASSWORD, // Usar variable de entorno para la contraseña
  database: process.env.DB_DATABASE, // Usar variable de entorno para la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar la conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conexión a la base de datos exitosa.");
    connection.release(); // Liberar la conexión después de la prueba
  } catch (err) {
    console.error("Error conectando a la base de datos:", err.message);
  }
})();

module.exports = pool;
