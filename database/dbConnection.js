import mysql from "mysql"
import mongoose from "mongoose"

export const dbConnection = async() => {
    const conexion = mysql.createConnection({
    host: "localhost",
    database: "CAMBIAR",
    user: "usergc",
    password: "hypertrolado" 
})

    conexion.connect((err) => {
        if (err) 
            throw err
        else
            console.log("conexion exitosa")
    })
}



export const dbMongo = async() => {
    try {
        console.info("Abriendo base de datos")
        const mongoDB = await mongoose.connect(process.env.BASE_URL_DB)
        console.info("Conectado a: ", mongoDB.connection.name)
    } catch (error) {
        console.error("Error al abrir conectarse a la DB")
        throw Error(error)
    }
}