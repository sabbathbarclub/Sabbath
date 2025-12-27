import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StaffLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        api.post('staff-login/', credentials)
            .then(res => {
                localStorage.setItem('token', res.data.token);
                navigate('/staff-dashboard');
            })
            .catch(err => {
                setError('Credenciales inválidas');
            });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-neonPurple/5 blur-3xl"></div>

            <div className="glass p-10 rounded-2xl w-full max-w-md relative z-10 border border-gray-800">
                <h1 className="text-3xl font-bold mb-8 text-center text-white neon-text tracking-widest">STAFF ACCESS</h1>

                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-6 text-center text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-widest pl-1">Usuario</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-gray-700 p-3 rounded mt-1 text-white focus:border-neonPurple focus:outline-none"
                            value={credentials.username}
                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-widest pl-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full bg-black/40 border border-gray-700 p-3 rounded mt-1 text-white focus:border-neonPurple focus:outline-none"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-neonPurple text-white font-bold tracking-widest hover:bg-white hover:text-black transition-all rounded shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        ENTRAR
                    </button>
                    <button type="button" onClick={() => navigate('/')} className="w-full py-3 text-gray-500 hover:text-white text-xs tracking-widest">
                        VOLVER AL INICIO
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StaffLogin;
