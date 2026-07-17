import { useEffect, useMemo, useState } from "react";
import {
  createIngredientApi,
  deleteIngredientApi,
  getLowStockAlertsApi,
  getStockApi,
  recordStockIntakeApi,
  updateIngredientApi,
} from "../../services/api";
import "./Stock.css";

const EMPTY_FORM = {
  name: "",
  unit: "",
  unitPrice: "",
  thresholdQty: "",
  category: "",
};

const EMPTY_INTAKE = {
  qty: "",
  reference: "",
};

function Stock() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showIntake, setShowIntake] = useState(false);
  const [intakeItem, setIntakeItem] = useState(null);
  const [intake, setIntake] = useState(EMPTY_INTAKE);

  const loadStock = async () => {
    setLoading(true);
    setError("");

    try {
      const [stockRes, alertRes] = await Promise.all([
        getStockApi(),
        getLowStockAlertsApi(),
      ]);

      setItems(Array.isArray(stockRes.data) ? stockRes.data : []);
      setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
    } catch (err) {
      setError(err.message || "Unable to load stock information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const categories = useMemo(() => {
    const values = items
      .map((item) => item.category)
      .filter((value) => value && value.trim());

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const totalValue = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.currentQty || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return total + quantity * unitPrice;
    }, 0);
  }, [items]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      unit: item.unit || "",
      unitPrice: item.unitPrice ?? "",
      thresholdQty: item.thresholdQty ?? "",
      category: item.category || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.unit.trim()) {
      setError("Ingredient name and unit are required.");
      return;
    }

    if (Number(form.unitPrice) < 0 || Number(form.thresholdQty) < 0) {
      setError("Price and threshold cannot be negative.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim(),
      unitPrice: Number(form.unitPrice || 0),
      thresholdQty: Number(form.thresholdQty || 0),
      category: form.category.trim() || null,
    };

    try {
      if (editingItem) {
        await updateIngredientApi(editingItem.id, payload);
        setSuccess("Ingredient updated successfully.");
      } else {
        await createIngredientApi(payload);
        setSuccess("Ingredient added successfully.");
      }

      closeForm();
      await loadStock();
    } catch (err) {
      setError(err.message || "Unable to save ingredient.");
    } finally {
      setSaving(false);
    }
  };

  const openIntake = (item) => {
    setIntakeItem(item);
    setIntake(EMPTY_INTAKE);
    setError("");
    setSuccess("");
    setShowIntake(true);
  };

  const closeIntake = () => {
    if (saving) return;
    setShowIntake(false);
    setIntakeItem(null);
    setIntake(EMPTY_INTAKE);
  };

  const handleIntakeChange = (event) => {
    const { name, value } = event.target;
    setIntake((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleIntakeSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const qty = Number(intake.qty);

    if (!qty || qty <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const userId = storedUser?.id;

    if (!userId) {
      setError("Logged-in user information is missing. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      await recordStockIntakeApi(
        intakeItem.id,
        qty,
        intake.reference.trim(),
        userId
      );

      closeIntake();
      setSuccess(`${intakeItem.name} stock intake recorded successfully.`);
      await loadStock();
    } catch (err) {
      setError(err.message || "Unable to record stock intake.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}"?\n\nThis should only be done when the ingredient has no stock movement history.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteIngredientApi(item.id);
      setSuccess(`${item.name} deleted successfully.`);
      await loadStock();
    } catch (err) {
      setError(err.message || "Unable to delete ingredient.");
    }
  };

  return (
    <div className="page stock-page">
      <div className="stock-header">
        <div>
          <h2>Food Stock Management</h2>
          <p className="stock-subtitle">
            Manage ingredients, quantities, prices and low-stock thresholds.
          </p>
        </div>

        <button className="stock-primary-button" onClick={openCreate}>
          + Add Ingredient
        </button>
      </div>

      {error && <div className="stock-message stock-message-error">{error}</div>}
      {success && (
        <div className="stock-message stock-message-success">{success}</div>
      )}

      <div className="stock-summary-grid">
        <div className="stock-summary-card">
          <span className="stock-summary-label">Total Ingredients</span>
          <strong>{items.length}</strong>
          <span>Registered stock items</span>
        </div>

        <div className="stock-summary-card">
          <span className="stock-summary-label">Low Stock Alerts</span>
          <strong className={alerts.length ? "stock-danger-text" : ""}>
            {alerts.length}
          </strong>
          <span>{alerts.length ? "Needs attention" : "Everything looks good"}</span>
        </div>

        <div className="stock-summary-card">
          <span className="stock-summary-label">Inventory Value</span>
          <strong>
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
          <span>Current quantity × unit price</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <section className="stock-alert-panel">
          <div className="stock-alert-heading">
            <div>
              <h3>Low Stock Alerts</h3>
              <p>Items at or below their configured threshold.</p>
            </div>
            <span className="stock-alert-count">{alerts.length}</span>
          </div>

          <div className="stock-alert-list">
            {alerts.map((item) => (
              <div className="stock-alert-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.currentQty ?? 0} {item.unit} remaining · threshold{" "}
                    {item.thresholdQty ?? 0} {item.unit}
                  </span>
                </div>
                <button
                  className="stock-small-button"
                  onClick={() => openIntake(item)}
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="stock-table-panel">
        <div className="stock-toolbar">
          <div>
            <h3>Ingredients</h3>
            <p>{filteredItems.length} item(s) shown</p>
          </div>

          <div className="stock-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ingredients..."
              className="stock-search"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="stock-select"
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="stock-empty-state">Loading stock...</div>
        ) : filteredItems.length === 0 ? (
          <div className="stock-empty-state">
            <strong>No ingredients found</strong>
            <span>Add an ingredient or change your search/filter.</span>
          </div>
        ) : (
          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Current Qty</th>
                  <th>Threshold</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="stock-name-cell">
                        <span className="stock-item-icon">📦</span>
                        <div>
                          <strong>{item.name}</strong>
                          <small>#{item.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{item.category || "—"}</td>

                    <td>
                      <strong>
                        {item.currentQty ?? 0} {item.unit}
                      </strong>
                    </td>

                    <td>
                      {item.thresholdQty ?? 0} {item.unit}
                    </td>

                    <td>
                      {Number(item.unitPrice || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      {item.lowStock ? (
                        <span className="stock-status stock-status-low">
                          Low Stock
                        </span>
                      ) : (
                        <span className="stock-status stock-status-ok">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="stock-actions">
                        <button
                          className="stock-action-button stock-action-intake"
                          onClick={() => openIntake(item)}
                        >
                          + Stock
                        </button>

                        <button
                          className="stock-action-button"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="stock-action-button stock-action-delete"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="stock-modal-backdrop" onMouseDown={closeForm}>
          <div
            className="stock-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="stock-modal-header">
              <div>
                <h3>{editingItem ? "Edit Ingredient" : "Add Ingredient"}</h3>
                <p>
                  {editingItem
                    ? "Update ingredient details and the low-stock threshold."
                    : "Create a new ingredient record."}
                </p>
              </div>

              <button className="stock-modal-close" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="stock-form">
              <div className="stock-form-grid">
                <label>
                  Ingredient Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Rice"
                    required
                  />
                </label>

                <label>
                  Unit
                  <input
                    name="unit"
                    value={form.unit}
                    onChange={handleFormChange}
                    placeholder="e.g. kg"
                    required
                  />
                </label>

                <label>
                  Unit Price
                  <input
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={handleFormChange}
                    placeholder="0.00"
                  />
                </label>

                <label>
                  Low Stock Threshold
                  <input
                    name="thresholdQty"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.thresholdQty}
                    onChange={handleFormChange}
                    placeholder="e.g. 10"
                  />
                </label>

                <label className="stock-form-full">
                  Category
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    placeholder="e.g. Grains"
                  />
                </label>
              </div>

              <div className="stock-modal-footer">
                <button
                  type="button"
                  className="stock-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Add Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIntake && intakeItem && (
        <div className="stock-modal-backdrop" onMouseDown={closeIntake}>
          <div
            className="stock-modal stock-intake-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="stock-modal-header">
              <div>
                <h3>Record Stock Intake</h3>
                <p>
                  Add stock to <strong>{intakeItem.name}</strong>. Current
                  quantity: {intakeItem.currentQty ?? 0} {intakeItem.unit}.
                </p>
              </div>

              <button className="stock-modal-close" onClick={closeIntake}>
                ×
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="stock-form">
              <label>
                Quantity to Add ({intakeItem.unit})
                <input
                  name="qty"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={intake.qty}
                  onChange={handleIntakeChange}
                  placeholder="e.g. 20"
                  autoFocus
                  required
                />
              </label>

              <label>
                Reference
                <input
                  name="reference"
                  value={intake.reference}
                  onChange={handleIntakeChange}
                  placeholder="e.g. PO-001"
                />
              </label>

              <div className="stock-modal-footer">
                <button
                  type="button"
                  className="stock-secondary-button"
                  onClick={closeIntake}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-primary-button"
                  disabled={saving}
                >
                  {saving ? "Recording..." : "Record Intake"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;