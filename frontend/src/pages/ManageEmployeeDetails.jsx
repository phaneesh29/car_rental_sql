import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import api from "../api/axios";
import ManagerSidebar from "../components/ManagerSidebar";
import { Loader2, Pencil, X, Check } from "lucide-react";

const ManageEmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [editing, setEditing] = useState(null); // which section is being edited
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/auth/manager/get/employee/${id}`, {
          withCredentials: true,
        });
        if (res.data.data && res.data.data.length > 0) {
          const emp = res.data.data[0];
          setEmployee(emp);
          setFormData({
            fName: emp.first_name,
            lName: emp.last_name,
            role: emp.role,
            status: emp.status,
            street: emp.street,
            city: emp.city,
            state: emp.state,
            zip: emp.zip,
            phoneNumber: emp.phone_num,
          });
        } else {
          setMsg({ text: "Employee not found.", type: "error" });
        }
      } catch (err) {
        setMsg({
          text: err.response?.data?.message || "Failed to fetch employee.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleEdit = (section) => setEditing(section);
  const handleCancel = () => {
    setEditing(null);
    setMsg({ text: "", type: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (type) => {
    try {
      const payload = {
        employeeId: employee.employee_id,
        ...formData,
        type,
      };
      const res = await api.patch("/auth/manager/update/", payload);
      setMsg({ text: res.data.message, type: "success" });
      setEditing(null);
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || "Update failed.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  if (!employee)
    return (
      <div className="flex bg-gray-950 text-gray-400 justify-center items-center h-screen">
        Employee not found.
      </div>
    );

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100">
      <ManagerSidebar />

      <div className="flex-1 ml-20 md:ml-64 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-red-500 mb-2">
          Employee Details
        </h1>

        {msg.text && (
          <div
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              msg.type === "success"
                ? "bg-green-900/30 text-green-400 border border-green-700"
                : "bg-red-900/30 text-red-400 border border-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* PERSONAL SECTION */}
        <Section
          title="Personal Details"
          editing={editing === "personal"}
          onEdit={() => handleEdit("personal")}
          onCancel={handleCancel}
          onSave={() => handleUpdate("personal")}
          fields={[
            {
              label: "First Name",
              name: "fName",
              value: formData.fName,
              onChange: handleChange,
            },
            {
              label: "Last Name",
              name: "lName",
              value: formData.lName,
              onChange: handleChange,
            },
            { label: "Email", value: employee.email, readOnly: true },
          ]}
        />

        {/* ROLE / STATUS SECTION */}
        <Section
          title="Role & Status"
          editing={editing === "rolestatus"}
          onEdit={() => handleEdit("rolestatus")}
          onCancel={handleCancel}
          onSave={() => handleUpdate("rolestatus")}
          fields={[
            {
              label: "Role",
              name: "role",
              value: formData.role,
              onChange: handleChange,
            },
            {
              label: "Status",
              name: "status",
              type: "select",
              options: ["working", "not_working"],
              value: formData.status,
              onChange: handleChange,
            },
          ]}
        />

        {/* ADDRESS SECTION */}
        <Section
          title="Address"
          editing={editing === "address"}
          onEdit={() => handleEdit("address")}
          onCancel={handleCancel}
          onSave={() => handleUpdate("address")}
          fields={[
            {
              label: "Street",
              name: "street",
              value: formData.street,
              onChange: handleChange,
            },
            {
              label: "City",
              name: "city",
              value: formData.city,
              onChange: handleChange,
            },
            {
              label: "State",
              name: "state",
              value: formData.state,
              onChange: handleChange,
            },
            {
              label: "ZIP",
              name: "zip",
              value: formData.zip,
              onChange: handleChange,
            },
          ]}
        />

        {/* PHONE SECTION */}
        <Section
          title="Contact"
          editing={editing === "phone"}
          onEdit={() => handleEdit("phone")}
          onCancel={handleCancel}
          onSave={() => handleUpdate("phone")}
          fields={[
            {
              label: "Phone Number",
              name: "phoneNumber",
              value: formData.phoneNumber,
              onChange: handleChange,
            },
          ]}
        />

        {/* Branch Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-red-400 mb-2">
            Branch Details
          </h2>
          <p>
            <span className="text-gray-400">Branch:</span>{" "}
            {employee.branch_name}
          </p>
          <p>
            <span className="text-gray-400">City:</span> {employee.branch_city}
          </p>
        </div>
      </div>
    </div>
  );
};

// Subcomponent for neat reuse
const Section = ({ title, fields, editing, onEdit, onCancel, onSave }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-red-400">{title}</h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700 p-1.5 rounded text-sm"
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 p-1.5 rounded text-sm"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-red-400 transition"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {fields.map((f, i) =>
          f.type === "select" ? (
            <select
              key={i}
              name={f.name}
              value={f.value}
              onChange={f.onChange}
              disabled={!editing}
              className={`bg-gray-800 p-2 rounded text-sm ${
                !editing && "opacity-70 cursor-not-allowed"
              }`}
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={i}
              name={f.name}
              value={f.value}
              onChange={f.onChange}
              readOnly={!editing || f.readOnly}
              className={`bg-gray-800 p-2 rounded text-sm ${
                !editing && "opacity-70 cursor-not-allowed"
              }`}
              placeholder={f.label}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ManageEmployeeDetails;


