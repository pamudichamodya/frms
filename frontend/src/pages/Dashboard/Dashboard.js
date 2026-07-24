import { useEffect, useMemo, useState } from "react";
import {
  getLowStockAlertsApi,
  getSalesApi,
  getStockApi,
  getWasteApi,
} from "../../services/api";
import "./Dashboard.css";

const isToday = (isoTimestamp) => {
  if (!isoTimestamp) return false;
  const date = new Date(isoTimestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const formatTime = (isoTimestamp) => {
  if (!isoTimestamp) return "—";
  return new Date(isoTimestamp)
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
};

const formatClock = (date) =>
  date
    .toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    })
    .toUpperCase();

function Dashboard() {
  const [stockItems, setStockItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sales, setSales] = useState([]);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [stockRes, alertRes, salesRes, wasteRes] = await Promise.all([
          getStockApi(),
          getLowStockAlertsApi(),
          getSalesApi(),
          getWasteApi(),
        ]);

        setStockItems(Array.isArray(stockRes.data) ? stockRes.data : []);
        setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
        setWaste(Array.isArray(wasteRes.data) ? wasteRes.data : []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const salesToday = useMemo(
    () => sales.filter((sale) => isToday(sale.timestamp)),
    [sales]
  );

  const wasteToday = useMemo(
    () => waste.filter((entry) => isToday(entry.timestamp)),
    [waste]
  );

  const stats = useMemo(() => {
    const itemsSoldToday = salesToday.reduce(
      (total, sale) => total + Number(sale.qtySold || 0),
      0
    );

    return [
      {
        label: "Stock on Hand",
        value: stockItems.length,
        note: "ingredients tracked",
      },
      {
        label: "Sold Today",
        value: itemsSoldToday,
        note: `${salesToday.length} ticket${salesToday.length === 1 ? "" : "s"} rung`,
      },
      {
        label: "Waste Logged",
        value: wasteToday.length,
        note: wasteToday.length > 0 ? "entries today" : "clean board today",
      },
      {
        label: "86 Alerts",
        value: alerts.length,
        note: alerts.length > 0 ? "on the list" : "board is clear",
      },
    ];
  }, [stockItems, alerts, salesToday, wasteToday]);

  const eightySixList = useMemo(() => {
    return [...alerts]
      .sort((a, b) => Number(a.currentQty || 0) - Number(b.currentQty || 0))
      .slice(0, 6);
  }, [alerts]);

  const railEntries = useMemo(() => {
    const saleEvents = sales.map((sale) => ({
      timestamp: sale.timestamp,
      kind: "sale",
      text: `${sale.qtySold} × ${sale.productName || "product"} — sold`,
    }));

    const wasteEvents = waste.map((entry) => ({
      timestamp: entry.timestamp,
      kind: "waste",
      text: `${entry.qtyWasted} ${entry.ingredientName || "ingredient"} — wasted`,
    }));

    return [...saleEvents, ...wasteEvents]
      .filter((entry) => entry.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 7);
  }, [sales, waste]);

  return (
    <div className="page pass-page">
      <div className="pass-header">
        <div>
          <span className="pass-eyebrow">Green Leaf Kitchen · Back of House</span>
          <h2 className="pass-title">Service Overview</h2>
        </div>
        <div className="pass-clock" aria-label="Current date and time">
          {formatClock(now)}
        </div>
      </div>

      {error && <div className="dashboard-message dashboard-message-error">{error}</div>}

      {loading ? (
        <div className="dashboard-empty-state">Firing up the pass...</div>
      ) : (
        <>
          <div className="ticket-row">
            {stats.map((stat) => (
              <div className="ticket-card" key={stat.label}>
                <span className="ticket-eyebrow">{stat.label}</span>
                <div className="ticket-perforation" aria-hidden="true" />
                <span className="ticket-value">{stat.value}</span>
                <span className="ticket-note">{stat.note}</span>
              </div>
            ))}
          </div>

          <div className="pass-columns">
            {/* ---------- Low Stock Items ---------- */}
            <section className="lowstock-panel">
              <h3 className="lowstock-title">Low Stock Items</h3>

              {eightySixList.length === 0 ? (
                <p className="dashboard-empty">No low-stock items right now.</p>
              ) : (
                <table className="lowstock-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eightySixList.map((item) => {
                      const isCritical =
                        Number(item.currentQty || 0) <=
                        Number(item.thresholdQty || 0) / 2;

                      return (
                        <tr key={item.id}>
                          <td className="lowstock-item">{item.name}</td>
                          <td className="lowstock-qty">
                            {item.currentQty ?? 0} {item.unit}
                          </td>
                          <td>
                            <span
                              className={`lowstock-status ${isCritical ? "is-critical" : "is-low"}`}
                            >
                              {isCritical ? "Critical" : "Low"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            {/* ---------- The Rail ---------- */}
            <section className="rail-panel">
              <div className="rail-panel-header">
                <h3>The Rail</h3>
                <p>Latest tickets in — sales and waste</p>
              </div>

              {railEntries.length === 0 ? (
                <p className="dashboard-empty dashboard-empty-dark">
                  No tickets on the rail yet.
                </p>
              ) : (
                <ul className="rail-list">
                  {railEntries.map((entry, index) => (
                    <li className={`rail-entry rail-entry-${entry.kind}`} key={index}>
                      <span className="rail-time">{formatTime(entry.timestamp)}</span>
                      <span className="rail-text">{entry.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;