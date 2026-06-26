import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { formatPrice, formatDate } from "../../utils/format";
import "./OrderDetail.css";

const API_BASE_URL = "http://localhost:3038";

// Individual transaction page: full detail for one order (GET /orders/:id).
// Also fetches products so each line item can show a readable product name
// instead of just a productId.
function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsFetching(true);
      setError(null);
      try {
        // Fetch the order and the product catalog together
        const [orderRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/orders/${orderId}`),
          axios.get(`${API_BASE_URL}/products`),
        ]);
        setOrder(orderRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError("Order not found");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isFetching) {
    return <h1>Loading...</h1>;
  }

  if (error || !order) {
    return (
      <div className="OrderDetail">
        <p className="error">{error || "Order not found"}</p>
        <Link to="/orders">← Back to all orders</Link>
      </div>
    );
  }

  // Look up a product name by id (falls back to the id if not found)
  const productName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  return (
    <div className="OrderDetail">
      <Link to="/orders" className="back-link">
        ← Back to all orders
      </Link>

      <h1>Order #{order.id}</h1>
      <div className="order-meta">
        <span>Placed by: {order.customer}</span>
        <span>Date: {formatDate(order.createdAt)}</span>
        <span className={`status status-${order.status}`}>{order.status}</span>
      </div>

      <table className="order-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map((item) => (
            <tr key={item.id}>
              <td>{productName(item.productId)}</td>
              <td>{item.quantity}</td>
              <td>{formatPrice(item.price)}</td>
              <td>{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="total-label">
              Total
            </td>
            <td className="total-value">{formatPrice(order.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default OrderDetail;
