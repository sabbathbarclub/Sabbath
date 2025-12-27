import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api';

const AdminPage = () => {
    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            scanner.clear();
            validateQR(decodedText);
        }

        function onScanFailure(error) {
            // handle error
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

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
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 px-4 flex flex-col items-center relative overflow-hidden">

            {/* Simple background accent */}
            <div className="absolute top-0 left-0 w-full h-96 bg-neonPurple/10 blur-[100px] rounded-full transform -translate-y-1/2"></div>

            <h1 className="text-3xl font-black mb-10 text-white tracking-[0.2em] relative z-10 neon-text">CONTROL DE ACCESO</h1>

            <div className="glass p-8 rounded-2xl w-full max-w-md relative z-10 border border-gray-800 shadow-2xl">
                {!scanResult ? (
                    <>
                        <div id="reader" className="w-full bg-black rounded-xl overflow-hidden border-2 border-dashed border-gray-700"></div>
                        <p className="text-center text-gray-500 mt-4 text-xs tracking-widest uppercase">Apunta la cámara al código QR</p>
                    </>
                ) : (
                    <div className={`text-center py-10 rounded-xl border ${scanResult === 'VÁLIDO' ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
                        <div className={`inline-block p-4 rounded-full mb-6 ${scanResult === 'VÁLIDO' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            {scanResult === 'VÁLIDO' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>
                        <h2 className={`text-4xl font-black mb-2 tracking-wide ${scanResult === 'VALID' ? 'text-green-500' : 'text-red-500'}`}>
                            {scanResult}
                        </h2>
                        <p className="text-lg text-white mb-8 font-light">{message}</p>
                        <button onClick={resetScanner} className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded shadow-lg">
                            Escanear Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
