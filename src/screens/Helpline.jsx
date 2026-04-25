import React from "react";
import { useNavigate } from "react-router-dom";

const Helpline = () => {
    const Card = ({ title, number, icon }) => (
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 text-2xl">
                        {icon}
                    </span>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">{title}</p>
                    <p className="text-2xl font-black text-[#1f39ad]">{number}</p>
                </div>
            </div>
            <a
                href={`tel:${number.replace(/[^0-9+]/g, "")}`}
                className="bg-[#1f39ad] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center gap-2 no-underline"
            >
                <span className="material-symbols-outlined text-sm">call</span> Call Now
            </a>
        </div>
    );

    const Section = ({ title, icon, iconBg, iconColor, children }) => (
        <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${iconBg}`}>
                <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
                    {icon}
                </span>
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            </div>
            <div className="grid gap-4">{children}</div>
        </div>
    );
    const navigate = useNavigate();
    return (
        <div className="min-h-screen w-full bg-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-white shadow-sm border-b border-slate-200">
                <div className="text-2xl font-bold text-[#1f39ad]">
                    Complaint Setu
                </div>
                <div className=" md:flex gap-8 text-sm font-medium">
                    <a href="#" className="text-slate-600 hover:text-[#1f39ad]" onClick={(e) => { e.preventDefault(); navigate('/'); }} >Home</a>
                    <a href="#" className="text-slate-600 hover:text-[#1f39ad]" onClick={(e) => { e.preventDefault(); navigate('/track/:id'); }} >Track Complaint</a>
                    <a href="#" className="text-[#1f39ad] border-b-2 border-[#1f39ad]">Helpline Info</a>
                    <a href="#" className="text-slate-600 hover:text-[#1f39ad]" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} >Contact Us</a>
                </div>
                <button className="bg-[#1f39ad] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section className="w-full py-20 px-6 md:px-12 text-center bg-gradient-to-br from-[#1f39ad]/5 to-transparent">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                    Helpline Information
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                    Access immediate assistance with our directory of national and local helpline numbers. Available 24/7.
                </p>
                <input
                    type="text"
                    placeholder="Search for a department or service..."
                    className="max-w-xl w-full px-6 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1f39ad] shadow-lg mx-auto block"
                />
            </section>

            {/* Grid Sections */}
            <section className="w-full px-6 md:px-12 py-16 max-w-full mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">

                    {/* Emergency */}
                    <Section title="Emergency" icon="emergency" iconBg="bg-red-100" iconColor="text-red-600">
                        <Card title="Police" number="100" icon="local_police" />
                        <Card title="Ambulance" number="108" icon="medical_services" />
                        <Card title="Fire" number="101" icon="fire_truck" />
                        <Card title="Disaster Management" number="1070" icon="tsunami" />
                    </Section>

                    {/* Women & Child */}
                    <Section title="Women & Child" icon="family_restroom" iconBg="bg-purple-100" iconColor="text-purple-600">
                        <Card title="Women Helpline" number="1091" icon="woman" />
                        <Card title="Child Helpline" number="1098" icon="child_care" />
                        <Card title="Missing Child" number="1094" icon="person_search" />
                    </Section>

                    {/* Health */}
                    <Section title="Health" icon="health_and_safety" iconBg="bg-emerald-100" iconColor="text-emerald-600">
                        <Card title="Blood Bank" number="1910" icon="bloodtype" />
                        <Card title="Drug Abuse Helpline" number="1800-11-0031" icon="pill" />
                        <Card title="Senior Citizen Helpline" number="14567" icon="elderly" />
                    </Section>

                    {/* Citizen Services */}
                    <Section title="Citizen Services" icon="public" iconBg="bg-blue-100" iconColor="text-blue-600">
                        <Card title="Cyber Cell" number="1930" icon="enhanced_encryption" />
                        <Card title="Consumer Helpline" number="1800-11-4000" icon="shopping_bag" />
                        <Card title="Road Accident" number="1073" icon="car_crash" />
                    </Section>

                </div>
            </section>

            {/* Notice Section */}
            <section className="w-full px-6 md:px-12 py-12 max-w-7xl mx-auto">
                <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined">gavel</span>
                        Important Legal Notice
                    </h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        All emergency helpline numbers provided above are strictly for genuine emergencies and reporting valid grievances. Misuse of these services, including prank calls or false reporting, is a serious offense punishable under the relevant sections of the Indian Penal Code (IPC). Please use these resources responsibly.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-12 px-6 md:px-12 text-center mt-auto bg-slate-50 border-t border-slate-200">
                <div className="text-lg font-semibold text-slate-900 mb-4">Complaint Setu</div>
                <div className="flex flex-wrap justify-center gap-6 mb-4">
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-900">Privacy Policy</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-900">Terms of Service</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-900">FAQ</a>
                    <a href="#" className="text-xs text-slate-500 hover:text-slate-900">Accessibility</a>
                </div>
                <p className="text-xs text-slate-500">© 2024 Complaint Setu - Government of India Grievance Portal. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Helpline;