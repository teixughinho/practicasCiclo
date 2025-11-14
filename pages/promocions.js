import { useState } from "react";
import useSWR from "swr";
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext'; 

const fetcher = (url) => fetch(url).then((res) => res.json());

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" aria-modal="true" role="dialog">
      <div className="modal-content">
        {children}
        <div style={{ textAlign: "right", marginTop: 8 }}>
          <button className="icon-btn" onClick={onClose} title="Pechar">findByIdechar ✖</button>
        </div>
      </div>
    </div>
  );
}

function getEmpresasCompatibles(empresas, unidade) {
  if (!empresas || !unidade) return [];
  return empresas.filter(e => e.activa && e.categoria === unidade);
}

export default function Promocions() {
  const { data, error, mutate } = useSWR("/api/promocions", fetcher);
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [alumnos, setAlumnos] = useState([{ nome: "", dni: "", data_nacemento: "", estado: "" }]);
  const [modalAlumnos, setModalAlumnos] = useState(null);
  const [modalAlumno, setModalAlumno] = useState(null);
  const [editandoPromocion, setEditandoPromocion] = useState(null);
  const [mostrarNovaPromocion, setMostrarNovaPromocion] = useState(false);
  const { user } = useUser(); // carga usuario e rol
  if (!user) return <div className="main-container">Debes iniciar sesión.</div>;

  const router = useRouter();
const rol = user?.rol;
  const { data: empresasActivas } = useSWR('/api/empresas', fetcher);

  if (error) return <div className="main-container">Erro ao cargar promocións.</div>;
  if (!data) return <div className="main-container">Cargando promocións...</div>;

  function engadirAlumno() {
    setAlumnos([...alumnos, { nome: "", dni: "", data_nacemento: "", estado: "" }]);
  }

  function actualizarAlumno(index, campo, valor) {
    setAlumnos(al => {
      const novos = [...al];
      novos[index][campo] = valor;
      return novos;
    });
  }

  async function engadirPromocion(e) {
    e.preventDefault();
    for (const alumno of alumnos) {
      if (!alumno.nome || !alumno.dni) {
        alert("Cada alumno debe ter nome e DNI");
        return;
      }
    }
    try {
      const res = await fetch("/api/promocions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, unidade, alumnos }),
      });
      if (!res.ok) throw new Error("Erro ao crear promoción");
      setNome("");
      setUnidade("");
      setAlumnos([{ nome: "", dni: "", data_nacemento: "", estado: "" }]);
      setMostrarNovaPromocion(false);
      mutate();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  async function eliminarPromocion(id) {
    if (!confirm('Seguro que queres eliminar esta promoción?')) return;
    try {
      const res = await fetch('/api/promocions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erro ao eliminar');
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  function iniciarEdicion(promo) {
    setEditandoPromocion({
      ...promo,
      alumnos: promo.alumnos && promo.alumnos.length
        ? promo.alumnos.map(a => ({ ...a }))
        : [{ nome: "", dni: "", data_nacemento: "", estado: "" }]
    });
  }

  function actualizarAlumnoEdicion(index, campo, valor) {
    setEditandoPromocion(p => {
      const novos = [...p.alumnos];
      novos[index][campo] = valor;
      return { ...p, alumnos: novos };
    });
  }

  function engadirAlumnoEdicion() {
    setEditandoPromocion(p => ({
      ...p,
      alumnos: [
        ...p.alumnos,
        { nome: "", dni: "", data_nacemento: "", estado: "" },
      ]
    }));
  }

  function borrarAlumnoEdicion(idx) {
    setEditandoPromocion(p => {
      const novos = [...p.alumnos];
      novos.splice(idx, 1);
      return { ...p, alumnos: novos.length ? novos : [{ nome: "", dni: "", data_nacemento: "", estado: "" }] };
    });
  }

  async function actualizarPromocion(e) {
    e.preventDefault();
    for (const alumno of editandoPromocion.alumnos) {
      if (!alumno.nome || !alumno.dni) {
        alert("Cada alumno debe ter nome e DNI");
        return;
      }
    }
    try {
      const res = await fetch('/api/promocions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editandoPromocion._id,
          nome: editandoPromocion.nome,
          unidade: editandoPromocion.unidade,
          alumnos: editandoPromocion.alumnos,
        }),
      });
      if (!res.ok) throw new Error('Erro ao actualizar');
      setEditandoPromocion(null);
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  async function asignarOferta(alumno, promocionId, empresaId) {
    try {
      const res = await fetch('/api/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoDni: alumno.dni, promocionId, empresaId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao asignar');
      alert('Oferta asignada correctamente');
      mutate();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  async function desasignarOferta(alumno, promocionId, empresaId) {
    try {
      const res = await fetch('/api/asignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoDni: alumno.dni, promocionId, empresaId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao retirar');
      alert('Oferta retirada correctamente');
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
          <button className="icon-btn" onClick={() => router.push('/empresas')}>
            Ir a empresas
          </button>
          <button className="icon-btn" onClick={() => router.push('/')}>
            Fechar sesión
          </button>
        </div>
      </div>

      <h1>Lista de promocións</h1>
       {rol === 'admin' && (<button
        className="icon-btn"
        style={{ marginBottom: 14, marginTop: 8 }}
        onClick={() => setMostrarNovaPromocion(x => !x)}
      >
        {mostrarNovaPromocion ? "Pechar formulario ✖" : "Engadir nova promoción ➕"}
      </button>)}

      {mostrarNovaPromocion && (
        <form onSubmit={engadirPromocion} style={{ marginBottom: 30, marginTop: 14, background: "#f7f7f7", padding: 16, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Nova promoción</h2>
          <div className="section-row">
            <input
              placeholder="Nome promoción"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ minWidth: 120 }}
            />
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              required
            >
              <option value="">Unidade</option>
              <option value="TCAE">TCAE</option>
              <option value="CFGB">CFGB</option>
              <option value="CFGM">CFGM</option>
            </select>
          </div>
          <h3 style={{ marginBottom: 0 }}>Alumnos</h3>
          {alumnos.map((alumno, i) => (
            <div className="alumno" key={i}>
              <input
                placeholder="Nome alumno"
                value={alumno.nome}
                onChange={(e) => actualizarAlumno(i, "nome", e.target.value)}
                required
                style={{ width: 90 }}
              />
              <input
                placeholder="DNI"
                value={alumno.dni}
                onChange={(e) => actualizarAlumno(i, "dni", e.target.value)}
                required
                style={{ width: 82 }}
              />
              <input
                placeholder="Nacemento"
                value={alumno.data_nacemento}
                onChange={(e) => actualizarAlumno(i, "data_nacemento", e.target.value)}
                style={{ width: 105 }}
              />
              <select
                value={alumno.estado}
                onChange={(e) => actualizarAlumno(i, "estado", e.target.value)}
                required
                style={{ width: 67 }}
              >
                <option value="">Estado</option>
                <option value="t">Titula</option>
                <option value="r">Repite</option>
                <option value="b">Baixa</option>
              </select>
              <button
                className="icon-btn danger"
                type="button"
                title="Eliminar alumno"
                onClick={() => {
                  setAlumnos(al => {
                    const novos = [...al];
                    novos.splice(i, 1);
                    return novos.length ? novos : [{ nome: "", dni: "", data_nacemento: "", estado: "" }];
                  });
                }}
              >🗑</button>
            </div>
          ))}
          <button className="icon-btn" type="button" onClick={engadirAlumno}>Engadir alumno ➕</button>
          <button className="icon-btn" type="submit">Gardar promoción 💾</button>
        </form>
      )}

<ul>
  {data.map((promo) => (
    <li key={promo._id} style={{ marginBottom: 18, background: "#fff", borderRadius: 10, boxShadow: '0 1px 8px #0001', padding: '6px 0' }}>
      <div className="promo-row">
        <span className="promo-nome">{promo.nome}</span>
        <span className="promo-unidade">{promo.unidade}</span>
        <div className="btn-group">
            {rol === 'admin' && (<button className="icon-btn" title="Editar" onClick={() => iniciarEdicion(promo)}>🖉</button>)}
          <button className="icon-btn danger" title="Eliminar" onClick={() => eliminarPromocion(promo._id)}>🗑</button>
          <button className="icon-btn" title="Ver alumnos" onClick={() => setModalAlumnos(promo)}>👤</button>
        </div>
      </div>
    </li>
  ))}
</ul>


      {/* Modal alumnos */}
      <Modal open={!!modalAlumnos} onClose={() => setModalAlumnos(null)}>
      {modalAlumnos && (
  <div>
    <h3>Alumnos de {modalAlumnos.nome}</h3>
    {modalAlumnos.alumnos && modalAlumnos.alumnos.length > 0 ? (
    <ul>
  {modalAlumnos.alumnos.map((a, i) => (
    <li key={a.dni || i} style={{ background: 'none', border: 'none', padding: 0, margin: '0 0 2px 0', listStyle: 'none' }}>
      <div className="promo-alumno-row" style={{ flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
        <div style={{ display: 'flex', alignItems: 'center', width: "100%" }}>
          <span className="alumno-nome" style={{ flex: 1 }}>{a.nome}</span>
          <span className="alumno-estado">{{ t: "Titula", r: "Repite", b: "Baixa" }[a.estado] || "-"}</span>
          <div className="btn-group" style={{ marginLeft: "auto" }}>
            <button className="icon-btn" onClick={() => setModalAlumno(a)}>Detalles</button>
            {/* {rol === 'admin' && (a.empresaAsignada ? (
              <button className="icon-btn" title="Desasignar oferta" onClick={() => desasignarOferta(a, modalAlumnos._id, a.empresaAsignada.empresaId)}>Desasignar</button>
            ) : (
              <select style={{ minWidth: 70 }} onChange={e => e.target.value && asignarOferta(a, modalAlumnos._id, e.target.value)} defaultValue="">
                <option value="">Empresa</option>
                {getEmpresasCompatibles(empresasActivas, modalAlumnos.unidade).map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.nome} ({e.posto})
                  </option>
                ))}
              </select>
            ))} */}
          </div>
        </div>
      {a.empresaAsignada && (
    <div className="alumno-asignado" style={{ marginTop: 2, width: "100%" }}>
      <small>Asignada: {a.empresaAsignada.nomeEmpresa}</small>
    </div>
  )}
      </div>
    </li>
  ))}
</ul>

    ) : (
      <div>Sen alumnos.</div>
    )}
  </div>
)}

      </Modal>

      {/* Modal detalles alumno */}
      <Modal open={!!modalAlumno} onClose={() => setModalAlumno(null)}>
        {modalAlumno && (
          <div>
            <h3>Detalles de {modalAlumno.nome}</h3>
            <div><strong>DNI:</strong> {modalAlumno.dni}</div>
            <div><strong>Data nacemento:</strong> {modalAlumno.data_nacemento || '-'}</div>
            <div><strong>Estado:</strong> {{
              t: "Titula", r: "Repite", b: "Baixa"
            }[modalAlumno.estado] || modalAlumno.estado || '-'}</div>
            {modalAlumno.empresaAsignada ? (
              <div style={{ marginTop: 12 }}>
                <strong>Empresa:</strong> {modalAlumno.empresaAsignada.nomeEmpresa}
                <br />
                <strong>Posto:</strong> {modalAlumno.empresaAsignada.posto}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <strong>Empresa asignada:</strong> Ningunha
              </div>
            )}
            {rol === 'admin' && (
              <div className="section-row" style={{ marginTop: 12 }}>
                {modalAlumno.empresaAsignada ? (
                  <button className="icon-btn" title="Desasignar oferta" onClick={() =>
                    desasignarOferta(
                      modalAlumno,
                      modalAlumnos?._id,
                      modalAlumno.empresaAsignada.empresaId
                    )
                  }>Retirar empresa</button>
                ) : (
                  <select
  style={{ minWidth: 140, maxWidth: 320, width: "auto" }} 
                    onChange={e => e.target.value && asignarOferta(modalAlumno, modalAlumnos?._id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Selecciona empresa</option>
                    {getEmpresasCompatibles(empresasActivas, modalAlumnos?.unidade).map(e => (
                      <option key={e._id} value={e._id}>
                        {e.nome} ({e.posto})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal editar promoción */}
      <Modal open={!!editandoPromocion} onClose={() => setEditandoPromocion(null)}>
        {editandoPromocion && (
          <form onSubmit={actualizarPromocion}>
            <h3>Editar promoción</h3>
            <div className="section-row">
              <input
                placeholder="Nome"
                value={editandoPromocion.nome}
                onChange={e =>
                  setEditandoPromocion({ ...editandoPromocion, nome: e.target.value })}
                required
                style={{ minWidth: 115 }}
              />
              <select
                value={editandoPromocion.unidade}
                onChange={e => setEditandoPromocion({ ...editandoPromocion, unidade: e.target.value })}
                required
  style={{ minWidth: 100, maxWidth: 320, width: "auto" }} 
              >
                <option value="">Unidade</option>
                <option value="TCAE">TCAE</option>
                <option value="CFGB">CFGB</option>
                <option value="CFGM">CFGM</option>
              </select>
            </div>
            <h4 style={{ marginBottom: 0 }}>Alumnos</h4>
            {editandoPromocion.alumnos.map((alumno, i) => (
              <div className="alumno" key={alumno.dni || i}>
                <input
                  placeholder="Nome"
                  value={alumno.nome}
                  onChange={e => actualizarAlumnoEdicion(i, "nome", e.target.value)}
                  required
                  style={{ width: 90 }}
                />
                <input
                  placeholder="DNI"
                  value={alumno.dni}
                  onChange={e => actualizarAlumnoEdicion(i, "dni", e.target.value)}
                  required
                  style={{ width: 82 }}
                />
                <input
                  placeholder="Nacemento"
                  value={alumno.data_nacemento}
                  onChange={e => actualizarAlumnoEdicion(i, "data_nacemento", e.target.value)}
                  style={{ width: 105 }}
                />
                <select
                  value={alumno.estado}
                  onChange={e => actualizarAlumnoEdicion(i, "estado", e.target.value)}
                  required
  style={{ minWidth: 100, maxWidth: 320, width: "auto" }} 
                >
                  <option value="">Estado</option>
                  <option value="t">Titula</option>
                  <option value="r">Repite</option>
                  <option value="b">Baixa</option>
                </select>
                <button
                  className="icon-btn danger"
                  type="button"
                  title="Eliminar alumno"
                  onClick={() => borrarAlumnoEdicion(i)}
                >🗑</button>
              </div>
            ))}
            <button className="icon-btn" type="button" onClick={engadirAlumnoEdicion}>Engadir alumno ➕</button>
            <button className="icon-btn" type="submit">Gardar cambios 💾</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
