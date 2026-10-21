import { useState, useMemo, useEffect } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99, emoji: '🎧' },
  { id: 2, name: 'Smart Watch', category: 'Electronics', price: 199.99, emoji: '⌚' },
  { id: 3, name: 'Running Shoes', category: 'Fashion', price: 89.99, emoji: '👟' },
  { id: 4, name: 'Leather Backpack', category: 'Fashion', price: 59.99, emoji: '🎒' },
  { id: 5, name: 'Coffee Maker', category: 'Home', price: 49.99, emoji: '☕' },
  { id: 6, name: 'Plant Pot Set', category: 'Home', price: 24.99, emoji: '🪴' },
  { id: 7, name: 'Bluetooth Speaker', category: 'Electronics', price: 39.99, emoji: '🔊' },
  { id: 8, name: 'Sunglasses', category: 'Fashion', price: 29.99, emoji: '🕶️' },
]

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home']
const THEME_KEY = 'shopeasy-theme'

function loadTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark'
}

export default function App() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [dark, setDark] = useState(loadTheme)
  const [sortBy, setSortBy] = useState('default') // 'default' | 'price-asc' | 'price-desc'

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = PRODUCTS.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price)
    }
    return list
  }, [category, query, sortBy])

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id)
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div>
      <header className="navbar">
        <div className="logo">🛍️ ShopEasy</div>
        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>Discover Great Deals</h1>
          <p>Electronics, fashion, and home essentials — all in one place.</p>
        </section>

        <div className="filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={category === c ? 'active' : ''}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="sort-bar">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <p className="empty-search">No products match "{query}".</p>
        )}

        <div className="products">
          {filtered.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image">{p.emoji}</div>
              <div className="product-body">
                <span className="category">{p.category}</span>
                <h3>{p.name}</h3>
                <div className="price">${p.price.toFixed(2)}</div>
                <button className="add-btn" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setCartOpen(false)}>
              Close
            </button>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p style={{ color: '#636e72', padding: '1rem 0' }}>
                Your cart is empty.
              </p>
            ) : (
              <>
                {cart.map((i) => (
                  <div key={i.id} className="cart-item">
                    <div className="emoji">{i.emoji}</div>
                    <div className="info">
                      <h4>{i.name}</h4>
                      <p>${i.price.toFixed(2)} each</p>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(i.id, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => updateQty(i.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => {
                    alert(`Order placed! Total: $${total.toFixed(2)}`)
                    setCart([])
                    setCartOpen(false)
                  }}
                >
                  Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
