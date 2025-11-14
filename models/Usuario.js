import mongoose from 'mongoose'

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  contrasinal: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'user'], default: 'user' }
})

export default mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema)
