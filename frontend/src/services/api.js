import axios from "axios";

// 1. Base Axios instance (This acts as the default export)
const API = axios.create({
  // The backend's @ApplicationPath is "resources" (see JakartaRestConfiguration.java),
  // not "api" — so every request must go under /Backend/resources/...
  // If your CRA package.json doesn't have a "proxy" field pointing at the backend's
  // host:port (e.g. "proxy": "http://localhost:8080"), replace this with the full
  // absolute URL instead, e.g. baseURL: 'http://localhost:8080/Backend/resources'.
  baseURL: "/Backend/resources",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------
// 2. Your Existing Named Exports (Keeps your other pages working)
// ---------------------------------------------------------
export const loginApi = (credentials) => API.post("/auth/login", credentials);

// Backend's UserRegisterDto only accepts { name, email, password }; role is
// always defaulted to "staff" server-side (see AuthService.registerUser).
export const registerApi = (data) => API.post("/auth/register", data);

// Backend resource is @Path("/stock") (IngredientResource.java), not /ingredients
export const getStockApi = () => API.get("/stock");
export const createIngredientApi = (data) => API.post("/stock", data);
export const updateIngredientApi = (id, data) => API.put(`/stock/${id}`, data);
export const deleteIngredientApi = (id) => API.delete(`/stock/${id}`);

export const getProductsApi = () => API.get("/products");

export const getSalesApi = () => API.get("/sales");
// SaleRequestDto only has {productId, qtySold, userId} — no price field, the
// backend derives revenue from the product's own price server-side.
export const recordSaleApi = (productId, qtySold, price, userId) =>
  API.post("/sales", { productId, qtySold, userId });

// IngredientResource's intake endpoint takes query params, not a JSON body:
// POST /resources/stock/intake?ingredientId=..&qty=..&reference=..&userId=..
export const recordStockIntakeApi = (ingredientId, qty, reference, userId) =>
  API.post("/stock/intake", null, {
    params: { ingredientId, qty, reference, userId },
  });
// Backend path is /stock/alerts (see IngredientResource "/alerts"), not /alerts/low-stock
export const getLowStockAlertsApi = () => API.get("/stock/alerts");

// ---------------------------------------------------------
// 3. New Product Named Exports (Optional, but good practice)
// ---------------------------------------------------------
export const createProductApi = (data) => API.post("/products", data);
export const updateProductApi = (id, data) => API.put(`/products/${id}`, data);
export const deleteProductApi = (id) => API.delete(`/products/${id}`);

// ---------------------------------------------------------
// 4. THE FIX: Export the instance as default
// ---------------------------------------------------------
// This allows `import API from '../../services/api'` to work in Products.js

export const getWasteApi = () => API.get("/waste");
export const recordWasteApi = (data) => API.post("/waste", data);
export default API;
