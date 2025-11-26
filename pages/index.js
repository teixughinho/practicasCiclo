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
      <div className="main-container login-container">
        <h2>
          Login correcto <span className="role-badge">({user.rol})</span>
        </h2>
        <div className="section-row center">
          <button onClick={() => router.push('/empresas')}>Ir a empresas</button>
          <button onClick={() => router.push('/promocions')}>Ir a promocións</button>
        </div>
        {user.rol === 'admin' && (
          <>
            <button className="primary-btn" onClick={() => setShowModal(true)}>Novo usuario 👤</button>
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
    <form className="main-container login-form" onSubmit={handleLogin}>
      <h2>Iniciar sesión</h2>
      <div className="form-group">
        <input
          className="login-input"
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-group">
        <input
          className="login-input"
          type="password"
          placeholder="Contrasinal"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>
      <div>
        <button type="submit">Entrar</button>
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
      <div className="modal-content">
        <h3>Crear novo usuario</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="login-input"
            placeholder="Contrasinal"
            type="password"
            value={contrasinal}
            onChange={(e) => setContrasinal(e.target.value)}
          />
          <select className="login-input" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="section-row right-align">
            <button type="submit">Crear</button>
            <button className="danger" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
