import mysql from "mysql"

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
