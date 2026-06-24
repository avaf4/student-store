import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import NotFound from "../NotFound/NotFound";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import "./App.css";

// Base URL of the student-store-api backend (see student-store-api/src/server.js)
const API_BASE_URL = "http://localhost:3038";

function App() {

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", dorm_number: ""});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // Toggles sidebar
  const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);

  // Functions to change state (used for lifting state)
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart);

  const handleOnSearchInputChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Fetch all products from the API once, when the app first mounts.
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/products`);
        setProducts(data);
      } catch (err) {
        setError("Failed to load products. Is the backend running?");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProducts();
  }, []);

  // Place an order: turn the cart into the POST /orders request body, send it,
  // and store the returned order (shaped into the receipt the UI expects).
  const handleOnCheckout = async () => {
    setIsCheckingOut(true);
    setError(null);
    try {
      // Build the items array the API contract expects: [{ productId, quantity }]
      const items = Object.keys(cart).map((productId) => ({
        productId: Number(productId),
        quantity: cart[productId],
      }));

      if (items.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      const { data: createdOrder } = await axios.post(`${API_BASE_URL}/orders`, {
        customer: Number(userInfo.name) || 0, // "Student ID" field maps to customer (Int)
        items,
      });

      // Shape the API response into the receipt structure CheckoutSuccess reads.
      const lines = [
        "Thank you for your order!",
        ...createdOrder.orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const name = product ? product.name : `Product #${item.productId}`;
          return `${item.quantity} x ${name} — $${(item.price * item.quantity).toFixed(2)}`;
        }),
        `Total: $${createdOrder.totalPrice.toFixed(2)}`,
      ];

      setOrder({ purchase: { ...createdOrder, receipt: { lines } } });
      setCart({}); // empty the cart after a successful order
    } catch (err) {
      setError(err?.response?.data?.error || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };


  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleOnAddToCart}
          removeFromCart={handleOnRemoveFromCart}
          getQuantityOfItemInCart={handleGetItemQuantity}
          getTotalItemsInCart={handleGetTotalCartItems}
          handleOnCheckout={handleOnCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchInputValue={searchInputValue}
            handleOnSearchInputChange={handleOnSearchInputChange}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  cart={cart}
                  error={error}
                  products={products}
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound
                  error={error}
                  products={products}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
 