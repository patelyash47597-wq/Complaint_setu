import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TrackComplaint = ({ onNavigate = () => { } }) => {
    const { id: urlId } = useParams();
    const [searchId, setSearchId] = useState("");
    const [complaint, setComplaint] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [locationValidation, setLocationValidation] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (urlId && urlId !== ":id") {
            setSearchId(urlId);
            fetchComplaint(urlId);
        }
    }, [urlId]);

    const fetchComplaint = async (id) => {
        setLoading(true);
        setError(null);
        setComplaint(null);
        setFeedbackRating(0);
        setFeedbackText("");
        setFeedbackSubmitted(false);

        try {
            const res = await fetch(`http://localhost:5000/api/complaints/${id}`);
            if (!res.ok) throw new Error("Complaint not found");
            const data = await res.json();
            setComplaint(data);
            setError(null);
            if (data.feedback?.rating) {
                setFeedbackSubmitted(true);
            }
        } catch (error) {
            console.error("Error fetching complaint:", error);
            setError(error.message || "Error fetching complaint details");
            setComplaint(null);
        } finally {
            setLoading(false);
        }
    };

    const validateLocation = async (location) => {
        if (!location) return;
        setLocationValidation({ status: 'validating', message: 'Validating location...' });
        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=demo&limit=1`);
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    setLocationValidation({ status: 'valid', message: 'Location validated successfully', details: data.results[0] });
                } else {
                    setLocationValidation({ status: 'invalid', message: 'Location could not be validated' });
                }
            } else {
                setLocationValidation({ status: 'error', message: 'Unable to validate location at this time' });
            }
        } catch (error) {
            setLocationValidation({ status: 'error', message: 'Location validation failed' });
        }
        setTimeout(() => setLocationValidation(null), 5000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            setError("Please enter a valid complaint ID");
            return;
        }
        fetchComplaint(searchId.trim());
    };

    const handleFeedbackSubmit = async () => {
        if (feedbackRating === 0) {
            alert("Please select a star rating");
            return;
        }
        try {
            await fetch(`http://localhost:5000/api/complaints/${complaint._id}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: feedbackRating, comment: feedbackText })
            });
            setFeedbackSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Error submitting feedback");
        }
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        const filename = image.replace(/\\/g, '/').replace(/^uploads\//, '');
        return `http://localhost:5000/uploads/${filename}`;
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">

                {/* Header */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-3">
                    <div className="flex items-center gap-4">
                        <div className="text-primary">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">Complaint Setu</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5">
                            <span className="material-symbols-outlined">account_circle</span>
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 max-w-[1400px] mx-auto w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">

                    {/* Sidebar */}
                    <aside className="md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 px-6 py-8 gap-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">

                        <div onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined">home</span>
                            <p className="text-sm font-medium">Home</p>
                        </div>

                        <div className="flex items-center gap-3 bg-primary/10 text-primary rounded-lg cursor-pointer p-2">
                            <span className="material-symbols-outlined">description</span>
                            <p className="text-sm font-bold">My Complaints</p>
                        </div>

                        <div onClick={() => navigate('/helpline')} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined">help</span>
                            <p className="text-sm font-medium">Support</p>
                        </div>

                        {complaint && (
                            <div className="mt-6 p-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow min-h-[520px] flex flex-col overflow-hidden">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 pb-3 border-b border-primary/20">
                                    <span className="material-symbols-outlined text-white text-lg bg-pink-600 p-1.5 rounded-lg shadow-md">timeline</span>
                                    <span className="text-xs uppercase tracking-wide">Status Timeline</span>
                                </h4>
                                <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                                    <div className="flex items-start gap-3 pb-5 border-b border-slate-100 dark:border-slate-600">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg">
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        </div>
                                        <div className="pt-1 flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Complaint Registered</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Filed on {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-xs text-primary font-semibold mt-2 flex items-center gap-1 bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                                                <span className="material-symbols-outlined text-xs">check_circle</span>Submitted
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 pb-5 border-b border-slate-100 dark:border-slate-600">
                                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-all ${complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                        </div>
                                        <div className="pt-1 flex-1 min-w-0">
                                            <p className={`text-sm font-bold transition-colors truncate ${complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>In Progress</p>
                                            <p className={`text-xs mt-1 transition-colors ${complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                                                {complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'Assigned to PWD' : 'Waiting for assignment'}
                                            </p>
                                            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 w-fit px-2 py-0.5 rounded-full ${complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-xs">schedule</span>
                                                {complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'In Review' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full shadow-lg transition-all ${complaint.status === 'Resolved' ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-lg">{complaint.status === 'Resolved' ? 'check_circle' : 'construction'}</span>
                                        </div>
                                        <div className="pt-1 flex-1 min-w-0">
                                            <p className={`text-sm font-bold transition-colors truncate ${complaint.status === 'Resolved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                {complaint.status === 'Resolved' ? 'Resolved' : 'Action Taken'}
                                            </p>
                                            <p className={`text-xs mt-1 transition-colors ${complaint.status === 'Resolved' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                                                {complaint.status === 'Resolved' ? 'Issue resolved and verified.' : 'Work in progress.'}
                                            </p>
                                            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 w-fit px-2 py-0.5 rounded-full ${complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-xs">{complaint.status === 'Resolved' ? 'done' : 'pending'}</span>
                                                {complaint.status === 'Resolved' ? 'Completed' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 px-6 md:px-8 py-8 flex flex-col gap-6 overflow-y-auto">

                        {/* Search Form */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <span className="material-symbols-outlined text-primary text-2xl">search</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Track Your Complaint</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your complaint ID to view status and updates</p>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter Complaint ID (e.g., 64f1a2b3c4d5e6f7g8h9i0j)"
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 pl-12 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">description</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin">sync</span>Searching...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">search</span>Track Complaint</>
                                    )}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    <div>
                                        <p className="font-medium">Error</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {complaint ? (
                            <>
                                {/* Page Header */}
                                <div className="flex items-center justify-between ml-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Complaint Status</h1>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Complaint ID: <span className="text-primary font-semibold ml-1">{complaint._id}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-100 px-4 py-1 rounded-full border border-blue-200">
                                        <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                                        <span className="text-blue-600 text-xs font-bold uppercase">{complaint.status}</span>
                                    </div>
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 gap-6 ml-6">

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-sm shadow-slate-200/40 dark:shadow-none transition-transform hover:-translate-y-0.5">
                                            <p className="text-xs uppercase text-slate-500 font-bold tracking-[0.2em] mb-3">Category</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{complaint?.category}</p>
                                            <p className="text-sm text-slate-500 mt-2">This is the complaint category selected during registration.</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-sm shadow-slate-200/40 dark:shadow-none transition-transform hover:-translate-y-0.5">
                                            <p className="text-xs uppercase text-slate-500 font-bold tracking-[0.2em] mb-3">Registered Date</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{new Date(complaint?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-sm text-slate-500 mt-2">The date when this complaint was created in the system.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-sm shadow-slate-200/40 dark:shadow-none transition-transform hover:-translate-y-0.5">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase text-slate-500 font-bold tracking-[0.2em] mb-2">Location</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                                        <p className="font-semibold text-slate-900 dark:text-white">{complaint?.location}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => validateLocation(complaint?.location)}
                                                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                                                >
                                                    <span className="material-symbols-outlined text-sm">place</span>
                                                    Validate Location
                                                </button>
                                            </div>

                                            {locationValidation && (
                                                <div className={`rounded-2xl p-3 text-sm flex items-center gap-2 ${locationValidation.status === 'valid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : locationValidation.status === 'invalid' ? 'bg-rose-50 text-rose-800 border border-rose-200' : locationValidation.status === 'validating' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                                                    <span className="material-symbols-outlined text-base">
                                                        {locationValidation.status === 'valid' ? 'check_circle' : locationValidation.status === 'invalid' ? 'error' : locationValidation.status === 'validating' ? 'sync' : 'info'}
                                                    </span>
                                                    <span>{locationValidation.message}</span>
                                                </div>
                                            )}

                                            <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <iframe
                                                    title="map"
                                                    width="100%"
                                                    height="320"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    allowFullScreen
                                                    src={`https://www.google.com/maps?q=${encodeURIComponent(complaint?.location)}&output=embed`}
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>

                                    {complaint?.image && (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-sm shadow-slate-200/40 dark:shadow-none transition-transform hover:-translate-y-0.5">
                                            <p className="text-xs uppercase text-slate-500 font-bold tracking-[0.2em] mb-4">Attached Image</p>
                                            <div className="relative group overflow-hidden rounded-3xl">
                                                <img
                                                    src={getImageUrl(complaint.image)}
                                                    alt="Complaint evidence"
                                                    className="w-full h-64 object-cover transition duration-300 group-hover:scale-105"
                                                    onError={(e) => { console.log("IMG FAILED TO LOAD:", e.target.src); }}
                                                    onClick={() => setSelectedImage(getImageUrl(complaint.image))}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition group-hover:bg-opacity-20">
                                                    <button
                                                        onClick={() => setSelectedImage(getImageUrl(complaint.image))}
                                                        className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold transition"
                                                    >
                                                        <span className="material-symbols-outlined mr-2 text-base">zoom_in</span>
                                                        View Full Size
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined">image</span>
                                                Evidence image attached to this complaint
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow ml-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <span className="material-symbols-outlined text-primary text-2xl">article</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Description</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed description of the issue</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="font-medium text-slate-900 dark:text-white leading-relaxed">{complaint?.details}</p>
                                    </div>
                                </div>

                                {/* ── FEEDBACK SECTION ── only shows when Resolved */}
                                {complaint.status === "Resolved" && (
                                    <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl p-8 shadow-lg ml-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900 rounded-full">
                                                <span className="material-symbols-outlined text-emerald-600 text-2xl">star</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rate the Resolution</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Was your issue actually resolved? Let us know.</p>
                                            </div>
                                        </div>

                                        {feedbackSubmitted ? (
                                            <div className="flex flex-col items-center gap-4 py-8">
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900 rounded-full">
                                                    <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                                                </div>
                                                <p className="text-lg font-bold text-emerald-600">Thank you for your feedback!</p>
                                                <p className="text-sm text-slate-500">Your response helps us improve our services.</p>
                                                {feedbackRating > 0 && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} className={`material-symbols-outlined text-2xl ${star <= feedbackRating ? "text-amber-400" : "text-slate-300"}`}>star</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {/* Star Rating */}
                                                <div className="flex items-center gap-2 mb-6">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setFeedbackRating(star)}
                                                            className="transition-transform hover:scale-110 focus:outline-none"
                                                        >
                                                            <span className={`material-symbols-outlined text-4xl transition-colors ${star <= feedbackRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}>
                                                                star
                                                            </span>
                                                        </button>
                                                    ))}
                                                    {feedbackRating > 0 && (
                                                        <span className="ml-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][feedbackRating]}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quick buttons */}
                                                <div className="flex gap-3 mb-6 flex-wrap">
                                                    <button
                                                        onClick={() => setFeedbackText("Yes, the issue was fully resolved.")}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${feedbackText === "Yes, the issue was fully resolved." ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"}`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">thumb_up</span>
                                                        Yes, resolved
                                                    </button>
                                                    <button
                                                        onClick={() => setFeedbackText("No, the issue is still not resolved.")}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${feedbackText === "No, the issue is still not resolved." ? "bg-rose-50 border-rose-400 text-rose-700" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"}`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">thumb_down</span>
                                                        Not resolved
                                                    </button>
                                                    <button
                                                        onClick={() => setFeedbackText("Partially resolved, needs more work.")}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${feedbackText === "Partially resolved, needs more work." ? "bg-amber-50 border-amber-400 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"}`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">warning</span>
                                                        Partially resolved
                                                    </button>
                                                </div>

                                                {/* Comment box */}
                                                <textarea
                                                    rows="3"
                                                    placeholder="Any additional comments? (optional)"
                                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all mb-4"
                                                    value={feedbackText}
                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                />

                                                <button
                                                    onClick={handleFeedbackSubmit}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined">send</span>
                                                    Submit Feedback
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-lg">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">search_off</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">No Complaint Found</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg">We couldn't find a complaint with that ID. Please check your complaint ID and try again.</p>
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        <button
                                            onClick={() => setSearchId("")}
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors shadow-lg"
                                        >
                                            Try Another ID
                                        </button>
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                                        >
                                            Register New Complaint
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Image Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-full">
                            <img
                                src={selectedImage}
                                alt="Complaint evidence - full size"
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 bg-white bg-opacity-90 text-slate-900 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackComplaint;