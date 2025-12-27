import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api';

const StaffDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [promos, setPromos] = useState([]);

    // Forms
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', capacity: 100 });
    const [eventImage, setEventImage] = useState(null);
    const [newPromo, setNewPromo] = useState({ code: '', discount_text: 'Entrada VIP' });
    const [menuFile, setMenuFile] = useState(null);

    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadEvents();
        loadPromos();
    }, []);

    const loadEvents = () => api.get('events/').then(res => setEvents(res.data)).catch(console.error);
    const loadPromos = () => api.get('promos/').then(res => setPromos(res.data)).catch(console.error);

    const handleCreateEvent = (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.keys(newEvent).forEach(key => fd.append(key, newEvent[key]));
        if (eventImage) fd.append('image', eventImage);

        api.post('events/', fd).then(() => {
            loadEvents();
            setNewEvent({ title: '', description: '', date: '', capacity: 100 });
            setEventImage(null);
            alert('Evento creado con éxito');
        }).catch(err => {
            console.error(err);
            alert('Error al crear evento');
        });
    };

    const handleCreatePromo = (e) => {
        e.preventDefault();
        api.post('promos/', newPromo).then(() => {
            loadPromos();
            setNewPromo({ code: '', discount_text: 'Entrada VIP' });
            alert('Código creado');
        });
    };

    const handleUploadMenu = (e) => {
        e.preventDefault();
        if (!menuFile) return;
        const fd = new FormData();
        fd.append('image', menuFile);
        fd.append('is_active', true);
        api.post('menus/', fd).then(() => alert('Carta actualizada en la web'));
    };

    const toggleEvent = (id) => {
        api.post(`events/${id}/toggle/`).then(loadEvents).catch(() => alert('Error'));
    };

    // QR Logic //
    useEffect(() => {
        if (activeTab === 'scanner') {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, (err) => { });
            function onScanSuccess(decodedText) {
                scanner.clear();
                validateQR(decodedText);
            }
            return () => { scanner.clear().catch(err => console.error(err)); };
        }
    }, [activeTab]);

    const validateQR = (qrId) => {
        api.post('validate-qr/', { qr_id: qrId })
            .then(res => {
                setScanResult(res.data.status);
                setMessage(res.data.message);
            })
            .catch(err => {
                setScanResult('INVÁLIDO');
                setMessage(err.response?.data?.message || 'Código no reconocido');
            });
    };

    const resetScanner = () => {
        setScanResult(null);
        setActiveTab('events');
        setTimeout(() => setActiveTab('scanner'), 100);
    };

    return (
        <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h1 className="text-3xl font-bold neon-text">PANEL STAFF</h1>
                    <div className="flex bg-gray-900 rounded-lg p-1 space-x-1 overflow-x-auto max-w-full">
                        {['events', 'promos', 'carta', 'scanner'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded text-sm font-bold uppercase ${activeTab === tab ? 'bg-neonPurple text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* EVENTS TAB */}
                {activeTab === 'events' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <div className="glass p-6 rounded-xl stuck">
                                <h3 className="text-xl font-bold mb-4 text-neonPink">NUEVO EVENTO</h3>
                                <form onSubmit={handleCreateEvent} className="space-y-4">
                                    <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Título" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                                    <textarea className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Descripción" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                                    <input type="datetime-local" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-gray-400" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                                    <input type="number" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Cupo (Cantidad QRs)" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} required />

                                    <div className="border border-dashed border-gray-600 p-4 rounded text-center cursor-pointer relative hover:border-white transition-colors">
                                        <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <p className="text-xs text-gray-400">{eventImage ? eventImage.name : "Subir Flyer / Poster"}</p>
                                    </div>

                                    <button type="submit" className="w-full py-3 bg-neonPurple font-bold rounded hover:bg-white hover:text-black transition-colors">CREAR EVENTO</button>

                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            {events.map(ev => (
                                <div key={ev.id} className="glass p-5 rounded-xl flex justify-between items-center border border-gray-800">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${ev.is_active ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-lg">{ev.title}</h3>
                                            <p className="text-gray-400 text-xs">Capacidad: {ev.reservations_count} / {ev.capacity}</p>
                                            <p className="text-gray-500 text-xs">{new Date(ev.date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleEvent(ev.id)}
                                        className={`px-4 py-1 text-xs rounded font-bold border ${ev.is_active ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'}`}
                                    >
                                        {ev.is_active ? 'CERRAR' : 'ABRIR'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROMOS TAB */}
                {activeTab === 'promos' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-xl h-fit">
                            <h3 className="text-xl font-bold mb-4 text-neonPink">CREAR CÓDIGO</h3>
                            <form onSubmit={handleCreatePromo} className="space-y-4">
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Código (ej: VIP2025)" value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value })} required />
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Texto (ej: Entrada Gratis)" value={newPromo.discount_text} onChange={e => setNewPromo({ ...newPromo, discount_text: e.target.value })} required />
                                <button type="submit" className="w-full py-3 bg-neonPink font-bold rounded hover:bg-white hover:text-black transition-colors">GENERAR PROMOCIÓN</button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {promos.map(p => (
                                <div key={p.id} className="bg-gray-900 p-4 rounded flex justify-between items-center border-l-4 border-neonPink">
                                    <div>
                                        <p className="font-mono text-xl font-bold text-white tracking-widest">{p.code}</p>
                                        <p className="text-gray-400 text-xs">{p.discount_text}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${p.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                        {p.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MENU TAB */}
                {activeTab === 'carta' && (
                    <div className="max-w-xl mx-auto glass p-10 rounded-xl text-center">
                        <h3 className="text-2xl font-bold mb-6 text-neonPurple">ACTUALIZAR CARTA</h3>
                        <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 mb-6 hover:border-white transition-colors cursor-pointer relative">
                            <input type="file" onChange={e => setMenuFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <p className="text-gray-400">Arrastra tu imagen del menú o haz click aquí</p>
                            {menuFile && <p className="mt-4 text-neonGreen font-bold">{menuFile.name}</p>}
                        </div>
                        <button onClick={handleUploadMenu} className="px-8 py-3 bg-white text-black font-bold tracking-widest hover:bg-neonPurple hover:text-white transition-all rounded w-full">
                            SUBIR Y PUBLICAR
                        </button>
                    </div>
                )}

                {/* SCANNER TAB */}
                {activeTab === 'scanner' && (
                    <div className="max-w-md mx-auto">
                        {!scanResult ? (
                            <div className="glass p-6 rounded-xl">
                                <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border-2 border-dashed border-gray-700"></div>
                            </div>
                        ) : (
                            <div className={`text-center py-10 rounded-xl border ${scanResult === 'VALID' ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
                                <h2 className={`text-4xl font-black mb-2 ${scanResult === 'VALID' ? 'text-green-500' : 'text-red-500'}`}>
                                    {scanResult}
                                </h2>
                                <p className="text-lg text-white mb-8">{message}</p>
                                <button onClick={resetScanner} className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded">
                                    Escanear Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
