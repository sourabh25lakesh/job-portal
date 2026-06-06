import { useEffect, useState } from "react";

import { getContactMessages } from "../api/contactApi";

function ContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setError("");

            const data = await getContactMessages();

            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch contact messages:", error);

            setError("Failed to load contact messages. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-6 py-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                        Admin Panel
                    </span>

                    <h1 className="mt-5 text-4xl font-extrabold text-gray-900">
                        Contact Messages
                    </h1>

                    <p className="mt-3 text-gray-600 text-lg">
                        Manage all user contact requests from one place.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 font-medium">
                        {error}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-blue-100">
                        <h2 className="text-3xl font-bold text-gray-800">
                            No Messages Found
                        </h2>

                        <p className="mt-4 text-gray-500">
                            No contact messages available right now.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="bg-white/90 backdrop-blur rounded-3xl border border-blue-100 shadow-sm hover:shadow-2xl transition-all duration-300 p-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {message.subject}
                                        </h2>

                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                                                👤 {message.name}
                                            </span>

                                            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                                📧 {message.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {message.created_at
                                            ? new Date(message.created_at).toLocaleString()
                                            : "No date"}
                                    </div>
                                </div>

                                <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {message.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default ContactMessages;