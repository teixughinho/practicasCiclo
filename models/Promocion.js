import mongoose from 'mongoose';

const alumnoSchema = new mongoose.Schema({
  nome: String,
  dni: String,
  data_nacemento: String,
  estado: String,
  empresaAsignada: {
    empresaId: mongoose.Schema.Types.ObjectId,
    nomeEmpresa: String,
    posto: String
  }
})

// Esquema para promocións
const promocionSchema = new mongoose.Schema({
  nome: String, // Nome da promoción
  unidade: String, // Unidade á que pertence
  alumnos: [alumnoSchema], // Lista de alumnos
});

// Exportar modelo, reutilizando se xa existe
export default mongoose.models.Promocion || mongoose.model('Promocion', promocionSchema);

