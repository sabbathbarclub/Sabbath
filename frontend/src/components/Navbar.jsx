import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-black/90 py-3 border-b border-neonPurple/30' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="z-50 relative">
                    <img
                        src="https://drive.google.com/thumbnail?id=1tVlRwyWZ-5nCJ7cRrYX80akhT5pk1EuI&sz=w500"
                        alt="SABBATH Logo"
                        className="h-12 md:h-16 object-contain"
                    />
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-white z-50 relative focus:outline-none"
                >
                    {isOpen ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8 text-sm tracking-widest">
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-neonPurple transition-colors duration-300">INICIO</Link>
                    <a href="/#events" className="hover:text-neonPurple transition-colors duration-300">EVENTOS</a>
                    <a href="/#promos" className="hover:text-neonPurple transition-colors duration-300">PROMOCIONES</a>
                    <a href="/#menu" className="hover:text-neonPurple transition-colors duration-300">CARTA</a>
                    <a href="/#about" className="hover:text-neonPurple transition-colors duration-300">NUESTRO BAR</a>
                    <Link to="/staff-login" className="text-gray-500 hover:text-white transition-colors duration-300">STAFF</Link>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 text-xl tracking-widest transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden z-40`}>
                <Link to="/" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-neonPurple">INICIO</Link>
                <a href="/#events" onClick={() => setIsOpen(false)} className="hover:text-neonPurple">EVENTOS</a>
                <a href="/#promos" onClick={() => setIsOpen(false)} className="hover:text-neonPurple">PROMOCIONES</a>
                <a href="/#menu" onClick={() => setIsOpen(false)} className="hover:text-neonPurple">CARTA</a>
                <a href="/#about" onClick={() => setIsOpen(false)} className="hover:text-neonPurple">NUESTRO BAR</a>
                <Link to="/staff-login" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">STAFF</Link>
            </div>
        </nav>
    );
};

export default Navbar;
