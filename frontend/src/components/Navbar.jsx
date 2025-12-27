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

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 py-3 border-b border-neonPurple/30' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="text-3xl font-bold tracking-widest text-white neon-text font-sans">
                    SÀBBATH
                </Link>
                <div className="hidden md:flex space-x-8 text-sm tracking-widest">
                    <a href="#events" className="hover:text-neonPurple transition-colors duration-300">EVENTOS</a>
                    <a href="#reservations" className="hover:text-neonPurple transition-colors duration-300">MESA VIP</a>
                    <a href="#about" className="hover:text-neonPurple transition-colors duration-300">EL CLUB</a>
                    <Link to="/staff-login" className="text-gray-500 hover:text-white transition-colors duration-300">STAFF</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
