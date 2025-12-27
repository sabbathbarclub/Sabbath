import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import api from '../api';
import mockEvents from '../mockEvents.json';

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        paternal_surname: '',
        maternal_surname: '',
        email: '',
        promo_code: '',
        dni: '',
        birth_date: ''
    });
    const [ticket, setTicket] = useState(null);
    const [menuUrl, setMenuUrl] = useState(null);

    useEffect(() => {
        // Fetch Menu
        api.get('menus/').then(res => {
            if (res.data.length > 0) setMenuUrl(res.data[0].image);
        }).catch(err => console.log("No menu found"));
        api.get('events/')
            .then(res => {
                // Use mock data if API returns empty
                if (res.data.length === 0) {
                    setEvents(mockEvents);
                } else {
                    setEvents(res.data);
                }
            })
            .catch(err => {
                console.log("API Error, using mock data", err);
                setEvents(mockEvents);
            });
    }, []);

    const handleBook = (e) => {
        e.preventDefault();

        const payload = {
            event: selectedEvent.id,
            first_name: formData.first_name,
            paternal_surname: formData.paternal_surname,
            maternal_surname: formData.maternal_surname,
            email: formData.email,
            promo_code: formData.promo_code,
            dni: formData.dni,
            birth_date: formData.birth_date
        };

        api.post('reservations/', payload)
            .then(res => {
                setTicket(res.data);
            })
            .catch(err => {
                const msg = err.response?.data?.birth_date?.[0] || err.response?.data?.message || 'Error al reservar. Inténtalo de nuevo.';
                alert(msg);
                if (err.response?.data?.birth_date) setSelectedEvent(null);
            });
    };

    const ticketRef = useRef(null);

    const handleDownloadTicket = async () => {
        if (!ticketRef.current) return;
        try {
            const canvas = await html2canvas(ticketRef.current, {
                backgroundColor: '#050505',
                scale: 3,
                useCORS: true,
                logging: false
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `SABBATH_LOCURA_TICKET_${ticket.dni}.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error("Error generating ticket:", err);
            alert("No se pudo descargar el ticket. Intenta hacer una captura de pantalla.");
        }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/bg.svg" alt="Background" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-neonPurple tracking-[1em] text-sm md:text-xl mb-4 uppercase">Bienvenidos al vacío</h2>
                    <h1 className="text-7xl md:text-9xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 neon-text">
                        SÀBBATH
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light tracking-wide max-w-2xl mx-auto">
                        Santuario del Sonido. <br /> Donde la noche cobra vida.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <a href="#events" className="px-10 py-4 bg-neonPurple text-white font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 clip-path-slant shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            RESERVAR ACCESO
                        </a>
                        <a href="#about" className="px-10 py-4 border border-white/20 text-white font-bold tracking-widest hover:border-neonPurple hover:text-neonPurple transition-all duration-300 clip-path-slant glass">
                            EXPLORAR
                        </a>
                    </div>
                    {menuUrl && (
                        <div className="mt-8">
                            <a href={menuUrl} target="_blank" rel="noreferrer" className="text-neonPink border-b border-neonPink hover:text-white hover:border-white transition-colors tracking-widest text-sm">
                                VER LA CARTA / MENU
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* UPCOMING EVENTS */}
            <section id="events" className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16 border-b border-gray-800 pb-4">
                        <h2 className="text-4xl md:text-6xl font-black text-white">
                            RITUALES <span className="text-neonPurple">PRÓXIMOS</span>
                        </h2>
                        <span className="hidden md:block text-gray-500 tracking-widest">ELIGE TU NOCHE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {events.map((event, index) => (
                            <div key={event.id} className="group relative bg-[#111] border border-white/5 hover:border-neonPurple/50 transition-all duration-500 overflow-hidden">
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-neonPurple/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                                    <img src={event.image || '/bg.svg'} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 gray-scale group-hover:grayscale-0" />
                                </div>
                                <div className="p-8 relative">
                                    <div className="text-xs text-neonPurple font-bold tracking-widest mb-2">
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-neonPink transition-colors">{event.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{event.description}</p>
                                    {event.is_active && (event.reservations_count < event.capacity) ? (
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="w-full py-4 border border-white/10 group-hover:bg-neonPurple group-hover:border-neonPurple group-hover:text-white transition-all duration-300 uppercase tracking-widest text-xs font-bold"
                                        >
                                            RESERVAR ACCESO
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-4 border border-red-900/30 text-red-500 cursor-not-allowed uppercase tracking-widest text-xs font-bold bg-red-900/10"
                                        >
                                            {!event.is_active ? 'CERRADO' : 'SOLD OUT'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ABOUT / BANNER */}
            <section id="about" className="py-24 bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neonPurple to-transparent opacity-50"></div>
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Redefiniendo la Noche</h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-12">
                        SÀBBATH no es solo un club, es una experiencia. Audiovisuales inmersivos,
                        mixología de clase mundial y una atmósfera que pulsa con el ritmo de la ciudad.
                        Únete a la élite.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div><div className="text-3xl font-bold text-neonPink mb-2">50+</div><div className="text-xs tracking-widest text-gray-500">ARTISTAS</div></div>
                        <div><div className="text-3xl font-bold text-neonPink mb-2">2000+</div><div className="text-xs tracking-widest text-gray-500">AFORO</div></div>
                        <div><div className="text-3xl font-bold text-neonPink mb-2">3</div><div className="text-xs tracking-widest text-gray-500">ESCENARIOS</div></div>
                        <div><div className="text-3xl font-bold text-neonPink mb-2">∞</div><div className="text-xs tracking-widest text-gray-500">VIBRAS</div></div>
                    </div>
                </div>
            </section>

            {/* BOOKING MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="glass p-10 max-w-md w-full relative border border-neonPurple/30 neon-box">
                        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">✕</button>
                        <div className="text-center mb-8">
                            <h3 className="text-xl text-gray-400 tracking-widest mb-2">RESERVACIÓN</h3>
                            <h2 className="text-3xl font-bold text-white neon-text">{selectedEvent.title}</h2>
                        </div>
                        <form onSubmit={handleBook} className="space-y-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Nombres</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="TUS NOMBRES"
                                        className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Apellido Paterno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="APELLIDO PATERNO"
                                            className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700"
                                            value={formData.paternal_surname}
                                            onChange={e => setFormData({ ...formData, paternal_surname: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Apellido Materno</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="APELLIDO MATERNO"
                                            className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700"
                                            value={formData.maternal_surname}
                                            onChange={e => setFormData({ ...formData, maternal_surname: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="INGRESA TU EMAIL (OPCIONAL)"
                                    className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">DNI / Documento</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="12345678"
                                        className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700 font-mono"
                                        value={formData.dni}
                                        onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700"
                                        value={formData.birth_date}
                                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neonPurple transition-colors">Código Promocional (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="EJ: VIP2025"
                                    className="w-full bg-black/30 border-b border-gray-700 p-3 text-white focus:border-neonPurple focus:outline-none transition-colors placeholder-gray-700 font-mono"
                                    value={formData.promo_code}
                                    onChange={e => setFormData({ ...formData, promo_code: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-white text-black font-black tracking-widest hover:bg-neonPurple hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                CONFIRMAR & OBTENER QR
                            </button>
                        </form>
                    </div>
                </div >
            )}

            {/* TICKET SUCCESS MODAL */}
            {ticket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in">
                    <div ref={ticketRef} className="glass p-8 md:p-12 max-w-sm w-full text-center border-2 border-neonPink shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neonPurple to-neonPink animate-pulse"></div>

                        <div className="mb-8">
                            <h3 className="text-3xl md:text-4xl font-black mb-2 text-white neon-text uppercase tracking-tighter">ACCESO CONCEDIDO</h3>
                            <p className="text-neonPink tracking-[0.3em] text-xs font-bold mb-4">BIENVENIDO A SÀBBATH</p>
                            <div className="w-16 h-1 bg-neonPurple mx-auto rounded-full"></div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Invitado</p>
                            <h4 className="text-xl font-bold text-white capitalize">
                                {ticket.first_name} {ticket.paternal_surname} {ticket.maternal_surname}
                            </h4>
                            <p className="text-gray-500 text-xs mt-1 font-mono">{ticket.dni}</p>
                        </div>

                        <div className="bg-white p-4 inline-block mb-8 rounded-xl shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-neonPurple to-neonPink opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                            <img src={ticket.qr_code} alt="QR Ticket" className="w-48 h-48 mix-blend-multiply relative z-10" />
                        </div>

                        {ticket.promo_code && (
                            <div className="mb-6">
                                <span className="px-4 py-1 bg-neonPurple/20 border border-neonPurple text-neonPurple text-xs font-bold rounded-full tracking-wider">
                                    PROMO: {ticket.promo_code}
                                </span>
                            </div>
                        )}

                        <div className="space-y-3" data-html2canvas-ignore>
                            <button
                                onClick={handleDownloadTicket}
                                className="block w-full py-3 bg-white text-black font-black tracking-widest hover:bg-neonPink hover:text-white transition-all duration-300 uppercase text-xs shadow-lg"
                            >
                                DESCARGAR TICKET
                            </button>
                            <button onClick={() => setTicket(null)} className="block w-full py-3 border border-gray-700 hover:border-white text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">
                                CERRAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="py-12 bg-black text-center border-t border-gray-900 text-gray-600 text-sm">
                <p>&copy; 2025 SÀBBATH BAR CLUB. TODOS LOS DERECHOS RESERVADOS.</p>
            </footer>
        </div >
    );
};

export default LandingPage;
