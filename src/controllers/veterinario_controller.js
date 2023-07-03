import Veterinario from "../models/Veterinario.js"
import sendMailToUser from "../config/nodemailer.js"

const login =(req,res)=>{
    res.status(200).json({res:'login del veterinario'})
}
const perfil=(req,res)=>{
    res.status(200).json({res:'perfil del veterinario'})
}
const registro = async (req,res)=>{
    // Capturar los datos del body de la petición
    const {email,password} = req.body
    // Validación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    // Verificar existencia del email
    const verificarEmailBDD = await Veterinario.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    // Crear la instancia del modelo
    const nuevoVeterinario = new Veterinario(req.body)
    // Encriptar el password del usuario
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    // Crear el token para el usuario
    const token = nuevoVeterinario.crearToken()
    // Invocar la funcion para el envio del correo
    await sendMailToUser(email,token)
    // Guardar en BDD
    await nuevoVeterinario.save()
    // Enviar respuesta
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}
const confirmEmail = (req,res)=>{
    res.status(200).json({res:'confirmar email de registro de veterinario'})
}
const listarVeterinarios = (req,res)=>{
    res.status(200).json({res:'lista de veterinarios registrados'})
}
const detalleVeterinario = (req,res)=>{
    res.status(200).json({res:'detalle de un eterinario registrado'})
}
const actualizarPerfil = (req,res)=>{
    res.status(200).json({res:'actualizar perfil de un veterinario registrado'})
}
const actualizarPassword = (req,res)=>{
    res.status(200).json({res:'actualizar password de un veterinario registrado'})
}
const recuperarPassword= (req,res)=>{
    res.status(200).json({res:'enviar mail recuperación'})
}
const comprobarTokenPasword= (req,res)=>{
    res.status(200).json({res:'verificar token mail'})
}
const nuevoPassword= (req,res)=>{
    res.status(200).json({res:'crear nuevo password'})
}

export {
    login,
    perfil,
    registro,
    confirmEmail,
    listarVeterinarios,
    detalleVeterinario,
    actualizarPerfil,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}