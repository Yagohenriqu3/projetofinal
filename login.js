import './Login.css';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      setError('Usuário ou senha incorretos. Por favor, tente novamente.');
    }
  };

  return (
    <div className='container--login'>
      <form onSubmit={handleSubmit} className="form"> 
        <h1 className="form-title">Login</h1> 
        <p> 
          <label htmlFor="email-login" className="form-label">Email</label>
          <input 
            id="email-login" 
            value={email}
            name="email-login" 
            required="required" 
            type="email"
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Digite seu email" 
            className="form-input"
          />
        </p>
         
        <p> 
          <label htmlFor="password-login" className="form-label">Senha</label>
          <input 
            id="password-login" 
            name="password-login" 
            required="required" 
            type="password" 
            placeholder="Digite sua senha" 
            className="form-input"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          /> 
        </p>

        {error && <p className="error-message">{error}</p>}
         
        <p> 
          <button className="form-input" type="submit">Entrar</button>
        </p>
         
        <p className="form-link">
          Ainda não tem conta?
          <Link to='/login/cadastro'> Cadastre-se</Link>
        </p>
        <p className="form-link">
          Esqueceu a senha?
          <Link to='/login/trocarsenhausuario'> Recuperar senha</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
