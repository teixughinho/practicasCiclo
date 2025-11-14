import connectToDatabase from '../../lib/mongodb';
import Empresa from '../../models/Empresa';

export default async function handler(req, res) {
  await connectToDatabase();

  // GET: obter todas as empresas
  if (req.method === 'GET') {
    try {
      const empresas = await Empresa.find();
      res.status(200).json(empresas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // POST: crear unha nova empresa
  } else if (req.method === 'POST') {
    try {
      const { nome, categoria, posto, activa, email, telefono } = req.body;
      const novaEmpresa = new Empresa({ nome, categoria, posto, activa, email, telefono });
      const saved = await novaEmpresa.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // PUT: modificar unha empresa existente por ID
  } else if (req.method === 'PUT') {
    try {
      const { id, nome, categoria, posto, activa, email, telefono } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Falta o ID da empresa para modificar' });
      }
      const updated = await Empresa.findByIdAndUpdate(
        id,
        { nome, categoria, posto, activa, email, telefono },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Non se atopou a empresa' });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // DELETE: eliminar unha empresa por ID
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Falta o ID da empresa para eliminar' });
      }
      const deleted = await Empresa.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Empresa non atopada' });
      }
      res.status(200).json({ message: 'Empresa eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  // Métodos non permitidos
  } else {
    res.status(405).json({ error: 'Método non permitido' });
  }
}