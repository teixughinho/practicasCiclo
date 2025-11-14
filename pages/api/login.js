import connectToDatabase from '../../lib/mongodb'
import Usuario from '../../models/Usuario'

export default async function handler(req, res) {
  await connectToDatabase()

  if (req.method === 'POST') {
    const { nome, contrasinal } = req.body

    if (!nome || !contrasinal) {
      return res.status(400).json({ error: 'Faltan datos' })
    }

    try {
      const usuario = await Usuario.findOne({ nome, contrasinal })
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais incorrectas' })
      }

      res.status(200).json({ nome: usuario.nome, rol: usuario.rol })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Método non permitido' })
  }
}