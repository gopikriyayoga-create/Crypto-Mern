import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

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
    date: ""
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token"); // Assuming standard token storage from the recent login tasks
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: getHeaders()
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
      date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : ""
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
        body: JSON.stringify(formData)
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
    if (!window.confirm("Are you sure you want to delete this investment?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!response.ok) throw new Error("Failed to delete investment");
      
      fetchPortfolio();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  // Calculate totals
  const totalInvested = investments.reduce((acc, curr) => acc + (curr.quantity * curr.purchasePrice), 0);

  if (loading && investments.length === 0) {
    return <div className="text-white p-6">Loading portfolio...</div>;
  }

  return (
    <div className="p-6 text-white min-h-screen w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text  bg-linear-to-r text-orange-600">My Portfolio</h1>
          <p className="text-gray-400 mt-2">Manage your crypto investments manually</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-linear-to-r from-orange-400 to-orange-600 hover:from-orange-400 hover:to-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          + Add Investment
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      ) : null}

      {/* Summary Card */}
      <div className="bg-[#151a2e] rounded-2xl p-6 border border-gray-800/50 mb-8 w-fit shadow-2xl">
        <h3 className="text-orange-400 text-sm font-medium mb-1">Total Invested Value</h3>
        <p className="text-4xl font-bold font-mono text-cyan-400">
          ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Portfolio Table */}
      <div className="bg-[#151a2e] rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f1323] border-b border-gray-800/50 text-orange-400 text-sm tracking-wider">
              <th className="p-4 font-medium uppercase">Coin</th>
              <th className="p-4 font-medium uppercase text-right">Quantity</th>
              <th className="p-4 font-medium uppercase text-right">Purchase Price</th>
              <th className="p-4 font-medium uppercase text-right">Total Value</th>
              <th className="p-4 font-medium uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {investments.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-orange-500">
                  No investments found. Add one to get started!
                </td>
              </tr>
            ) : (
              investments.map((inv) => (
                <tr key={inv._id} className="hover:bg-[#1a2138] transition-colors">
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
                      {inv.coinId.charAt(0)}
                    </div>
                    <span className="capitalize">{inv.coinId}</span>
                  </td>
                  <td className="p-4 text-right font-mono text-gray-300">{inv.quantity}</td>
                  <td className="p-4 text-right font-mono text-gray-300">
                    ${inv.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-cyan-400">
                    ${(inv.quantity * inv.purchasePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button 
                      onClick={() => openEditModal(inv)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2 bg-blue-500/10 rounded-lg"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(inv._id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 bg-red-500/10 rounded-lg"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-white">
          <div className="bg-[#151a2e] rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-600 rounded-full inline-block"></span>
              {editingId ? "Edit Investment" : "Add Investment"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Coin ID (e.g. bitcoin, ethereum)</label>
                <input 
                  type="text" 
                  name="coinId"
                  value={formData.coinId}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1323] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  placeholder="bitcoin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    step="any"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0f1323] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price per Coin ($)</label>
                  <input 
                    type="number" 
                    name="purchasePrice"
                    step="any"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0f1323] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date (Optional)</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#0f1323] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm color-scheme-dark"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-linear-to-r from-orange-400 to-orange-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
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
