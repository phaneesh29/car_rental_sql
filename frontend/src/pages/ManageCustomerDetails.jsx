import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import api from "../api/axios";
import ManagerSidebar from "../components/ManagerSidebar";
import { Loader2, User2, Mail, Phone, IdCard, MapPin } from "lucide-react";

const ManageCustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/auth/manager/get/customer/${id}`, { withCredentials: true });
        if (res.data.data && res.data.data.length > 0) {
          setCustomer(res.data.data[0]);
          setMessage({ type: "success", text: res.data.message });
        } else {
          setMessage({ type: "info", text: "Customer not found." });
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: err.response?.data?.message || "Failed to fetch customer.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-red-500">Customer Details</h1>
        </div>

        {/* Inline Message */}
        {message.text && (
          <div
            className={`mb-4 px-4 py-2 rounded-md text-sm font-medium ${
              message.type === "success"
                ? "bg-green-900/30 text-green-400 border border-green-700"
                : message.type === "info"
                ? "bg-gray-800 text-gray-300 border border-gray-700"
                : "bg-red-900/30 text-red-400 border border-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : !customer ? (
          <p className="text-gray-400 text-center mt-8">No customer found.</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <User2 className="text-red-400" size={40} />
              <div>
                <h2 className="text-xl font-semibold">
                  {customer.f_name} {customer.l_name}
                </h2>
                <p className="text-sm text-gray-400">Customer ID: {customer.cust_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <IdCard size={16} className="text-gray-500" />
                <p>{customer.licence_num}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <p>{customer.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <p>{customer.phone_num}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <p>
                  {customer.street}, {customer.city}, {customer.state} - {customer.zip}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCustomerDetails;
