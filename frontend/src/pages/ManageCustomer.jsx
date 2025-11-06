import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ManagerSidebar from "../components/ManagerSidebar";
import { Loader2, User2, Mail, Phone, IdCard } from "lucide-react";
import { useNavigate } from "react-router";

const ManageCustomer = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get("/auth/manager/get/customer", { withCredentials: true });
                if (res.data.data && res.data.data.length > 0) {
                    setCustomers(res.data.data);
                    setMessage({ type: "success", text: res.data.message });
                } else {
                    setMessage({ type: "info", text: "No customers found." });
                }
            } catch (err) {
                setMessage({
                    type: "error",
                    text: err.response?.data?.message || "Failed to fetch customers.",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    return (
        <div className="flex bg-gray-950 min-h-screen text-gray-100">
            <ManagerSidebar />

            <div className="flex-1 ml-20 md:ml-64 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-red-500">Manage Customers</h1>
                </div>

                {/* Inline Message */}
                {message.text && (
                    <div
                        className={`mb-4 px-4 py-2 rounded-md text-sm font-medium ${message.type === "success"
                                ? "bg-green-900/30 text-green-400 border border-green-700"
                                : message.type === "info"
                                    ? "bg-gray-800 text-gray-300 border border-gray-700"
                                    : "bg-red-900/30 text-red-400 border border-red-700"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                    </div>
                ) : customers.length === 0 ? (
                    <p className="text-gray-400 text-center mt-8">No customers found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map((cust) => (
                            <div
                                key={cust.cust_id}
                                onClick={() => navigate(`/manager/customers/${cust.cust_id}`)}
                                className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-5 hover:border-red-500 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <User2 className="text-red-400" size={22} />
                                    <h2 className="text-lg font-semibold">
                                        {cust.f_name} {cust.l_name}
                                    </h2>
                                </div>

                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <IdCard size={16} className="text-gray-500" />
                                        <p>{cust.licence_num}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
                                        <p>{cust.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-500" />
                                        <p>{cust.phone_num}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>ID:</span>
                                        <span className="font-mono text-gray-400">{cust.cust_id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCustomer;
