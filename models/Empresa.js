import mongoose from 'mongoose';


const empresaSchema = new mongoose.Schema({
  nome: String,
  categoria: String,
  posto: String,
  activa: Boolean,
  email: String,
  telefono: String,
  asignadoA: {
    nome: String,
    dni: String,
    promocionId: mongoose.Schema.Types.ObjectId // referencia á promoción
  }
})

// Exportar modelo, reutilizando se xa existe
export default mongoose.models.Empresa || mongoose.model('Empresa', empresaSchema);