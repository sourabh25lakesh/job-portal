import { useState } from "react";

import { sendContactMessage } from "../api/contactApi";

const contactInfo = [
    {
        icon: "📍",
        title: "Office Address",
        text: "Bangalore, Karnataka, India",
    },
    {
        icon: "📧",
        title: "Email Support",
        text: "support@jobportal.com",
    },
    {
        icon: "📞",
        title: "Phone Number",
        text: "+91 98765 43210",
    },
];

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await sendContactMessage(formData);

            setSuccess("Thank you! Your message has been sent successfully.");

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });

            setTimeout(() => {
                setSuccess("");
            }, 4000);
        } catch (err) {
            console.log(err);

            setError(
                err?.response?.data?.detail ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-6 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                <div className="text-center max-w-3xl mx-auto animate-fadeInUp">
                    <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                        Contact Us
                    </span>

                    <h1 className="mt-5 text-4xl md:text-6xl font-extrabold text-gray-900">
                        Let’s Talk About Your{" "}
                        <span className="text-blue-600">Career Journey</span>
                    </h1>

                    <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                        Have questions about jobs, applications, or hiring? Send us a message and our team will help you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mt-14">
                    {contactInfo.map((item) => (
                        <div
                            key={item.title}
                            className="group bg-white/80 backdrop-blur rounded-3xl p-8 border border-blue-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                {item.icon}
                            </div>

                            <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                {item.title}
                            </h3>

                            <p className="mt-3 text-gray-600">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-center mt-16">
                    <div className="bg-white/90 backdrop-blur rounded-[2rem] p-8 border border-blue-100 shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Send Message
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Fill the form below and we’ll get back to you soon.
                        </p>

                        {success && (
                            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl font-medium">
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    required
                                    minLength="2"
                                    className="w-full px-5 py-4 rounded-2xl border border-blue-100 bg-blue-50/40 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your Email"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border border-blue-100 bg-blue-50/40 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                                />
                            </div>

                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                required
                                minLength="3"
                                className="w-full px-5 py-4 rounded-2xl border border-blue-100 bg-blue-50/40 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                            />

                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Write your message..."
                                rows="6"
                                required
                                minLength="10"
                                className="w-full px-5 py-4 rounded-2xl border border-blue-100 bg-blue-50/40 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition resize-none"
                            ></textarea>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full
                                    py-4
                                    rounded-2xl
                                    font-semibold
                                    transition-all
                                    duration-300
                                    ${
                                        loading
                                            ? "bg-blue-400 cursor-not-allowed text-white"
                                            : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200"
                                    }
                                `}
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-70"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-200 rounded-full blur-3xl opacity-70"></div>

                        <div className="relative bg-white/90 backdrop-blur rounded-[2rem] p-8 border border-blue-100 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-float">
                            <img
                                src="https://illustrations.popsy.co/gray/customer-support.svg"
                                alt="Contact Support"
                                className="w-full max-w-md mx-auto"
                            />

                            <div className="mt-8 bg-blue-50 rounded-3xl p-6 border border-blue-100">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    We usually reply fast
                                </h3>

                                <p className="mt-3 text-gray-600 leading-relaxed">
                                    Your message will be stored safely and reviewed by the JobPortal support team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-12px);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease forwards;
                }

                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}

export default Contact;