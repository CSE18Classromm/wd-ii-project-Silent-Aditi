import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap for layout & responsiveness
import { FiShoppingCart, FiHeart, FiSearch, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi"; // icons
import Logo from "./assets/amazon-icon.svg"; // local custom logo
import "./App.css";

// Main App component (functional, uses hooks)
function App() {
  // State: products fetched, cart items, wishlist ids, search query, current view, loading, toast
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // cart items: { product, qty }
  const [wishlist, setWishlist] = useState([]); // array of product ids
  const [search, setSearch] = useState("");
  const [view, setView] = useState("home"); // 'home' | 'cart' | 'wishlist'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Load initial data: products and localStorage (cart/wishlist)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }

    // load cart and wishlist from localStorage
    const savedCart = localStorage.getItem("ac_cart");
    const savedWishlist = localStorage.getItem("ac_wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    fetchProducts();
  }, []);

  // Persist cart and wishlist to localStorage when they change
  useEffect(() => {
    localStorage.setItem("ac_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ac_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Helpers
  const toINR = (usd) => {
    const rate = 82; // demo conversion rate
    const inr = usd * rate;
    return inr.toLocaleString("en-IN", { style: "currency", currency: "INR" });
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  };

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast("Added to cart");
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.product.id !== productId));
    showToast("Removed from cart");
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((p) => (p.product.id === productId ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
        .filter(Boolean)
    );
  };

  const cartCount = cart.reduce((s, item) => s + item.qty, 0);

  const cartSubtotal = cart.reduce((s, item) => s + item.qty * item.product.price * 82, 0);

  const checkout = () => {
    // simple simulated checkout: clear cart
    setCart([]);
    showToast("Checkout successful — thank you!");
  };

  // Modal controls
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openCartModal = () => setCartModalOpen(true);
  const closeCartModal = () => setCartModalOpen(false);
  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
    showToast("Wishlist updated");
  };

  const moveToCartFromWishlist = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) addToCart(prod);
    // remove from wishlist
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  // Filter products by search query (case-insensitive)
  const filteredProducts = products.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  // Page components (kept inline for simplicity)
  const HomePage = () => (
    <div>
      <div className="row">
        {filteredProducts.map((product) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={product.id}>
            <div className="card product-card h-100 shadow-sm">
              <div className="card-img-top product-media">
                <img src={product.image} alt={product.title} />
                <button
                  className={`btn wishlist-toggle ${wishlist.includes(product.id) ? "active" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  <FiHeart />
                </button>
              </div>

              <div className="card-body d-flex flex-column">
                <h6 className="product-title" title={product.title}>
                  {product.title}
                </h6>

                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="price">{toINR(product.price)}</div>
                    <div className="rating">⭐ {product.rating.rate} <span className="muted">({product.rating.count})</span></div>
                  </div>

                  <button className="btn btn-warning w-100 add-cart-btn" onClick={() => addToCart(product)}>
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && <div className="col-12 text-center py-5 muted">No products match your search.</div>}
      </div>
    </div>
  );

  const CartPage = () => (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <h4>Your Cart</h4>
        <div className="muted">{cartCount} items</div>
      </div>

      {cart.length === 0 ? (
        <div className="py-5 text-center muted">Your cart is empty.</div>
      ) : (
        <div className="row">
          <div className="col-12 col-lg-8">
            {cart.map((entry) => (
              <div className="card cart-item mb-3" key={entry.product.id}>
                <div className="row g-0 align-items-center">
                  <div className="col-3 text-center p-2">
                    <img src={entry.product.image} alt={entry.product.title} style={{maxHeight:80,objectFit:'contain'}} />
                  </div>
                  <div className="col-6 p-3">
                    <div className="fw-bold">{entry.product.title}</div>
                    <div className="muted">{toINR(entry.product.price)}</div>
                  </div>
                  <div className="col-3 p-3 text-end">
                    <div className="d-flex justify-content-end align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(entry.product.id, -1)}><FiMinus /></button>
                      <div className="px-2">{entry.qty}</div>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(entry.product.id, 1)}><FiPlus /></button>
                    </div>
                    <div className="mt-2">
                      <button className="btn btn-link text-danger" onClick={() => removeFromCart(entry.product.id)}><FiTrash2 /> Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 col-lg-4">
            <div className="card p-3">
              <h6>Order Summary</h6>
              <div className="d-flex justify-content-between py-2"><span>Subtotal</span><strong>{toINR(cartSubtotal/82)}</strong></div>
              <div className="d-flex justify-content-between py-2 muted"><small>Estimated taxes and shipping calculated at checkout</small></div>
              <button className="btn btn-warning w-100 mt-3" onClick={checkout}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const WishlistPage = () => {
    const items = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    return (
      <div>
        <div className="page-header d-flex justify-content-between align-items-center mb-3">
          <h4>Your Wishlist</h4>
          <div className="muted">{items.length} items</div>
        </div>

        {items.length === 0 ? (
          <div className="py-5 text-center muted">No items in wishlist.</div>
        ) : (
          <div className="row">
            {items.map((p) => (
              <div className="col-12 col-md-6 mb-3" key={p.id}>
                <div className="card p-3 d-flex flex-row align-items-center gap-3">
                  <img src={p.image} alt={p.title} style={{height:80,objectFit:'contain'}} />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{p.title}</div>
                    <div className="muted">{toINR(p.price)}</div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => moveToCartFromWishlist(p.id)}>Move to Cart</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => toggleWishlist(p.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark custom-navbar px-3">
        <div className="d-flex align-items-center" style={{cursor:'pointer'}} onClick={() => setView('home')}>
          <img src={Logo} alt="logo" style={{height:36}} />
        </div>

        {/* Search - centered on large screens */}
        <div className="mx-auto search-container w-50 d-none d-lg-flex">
          <div className="input-group w-100">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search for products, brands and more"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-search" aria-label="Search">
              <FiSearch size={18} />
            </button>
          </div>
        </div>

        {/* Icons: wishlist and cart (navigate to pages) */}
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn wishlist-btn" title="Wishlist" onClick={() => setView('wishlist')}>
            <FiHeart size={20} />
            <span className="icon-badge">{wishlist.length}</span>
          </button>

          <button className="btn btn-warning cart-btn" title="Cart" onClick={openCartModal}>
            <FiShoppingCart size={18} />
            <span className="cart-text">Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* HERO / BANNER */}
      <header className="hero-banner mt-3">
        <img
          src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&s=1e9e5a2f5b1f9c3a6b9b0b3a7b1f6a3a"
          alt="hero"
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="container my-4">
        {/* Small search for mobile */}
        <div className="d-lg-none mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-secondary">
              <FiSearch />
            </button>
          </div>
        </div>

        {/* Page switching */}
        {view === "home" && (loading ? <div className="text-center py-5">Loading products...</div> : <HomePage />)}
        {view === "cart" && <CartPage />}
        {view === "wishlist" && <WishlistPage />}

      </main>

      {/* Toast */}
      {toast && <div className="toast-notice">{toast}</div>}

      {/* Cart Modal */}
      {cartModalOpen && (
        <div className="modal-overlay" onClick={closeCartModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Your Cart ({cartCount})</h5>
              <button className="btn-close" onClick={closeCartModal} aria-label="Close"></button>
            </div>

            {cart.length === 0 ? (
              <div className="py-4 text-center muted">Your cart is empty.</div>
            ) : (
              <div>
                <div className="cart-modal-list mb-3">
                  {cart.map((entry) => (
                    <div className="d-flex align-items-center justify-content-between mb-2" key={entry.product.id}>
                      <div className="d-flex align-items-center gap-3">
                        <img src={entry.product.image} alt="" style={{height:50,objectFit:'contain'}} />
                        <div>
                          <div className="fw-bold" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.product.title}</div>
                          <div className="muted">{toINR(entry.product.price)}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(entry.product.id, -1)}><FiMinus /></button>
                        <div>{entry.qty}</div>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => changeQty(entry.product.id, 1)}><FiPlus /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-bold">Subtotal</div>
                  <div className="fw-bold">{toINR(cartSubtotal/82)}</div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-outline-secondary" onClick={() => { setView('cart'); closeCartModal(); }}>Go to Cart</button>
                  <button className="btn btn-warning" onClick={() => { openConfirm(); }}>Checkout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={closeConfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Confirm Checkout</h5>
            <p className="muted">Are you sure you want to place the order for {cartCount} item(s)?</p>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={closeConfirm}>Cancel</button>
              <button className="btn btn-warning" onClick={() => { checkout(); closeConfirm(); closeCartModal(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;