import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext'; // carga o contexto de usuario 
const fetcher = url => fetch(url).then(res => res.json());

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" aria-modal="true" role="dialog">
      <div className="modal-content">
        {children}
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button className="icon-btn" onClick={onClose}>Pechar ✖</button>
        </div>
      </div>
    </div>
  );
}

export default function Empresas() {
  const { data, error, mutate } = useSWR('/api/empresas', fetcher);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [posto, setPosto] = useState('');
  const [activa, setActiva] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresaDetalles, setEmpresaDetalles] = useState(null);
  const [editandoEmpresa, setEditandoEmpresa] = useState(null);
  const [mostrarNovaEmpresa, setMostrarNovaEmpresa] = useState(false);
  const { user } = useUser(); // aquí carga usuario mailo rol
  if (!user) return <div className="main-container">Debes iniciar sesión.</div>;

  const router = useRouter();
const rol = user?.rol; // o "?" é por seguridade, por se non está logueado.
  if (error) return <div className="main-container">Erro ao cargar empresas.</div>;
  if (!data) return <div className="main-container">Cargando empresas...</div>;

  // Crear empresa
  async function engadirEmpresa(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, categoria, posto, activa, email, telefono }),
      });
      if (!res.ok) throw new Error('Erro ao crear empresa');
      setNome('');
      setCategoria('');
      setPosto('');
      setActiva(false);
      setEmail('');
      setTelefono('');
      setMostrarNovaEmpresa(false);
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // Eliminar empresa
  async function eliminarEmpresa(id) {
    if (!confirm('Seguro que queres eliminar esta empresa?')) return;
    try {
      const res = await fetch('/api/empresas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Erro ao eliminar');
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // Editar empresa
  function iniciarEdicion(empresa) {
    setEditandoEmpresa({ ...empresa });
  }

  // Actualizar empresa (PUT)
  async function actualizarEmpresa(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/empresas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoEmpresa._id,
          nome: editandoEmpresa.nome,
          categoria: editandoEmpresa.categoria,
          posto: editandoEmpresa.posto,
          activa: editandoEmpresa.activa,
          email: editandoEmpresa.email,
          telefono: editandoEmpresa.telefono
        })
      });
      if (!res.ok) throw new Error('Erro ao actualizar');
      setEditandoEmpresa(null);
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  return (
    <div className="main-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div><strong>Tipo:</strong> {rol === 'admin' ? 'Administrador' : 'Usuario normal'}</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="icon-btn" onClick={() => router.push('/promocions')}>
            Ir a promocións
          </button>
          <button className="icon-btn" onClick={() => router.push('/')}>
            Fechar sesión
          </button>
        </div>
      </div>
      <h1>Empresas</h1>
       {rol === 'admin' && (<button
        className="icon-btn"
        style={{ marginBottom: 14, marginTop: 8 }}
        onClick={() => setMostrarNovaEmpresa(x => !x)}
      >
        {mostrarNovaEmpresa ? "Fechar formulario ✖" : "Engadir nova empresa ➕"}
      </button>)}
      {mostrarNovaEmpresa && (
        <form onSubmit={engadirEmpresa} style={{ marginBottom: 30, marginTop: 14, background: "#f7f7f7", padding: 16, borderRadius: 8 }}>
          <h2>Nova empresa</h2>
          <div className="section-row">
            <input
              placeholder="Nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              style={{ minWidth: 120 }}
            />
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              required
            >
              <option value="">Unidade</option>
              <option value="TCAE">TCAE</option>
              <option value="CFGB">CFGB</option>
              <option value="CFGM">CFGM</option>
            </select>
            <input
              placeholder="Posto"
              value={posto}
              onChange={e => setPosto(e.target.value)}
              required
              style={{ minWidth: 80 }}
            />
            <label className="section-row" style={{ gap: 3, fontSize: 15 }}>
              <input
                type="checkbox"
                checked={activa}
                onChange={e => setActiva(e.target.checked)}
                style={{ marginRight: 4 }}
              />
              Activa
            </label>
          </div>
          <div className="section-row">
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ minWidth: 110 }}
            />
            <input
              placeholder="Teléfono"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              required
              style={{ minWidth: 90 }}
            />
          </div>
          <button className="icon-btn" type="submit">Engadir empresa 💾</button>
        </form>
      )}
  <ul>
  {data.map(e => (
    <li key={e._id}>
      <div className="section-row" style={{ fontSize: 15, marginBottom: 3 }}>
        <span style={{ fontWeight: 'bold', flex: 1, minWidth: 100 }}>{e.nome}</span>
        <span style={{ minWidth: 65 }}>{e.categoria}</span>
        <span style={{ minWidth: 65 }}>{e.posto}</span>
        <span style={{ color: e.activa ? 'green' : 'gray', minWidth: 52 }}>
          {e.activa ? "Activa" : "Inactiva"}
        </span>
        <div className="btn-group">
          <button className="icon-btn" title="Detalles" onClick={() => setEmpresaDetalles(e)}>👁</button>
          {rol === 'admin' && ( <button className="icon-btn" title="Editar" onClick={() => iniciarEdicion(e)}>🖉</button>)}
          <button className="icon-btn danger" title="Eliminar" onClick={() => eliminarEmpresa(e._id)}>🗑</button>
        </div>
      </div>
    </li>
  ))}
