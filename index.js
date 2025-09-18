import express from "express"
import 'dotenv/config'
//import { dbConnection } from "./database/dbConnection.js"

import organizationsRoutes from "./routes/organizations.routes.js"
import networksRoutes from "./routes/networks.routes.js"
import devicesRoutes from "./routes/devices.routes.js"
import summaryRoutes from "./routes/summary.routes.js";

import cors from "cors"

const server = express()

const api = async() => {

    const API_PORT = (process.env.PORT || 4000 )
    
    // defino puerto en el .env
    // CORS estricto: sólo el frontend
    // defino localhost
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    server.use(cors({
        origin: (origin, cb) => {
            if (!origin || allowed.includes(origin)) return cb(null, true);
            return cb(new Error('CORS not allowed'), false);
            },
        credentials: true
    }));

    server.use(express.json()) 
    // conexion a la db
    // await dbConnection()

    server.use("/api/organizations", organizationsRoutes)
    server.use("/api/networks", networksRoutes)
    server.use("/api/devices", devicesRoutes)
    server.use("/api/summary", summaryRoutes);

    server.listen(API_PORT, () => {
        console.log(`el servidor está corriendo en el puerto ${API_PORT}`)
        console.log(`http://localhost:${API_PORT}/api`)
    })

}

api()