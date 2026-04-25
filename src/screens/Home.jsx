import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Gavel, ShieldCheck, FileText, Search, Shield,
    Ambulance, Heart, Baby, PhoneCall, ArrowRight
} from 'lucide-react';
import downloadImg from "./download.jpg"; // adjust path if needed

const Home = ({ onNavigate = () => { } }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        document.title = 'Complaint Setu - Quick & Efficient Redressal';
    }, []);
    const navigate = useNavigate();
    return (
        <>

            <div className="min-h-screen bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100">
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 relative">
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-icons text-slate-900">gavel</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-primary">Complaint Setu</span>
                        </div>
                        <nav className="flex items-center gap-8 bg-white ">
                            <a className="font-medium text-primary hover:text-primary/80" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a>
                            <a className="font-medium text-slate-700 dark:text-slate-400 hover:text-blue-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); navigate('/track/:id'); }}>Track Complaint</a>
                            <a className="font-medium text-slate-700 dark:text-slate-400 hover:text-blue-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); navigate('/helpline'); }}>Helpline Info</a>
                            <a className="font-medium text-slate-700 dark:text-slate-400 hover:text-blue-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact Us</a>

                        </nav>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileOpen((value) => !value)} className="md:hidden p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-icons">{mobileOpen ? 'close' : 'menu'}</span>
                            </button>

                            <button className="bg-white text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition" onClick={() => navigate('/admin')}>
                                Admin Dashboard
                            </button>
                            <button className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition" onClick={() => navigate('/login')}>
                                Login
                            </button>
                        </div>
                        <div className={`${mobileOpen ? 'flex' : 'hidden'} absolute top-full left-0 right-0 bg-white dark:bg-background-dark border-t border-primary/10 p-4 md:hidden z-20`}>
                            <nav className="flex flex-col gap-3">
                                <a className="font-medium text-primary hover:text-primary/80" href="#" onClick={(e) => { e.preventDefault(); setMobileOpen(false); onNavigate('home'); }}>Home</a>
                                <a className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#" onClick={(e) => { e.preventDefault(); setMobileOpen(false); navigate('/track/:id'); }}>Track Complaint</a>
                                <a className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#" onClick={(e) => { e.preventDefault(); setMobileOpen(false); onNavigate('dashboard'); }}>Helpline Info</a>
                                <a className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#" onClick={(e) => { e.preventDefault(); setMobileOpen(false); onNavigate('dashboard'); }}>Contact Us</a>
                                <a
                                    className="font-medium text-slate-600 dark:text-slate-400 hover:text-primary" href="#" onClick={(e) => { e.preventDefault(); setMobileOpen(false); onNavigate('dashboard'); }}>Login
                                </a>

                            </nav>
                        </div>
                    </div>
                </header>
                <main>
                    {/* Hero Section */}
                    <section className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden">

                        <div className="container mx-auto px-6">

                            <div className="grid lg:grid-cols-2 gap-16 items-center">

                                {/* LEFT CONTENT */}
                                <div>

                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                                        <span className="material-icons text-sm">verified</span>
                                        Official Government Grievance Portal
                                    </div>

                                    <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-slate-900">
                                        One Platform.<br />
                                        Every Complaint.<br />
                                        <span className="text-blue-700">Quick Action.</span>
                                    </h1>

                                    <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
                                        Empowering citizens with a unified interface for logging grievances,
                                        tracking resolutions, and accessing emergency helplines directly.
                                    </p>

                                    <div className="flex gap-4">

                                        <button
                                            onClick={() => navigate("/register")}
                                            className="px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition flex items-center gap-2"
                                        >
                                            <span className="material-icons text-sm">edit</span>
                                            Register Complaint
                                        </button>

                                        <button
                                            onClick={() => navigate("/track/69b5ccdd4011abecbbcfb92e")}
                                            className="px-8 py-4 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition flex items-center gap-2"
                                        >
                                            <span className="material-icons text-sm">search</span>
                                            Track Complaint
                                        </button>

                                    </div>

                                </div>

                                {/* RIGHT IMAGE */}

                                <div className="relative">

                                    <div className="absolute -inset-6 bg-blue-200/40 blur-3xl rounded-full"></div>

                                    <img
                                        className="rounded-3xl shadow-2xl relative z-10 w-full h-[420px] object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4UdGS61vhReNSIiWnobtzcp82S_DyysQRKLELWHaSznL0GumhluJ99XqUPvSig3jL2rBgDbgCdHcpg1jLgveLNAQnglHXvi1vebbwCjEPWbDTuHHdXsMDp17VAMlysZICdaJtt40Axy1kzibx-UNL37olHeaGGzG-rJNXc2zENTy1WrH3AsjiFrJbBLP-_9hqOgFyVEdwoXnTAqEVjCZEfbB326Q8w6c5ZZV1m44H9QKd7cZTrbi48rnGgq_YEdr0hDsbT2PBjI8"
                                        alt="Government Building"
                                    />

                                </div>
                            </div>

                        </div>

                    </section>
                    {/* Helpline Section */}
                    <section className="py-24 bg-slate-100 dark:bg-slate-800">
                        <div className="container mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold mb-4">Public Awareness &amp; Important Helplines</h2>
                                <p className="text-slate-600 dark:text-slate-400">Immediate assistance is just a call away. Available 24/7 across all regions.</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Helpline Card 1 - Police */}
                                <a
                                    href="tel:100"
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-primary/5 hover:border-red-300 hover:shadow-md transition-all group no-underline block"
                                >
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <span className="material-icons">local_police</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-slate-900">Police</h3>
                                    <p className="text-sm text-slate-500 mb-4">Emergency police assistance</p>
                                    <div className="text-2xl font-bold text-primary">100</div>
                                    <div className="mt-3 flex items-center gap-1 text-red-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-icons text-sm">call</span> Tap to Call
                                    </div>
                                </a>

                                {/* Helpline Card 2 - Ambulance */}
                                <a
                                    href="tel:108"
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-primary/5 hover:border-blue-300 hover:shadow-md transition-all group no-underline block"
                                >
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <span className="material-icons">medical_services</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-slate-900">Ambulance</h3>
                                    <p className="text-sm text-slate-500 mb-4">Medical emergency services</p>
                                    <div className="text-2xl font-bold text-primary">108</div>
                                    <div className="mt-3 flex items-center gap-1 text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-icons text-sm">call</span> Tap to Call
                                    </div>
                                </a>

                                {/* Helpline Card 3 - Women Helpline */}
                                <a
                                    href="tel:1091"
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-primary/5 hover:border-pink-300 hover:shadow-md transition-all group no-underline block"
                                >
                                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                        <span className="material-icons">woman</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-slate-900">Women Helpline</h3>
                                    <p className="text-sm text-slate-500 mb-4">Safety and support services</p>
                                    <div className="text-2xl font-bold text-primary">1091</div>
                                    <div className="mt-3 flex items-center gap-1 text-pink-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-icons text-sm">call</span> Tap to Call
                                    </div>
                                </a>

                                {/* Helpline Card 4 - Child Helpline */}
                                <a
                                    href="tel:1098"
                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-primary/5 hover:border-orange-300 hover:shadow-md transition-all group no-underline block"
                                >
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <span className="material-icons">child_care</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 text-slate-900">Child Helpline</h3>
                                    <p className="text-sm text-slate-500 mb-4">Protection and child welfare</p>
                                    <div className="text-2xl font-bold text-primary">1098</div>
                                    <div className="mt-3 flex items-center gap-1 text-orange-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-icons text-sm">call</span> Tap to Call
                                    </div>
                                </a>
                            </div>
                            <div className="mt-16 bg-slate-100 rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-lg">

                                <div className="flex items-start justify-between gap-8">

                                    <div className="w-2/3">
                                        <h3 className="text-2xl font-bold mb-4">Public Awareness Notice</h3>

                                        <p className="text-slate-600 mb-6 leading-relaxed">
                                            Always keep your complaint reference number confidential. Official representatives will never ask for your passwords or bank details.
                                        </p>

                                        <a className="inline-flex items-center text-blue-700 font-semibold hover:gap-2 transition-all">
                                            Learn more about safety protocols
                                            <span className="material-icons ml-1">arrow_forward</span>
                                        </a>
                                    </div>

                                    <div className="w-1/3">
                                        <a
                                            href="tel:18001234567"
                                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group block no-underline"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="material-icons text-blue-700 group-hover:scale-110 transition-transform">support_agent</span>
                                                <span className="font-semibold text-slate-800">24/7 Citizen Support</span>
                                            </div>

                                            <div className="text-3xl font-bold text-blue-700 mb-2">
                                                1800-123-4567
                                            </div>

                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
                                                Toll-Free Number
                                            </p>

                                            <div className="flex items-center gap-2 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-blue-800 transition-colors justify-center">
                                                <span className="material-icons text-sm">call</span>
                                                Call Now
                                            </div>
                                        </a>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </section>
                </main>
                <footer className="bg-white border-t border-slate-200 py-6">

                    <div className="container mx-auto px-6">

                        <div className="flex justify-between items-center flex-wrap gap-6">

                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-blue-700 text-sm">gavel</span>
                                </div>
                                <span className="font-bold text-blue-700">Complaint Setu</span>
                            </div>

                            {/* Links */}
                            <div className="flex gap-8 text-sm text-slate-500">
                                <a className="hover:text-blue-700 transition-colors" href="#">Privacy Policy</a>
                                <a className="hover:text-blue-700 transition-colors" href="#">Terms of Use</a>
                                <a className="hover:text-blue-700 transition-colors" href="#">Accessibility</a>
                            </div>

                            {/* Copyright */}
                            <p className="text-sm text-slate-400">
                                © 2024 Complaint Setu. All rights reserved.
                            </p>

                        </div>

                    </div>

                </footer>
            </div>



        </>
    );
}

export default Home;