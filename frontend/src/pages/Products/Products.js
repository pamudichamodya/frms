import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sellingPrice: '',
    category: 'Main Course',
    ingredients: []
  });

  const categories = ['Main Course', 'Appetizer', 'Beverage', 'Dessert', 'Bakery', 'Side Dish'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, ingRes] = await Promise.all([
        API.get('/products'),
        API.get('/stock') // backend's IngredientResource is @Path("/stock"), not /ingredients
      ]);
      setProducts(prodRes.data || []);
      setIngredients(ingRes.data || []);
    } catch (err) {
      console.error('Error fetching products/ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sellingPrice: '',
      category: 'Main Course',
      ingredients: [{ ingredientId: '', qtyPerUnit: '' }]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sellingPrice: product.sellingPrice,
      category: product.category || 'Main Course',
      ingredients: product.ingredients && product.ingredients.length > 0
        ? product.ingredients.map(i => ({ ingredientId: i.ingredientId, qtyPerUnit: i.qtyPerUnit }))
        : [{ ingredientId: '', qtyPerUnit: '' }]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddIngredientRow = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', qtyPerUnit: '' }]
    });
  };

  const handleRemoveIngredientRow = (index) => {
    const updated = formData.ingredients.filter((_, idx) => idx !== index);
    setFormData({ ...formData, ingredients: updated });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    setFormData({ ...formData, ingredients: updated });
  };

  // Real-time calculation of recipe cost inside modal
  const calculateEstimatedCost = () => {
    let cost = 0;
    formData.ingredients.forEach(item => {
      const found = ingredients.find(ing => ing.id === Number(item.ingredientId));
      if (found && item.qtyPerUnit) {
        cost += (Number(found.unitPrice) || 0) * (Number(item.qtyPerUnit) || 0);
      }
    });
    return cost.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sellingPrice: parseFloat(formData.sellingPrice),
        category: formData.category,
        ingredients: formData.ingredients
          .filter(i => i.ingredientId && i.qtyPerUnit)
          .map(i => ({
            ingredientId: parseInt(i.ingredientId),
            qtyPerUnit: parseFloat(i.qtyPerUnit)
          }))
      };

      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, payload);
      } else {
        await API.post('/products', payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please check input values.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h1>Product Management</h1>
          <p className="subtitle">Manage products, recipe ingredients, and sellable stock portions</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      <div className="products-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search product by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading product catalogue...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">No products found. Click "+ Add New Product" to create one.</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <div>
                  <span className="category-tag">{product.category || 'General'}</span>
                  <h3>{product.name}</h3>
                </div>
                <div className="actions">
                  <button className="btn-icon" onClick={() => openEditModal(product)} title="Edit">✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">🗑️</button>
                </div>
              </div>

              <div className="pricing-row">
                <div className="price-box">
                  <span className="label">Selling Price</span>
                  <span className="val selling">Rs. {Number(product.sellingPrice).toFixed(2)}</span>
                </div>
                <div className="price-box">
                  <span className="label">Cost / Unit</span>
                  <span className="val cost">Rs. {Number(product.costPrice || 0).toFixed(2)}</span>
                </div>
                <div className="price-box">
                  <span className="label">Margin</span>
                  <span className="val margin">Rs. {Number(product.profitMargin || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="stock-availability">
                <span className="label">Available to Sell:</span>
                <span className={`portion-badge ${product.availableQty > 5 ? 'in-stock' : product.availableQty > 0 ? 'low-stock' : 'out-of-stock'}`}>
                  {product.availableQty > 0 ? `${product.availableQty} Portions` : 'Out of Stock'}
                </span>
              </div>

              <div className="recipe-section">
                <h4>Recipe Ingredients</h4>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="ingredient-list">
                    {product.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        <span className="ing-name">• {ing.ingredientName}</span>
                        <span className="ing-qty">{ing.qtyPerUnit} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-recipe">No recipe ingredients attached.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Rice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="850.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="recipe-builder">
                <div className="recipe-builder-header">
                  <h3>Manage Product Ingredients (Recipe)</h3>
                  <button type="button" className="btn-secondary-sm" onClick={handleAddIngredientRow}>
                    + Add Ingredient
                  </button>
                </div>

                {formData.ingredients.map((row, idx) => {
                  const selectedIng = ingredients.find(i => i.id === Number(row.ingredientId));
                  return (
                    <div key={idx} className="ingredient-row">
                      <select
                        required
                        value={row.ingredientId}
                        onChange={(e) => handleIngredientChange(idx, 'ingredientId', e.target.value)}
                      >
                        <option value="">-- Select Ingredient --</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit}) - Rs. {Number(ing.unitPrice).toFixed(2)}
                          </option>
                        ))}
                      </select>

                      <div className="qty-wrapper">
                        <input
                          type="number"
                          step="0.001"
                          required
                          placeholder="Qty / Portion"
                          value={row.qtyPerUnit}
                          onChange={(e) => handleIngredientChange(idx, 'qtyPerUnit', e.target.value)}
                        />
                        <span className="unit-label">{selectedIng ? selectedIng.unit : 'unit'}</span>
                      </div>

                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveIngredientRow(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="recipe-summary">
                <span>Estimated Recipe Cost: <strong>Rs. {calculateEstimatedCost()}</strong></span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;