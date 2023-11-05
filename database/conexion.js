
const { connect } = require('mongoose')

async function conexion() {

    try {
        await connect(process.env.DB_URL)
        console.log("Conexión a la base de datos exitosa");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }

}
module.exports = { conexion }