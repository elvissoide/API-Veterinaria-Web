// Importación de la varuable app por medio de módulos
import app from './server.js'
import connection from './database.js';

connection()

// Ejecutar el servidor por medio del puerto 3000
app.listen(app.get('port'),()=>{
    console.log(`Server ok on http://localhost:${app.get('port')}`);
})