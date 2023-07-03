// Type module
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

// Inicializaciones
// Inicializar express en la variable app
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())

// Variables globales


// Rutas 
app.get('/',(req,res)=>{
    res.send("Server on")
})

// Exportacion por default
export default  app