import connectToDatabase from '../../lib/mongodb'
import Empresa from '../../models/Empresa'
import Promocion from '../../models/Promocion'

export default async function handler(req, res) {
  await connectToDatabase()

  if (req.method === 'POST') {
    const { empresaId, alumnoDni, promocionId } = req.body

    if (!empresaId || !alumnoDni || !promocionId) {
      return res.status(400).json({ error: 'Faltan datos obrigatorios' })
    }

    try {
      const empresa = await Empresa.findById(empresaId)
      if (!empresa) return res.status(404).json({ error: 'Empresa non atopada' })
      if (!empresa.activa) return res.status(400).json({ error: 'A oferta xa está asignada' })

      const promocion = await Promocion.findById(promocionId)
      if (!promocion) return res.status(404).json({ error: 'Promoción non atopada' })

      if (empresa.categoria !== promocion.unidade) {
        return res.status(400).json({ error: 'A categoría da empresa non coincide coa da promoción' })
      }

      const alumno = promocion.alumnos.find(a => a.dni === alumnoDni)
      if (!alumno) return res.status(404).json({ error: 'Alumno non atopado na promoción' })

      // Actualizar empresa
      empresa.activa = false
      empresa.asignadoA = {
        nome: alumno.nome,
        dni: alumno.dni,
        promocionId: promocion._id
      }
      await empresa.save()

      // Actualizar alumno
      alumno.empresaAsignada = {
        empresaId: empresa._id,
        nomeEmpresa: empresa.nome,
        posto: empresa.posto
      }
      await promocion.save()

      res.status(200).json({ message: 'Oferta asignada correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  else if (req.method === 'PUT') {
    const { empresaId, alumnoDni, promocionId } = req.body

    if (!empresaId || !alumnoDni || !promocionId) {
      return res.status(400).json({ error: 'Faltan datos obrigatorios' })
    }

    try {
      const empresa = await Empresa.findById(empresaId)
      if (!empresa) return res.status(404).json({ error: 'Empresa non atopada' })

      const promocion = await Promocion.findById(promocionId)
      if (!promocion) return res.status(404).json({ error: 'Promoción non atopada' })

      const alumno = promocion.alumnos.find(a => a.dni === alumnoDni)
      if (!alumno) return res.status(404).json({ error: 'Alumno non atopado na promoción' })

      // Desasigna empresa
      empresa.activa = true
      empresa.asignadoA = null
      await empresa.save()

      // Desasigna alumno
      alumno.empresaAsignada = null
      await promocion.save()

      res.status(200).json({ message: 'Oferta retirada correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  else {
    res.status(405).json({ error: 'Método non permitido' })
  }
}