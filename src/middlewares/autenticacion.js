// Importación del JWT
import jwt from 'jsonwebtoken'
// Importar el modelo
import Veterinario from '../models/Veterinario.js'

// Definir la función para validar el JWT
const verificarAutenticacion = async (req, res, next) => {
    // Validación del jwt
    // req.bdy
    // res.params
    // req.headers.authorization ()
    if (!req.headers.authorization) return res.status(404).json({ msg: "Lo sentimos, debes proprocionar un token" })
    // Obtener jwt
    const { authorization } = req.headers
    try {
        // Obtener solo el token y verificar el mismo
        const { id } = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET)
        // Obtener el usuario en base al ID
        req.veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
        // next
        next()
    } catch (error) {
        // Mandar mensajes de error
        const e = new Error("Formato del token no válido")
        return res.status(404).json({ msg: e.message })
    }
}

// Exportar la función
export default verificarAutenticacion