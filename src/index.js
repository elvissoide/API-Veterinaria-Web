// Importación de la varuable app por medio de módulos
import app from './server.js'

// Ejecutar el servidor por medio del puerto 3000
app.listen(3000,()=>{
    console.log(`Server on port ${3000}`);
})