</ul>


      {/* Modal detalles */}
      <Modal open={!!empresaDetalles} onClose={() => setEmpresaDetalles(null)}>
        {empresaDetalles && (
          <div>
            <h3>Detalles de {empresaDetalles.nome}</h3>
            <div><strong>Categoría:</strong> {empresaDetalles.categoria}</div>
            <div><strong>Posto:</strong> {empresaDetalles.posto}</div>
            <div><strong>Estado:</strong> {empresaDetalles.activa ? 'Activa' : 'Inactiva'}</div>
            <div><strong>Email:</strong> {empresaDetalles.email}</div>
            <div><strong>Teléfono:</strong> {empresaDetalles.telefono}</div>
          </div>
        )}
      </Modal>

      {/* Modal pra editar */}
      <Modal open={!!editandoEmpresa} onClose={() => setEditandoEmpresa(null)}>
        {editandoEmpresa && (
          <form onSubmit={actualizarEmpresa}>
            <h3>Editar empresa</h3>
            <div className="section-row">
              <input
                placeholder="Nome"
                value={editandoEmpresa.nome}
                onChange={e => setEditandoEmpresa({ ...editandoEmpresa, nome: e.target.value })}
                required
                style={{ minWidth: 120 }}
              />
              <select
                value={editandoEmpresa.categoria}
                onChange={e => setEditandoEmpresa({ ...editandoEmpresa, categoria: e.target.value })}
                required
              >
                <option value="">Unidade</option>
                <option value="TCAE">TCAE</option>
                <option value="CFGB">CFGB</option>
                <option value="CFGM">CFGM</option>
              </select>
              <input
                placeholder="Posto"
                value={editandoEmpresa.posto}
                onChange={e => setEditandoEmpresa({ ...editandoEmpresa, posto: e.target.value })}
                required
                style={{ minWidth: 80 }}
              />
              <label className="section-row" style={{ gap: 3, fontSize: 15 }}>
                <input
                  type="checkbox"
                  checked={editandoEmpresa.activa}
                  onChange={e => setEditandoEmpresa({ ...editandoEmpresa, activa: e.target.checked })}
                  style={{ marginRight: 4 }}
                />
                Activa
              </label>
            </div>
            <div className="section-row">
              <input
                placeholder="Email"
                type="email"
                value={editandoEmpresa.email}
                onChange={e => setEditandoEmpresa({ ...editandoEmpresa, email: e.target.value })}
                required
                style={{ minWidth: 110 }}
              />
              <input
                placeholder="Teléfono"
                value={editandoEmpresa.telefono}
                onChange={e => setEditandoEmpresa({ ...editandoEmpresa, telefono: e.target.value })}
                required
                style={{ minWidth: 90 }}
              />
            </div>
            <button className="icon-btn" type="submit">Gardar cambios 💾</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
