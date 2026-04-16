import React, { useState, useEffect } from "react";

const API_BASE_URL =
  "https://crypto-mern-q442.onrender.com/api/auth/register/api";

function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    coinId: "",
    quantity: "",
    purchasePrice: "",
    date: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      const data = await response.json();
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ coinId: "", quantity: "", purchasePrice: "", date: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (inv) => {
    setFormData({
      coinId: inv.coinId,
      quantity: inv.quantity,
      purchasePrice: inv.purchasePrice,
      date: inv.date ? new Date(inv.date).toISOString().split("T")[0] : "",
    });
    setEditingId(inv._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `${API_BASE_URL}/portfolio/${editingId}`
        : `${API_BASE_URL}/portfolio`;

      const response = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save investment");
      }

      closeModal();
      fetchPortfolio();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete");
      fetchPortfolio();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalInvested = investments.reduce(
    (acc, curr) => acc + curr.quantity * curr.purchasePrice,
    0,
  );

  if (loading && investments.length === 0)
    return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="p-6 text-white min-h-screen w-full relative">
      {/* Header & Table logic stays same as your snippet */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-600">My Portfolio</h1>
        <button
          onClick={openAddModal}
          className="bg-orange-500 px-6 py-2 rounded-xl"
        >
          + Add
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#151a2e] p-6 rounded-2xl mb-8 w-fit border border-gray-800">
        <h3 className="text-gray-400 text-sm">Total Invested</h3>
        <p className="text-4xl font-bold text-cyan-400">
          ${totalInvested.toLocaleString()}
        </p>
      </div>

      {/* Table - truncated for brevity based on your snippet */}
      <table className="w-full bg-[#151a2e] rounded-xl overflow-hidden">
        <thead className="bg-[#0f1323] text-orange-400">
          <tr>
            <th className="p-4">Coin</th>
            <th className="p-4 text-right">Qty</th>
            <th className="p-4 text-right">Price</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv._id} className="border-b border-gray-800">
              <td className="p-4 capitalize">{inv.coinId}</td>
              <td className="p-4 text-right">{inv.quantity}</td>
              <td className="p-4 text-right">${inv.purchasePrice}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => openEditModal(inv)}
                  className="mr-2 text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(inv._id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🟢 ADDED: THE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2138] border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-orange-500">
              {editingId ? "Edit Investment" : "Add New Investment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Coin ID (e.g. bitcoin)
                </label>
                <input
                  name="coinId"
                  value={formData.coinId}
                  onChange={handleChange}
                  className="w-full bg-[#0f1323] border border-gray-700 rounded-lg p-2 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full bg-[#0f1323] border border-gray-700 rounded-lg p-2 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Buy Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="w-full bg-[#0f1323] border border-gray-700 rounded-lg p-2 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 rounded-lg font-bold hover:bg-orange-500 transition-colors"
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
