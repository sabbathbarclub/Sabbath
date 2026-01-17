import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale';
import api from '../api';

registerLocale('es', es);

const StaffDashboard = () => {
    // 1. STATE DEFINITIONS
    const [activeTab, setActiveTab] = useState('events');
    const [isLoading, setIsLoading] = useState(false);

    // Data State (Initialized to empty arrays to prevent crashes)
    const [menus, setMenus] = useState([]);
    const [events, setEvents] = useState([]);
    const [promos, setPromos] = useState([]);

    // Form States
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', capacity: 100 });
    const [eventImageUrl, setEventImageUrl] = useState('');
    const [newPromo, setNewPromo] = useState({ title: '', current_benefit: '1 Shot Gratis', limit: 100 });
    const [menuUrl, setMenuUrl] = useState('');

    // Scanner & Feedback States
    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState('');
    const [notification, setNotification] = useState(null);

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);

    // 2. EFFECTS (Data Loading)
    useEffect(() => {
        loadEvents();
        loadPromos();
        loadMenus();
    }, []);

    // Notification Timer
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Scanner Logic
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

    // 3. API FUNCTIONS
    const loadEvents = () => api.get('events/').then(res => setEvents(res.data)).catch(console.error);
    const loadPromos = () => api.get('campaigns/').then(res => setPromos(res.data)).catch(console.error);
    const loadMenus = () => api.get('menus/').then(res => setMenus(res.data)).catch(console.error);

    const handleCreateEvent = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const eventData = { ...newEvent, is_active: true, reservations_count: 0 };
        if (eventImageUrl) eventData.image = eventImageUrl;

        api.post('events/', eventData)
            .then(() => {
                loadEvents();
                setNewEvent({ title: '', description: '', date: '', capacity: 100 });
                setEventImageUrl('');
                setNotification({ type: 'success', msg: '🎉 Evento creado' });
            })
            .catch(() => setNotification({ type: 'error', msg: 'Error al crear evento' }))
            .finally(() => setIsLoading(false));
    };

    const handleCreatePromo = (e) => {
        e.preventDefault();
        api.post('campaigns/', { ...newPromo, tickets_claimed: 0 })
            .then(() => {
                loadPromos();
                setNewPromo({ title: '', current_benefit: '1 Shot Gratis', limit: 100 });
                setNotification({ type: 'success', msg: '🎟️ Campaña creada' });
            })
            .catch(() => setNotification({ type: 'error', msg: 'Error al crear campaña' }));
    };

    const handleUpdatePromo = (e) => {
        e.preventDefault();
        if (!editingPromo) return;
        api.patch(`campaigns/${editingPromo.id}/`, editingPromo)
            .then(() => {
                loadPromos();
                setEditingPromo(null);
                setNotification({ type: 'success', msg: '✅ Campaña actualizada' });
            })
            .catch(() => setNotification({ type: 'error', msg: 'Error al actualizar' }));
    };

    const handleUploadMenu = () => {
        if (!menuUrl) return;
        api.post('menus/', { image: menuUrl, is_active: true }).then(() => {
            loadMenus();
            setNotification({ type: 'success', msg: '📜 Carta actualizada (Link)' });
            setMenuUrl('');
        }).catch(() => setNotification({ type: 'error', msg: 'Error al actualizar carta' }));
    };

    const toggleEvent = (id) => {
        api.post(`events/${id}/toggle/`).then(loadEvents).catch(() => alert('Error'));
    };

    const toggleMenu = (id) => {
        api.post(`menus/${id}/toggle/`).then(() => {
            loadMenus(); // This enables the UI update
            setNotification({ type: 'success', msg: '📜 Estado de carta cambiado' });
        }).catch(() => setNotification({ type: 'error', msg: 'Error al cambiar estado' }));
    };

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

    const requestDelete = (type, id) => {
        setDeleteType(type);
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete || !deleteType) return;
        setIsLoading(true);

        let endpoint = '';
        if (deleteType === 'event') endpoint = `events/${itemToDelete}/`;
        else if (deleteType === 'menu') endpoint = `menus/${itemToDelete}/`;
        else endpoint = `campaigns/${itemToDelete}/`;

        api.delete(endpoint).then(() => {
            if (deleteType === 'event') loadEvents();
            else if (deleteType === 'menu') loadMenus();
            else loadPromos();
            setNotification({ type: 'success', msg: '🗑️ Eliminado' });
        }).catch(() => {
            setNotification({ type: 'error', msg: 'No se pudo eliminar' });
        }).finally(() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
            setDeleteType(null);
            setIsLoading(false);
        });
    };

    // 4. RENDER
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
                                        <input type="url" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700 text-neonPurple" placeholder="https://..." value={eventImageUrl} onChange={e => setEventImageUrl(e.target.value)} />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-neonPurple font-bold rounded hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                                        {isLoading ? 'CREANDO...' : 'CREAR EVENTO'}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            {Array.isArray(events) && events.map(ev => (
                                <div key={ev.id} className="glass p-5 rounded-xl flex justify-between items-center border border-gray-800">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${ev.is_active ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-lg">{ev.title}</h3>
                                            <p className="text-gray-400 text-xs">Capacidad: {ev.reservations_count} / {ev.capacity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button onClick={() => toggleEvent(ev.id)} className={`px-4 py-1 text-xs rounded font-bold border ${ev.is_active ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                            {ev.is_active ? 'CERRAR' : 'ABRIR'}
                                        </button>
                                        <button onClick={() => requestDelete('event', ev.id)} className="ml-2 px-3 py-1 text-xs rounded border border-red-800 text-red-500">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROMOS TAB */}
                {activeTab === 'promos' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-xl h-fit">
                            <h3 className="text-xl font-bold mb-4 text-neonPink">NUEVA CAMPAÑA</h3>
                            <form onSubmit={handleCreatePromo} className="space-y-4">
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Título" value={newPromo.title} onChange={e => setNewPromo({ ...newPromo, title: e.target.value })} required />
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Beneficio" value={newPromo.current_benefit} onChange={e => setNewPromo({ ...newPromo, current_benefit: e.target.value })} required />
                                <input type="number" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" placeholder="Cupos" value={newPromo.limit} onChange={e => setNewPromo({ ...newPromo, limit: parseInt(e.target.value) })} required />
                                <button type="submit" className="w-full py-3 bg-neonPink font-bold rounded">CREAR CAMPAÑA</button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {Array.isArray(promos) && promos.map(p => (
                                <div key={p.id} className="bg-gray-900 p-4 rounded border-l-4 border-neonPink relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-white">{p.title}</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPromo(p)} className="text-gray-400 hover:text-white">✏️</button>
                                            <button onClick={() => requestDelete('promo', p.id)} className="text-red-500 hover:text-white">🗑️</button>
                                        </div>
                                    </div>
                                    <p className="text-neonPurple font-bold">BENEFICIO: {p.current_benefit}</p>
                                    <p className="text-xs text-gray-400 mt-2">Progreso: {p.tickets_claimed} / {p.limit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CARTA TAB (With Toggle Logic) */}
                {activeTab === 'carta' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="grid gap-4">
                            {Array.isArray(menus) && menus.map(m => (
                                <div key={m.id} className={`glass p-4 rounded-xl flex justify-between items-center border ${m.is_active ? 'border-green-500/50' : 'border-gray-800'}`}>
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${m.is_active ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                        <a href={m.image} target="_blank" rel="noreferrer" className="text-neonPurple underline truncate max-w-xs">{m.image}</a>
                                    </div>
                                    <button onClick={() => toggleMenu(m.id)} className={`px-4 py-1 text-xs rounded font-bold border ${m.is_active ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                        {m.is_active ? 'OCULTAR' : 'MOSTRAR'}
                                    </button>
                                    <button onClick={() => requestDelete('menu', m.id)} className="ml-2 px-3 py-1 text-xs rounded border border-red-800 text-red-500">🗑️</button>
                                </div>
                            ))}
                        </div>
                        <div className="glass p-10 rounded-xl text-center border-t border-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-neonPurple">SUBIR NUEVA CARTA</h3>
                            <input type="url" className="w-full bg-black/50 p-4 rounded text-sm border border-gray-700 text-neonPurple mb-4" placeholder="https://drive.google.com/..." value={menuUrl} onChange={e => setMenuUrl(e.target.value)} />
                            <button onClick={handleUploadMenu} className="px-8 py-3 bg-white text-black font-bold rounded w-full hover:bg-neonPurple hover:text-white transition-colors">ACTUALIZAR ENLACE</button>
                        </div>
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
                            <div className={`text-center py-10 rounded-xl border ${scanResult === 'VALID' ? 'border-green-500/50' : 'border-red-500/50'}`}>
                                <h2 className={`text-4xl font-black mb-2 ${scanResult === 'VALID' ? 'text-green-500' : 'text-red-500'}`}>{scanResult}</h2>
                                <p className="text-lg text-white mb-8">{message}</p>
                                <button onClick={resetScanner} className="px-8 py-3 bg-white text-black font-bold uppercase rounded">Escanear Siguiente</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Notificaciones & Modales */}
                {notification && (
                    <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-xl border flex items-center gap-3 z-50 ${notification.type === 'success' ? 'bg-black border-green-500 text-green-400' : 'bg-black border-red-500 text-red-500'}`}>
                        {notification.type === 'success' ? '✅' : '⚠️'} <span className="font-bold text-sm">{notification.msg}</span>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <div className="glass p-8 max-w-sm w-full text-center border border-red-900/50">
                            <h3 className="text-xl font-bold text-white mb-2">¿Eliminar?</h3>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button onClick={() => setShowDeleteModal(false)} className="py-3 px-4 rounded border border-gray-600 text-gray-400">Cancelar</button>
                                <button onClick={confirmDelete} className="py-3 px-4 rounded bg-red-900 text-red-100">Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

                {editingPromo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <div className="glass p-8 max-w-md w-full relative border border-neonPurple/50">
                            <button onClick={() => setEditingPromo(null)} className="absolute top-4 right-4 text-gray-500">✕</button>
                            <h3 className="text-xl font-bold mb-6 text-neonPurple">EDITAR CAMPAÑA</h3>
                            <form onSubmit={handleUpdatePromo} className="space-y-4">
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" value={editingPromo.title} onChange={e => setEditingPromo({ ...editingPromo, title: e.target.value })} />
                                <input className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" value={editingPromo.current_benefit} onChange={e => setEditingPromo({ ...editingPromo, current_benefit: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" className="w-full bg-black/50 p-3 rounded text-sm border border-gray-700" value={editingPromo.limit} onChange={e => setEditingPromo({ ...editingPromo, limit: parseInt(e.target.value) })} />
                                    <input type="number" className="w-full bg-black/50 p-3 rounded text-sm border border-neonPink/50" value={editingPromo.manual_claims} onChange={e => setEditingPromo({ ...editingPromo, manual_claims: parseInt(e.target.value) })} />
                                </div>
                                <button type="submit" className="w-full py-3 bg-neonPurple text-white font-bold rounded mt-4">GUARDAR CAMBIOS</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
