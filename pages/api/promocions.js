import connectToDatabase from '../../lib/mongodb';
import Promocion from '../../models/Promocion';

export default async function handler(req, res) {
  await connectToDatabase();

  // GET: obter todas as promocións
  if (req.method === 'GET') {
    try {
      const promocions = await Promocion.find();
      res.status(200).json(promocions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // POST: crear nova promoción
  } else if (req.method === 'POST') {
    try {
      const { nome, unidade, alumnos } = req.body;
      const novaPromocion = new Promocion({ nome, unidade, alumnos });
      const saved = await novaPromocion.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // PUT: modificar promoción por ID
  } else if (req.method === 'PUT') {
    try {
      const { id, nome, unidade, alumnos } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Falta o ID da promoción para modificar' });
      }
      const updated = await Promocion.findByIdAndUpdate(
        id,
        { nome, unidade, alumnos },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Promoción non atopada' });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // DELETE: eliminar promoción por ID
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Falta o ID da promoción para eliminar' });
      }
      const deleted = await Promocion.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Promoción non atopada' });
      }
      res.status(200).json({ message: 'Promoción eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  } else {
    res.status(405).json({ error: 'Método non permitido' });
  }
}