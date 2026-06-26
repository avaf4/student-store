import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatPrice, formatDate } from "../../utils/format";
import "./Orders.css";

const API_BASE_URL = "http://localhost:3038";

// Past Orders page: lists every order, and lets the user filter the list by
// the email of the customer who placed it (GET /orders?email=...).
function Orders() {
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Controlled value of the email filter input
  const [emailInput, setEmailInput] = useState("");
  // The email actually being filtered on (empty string = show all)
  const [activeEmail, setActiveEmail] = useState("");

  // Fetch orders whenever the active email filter changes. An empty filter
  // hits GET /orders (all orders); a set filter hits GET /orders?email=...
  useEffect(() => {
    const fetchOrders = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const url = activeEmail
          ? `${API_BASE_URL}/orders?email=${encodeURIComponent(activeEmail)}`
          : `${API_BASE_URL}/orders`;
        const { data } = await axios.get(url);
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders. Is the backend running?");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [activeEmail]);

  // Apply the typed email as the active filter
  const handleFilter = (event) => {
    event.preventDefault();
    setActiveEmail(emailInput.trim());
  };

  // Clear the filter and return to the full list
  const handleShowAll = () => {
    setEmailInput("");
    setActiveEmail("");
  };

  return (
    <div className="Orders">
      <h1>Past Orders</h1>

      <form className="order-filter" onSubmit={handleFilter}>
        <input
          type="text"
          name="email"
          placeholder="Filter by customer email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <button type="submit">Filter</button>
        {activeEmail && (
          <button type="button" className="show-all" onClick={handleShowAll}>
            Show all orders
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {isFetching ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        // Empty result — most commonly an email with no matching orders
        <p className="no-orders">No orders found.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-row">
              <Link to={`/orders/${order.id}`}>
                <span className="order-id">Order #{order.id}</span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className="order-total">{formatPrice(order.totalPrice)}</span>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Orders;
