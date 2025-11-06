import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ManagerSidebar from "../components/ManagerSidebar";
import {
  Loader2,
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  // 🔹 Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/auth/manager/get/employee", {
          withCredentials: true,
        });
        const data = res.data.data || [];
        if (data.length > 0) setEmployees(data);
        else setMessage({ type: "info", text: "No employees found." });
      } catch (err) {
        setMessage({
          type: "error",
          text: err.response?.data?.message || "Failed to fetch employees.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 Delete employee handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    setDeleting(id);
    try {
      const res = await api.delete(`/auth/manager/delete/${id}`, {
        withCredentials: true,
      });
      setEmployees((prev) => prev.filter((emp) => emp.employee_id !== id));
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete employee.",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-red-500">Manage Employees</h1>
          {message.text && (
            <div
              className={`px-4 py-2 rounded-md text-sm font-medium border ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border-green-700"
                  : message.type === "info"
                  ? "bg-gray-800 text-gray-300 border-gray-700"
                  : "bg-red-900/30 text-red-400 border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* LOADER / EMPTY STATE */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            No employees found.
          </p>
        ) : (
          // 🔹 EMPLOYEE CARDS
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.employee_id}
                className="group bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-5 hover:border-red-500 hover:scale-[1.02] transition-all flex flex-col justify-between relative"
              >
                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(emp.employee_id)}
                  disabled={deleting === emp.employee_id}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                  title="Delete Employee"
                >
                  {deleting === emp.employee_id ? (
                    <Loader2 size={16} className="animate-spin text-red-400" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>

                {/* EMPLOYEE INFO */}
                <div
                  onClick={() =>
                    navigate(`/manager/employee/${emp.employee_id}`)
                  }
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gray-800 p-2 rounded-full">
                      <User size={20} className="text-red-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-100">
                        {emp.first_name} {emp.last_name}
                      </h2>
                      <p className="text-xs text-gray-400">{emp.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-500" />
                      <p className="truncate">{emp.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" />
                      <p>{emp.phone_num}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-500" />
                      <p className="truncate">
                        {emp.branch_name} — {emp.branch_city}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-gray-500" />
                      <p
                        className={`capitalize font-medium ${
                          emp.status === "working"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {emp.status}
                      </p>
                    </div>
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

export default ManageEmployee;
