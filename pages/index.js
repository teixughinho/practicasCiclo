import { useRouter } from 'next/router'
import { useState } from 'react'
import { useUser } from '../contexts/UserContext'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [success, setSuccess] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { user, setUser } = useUser()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: username, contrasinal: pass })
      })
      const data = await res.json()
      if (res.ok) {
        setUser({ nome: username, rol: data.rol })
        setSuccess(true)
      } else {
        alert(data.error || 'Credenciais incorrectas')
      }
    } catch (err) {
      alert('Erro de conexión coa API')
    }
  }

  const handleCreateUser = async (novoUsuario) => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Usuario creado: ${data.nome}`)
        setShowModal(false)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (err) {
      alert('Erro ao conectar coa API')
    }
  }

  if (success && user && user.rol) {
    return (
      <div className="main-container" style={{ maxWidth: 360, margin: '40px auto 0' }}>
        <h2 style={{ marginBottom: 14 }}>
          Login correcto <span style={{ fontSize: 13, color: '#667eea' }}>({user.rol})</span>
        </h2>
        <div className="section-row" style={{ marginBottom: 18 }}>
          <button className="icon-btn" style={{ minWidth: 90 }} onClick={() => router.push('/empresas')}>Empresas</button>
          <button className="icon-btn" style={{ minWidth: 96 }} onClick={() => router.push('/promocions')}>Promocións</button>
        </div>
        {user.rol === 'admin' && (
          <>
            <button className="icon-btn" style={{ minWidth: 130 }} onClick={() => setShowModal(true)}>➕ Novo usuario</button>
            {showModal && (
              <ModalCrearUsuario
                onClose={() => setShowModal(false)}
                onCreate={handleCreateUser}
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <form className="main-container" style={{ maxWidth: 315, margin: '40px auto 0', padding: '26px 24px' }} onSubmit={handleLogin}>
      <h2 style={{ marginBottom: 16 }}>Iniciar sesión</h2>
      <div style={{ marginBottom: 14 }}>
        <input
          className="login-input"
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <input
          className="login-input"
          type="password"
          placeholder="Contrasinal"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>
      <div>
        <button className="icon-btn" type="submit" style={{ minWidth: 90 }}>Entrar</button>
      </div>
    </form>
  )
}

function ModalCrearUsuario({ onClose, onCreate }) {
  const [nome, setNome] = useState('')
  const [contrasinal, setContrasinal] = useState('')
  const [rol, setRol] = useState('user')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nome || !contrasinal) {
      alert('Completa todos os campos')
      return
    }
    onCreate({ nome, contrasinal, rol })
  }

  return (
    <div className="modal-backdrop" aria-modal="true" role="dialog">
      <div className="modal-content" style={{ maxWidth: 325 }}>
        <h3 style={{ marginBottom: 14 }}>Crear novo usuario</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <input
            className="login-input"
            placeholder="Contrasinal"
            type="password"
            value={contrasinal}
            onChange={(e) => setContrasinal(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <select className="login-input" value={rol} onChange={(e) => setRol(e.target.value)} style={{ marginBottom: 20 }}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="section-row" style={{ justifyContent: 'flex-end', marginTop: 5 }}>
            <button className="icon-btn" type="submit">Crear</button>
            <button className="icon-btn danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
