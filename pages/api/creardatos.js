import connectToDatabase from '../../lib/mongodb';
import Promocion from '../../models/Promocion';
import Empresa from '../../models/Empresa';
//CREAR DATOS INICIAIS FICTICIOS PARA FACER COMPROBACIÓNS
export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      // Comproba se existen datos para que non se dupliquen
      const promoCount = await Promocion.countDocuments();
      const empresaCount = await Empresa.countDocuments();

      if (promoCount === 0) {
        const promocion1 = new Promocion({
          nome: 'Promoción 2025',
          unidade: 'Unidade 1',
          alumnos: [
            { nome: 'Ana Pérez', dni: '12345678A', data_nacemento: '2000-01-01', estado: 'activo' },
            { nome: 'Luis Gómez', dni: '87654321B', data_nacemento: '1999-05-15', estado: 'activo' },
          ],
        });
        await promocion1.save();
      }

      if (empresaCount === 0) {
        const empresa1 = new Empresa({
          nome: 'Empresa Alfa',
          categoria: 'Tecnoloxía',
          posto: 'Desenvolvedor',
          activa: true,
          email: 'contacto@empresa-alfa.com',
          telefono: '123456789',
        });

        const empresa2 = new Empresa({
          nome: 'Empresa Beta',
          categoria: 'Marketing',
          posto: 'Analista',
          activa: false,
          email: 'info@empresa-beta.com',
          telefono: '987654321',
        });

        await empresa1.save();
        await empresa2.save();
      }

      res.status(201).json({ message: 'Datos de proba creados correctamente (se non existían)' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método non permitido' });
  }
}

