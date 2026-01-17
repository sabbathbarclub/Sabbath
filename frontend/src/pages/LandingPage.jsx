import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import api from '../api';
// import mockEvents from '../mockEvents.json';
import Marquee from '../components/Marquee';

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
    const [promos, setPromos] = useState([]);

    // Media Rotation Logic: 0 = Video, 1 = Image 1, 2 = Image 2
    const [mediaIndex, setMediaIndex] = useState(0);

    useEffect(() => {
        let timer;
        if (mediaIndex === 1) {
            timer = setTimeout(() => setMediaIndex(2), 3000); // Image 1 for 3s -> Image 2
        } else if (mediaIndex === 2) {
            timer = setTimeout(() => setMediaIndex(0), 3000); // Image 2 for 3s -> Video
        }
        return () => clearTimeout(timer);
    }, [mediaIndex]);

    useEffect(() => {
        // Fetch Menu
        api.get(`menus/?t=${Date.now()}`).then(res => {
            if (res.data.length > 0) setMenuUrl(res.data[0].image);
        }).catch(err => console.log("No menu found"));

        // Fetch Events
        api.get(`events/?t=${Date.now()}`)
            .then(res => setEvents(res.data))
            .catch(err => {
                console.log("API Error", err);
                setEvents([]);
            });

        // Fetch Active Campaigns
        api.get(`campaigns/?t=${Date.now()}`).then(res => setPromos(res.data)).catch(console.error);
    }, []);

    // Scroll Reveal Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => observer.observe(el));

        return () => reveals.forEach(el => observer.unobserve(el));
    }, [events, promos, menuUrl]); // Re-run when content loads

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

    const getDriveDirectLink = (url) => {
        if (!url) return '/bg.svg';
        try {
            // Extract ID
            let id = '';
            if (url.includes('/d/')) {
                const parts = url.split('/d/');
                if (parts.length > 1) {
                    id = parts[1].split('/')[0];
                }
            } else if (url.includes('id=')) {
                id = url.split('id=')[1].split('&')[0];
            }

            if (id) {
                // Use thumbnail endpoint with large size (w1000)
                return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            }
        } catch (e) {
            console.error("Error parsing Drive URL", e);
        }
        return url;
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    {/* Dynamic CSS Background */}
                    <div className="absolute top-[-20%] left-[-20%] w-[150vw] h-[150vw] md:w-[60vw] md:h-[60vw] bg-neonPurple/40 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[150vw] h-[150vw] md:w-[60vw] md:h-[60vw] bg-purple-900/50 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-neonPurple/20 to-transparent blur-2xl md:blur-3xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
                    <h2 className="text-neonPurple tracking-[1em] text-sm md:text-xl mb-4 uppercase">Bienvenidos al vórtice</h2>
                    <img src="https://lh3.googleusercontent.com/d/1JUsJhmRSdgFgPGcb5jJyAXCkXlYLi8Ag" alt="SÀBBATH" className="h-24 md:h-48 object-contain mx-auto mb-6 filter brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse-slow" />
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
                {/* MARQUEE BAND */}
                <Marquee />
            </section>

            {/* UPCOMING EVENTS */}
            {/* UPCOMING EVENTS */}
            <section id="events" className="py-24 px-6 relative z-10 reveal overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="https://lh3.googleusercontent.com/d/1-4-Fkkj9L8H0bFRIaydWt5dLAPHLWHuB"
                        alt="Events Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tb from-[#050505] via-transparent to-[#050505] opacity-90"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex justify-between items-end mb-16 border-b border-gray-800 pb-4">
                        <h2 className="text-4xl md:text-6xl font-black text-white">
                            RITUALES <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonPink">PRÓXIMOS</span>
                        </h2>
                        <span className="hidden md:block text-gray-500 tracking-widest">ELIGE TU NOCHE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {events.length > 0 ? (
                            events.map((event, index) => (
                                <div key={event.id} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-neonPurple to-neonPink rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500"></div>
                                    <div className="relative bg-[#0a0a0a] border border-gray-800 hover:border-transparent rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 transform group-hover:-translate-y-2">
                                        <div className="h-64 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-neonPurple/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                                            <img
                                                src={getDriveDirectLink(event.image)}
                                                alt={event.title}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 gray-scale group-hover:grayscale-0"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-8 relative flex-grow flex flex-col">
                                            <div className="text-xs text-neonPurple font-bold tracking-widest mb-2">
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-4 group-hover:text-neonPink transition-colors">{event.title}</h3>
                                            <p className="text-gray-400 text-sm mb-6 line-clamp-2">{event.description}</p>

                                            <div className="mt-auto">
                                                {event.is_active && (event.reservations_count < event.capacity) ? (
                                                    <button
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="w-full py-4 border border-white/10 group-hover:bg-neonPurple group-hover:border-neonPurple group-hover:text-white transition-all duration-300 uppercase tracking-widest text-xs font-bold rounded-xl"
                                                    >
                                                        RESERVAR ACCESO
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="w-full py-4 border border-red-900/30 text-red-500 cursor-not-allowed uppercase tracking-widest text-xs font-bold bg-red-900/10 rounded-xl"
                                                    >
                                                        {!event.is_active ? 'CERRADO' : 'SOLD OUT'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="md:col-span-3 flex flex-col items-center justify-center text-center py-20 relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-r from-neonPurple/10 to-neonPink/10 animate-pulse"></div>
                                <div className="relative z-10 p-10">
                                    <div className="text-6xl mb-6 opacity-80 animate-bounce-slow">🤫</div>
                                    <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                                        PLANEANDO LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonPink">PRÓXIMA EXPERIENCIA</span>
                                    </h3>
                                    <p className="text-gray-400 text-lg md:text-xl tracking-widest uppercase mb-8">
                                        ¿Estás listo para lo que viene?
                                    </p>
                                    <div className="inline-block px-8 py-3 rounded-full border border-neonPurple/30 text-neonPurple bg-neonPurple/5 text-sm font-bold tracking-[0.2em] uppercase">
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* PROMOS SECTION */}
            {promos.length > 0 && (
                <section id="promos" className="py-24 px-6 bg-black relative border-t border-gray-900 overflow-hidden reveal">
                    {/* Background Gradients */}
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neonPurple/20 rounded-full blur-[128px] pointer-events-none"></div>
                    <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-neonPink/10 rounded-full blur-[128px] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-20 animate-fade-in">
                            <span className="text-neonPurple tracking-[0.5em] text-xs font-bold uppercase mb-4 block">Membership</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                                BENEFICIOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonPink">EXCLUSIVOS</span>
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                Únete a la comunidad digital. Desbloquea recompensas únicas solo por seguirnos.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            {promos.map(promo => {
                                // Use real limit from backend
                                const claimed = promo.tickets_claimed || 0;
                                const target = promo.limit || 100;
                                const percentage = Math.min((claimed / target) * 100, 100);

                                return (
                                    <a key={promo.id} href={`/promo/${promo.id}`} className="block group relative w-full max-w-md">
                                        <div className="absolute inset-0 bg-gradient-to-r from-neonPurple to-neonPink rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500"></div>
                                        <div className="relative bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 hover:border-transparent h-full flex flex-col transition-all duration-300 transform group-hover:-translate-y-2">

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-full">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </span>
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">
                                                                RUNNING FAST
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold text-white font-mono">{claimed} / {target}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-neonPurple to-neonPink h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-neonPurple transition-colors">{promo.current_benefit}</h3>

                                            <div className="my-6">
                                                <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-neonPurple pl-4 italic">
                                                    "Cuando alcancemos la meta obtendremos <span className="text-white font-bold">mejores promos</span> y sorpresas exclusivas."
                                                </p>
                                            </div>

                                            <div className="mt-auto border-t border-gray-800 pt-6">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest text-xs font-bold">Acceder a la promoción</span>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neonPurple group-hover:text-black transition-all">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* MENU SECTION */}
            {menuUrl && (
                <section id="menu" className="py-24 px-6 relative bg-[#0a0a0a] border-t border-gray-900 reveal">
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase">NUESTRA <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonPink">CARTA</span></h2>
                        <p className="text-gray-400 mb-10 tracking-widest text-sm">EXPLORA NUESTROS TRAGOS DE AUTOR</p>

                        <div className="w-full h-[60vh] md:h-[80vh] bg-black/50 border border-gray-800 rounded-2xl overflow-hidden mb-8 shadow-2xl relative">
                            <iframe
                                src={menuUrl.replace(/\/view.*/, '/preview').replace(/\/d\/(.*?)\/.*/, '/d/$1/preview') || menuUrl}
                                className="w-full h-full"
                                title="Carta Sabbath"
                            ></iframe>
                        </div>

                        <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 bg-neonPurple/10 border border-neonPurple text-neonPurple font-bold tracking-widest hover:bg-neonPurple hover:text-white transition-all duration-300 rounded uppercase text-sm"
                        >
                            ABRIR / DESCARGAR PDF
                        </a>
                    </div>
                </section>
            )}

            {/* ABOUT / BANNER */}
            <section id="about" className="py-24 bg-white/5 relative overflow-hidden reveal">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neonPurple to-transparent opacity-50"></div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Text */}
                    <div className="text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white"><span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-neonPink">#SÀBBATHNIGHT</span></h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-12">
                            SÀBBATH no es solo un club, es la brecha entre este mundo y el otro. Audiovisuales inmersivos,
                            mixología de clase mundial y una atmósfera que pulsa con el ritmo de la ciudad.
                            Únete al culto.
                        </p>
                        <div className="flex justify-center md:justify-start">
                            <div><div className="text-3xl font-bold text-neonPink mb-2">∞</div><div className="text-xs tracking-widest text-gray-500">VIBRAS</div></div>
                        </div>
                    </div>

                    {/* Right Column: Video */}
                    <div className="relative rounded-2xl overflow-hidden border border-neonPurple/20 shadow-[0_0_50px_rgba(180,109,248,0.1)] group aspect-video bg-black">
                        <div className="absolute inset-0 bg-neonPurple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

                        {mediaIndex === 0 && (
                            <video
                                src="/assets/sabbath_intro.mp4"
                                className="w-full h-full object-cover animate-fade-in"
                                autoPlay
                                muted
                                playsInline
                                onEnded={() => setMediaIndex(1)}
                            />
                        )}

                        {mediaIndex === 1 && (
                            <img
                                src="https://drive.google.com/thumbnail?id=1OJgIgB6aImjd0_XYlJbfvCoyn63DVcsM&sz=w1000"
                                alt="Sabbath Vibes 1"
                                className="w-full h-full object-cover animate-fade-in"
                            />
                        )}

                        {mediaIndex === 2 && (
                            <img
                                src="https://drive.google.com/thumbnail?id=1vAn1TTz61PPU8qkGnwzhp8Zj7ptAIsPc&sz=w1000"
                                alt="Sabbath Vibes 2"
                                className="w-full h-full object-cover animate-fade-in"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* BOOKING MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
                    <div className="glass p-6 md:p-10 max-w-md w-full relative border border-neonPurple/30 neon-box max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
                        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10 p-2">✕</button>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {
                ticket && (
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
                )
            }



            {/* FOOTER */}
            {/* FOOTER */}
            <footer className="py-12 bg-black text-center border-t border-gray-900 text-gray-600 text-sm">
                <div className="flex justify-center items-center gap-8 mb-8 flex-wrap px-4">
                    <img src="https://drive.google.com/thumbnail?id=138hCac1wb7I3Neu9rmrgnSnxozzsDG3P&sz=w400" alt="Sponsor 1" className="h-10 md:h-14 object-contain opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0" />
                    <img src="https://drive.google.com/thumbnail?id=1_i3IroE_sxsnKrU7psOPjkZKYr_5liin&sz=w400" alt="Sponsor 2" className="h-10 md:h-14 object-contain opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0" />
                    <img src="https://drive.google.com/thumbnail?id=1b1lpuRAQV7z7PAX6rkjQmyLEEXX4rWqd&sz=w400" alt="Sponsor 4" className="h-20 md:h-28 object-contain opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0" />
                    <img src="https://drive.google.com/thumbnail?id=1nXKFP3bDPdJlWRhtkWApG0SaAyUm8iBF&sz=w400" alt="Sponsor 3" className="h-10 md:h-14 object-contain opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0" />
                    <img src="/assets/trago5.png" alt="Sponsor 5" className="h-10 md:h-14 object-contain opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0" />
                </div>
                <p>&copy; 2025 SÀBBATH BAR CLUB. TODOS LOS DERECHOS RESERVADOS.</p>
            </footer>
        </div >
    );
};

export default LandingPage;
