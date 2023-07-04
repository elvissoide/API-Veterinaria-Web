import Veterinario from "../models/Veterinario.js"
//import sendMailToUser from "../config/nodemailer.js"
import { sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose";

const login = async (req, res) => {
    // Capturar los datos del request
    const { email, password } = req.body
    // Validación de campos vacíos
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    // Obtener el usuario en base al email
    const veterinarioBDD = await Veterinario.findOne({ email }).select("-status -__v -token -updatedAt -createdAt")
    // Validación de la cuenta de email
    if (veterinarioBDD?.confirmEmail === false) return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" })
    // Validar si existe el usuario
    if (!veterinarioBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
    // Validar si el password del request es el mismo de la BDD
    const verificarPassword = await veterinarioBDD.matchPassword(password)
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" })
    // Creación del token
    const token = generarJWT(veterinarioBDD._id)
    // Desestructurar la info del usuario
    const { nombre, apellido, direccion, telefono, _id } = veterinarioBDD
    // Presentar datos
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email: veterinarioBDD.email
    })
}
const perfil = (req, res) => {
    delete req.veterinarioBDD.token
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)
}
const registro = async (req, res) => {
    // Capturar los datos del body de la petición
    const { email, password } = req.body
    // Validación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    // Verificar existencia del email
    const verificarEmailBDD = await Veterinario.findOne({ email })
    if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" })
    // Crear la instancia del modelo
    const nuevoVeterinario = new Veterinario(req.body)
    // Encriptar el password del usuario
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    // Crear el token para el usuario
    const token = nuevoVeterinario.crearToken()
    // Invocar la funcion para el envio del correo
    await sendMailToUser(email, token)
    // Guardar en BDD
    await nuevoVeterinario.save()
    // Enviar respuesta
    res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" })
}
const confirmEmail = async (req, res) => {
    // Validar el token del correo
    if (!(req.params.token)) return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    // Verificar si en base al token existe ese usuario
    const veterinarioBDD = await Veterinario.findOne({ token: req.params.token })
    // Validar si el token ya fue seteado a null
    if (!veterinarioBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" })
    // Setear a null el token y cambiar a true la confirmación de la cuenta
    veterinarioBDD.token = null
    // Cambiar a true la configuración de la cuenta
    veterinarioBDD.confirmEmail = true
    // Guardar cambios en BDD
    await veterinarioBDD.save()
    // Presentar mensajes al usuario
    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" })
}
const listarVeterinarios = (req, res) => {
    res.status(200).json({ res: 'lista de veterinarios registrados' })
}
const detalleVeterinario = async (req, res) => {
    // Obtener datos del request params
    const { id } = req.params
    // Validar el id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    // Obtener el usuario en bae al id
    const veterinarioBDD = await Veterinario.findById(id).select("-password")
    // Validar si existe el usuario
    if (!veterinarioBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el veterinario ${id}` })
    // Obtener datos del usuario
    res.status(200).json({ msg: veterinarioBDD })
}
const actualizarPerfil = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    const veterinarioBDD = await Veterinario.findById(id)
    if (!veterinarioBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el veterinario ${id}` })
    if (veterinarioBDD.email != req.body.email) {
        const veterinarioBDDMail = await Veterinario.findOne({ email: req.body.email })
        if (veterinarioBDDMail) {
            return res.status(404).json({ msg: `Lo sentimos, el existe ya se encuentra registrado` })
        }
    }
    veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion || veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({ msg: "Perfil actualizado correctamente" })
}
const actualizarPassword = (req, res) => {
    res.status(200).json({ res: 'actualizar password de un veterinario registrado' })
}
const recuperarPassword = async (req, res) => {
    // Capturar el email del request
    const { email } = req.body
    // Validación de campos vacíos
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    // Obtener el usuario en base al email
    const veterinarioBDD = await Veterinario.findOne({ email })
    // Validación de la existencia del usuario
    if (!veterinarioBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
    // Crear token
    const token = veterinarioBDD.crearToken()
    // Establecer el token en el usuario obtenido previamente
    veterinarioBDD.token = token
    // Enviar el email de recuperación
    await sendMailToRecoveryPassword(email, token)
    // Guardar los cambios en BDD
    await veterinarioBDD.save()
    // Presentar los mensajes al usuario
    res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })
}
const comprobarTokenPasword = async (req, res) => {
    // Validar el token
    if (!(req.params.token)) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    // Obtener el usuario en base al token
    const veterinarioBDD = await Veterinario.findOne({ token: req.params.token })
    // Validación de la existencia del usuario
    if (veterinarioBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    // Guardar en BDD
    await veterinarioBDD.save()
    // Presentar mensajes al usuario
    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
}
const nuevoPassword = async (req, res) => {
    // Obtener el password nuevo y la confirmación del password del request
    const { password, confirmpassword } = req.body
    // Validación de campos vacíos
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    // Validación de coincidencia de los password
    if (password != confirmpassword) return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" })
    // Obtener los datos del usuario en base al token
    const veterinarioBDD = await Veterinario.findOne({ token: req.params.token })
    // Validar la existencia del usuario
    if (veterinarioBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    // Setear el token nuevamente a null
    veterinarioBDD.token = null
    // 
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    // Guardar en BDD
    await veterinarioBDD.save()
    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" })
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