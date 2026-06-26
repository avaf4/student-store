import { Link } from "react-router-dom"
import "./SubNavbar.css"

function SubNavbar({
  activeCategory,
  setActiveCategory,
  searchInputValue,
  handleOnSearchInputChange,
  toggleSidebar,
  cartCount = 0,
}) {

  const categories = ["All Categories", "Accessories", "Apparel", "Books", "Snacks", "Supplies"];

  return (
    <nav className="SubNavbar">

      {/* Top blue bar: brand, search, and primary action buttons */}
      <div className="top-bar">
        <div className="top-content">
          <Link to="/" className="brand">
            <i className="material-icons">storefront</i>
            <span>STUDENT STORE</span>
          </Link>

          <div className="search-bar">
            <i className="material-icons">search</i>
            <input
              type="text"
              name="search"
              placeholder="Search keywords"
              value={searchInputValue}
              onChange={handleOnSearchInputChange}
            />
          </div>

          <div className="actions">
            <Link to="/orders" className="nav-button orders-button">
              <i className="material-icons">receipt_long</i>
              <span>Orders</span>
            </Link>
            <button type="button" className="nav-button cart-button" onClick={toggleSidebar}>
              <i className="material-icons">shopping_bag</i>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Category row */}
      <div className="category-bar">
        <ul className="category-menu">
          {categories.map((cat) => (
            <li className={activeCategory === cat ? "is-active" : ""} key={cat}>
              <button onClick={() => setActiveCategory(cat)}>{cat}</button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default SubNavbar;
