import connectToDatabase from '../../lib/mongodb'
import Usuario from '../../models/Usuario'
export default async function handler(req, res) {
  await connectToDatabase()

  if (req.method === 'POST') {
    const { nome, contrasinal, rol } = req.body

    if (!nome || !contrasinal || !rol) {
      return res.status(400).json({ error: 'Faltan campos obrigatorios' })
    }

    try {
      const novoUsuario = new Usuario({ nome, contrasinal, rol })
      const saved = await novoUsuario.save()
      res.status(201).json(saved)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Método non permitido' })
  }
}