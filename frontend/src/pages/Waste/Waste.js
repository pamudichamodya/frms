import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './Waste.css';

const Waste = ({ user }) => {
  const [wasteLogs, setWasteLogs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    ingredientId: '',
    qtyWasted: '',
    wasteCategory: 'kitchen_spoilage',
    reason: ''
  });

  const categories = [
    { id: 'kitchen_spoilage', label: 'Spoilage' },
    { id: 'preparation_trimmings', label: 'Prep Trimmings' },
    { id: 'unsold_leftovers', label: 'Unsold Leftovers' },
    { id: 'customer_plate_waste', label: 'Plate Waste' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wasteRes, ingRes] = await Promise.all([
        API.get('/waste'),
        // Backend resource is @Path("/stock") (IngredientResource.java), not /ingredients
        API.get('/stock')
      ]);
      setWasteLogs(wasteRes.data || []);
      setIngredients(ingRes.data || []);
    } catch (err) {
      console.error('Error fetching waste data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ingredientId: parseInt(formData.ingredientId),
        qtyWasted: parseFloat(formData.qtyWasted),
        wasteCategory: formData.wasteCategory,
        reason: formData.reason,
        userId: user?.id || 1 // Fallback to 1 if user context is missing
      };

      await API.post('/waste', payload);
      
      // Reset form on success
      setFormData({
        ingredientId: '',
        qtyWasted: '',
        wasteCategory: 'kitchen_spoilage',
        reason: ''
      });
      loadData();
      alert("Waste logged successfully.");
    } catch (err) {
      console.error('Error recording waste:', err);
      alert('Failed to record waste.');
    }
  };

  return (
    <div className="waste-container">
      <div className="waste-header">
        <h1>Waste Management</h1>
        <p className="subtitle">Log inventory waste. This is an append-only ledger for auditing.</p>
      </div>

      <div className="waste-content">
        {/* Form Section */}
        <div className="waste-form-card">
          <h3>Log New Waste Event</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Ingredient</label>
              <select 
                required
                value={formData.ingredientId}
                onChange={(e) => setFormData({...formData, ingredientId: e.target.value})}
              >
                <option value="">-- Choose Ingredient --</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Wasted</label>
              <input 
                type="number" 
                step="0.001"
                min="0.001"
                required
                placeholder="e.g. 0.500"
                value={formData.qtyWasted}
                onChange={(e) => setFormData({...formData, qtyWasted: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                required
                value={formData.wasteCategory}
                onChange={(e) => setFormData({...formData, wasteCategory: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Reason / Notes</label>
              <textarea 
                rows="3"
                placeholder="Briefly explain the reason for waste..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="btn-danger-full">Record Waste</button>
          </form>
        </div>

        {/* Ledger Section */}
        <div className="waste-ledger-card">
          <h3>Waste Ledger</h3>
          {loading ? (
            <p>Loading ledger...</p>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Ingredient</th>
                  <th>Qty Wasted</th>
                  <th>Category</th>
                  <th>Reason</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {wasteLogs.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No waste records found.</td></tr>
                ) : (
                  wasteLogs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="font-weight-bold">{log.ingredientName}</td>
                      <td className="text-danger">-{log.qtyWasted}</td>
                      <td><span className="badge-cat">{log.wasteCategory.replace(/_/g, ' ')}</span></td>
                      <td>{log.reason}</td>
                      <td>{log.userName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waste;