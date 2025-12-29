import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import html2canvas from 'html2canvas';

const PromoPage = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [formData, setFormData] = useState({ name: '', dni: '' });
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const ticketRef = useRef(null);

    // New States for Lock Logic
    const [verifying, setVerifying] = useState(false);
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        api.get('campaigns/').then(res => {
            const found = res.data.find(c => c.id == id);
            if (found) {
                setCampaign(found);
            } else {
                setError("Campaña no encontrada o finalizada.");
            }
            setIsLoading(false);
        }).catch(err => {
            setError("Error cargando campaña.");
            setIsLoading(false);
        });
    }, [id]);

    const handleFollowVerify = () => {
        // Open Instagram
        window.open(campaign.instagram_url, '_blank');

        // Simular Verificación
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setUnlocked(true);
        }, 3000); // 3 seconds delay
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('campaigns/ticket/', {
                campaign: id,
                name: formData.name,
                dni: formData.dni
            });
            setTicket(res.data);
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.response?.data?.message || "No se pudo generar el ticket."));
        }
    };

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#050505',
                scale: 3,
                useCORS: true,
                logging: true
            });
            const url = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `SABBATH_PROMO_${ticket.name}.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error("Error generating ticket:", err);
            alert("No se pudo descargar el ticket.");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-neonPurple animate-pulse">CARGANDO RITUAL...</div>;
    if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-dvh bg-[#050505] text-white flex flex-col items-center justify-start pt-32 p-4 md:p-6 relative overflow-y-auto">
            {/* Background FX */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg.svg')] bg-cover opacity-20 z-0"></div>

            <div className="relative z-10 max-w-md w-full">
                {!ticket ? (
                    <div className="glass p-8 rounded-2xl border border-neonPurple/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center animate-fade-in">
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold tracking-widest text-neonGreen mb-6 w-full justify-center">
                                <span className="relative flex h-2 w-2 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                {campaign.tickets_claimed} DE {campaign.limit} PERSONAS YA RECLAMARON ESTO. ¡RECLAMA EL TUYO!
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8 backdrop-blur-md">
                            <p className="text-neonGreen font-bold text-xl mb-1">{campaign.current_benefit}</p>
                            <p className="text-gray-500 text-xs">Válido por una única vez</p>
                        </div>

                        {!unlocked ? (
                            <div className="mb-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                                <div className="text-4xl mb-4">🔒</div>
                                <h3 className="text-lg font-bold text-white mb-2">PASO 1: Desbloquear</h3>
                                <p className="text-sm text-gray-400 mb-6">Síguenos en Instagram para acceder a esta recompensa.</p>

                                <button
                                    onClick={handleFollowVerify}
                                    className="block w-full py-4 rounded bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                                    disabled={verifying}
                                >
                                    {verifying ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            VERIFICANDO...
                                        </>
                                    ) : (
                                        <>
                                            📸 SEGUIR PARA DESBLOQUEAR
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 text-left animate-fade-in">
                                <div className="flex items-center gap-2 text-green-400 mb-4 bg-green-900/20 p-2 rounded text-xs justify-center">
                                    <span>🔓 ACCESO CONCEDIDO</span>
                                </div>
                                <p className="text-sm text-gray-400">PASO 2: Genera tu Ticket</p>
                                <input
                                    className="w-full bg-black/50 p-3 rounded border border-gray-700 focus:border-neonPurple outline-none transition-colors"
                                    placeholder="Tu Nombre Completo"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    className="w-full bg-black/50 p-3 rounded border border-gray-700 focus:border-neonPurple outline-none transition-colors"
                                    placeholder="DNI (Para validar en puerta)"
                                    value={formData.dni}
                                    onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                    required
                                />
                                <button type="submit" className="w-full py-4 bg-neonPurple text-black font-bold tracking-widest hover:bg-white transition-colors uppercase mt-4">
                                    OBTENER CÓDIGO
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in flex flex-col items-center">
                        <div ref={ticketRef} className="bg-black border border-neonPurple p-8 rounded-2xl text-center relative max-w-sm mx-auto shadow-[0_0_100px_rgba(168,85,247,0.3)]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black rounded-full border border-neonPurple flex items-center justify-center p-2">
                                <img src="/logo.png" alt="S" className="w-full" onError={(e) => e.target.style.display = 'none'} />
                            </div>

                            <h2 className="mt-8 text-2xl font-black text-white mb-1">SÀBBATH</h2>
                            <p className="text-neonPink tracking-[0.5em] text-[10px] mb-6">CÓDIGO PROMOCIONAL</p>

                            <div className="bg-white p-4 inline-block mb-8 rounded-xl shadow-2xl relative group">
                                <img
                                    src={ticket.qr_base64 || ticket.qr_code}
                                    alt="QR"
                                    className="w-48 h-48 mix-blend-multiply relative z-10"
                                />
                            </div>

                            <div className="text-left border-t border-gray-800 pt-4 mt-2">
                                <p className="text-[10px] text-gray-500 uppercase">Beneficiario</p>
                                <p className="font-bold text-lg leading-tight">{ticket.name}</p>
                                <p className="text-gray-500 text-xs font-mono mb-2">{ticket.dni}</p>

                                <p className="text-[10px] text-gray-500 uppercase">Beneficio</p>
                                <p className="font-bold text-neonGreen">{ticket.benefit}</p>
                            </div>

                            <div className="mt-6 text-[9px] text-gray-600 uppercase">
                                Presentar QR en la barra.<br />Válido por única vez.
                            </div>
                        </div>

                        <button onClick={handleDownload} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-xl flex items-center gap-2">
                            ⬇️ DESCARGAR TARJETA
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoPage;
