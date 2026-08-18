import { useEffect, useMemo, useState } from "react";
import {
  getProductsApi,
  getSalesApi,
  recordSaleApi,
} from "../../services/api";
import "./Selling.css";

const EMPTY_SALE = {
  productId: "",
  qtySold: "",
  salePrice: "",
};

function Selling() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_SALE);
  const [priceTouched, setPriceTouched] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [productRes, salesRes] = await Promise.all([
        getProductsApi(),
        getSalesApi(),
      ]);

      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
    } catch (err) {
      setError(err.message || "Unable to load selling information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = useMemo(() => {
    return sales.reduce((total, sale) => total + Number(sale.salePrice || 0), 0);
  }, [sales]);

  const totalItemsSold = useMemo(() => {
    return sales.reduce((total, sale) => total + Number(sale.qtySold || 0), 0);
  }, [sales]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(form.productId)) || null;
  }, [products, form.productId]);

  const openForm = () => {
    setForm(EMPTY_SALE);
    setPriceTouched(false);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setForm(EMPTY_SALE);
    setPriceTouched(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const next = { ...previous, [name]: value };

      // Auto-fill sale price from the product's selling price × qty,
      // unless the user has manually edited the price themselves.
      if (!priceTouched && (name === "productId" || name === "qtySold")) {
        const product = products.find(
          (p) => String(p.id) === String(next.productId)
        );
        const qty = Number(next.qtySold);

        if (product && qty > 0) {
          next.salePrice = (Number(product.sellingPrice || 0) * qty).toFixed(2);
        } else if (!next.qtySold) {
          next.salePrice = "";
        }
      }

      return next;
    });

    if (name === "salePrice") {
      setPriceTouched(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.productId) {
      setError("Please select a product.");
      return;
    }

    const qty = Number(form.qtySold);
    if (!qty || qty <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }

    const price = Number(form.salePrice);
    if (!price || price < 0) {
      setError("Please enter a valid sale price.");
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
      // One atomic call: the backend records the sale AND decrements every
      // BOM ingredient's stock in a single database transaction, so a
      // failure here (e.g. insufficient stock) leaves nothing partially
      // applied — no sale row without a stock update, or vice versa.
      await recordSaleApi(Number(form.productId), qty, price, userId);

      closeForm();
      setSuccess(`Sale of ${selectedProduct?.name || "product"} recorded successfully.`);
      await loadData();
    } catch (err) {
      // Surfaces backend messages directly, e.g.
      // "Insufficient stock for ingredient: Rice"
      setError(err.message || "Unable to record sale.");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="page selling-page">
      <div className="selling-header">
        <div>
          <h2>Food Selling Management</h2>
          <p className="selling-subtitle">
            Record sales — each sale automatically deducts the ingredients
            it consumes from stock.
          </p>
        </div>

        <button
          className="selling-primary-button"
          onClick={openForm}
          disabled={loading || products.length === 0}
          title={
            products.length === 0
              ? "No products available to sell yet"
              : undefined
          }
        >
          + Record Sale
        </button>
      </div>

      {error && (
        <div className="selling-message selling-message-error">{error}</div>
      )}
      {success && (
        <div className="selling-message selling-message-success">
          {success}
        </div>
      )}

      <div className="selling-summary-grid">
        <div className="selling-summary-card">
          <span className="selling-summary-label">Total Sales</span>
          <span className="selling-summary-value">{sales.length}</span>
        </div>

        <div className="selling-summary-card">
          <span className="selling-summary-label">Total Revenue</span>
          <span className="selling-summary-value">
            {totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="selling-summary-card">
          <span className="selling-summary-label">Items Sold</span>
          <span className="selling-summary-value">{totalItemsSold}</span>
        </div>
      </div>

      <section className="selling-table-section">
        {loading ? (
          <div className="selling-empty-state">Loading sales...</div>
        ) : sales.length === 0 ? (
          <div className="selling-empty-state">
            <strong>No sales recorded yet</strong>
            <span>Record your first sale to see it appear here.</span>
          </div>
        ) : (
          <div className="selling-table-wrapper">
            <table className="selling-table">
              <thead>
                <tr>
                  <th>Item Sold</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Sold By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>{sale.productName}</strong>
                    </td>
                    <td>{sale.qtySold}</td>
                    <td>
                      {Number(sale.salePrice || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>{sale.soldBy || "—"}</td>
                    <td>{formatDateTime(sale.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="selling-modal-backdrop" onMouseDown={closeForm}>
          <div
            className="selling-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="selling-modal-header">
              <div>
                <h3>Record Sale</h3>
                <p>Selling deducts BOM ingredients from stock automatically.</p>
              </div>

              <button className="selling-modal-close" onClick={closeForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="selling-form">
              <label>
                Product
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="" disabled>
                    Select a product
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                      {product.sellingPrice != null
                        ? ` — ${Number(product.sellingPrice).toFixed(2)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity
                <input
                  name="qtySold"
                  type="number"
                  min="1"
                  step="1"
                  value={form.qtySold}
                  onChange={handleFormChange}
                  placeholder="e.g. 2"
                  required
                />
              </label>

              <label>
                Sale Price (total)
                <input
                  name="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  required
                />
              </label>

              <div className="selling-modal-footer">
                <button
                  type="button"
                  className="selling-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="selling-primary-button"
                  disabled={saving}
                >
                  {saving ? "Recording..." : "Record Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Selling;