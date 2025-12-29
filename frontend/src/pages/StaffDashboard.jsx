import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';
import api from '../api';

registerLocale('es', es);

const StaffDashboard = () => {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [promos, setPromos] = useState([]);

    // Forms
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', capacity: 100 });
    const [eventImageUrl, setEventImageUrl] = useState(''); // Changed from file to URL string
    const [newPromo, setNewPromo] = useState({ title: '', current_benefit: '1 Shot Gratis', limit: 100 });
    const [menuUrl, setMenuUrl] = useState('');

    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState('');

    // UX States
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', msg: '' }

    // Delete Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState(null); // 'event' or 'promo'
    const [itemToDelete, setItemToDelete] = useState(null);

    // Edit Modal States (Promo)
    const [editingPromo, setEditingPromo] = useState(null);

    useEffect(() => {
        loadEvents();
        loadPromos();
    }, []);

    // Clear notification after 3s
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadEvents = () => api.get('events/').then(res => setEvents(res.data)).catch(console.error);
    const loadPromos = () => api.get('campaigns/').then(res => setPromos(res.data)).catch(console.error);

    const handleCreateEvent = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Send JSON payload with URL
        const payload = { ...newEvent, image: eventImageUrl };

        api.post('events/', payload).then(() => {
            loadEvents();
            setNewEvent({ title: '', description: '', date: '', capacity: 100 });
            setEventImageUrl('');
            setIsLoading(false);
            setNotification({ type: 'success', msg: '🔥 Ritual creado con éxito' });
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
            setNotification({ type: 'error', msg: 'Error al crear evento' });
        });
    };

    const handleCreatePromo = (e) => {
        e.preventDefault();
        api.post('campaigns/', newPromo).then(() => {
            loadPromos();
            setNewPromo({ title: '', current_benefit: '1 Shot Gratis', limit: 100 });
            setNotification({ type: 'success', msg: '💎 Campaña creada' });
        });
    };

    const handleUpdatePromo = (e) => {
        e.preventDefault();
        if (!editingPromo) return;
        api.put(`campaigns/${editingPromo.id}/`, editingPromo).then(() => {
            loadPromos();
            setEditingPromo(null);
            setNotification({ type: 'success', msg: '✨ Campaña actualizada' });
        }).catch(err => {
            console.error(err);
            setNotification({ type: 'error', msg: 'Error al actualizar' });
        });
    };

    const handleUploadMenu = () => {
        if (!menuUrl) return;
        api.post('menus/', { image: menuUrl, is_active: true }).then(() => {
            setNotification({ type: 'success', msg: '📜 Carta actualizada (Link)' });
            setMenuUrl('');
        }).catch(() => setNotification({ type: 'error', msg: 'Error al actualizar carta' }));
    };

    const toggleEvent = (id) => {
        api.post(`events/${id}/toggle/`).then(loadEvents).catch(() => alert('Error'));
    };

    const requestDelete = (type, id) => {
        setDeleteType(type);
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete || !deleteType) return;
        setIsLoading(true);

        const endpoint = deleteType === 'event' ? `events/${itemToDelete}/` : `campaigns/${itemToDelete}/`;

        api.delete(endpoint).then(() => {
            if (deleteType === 'event') loadEvents();
            else loadPromos();

            setShowDeleteModal(false);
            setItemToDelete(null);
            setDeleteType(null);
            setIsLoading(false);
            setNotification({ type: 'success', msg: '🗑️ Elemento eliminado correctamente' });
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
            setShowDeleteModal(false);
            setNotification({ type: 'error', msg: 'No se pudo eliminar' });
        });
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
                                    <div className="custom-datepicker-wrapper">
                                        <DatePicker
                                            selected={newEvent.date ? new Date(newEvent.date) : null}
                                            onChange={(date) => setNewEvent({ ...newEvent, date: date.toISOString() })}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={30}
                                            dateFormat="d 'de' MMMM, yyyy h:mm aa"
                                            locale="es"
                                            placeholderText="Seleccionar Fecha y Hora"
                                            className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-neonPurple"
                                            calendarClassName="bg-black border border-gray-800 text-white"
                                        />
                                    </div>
                                    <input type="number" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Cupo (Cantidad QRs)" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} required />

                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1">Imagen (Link Google Drive)</label>
                                        <input
                                            type="url"
                                            className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-neonPurple"
                                            placeholder="https://drive.google.com/..."
                                            value={eventImageUrl}
                                            onChange={e => setEventImageUrl(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Asegúrate que el enlace sea público (Cualquiera con el link).</p>
                                    </div>

                                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-neonPurple font-bold rounded hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isLoading ? 'CREANDO...' : 'CREAR EVENTO'}
                                    </button>

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
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleEvent(ev.id)}
                                            className={`px-4 py-1 text-xs rounded font-bold border ${ev.is_active ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'}`}
                                        >
                                            {ev.is_active ? 'CERRAR' : 'ABRIR'}
                                        </button>
                                        <button
                                            onClick={() => requestDelete('event', ev.id)}
                                            className="ml-2 px-3 py-1 text-xs rounded font-bold border border-red-800 text-red-500 hover:bg-red-900 hover:text-white"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CAMPAIGNS TAB (Previously Promos) */}
                {activeTab === 'promos' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-xl h-fit">
                            <h3 className="text-xl font-bold mb-4 text-neonPink">NUEVA CAMPAÑA</h3>
                            <form onSubmit={handleCreatePromo} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400">Título (Interno)</label>
                                    <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Ej: Seguidores IG" value={newPromo.title} onChange={e => setNewPromo({ ...newPromo, title: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Beneficio Actual (Modificable)</label>
                                    <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Ej: 2 Shots Gratis" value={newPromo.current_benefit} onChange={e => setNewPromo({ ...newPromo, current_benefit: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Cupos Disponibles</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700"
                                        placeholder="100"
                                        value={newPromo.limit}
                                        onChange={e => setNewPromo({ ...newPromo, limit: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-neonPink font-bold rounded hover:bg-white hover:text-black transition-colors">CREAR CAMPAÑA</button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {promos.map(p => (
                                <div key={p.id} className="bg-gray-900 p-4 rounded border-l-4 border-neonPink relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-white">{p.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingPromo(p)}
                                                className="p-2 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => requestDelete('promo', p.id)}
                                                className="p-2 rounded bg-red-900/20 text-red-500 hover:bg-red-900 hover:text-white transition-colors"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-neonPurple font-bold">BENEFICIO: {p.current_benefit}</p>
                                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                                        <span>Progreso: {typeof p.tickets_claimed === 'number' ? p.tickets_claimed : 0} / {p.limit}</span>
                                        {p.manual_claims > 0 && <span className="text-xs text-gray-500">(Manual: +{p.manual_claims})</span>}
                                    </div>

                                    <div className="mt-3 bg-black/50 p-2 rounded text-xs break-all font-mono text-gray-500">
                                        http://{window.location.host}/promo/{p.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MENU TAB */}
                {activeTab === 'carta' && (
                    <div className="max-w-xl mx-auto glass p-10 rounded-xl text-center">
                        <h3 className="text-2xl font-bold mb-6 text-neonPurple">ACTUALIZAR CARTA</h3>
                        <div className="mb-6">
                            <label className="block text-left text-xs uppercase text-gray-500 mb-2">Enlace de Google Drive (PDF)</label>
                            <input
                                type="url"
                                className="w-full bg-black/50 p-4 rounded text-sm border border-gray-700 text-neonPurple focus:border-neonPurple focus:outline-none"
                                placeholder="https://drive.google.com/..."
                                value={menuUrl}
                                onChange={e => setMenuUrl(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 mt-2 text-left">
                                Asegúrate que el enlace tenga permisos públicos ("Cualquiera con el enlace").
                            </p>
                        </div>
                        <button
                            onClick={handleUploadMenu}
                            className="px-8 py-3 bg-white text-black font-bold tracking-widest hover:bg-neonPurple hover:text-white transition-all rounded w-full"
                        >
                            ACTUALIZAR ENLACE
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
                {/* NOTIFICATIONS */}
                {notification && (
                    <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-xl border flex items-center gap-3 animate-fade-in z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${notification.type === 'success' ? 'bg-black border-green-500 text-green-400' : 'bg-black border-red-500 text-red-500'}`}>
                        {notification.type === 'success' ? '✅' : '⚠️'}
                        <span className="font-bold tracking-wide uppercase text-sm">{notification.msg}</span>
                    </div>
                )}

                {/* DELETE CONFIRMATION MODAL */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="glass p-8 max-w-sm w-full text-center border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                            <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-6 text-3xl">
                                🗑️
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Elemento?</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                Esta acción es irreversible.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="py-3 px-4 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors uppercase text-xs font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isLoading}
                                    className="py-3 px-4 rounded bg-red-900 text-red-100 hover:bg-red-700 transition-colors uppercase text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Borrando...' : 'Sí, Eliminar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT PROMO MODAL */}
                {editingPromo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="glass p-8 max-w-md w-full relative border border-neonPurple/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                            <button onClick={() => setEditingPromo(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                            <h3 className="text-xl font-bold mb-6 text-neonPurple">EDITAR CAMPAÑA</h3>

                            <form onSubmit={handleUpdatePromo} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Título</label>
                                    <input
                                        className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-white focus:border-neonPurple outline-none"
                                        value={editingPromo.title}
                                        onChange={e => setEditingPromo({ ...editingPromo, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Beneficio</label>
                                    <input
                                        className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-white focus:border-neonPurple outline-none"
                                        value={editingPromo.current_benefit}
                                        onChange={e => setEditingPromo({ ...editingPromo, current_benefit: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Límite Total</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-white focus:border-neonPurple outline-none"
                                            value={editingPromo.limit}
                                            onChange={e => setEditingPromo({ ...editingPromo, limit: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block text-neonPink">Contador Externo (Manual)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/50 p-3 rounded text-sm border border-neonPink/50 text-white focus:border-neonPink outline-none"
                                            value={editingPromo.manual_claims}
                                            onChange={e => setEditingPromo({ ...editingPromo, manual_claims: parseInt(e.target.value) })}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Define el total de personas que participaron fuera de la web.</p>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3 bg-neonPurple text-white font-bold rounded hover:bg-white hover:text-black transition-colors mt-4">
                                    GUARDAR CAMBIOS
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
