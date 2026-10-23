import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import './App.css';
import AuthModal from './components/AuthModal';
import AdminLoginModal from './components/AdminLoginModal';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProductCatalog from './components/ProductCatalog';
import CheckoutPage from './components/CheckoutPage';
import ThankYouPage from './components/ThankYouPage';
import ContactModal from './components/ContactModal';
import WhatsAppButton from './components/WhatsAppButton';
import { formatStorePrice } from './utils/price';
import { availableStock, stockLimitMessage } from './utils/stock';

// Lazy load heavy components to reduce initial bundle size
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// --- Local Asset Imports (MUST use these, not external URLs) ---
import quillImg from './assets/quill.png';
import wingsImg from './assets/wings.png';
import heImg from './assets/he.png';
import crownImg from './assets/crown.png';
import mezuzahLargeImg from './assets/mezuzah-large.png';
import mezuzahMediumImg from './assets/mezuzah-medium.png';
import sealOfSolomonImg from './assets/seal-of-solomon.png';
import amuletDefaultImg from './assets/amulet-default.png';

function App() {
  const [products, setProducts] = useState([]);
  const [showCatalog, setShowCatalog] = useState(true);
  const [language, setLanguage] = useState('he'); // 'he' for Hebrew, 'en' for English
  const [cart, setCart] = useState([]); // Shopping cart: array of { product, quantity }
  const [showCart, setShowCart] = useState(false); // Toggle cart visibility
  const [cartNotification, setCartNotification] = useState(false); // Show notification when item added
  const [stockAlerts, setStockAlerts] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false); // Show custom confirmation modal
  
  // Authentication state
  const [user, setUser] = useState(null); // Current logged in user
  const [admin, setAdmin] = useState(null); // Current logged in admin
  const [showAuthModal, setShowAuthModal] = useState(false); // Show login/register modal
  const [showAdminModal, setShowAdminModal] = useState(false); // Show admin login modal
  const [showDashboard, setShowDashboard] = useState(false); // Show admin dashboard
  const [showCheckout, setShowCheckout] = useState(false); // Show checkout page
  const [completedOrder, setCompletedOrder] = useState(null); // Completed order for thank you page
  const [showProductsDropdown, setShowProductsDropdown] = useState(false); // Control Products dropdown
  const [showContactModal, setShowContactModal] = useState(false); // Contact / booking modal

  // Unified handler to return to main home view from any page (dashboard / checkout / thank you)
  const handleGoHome = () => {
    setShowDashboard(false);
    setShowCheckout(false);
    setCompletedOrder(null);
    setShowCatalog(false);
    setShowCart(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper: scroll smoothly to a section by id
  const scrollToSection = (sectionId) => {
    // Small delay to ensure layout is rendered
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Unified handler to open products/catalog from anywhere (dashboard / checkout / thank you / home)
  const handleGoProducts = (sectionId = 'products') => {
    setShowDashboard(false);
    setShowCheckout(false);
    setCompletedOrder(null);
    setShowCart(false);
    setShowCatalog(true);
    scrollToSection(sectionId);
  };

  // Mock data with categories - Ready for SQL database
  // Base product data (language-agnostic)
  const baseMockProducts = [
    // Mezuzahs (מזוזות)
    {
      _id: '1',
      nameHe: 'מזוזות גדולות',
      nameEn: 'Large Mezuzahs',
      descriptionHe: 'מזוזות גדולות בכתב יד על קלף משובח, נכתבו על ידי סופר סת"ם מקובל בטהרה. מזוזה מעוצבת עם ברכת כהנים חרוטה.',
      descriptionEn: 'Large mezuzahs handwritten on premium parchment by a Kabbalist Sofer STaM in purity. Elegantly designed mezuzah with engraved Priestly Blessing.',
      price: 250,
      priceDisplay: '$250',
      category: 'mezuzah',
      image: mezuzahLargeImg
    },
    {
      _id: '2',
      nameHe: 'מזוזות בינוניות',
      nameEn: 'Medium Mezuzahs',
      descriptionHe: 'מזוזות בינוניות בכתב יד על קלף משובח, נכתבו על ידי סופר סת"ם מקובל בטהרה. מזוזה מעוצבת בכסף מהודר עם אות שין.',
      descriptionEn: 'Medium mezuzahs handwritten on premium parchment by a Kabbalist Sofer STaM in purity. Elegantly designed silver mezuzah with Shin letter.',
      price: 190,
      priceDisplay: '$190',
      category: 'mezuzah',
      image: mezuzahMediumImg
    },
    // Amulets (קמעות)
    {
      _id: '3',
      nameHe: 'קמיע ביטול כישוף',
      nameEn: 'Amulet for Breaking Spells',
      descriptionHe: 'קמיע חזק לביטול כישופים ולחיסול השפעות שליליות. נכתב על ידי מקובל בטהרה.',
      descriptionEn: 'Powerful amulet for breaking spells and eliminating negative influences. Written by a Kabbalist in purity.',
      price: 600,
      priceDisplay: '$600',
      category: 'amulet',
      image: null
    },
    {
      _id: '4',
      nameHe: 'קמיע להצלחה',
      nameEn: 'Amulet for Success',
      descriptionHe: 'קמיע להצלחה בעסקים, בקריירה ובכל תחומי החיים. מביא ברכה והצלחה.',
      descriptionEn: 'Amulet for success in business, career, and all areas of life. Brings blessing and success.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '5',
      nameHe: 'קמיע לשלום בית',
      nameEn: 'Amulet for Peace at Home',
      descriptionHe: 'קמיע לשלום בית ולאהבה בין בני הזוג. מביא הרמוניה ושקט נפשי למשפחה.',
      descriptionEn: 'Amulet for peace at home and love between spouses. Brings harmony and peace of mind to the family.',
      price: 450,
      priceDisplay: '$450',
      category: 'amulet',
      image: null
    },
    {
      _id: '6',
      nameHe: 'קמיע לאהבה',
      nameEn: 'Amulet for Love',
      descriptionHe: 'קמיע לאהבה ולזיווג. מביא אהבה אמיתית וזוגיות מאושרת.',
      descriptionEn: 'Amulet for love and matchmaking. Brings true love and happy relationships.',
      price: 450,
      priceDisplay: '$450',
      category: 'amulet',
      image: null
    },
    {
      _id: '7',
      nameHe: 'קמיע חן וחסד ובטחון',
      nameEn: 'Amulet for Grace, Kindness and Confidence',
      descriptionHe: 'קמיע לחן, חסד ובטחון עצמי. מביא אהדה, חסד ואמונה עצמית.',
      descriptionEn: 'Amulet for grace, kindness, and self-confidence. Brings favor, kindness, and self-belief.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '8',
      nameHe: 'קמיע לזיווג',
      nameEn: 'Amulet for Matchmaking',
      descriptionHe: 'קמיע לזיווג ולמציאת בן/בת זוג. מביא את הזיווג הנכון בזמן הנכון.',
      descriptionEn: 'Amulet for matchmaking and finding a spouse. Brings the right match at the right time.',
      price: 450,
      priceDisplay: '$450',
      category: 'amulet',
      image: null
    },
    {
      _id: '9',
      nameHe: 'קמיע לרפואה',
      nameEn: 'Amulet for Healing',
      descriptionHe: 'קמיע לרפואה שלמה ולחיזוק הגוף והנפש. מביא בריאות וחוזק.',
      descriptionEn: 'Amulet for complete healing and strengthening body and soul. Brings health and strength.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '10',
      nameHe: 'קמיע לדכאון',
      nameEn: 'Amulet for Depression',
      descriptionHe: 'קמיע לחיזוק הנפש ולשחרור מדכאון. מביא אור, שמחה ותקווה.',
      descriptionEn: 'Amulet for strengthening the soul and release from depression. Brings light, joy, and hope.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '11',
      nameHe: 'קמיע לעין הרע',
      nameEn: 'Amulet for Evil Eye',
      descriptionHe: 'קמיע חזק להגנה מעין הרע ומהשפעות שליליות. שומר ומגן.',
      descriptionEn: 'Powerful amulet for protection from the evil eye and negative influences. Protects and guards.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '12',
      nameHe: 'קמיע גמילה מעישון אלכוהול וסמים',
      nameEn: 'Amulet for Recovery from Smoking, Alcohol and Drugs',
      descriptionHe: 'קמיע חזק לגמילה מעישון, אלכוהול וסמים. מביא כוח ונחישות להשתחרר מההרגלים המזיקים.',
      descriptionEn: 'Powerful amulet for recovery from smoking, alcohol, and drugs. Brings strength and determination to break free from harmful habits.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    },
    {
      _id: '13',
      nameHe: 'קמיע לפרנסה',
      nameEn: 'Amulet for Livelihood',
      descriptionHe: 'קמיע לפרנסה טובה ולשפע כלכלי. מביא ברכה בעבודה ובעסקים.',
      descriptionEn: 'Amulet for good livelihood and financial abundance. Brings blessing in work and business.',
      price: 500,
      priceDisplay: '$500',
      category: 'amulet',
      image: null
    }
  ];

  // Update products based on current language and add default images
  const mockProducts = useMemo(() => {
    return baseMockProducts.map(product => {
      // Add default image for amulets without image
      let image = product.image;
      if (!image && product.category === 'amulet') {
        // Check if it's seal of solomon
        const title = product.nameHe || product.nameEn || '';
        const isSealOfSolomon = title.includes('חותם') || 
                               title.includes('שלמה') ||
                               title.toLowerCase().includes('seal') ||
                               title.toLowerCase().includes('solomon');
        if (isSealOfSolomon) {
          image = sealOfSolomonImg;
        } else {
          image = amuletDefaultImg;
        }
      }
      
      return {
        ...product,
        image: image,
        name: language === 'he' ? product.nameHe : product.nameEn,
        description: language === 'he' ? product.descriptionHe : product.descriptionEn,
        stock: typeof product.stock === 'number' ? product.stock : 0,
        allow_preorder: !!product.allow_preorder
      };
    });
  }, [language]);

  // Fetch products from API (SQL Database)
  useEffect(() => {
    const normalizeProductFromDB = (dbProduct) => {
      // Convert SQL data structure to app structure
      const category = dbProduct.category === 'מזוזות' ? 'mezuzah' : 
                      dbProduct.category === 'קמיעות' ? 'amulet' : 
                      dbProduct.category === 'חותמים' ? 'amulet' : 'other';
      
      // Use local images for mezuzahs and seals if no image_url in SQL
      const title = dbProduct.title || '';

      // Try to find matching mock product to reuse English translations
      const matchingMock = baseMockProducts.find(mock =>
        mock.nameHe === title ||
        (mock.price === (dbProduct.price_usd || dbProduct.price) && mock.category === category)
      );
      const isLargeMezuzah = category === 'mezuzah' && (
        title.includes('גדולה') || 
        title.includes('גדול') || 
        title.toLowerCase().includes('large')
      );
      const isMediumMezuzah = category === 'mezuzah' && (
        title.includes('בינונית') || 
        title.includes('בינוני') || 
        title.toLowerCase().includes('medium')
      );
      const isSealOfSolomon = (category === 'amulet' && dbProduct.category === 'חותמים') || 
                              title.includes('חותם') || 
                              title.includes('שלמה') ||
                              title.toLowerCase().includes('seal') ||
                              title.toLowerCase().includes('solomon');
      
      let image = dbProduct.image_url || null;
      if (!image) {
        if (category === 'mezuzah') {
          if (isLargeMezuzah) {
            image = mezuzahLargeImg;
          } else if (isMediumMezuzah) {
            image = mezuzahMediumImg;
          }
        } else if (category === 'amulet') {
          if (isSealOfSolomon) {
            image = sealOfSolomonImg;
          } else {
            // Default image for all other amulets
            image = amuletDefaultImg;
          }
        }
      }
      
      return {
        _id: dbProduct.id,
        nameHe: title,
        // Prefer explicit SQL English fields, otherwise fall back to mock translations if available
        nameEn: dbProduct.title_en || (matchingMock ? matchingMock.nameEn : title),
        descriptionHe: dbProduct.description || (matchingMock ? matchingMock.descriptionHe : ''),
        descriptionEn: dbProduct.description_en || dbProduct.description || (matchingMock ? matchingMock.descriptionEn : ''),
        price: dbProduct.price_usd || dbProduct.price || 0,
        priceDisplay: `$${dbProduct.price_usd || dbProduct.price || 0}`,
        category: category,
        image: image,
        stock: typeof dbProduct.stock === 'number' ? dbProduct.stock : 0,
        allow_preorder: !!dbProduct.allow_preorder
      };
    };

    const updateProductsForLanguage = (productsList) => {
      return productsList.map(product => {
        const normalized = normalizeProductFromDB(product);
        return {
          ...normalized,
          name: language === 'he' ? normalized.nameHe : normalized.nameEn,
          description: language === 'he' ? normalized.descriptionHe : normalized.descriptionEn
        };
      });
    };

    // Use async/await with proper error handling and timeout
    const fetchProducts = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Products loaded from SQL:', data.length);
          
          // Remove duplicates based on unique identifier or title+price combination
          const removeDuplicates = (productsList) => {
            const seen = new Map();
            return productsList.filter(product => {
              try {
                const normalized = normalizeProductFromDB(product);
                // Use id as primary key, or title+price as fallback
                const key = normalized._id || `${normalized.nameHe || normalized.nameEn}_${normalized.price}`;
                
                if (seen.has(key)) {
                  console.log('⚠️ Duplicate product removed:', normalized.nameHe || normalized.nameEn);
                  return false;
                }
                seen.set(key, true);
                return true;
              } catch (err) {
                console.error('Error processing product:', err);
                return false;
              }
            });
          };
          
          const uniqueProducts = removeDuplicates(data);
          console.log('✅ Unique products after deduplication:', uniqueProducts.length);
          setProducts(updateProductsForLanguage(uniqueProducts));
        } else {
          console.log('⚠️ No products from SQL, using mock data');
          setProducts(mockProducts);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('❌ Request timeout - using mock data');
        } else {
          console.error("❌ Error fetching from SQL:", err);
        }
        console.log("Using mock data as fallback");
        setProducts(mockProducts);
      }
    };

    fetchProducts();
  }, [language, mockProducts]);

  // Removed - now handled in ProductCatalog component for better code splitting

  const getPriceDisplay = (price) => formatStorePrice(price, language);

  // Cart management functions
  const cartItemId = (product) => (
    product._id || product.id || `${product.name || product.nameHe || product.nameEn}_${product.price}`
  );

  const markStockLimit = (productId, stock) => {
    setStockAlerts((prev) => ({ ...prev, [productId]: stock }));
    setShowCart(true);
  };

  const clearStockLimit = (productId) => {
    setStockAlerts((prev) => {
      if (prev[productId] == null) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const addToCart = (product) => {
    const productId = cartItemId(product);
    const productToAdd = {
      ...product,
      _id: productId,
      id: productId,
      price: product.price || 0,
      name: product.name || (language === 'he' ? product.nameHe : product.nameEn) || 'Product',
      nameHe: product.nameHe || product.name || '',
      nameEn: product.nameEn || product.name || '',
      image: product.image || product.image_url || null,
      image_url: product.image_url || product.image || null
    };

    const existingItem = cart.find((item) => cartItemId(item.product) === productId);
    const limit = availableStock(productToAdd);
    const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;
    if (limit !== null && nextQuantity > limit) {
      markStockLimit(productId, limit);
      return;
    }

    clearStockLimit(productId);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => cartItemId(item.product) === productId);
      if (existing) {
        return prevCart.map((item) => (
          cartItemId(item.product) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
      return [...prevCart, { product: productToAdd, quantity: 1 }];
    });

    setCartNotification(true);
    setTimeout(() => {
      setCartNotification(false);
    }, 2000);
  };

  const removeFromCart = (productId) => {
    clearStockLimit(productId);
    setCart(prevCart => prevCart.filter(item => {
      const itemId = item.product._id || item.product.id || `${item.product.name}_${item.product.price}`;
      return itemId !== productId;
    }));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      clearStockLimit(productId);
      removeFromCart(productId);
      return;
    }
    const current = cart.find((item) => cartItemId(item.product) === productId);
    const limit = current ? availableStock(current.product) : null;
    if (limit !== null && newQuantity > limit) {
      markStockLimit(productId, limit);
      return;
    }
    clearStockLimit(productId);
    setCart(prevCart =>
      prevCart.map(item => {
        const itemId = cartItemId(item.product);
        if (itemId === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    setCart([]);
    setShowClearConfirm(false);
  };

  const cancelClearCart = () => {
    setShowClearConfirm(false);
  };

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    if (adminToken && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }
  }, []);

  // Handle auth success
  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setShowAuthModal(false);
  };

  // Handle admin auth success
  const handleAdminSuccess = (data) => {
    setAdmin(data.admin);
    setShowAdminModal(false);
  };

  // Handle order completion
  const handleOrderComplete = (order) => {
    setCart([]); // Clear cart
    setCompletedOrder(order);
    setShowCheckout(false);
  };

  // Logout functions
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  // Calculate cart totals
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.product.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="app-container">
      
      {/* --- Floating Parallax Background Elements --- */}
      <img src={heImg} className="floating-asset he-float" alt="Sacred Letter He" />
      <img src={crownImg} className="floating-asset crown-float" alt="Tech Crown" />

      {/* --- Navbar (Sticky & Glassmorphic) --- */}
      <nav className="navbar">
        <div className="nav-brand-container">
          <img src={quillImg} className="nav-logo" alt="Art of Raziel Logo" />
          <span className="nav-brand">ART OF RAZIEL</span>
        </div>
        <div className="nav-links">
          <a 
            href="#home" 
            onClick={(e) => {
              e.preventDefault();
              handleGoHome();
            }}
          >
            Home
          </a>
          <div 
            className="dropdown"
            onMouseEnter={() => setShowProductsDropdown(true)}
            onMouseLeave={() => {
              // Add delay before closing
              setTimeout(() => {
                setShowProductsDropdown(false);
              }, 300);
            }}
          >
            <a 
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleGoProducts('products');
              }}
            >
              Products
            </a>
            <div 
              className={`dropdown-content ${showProductsDropdown ? 'dropdown-open' : ''}`}
              onMouseEnter={() => setShowProductsDropdown(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  setShowProductsDropdown(false);
                }, 300);
              }}
            >
              <a 
                href="#products"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoProducts('products');
                }}
              >
                All Products (כל המוצרים)
              </a>
              <a 
                href="#mezuzahs"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoProducts('mezuzahs');
                }}
              >
                Mezuzahs (מזוזות)
              </a>
              <a 
                href="#amulets"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoProducts('amulets');
                }}
              >
                Amulets (קמיעות)
              </a>
            </div>
          </div>
        </div>
        <div className="nav-right">
          <button
            className="contact-btn"
            onClick={() => setShowContactModal(true)}
            title={language === 'he' ? 'קבע פגישה / צור קשר' : 'Book a meeting / Contact'}
          >
            <span className="contact-icon">📅</span>
            <span className="contact-text">
              {language === 'he' ? 'יצירת קשר' : 'Contact'}
            </span>
          </button>
          <button 
            className={`cart-toggle ${cartItemCount > 0 ? 'cart-has-items' : ''} ${cartNotification ? 'cart-pulse' : ''}`}
            onClick={() => setShowCart(!showCart)}
            title={language === 'he' ? 'סל קניות' : 'Shopping Cart'}
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-text">{language === 'he' ? 'סל' : 'Cart'}</span>
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
          <button 
            className="language-toggle"
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
          >
            {language === 'he' ? 'EN' : 'עב'}
          </button>
          {admin ? (
            <div className="admin-info">
              <button 
                className="admin-dashboard-btn"
                onClick={() => setShowDashboard(true)}
                title={language === 'he' ? 'לוח בקרה' : 'Dashboard'}
              >
                {language === 'he' ? 'לוח בקרה' : 'Dashboard'}
              </button>
              <span className="admin-name">{admin.name || admin.email}</span>
              <button className="admin-logout-btn" onClick={handleAdminLogout}>
                {language === 'he' ? 'התנתק' : 'Logout'}
              </button>
            </div>
          ) : (
            <button 
              className="admin-btn"
              onClick={() => setShowAdminModal(true)}
            >
              {language === 'he' ? 'התחברות אדמין' : 'ADMIN LOGIN'}
            </button>
          )}
          
          {user ? (
            <div className="user-info">
              <span className="user-name">
                {user.first_name || user.email}
              </span>
              <button className="user-logout-btn" onClick={handleLogout}>
                {language === 'he' ? 'התנתק' : 'Logout'}
              </button>
            </div>
          ) : (
            <button 
              className="auth-btn"
              onClick={() => setShowAuthModal(true)}
            >
              {language === 'he' ? 'התחבר/הירשם' : 'Login/Register'}
            </button>
          )}
        </div>
      </nav>

      {/* Admin Dashboard */}
      {showDashboard && admin ? (
        <Suspense fallback={
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #020202 0%, #111111 100%)',
            color: '#D4AF37',
            fontFamily: 'Cinzel, serif'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
              <h2>{language === 'he' ? 'טוען לוח בקרה...' : 'Loading Dashboard...'}</h2>
            </div>
          </div>
        }>
          <AdminDashboard 
            onBack={() => setShowDashboard(false)}
            language={language}
            products={products}
          />
        </Suspense>
      ) : completedOrder ? (
        /* Thank You Page */
        <ThankYouPage 
          order={completedOrder}
          language={language}
          onBackToShop={() => {
            setCompletedOrder(null);
            setShowCheckout(false);
            setShowCatalog(true);
          }}
        />
      ) : showCheckout ? (
        /* Checkout Page */
        <CheckoutPage
          cart={cart}
          language={language}
          user={user}
          stockAlerts={stockAlerts}
          onUpdateQuantity={updateQuantity}
          onOrderComplete={handleOrderComplete}
          onBack={() => {
            setShowCheckout(false);
            setShowCart(true);
          }}
        />
      ) : (
              <>
                {/* Hero Section */}
                <HeroSection quillImg={quillImg} wingsImg={wingsImg} language={language} />

                {/* About Section */}
                <AboutSection language={language} />

                {/* Product Catalog */}
                {showCatalog && (
                  <ProductCatalog 
                    products={products} 
                    language={language} 
                    addToCart={addToCart}
                  />
                )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()} dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="cart-header">
              <h2>{language === 'he' ? 'סל קניות' : 'Shopping Cart'}</h2>
              <button className="cart-close" onClick={() => setShowCart(false)}>×</button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="cart-empty">{language === 'he' ? 'הסל ריק' : 'Your cart is empty'}</p>
              ) : (
                cart.map((item) => {
                  const productId = item.product._id || item.product.id || `${item.product.name}_${item.product.price}`;
                  const imageSrc = item.product.image || item.product.image_url || null;
                  const productName = item.product.name || (language === 'he' ? item.product.nameHe : item.product.nameEn) || 'Product';
                  const productPrice = item.product.price || 0;
                  
                  return (
                    <div key={productId} className="cart-item">
                      {imageSrc ? (
                        <img src={imageSrc} alt={productName} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-placeholder">
                          <span>{language === 'he' ? 'אמנות קדושה' : 'Sacred Art'}</span>
                        </div>
                      )}
                      <div className="cart-item-details">
                        <h4>{productName}</h4>
                        <div className="cart-item-price">{getPriceDisplay(productPrice)}</div>
                        <div className="cart-item-subtotal">
                          {language === 'he' ? 'סה"כ פריט:' : 'Item Total:'} {getPriceDisplay(productPrice * item.quantity)}
                        </div>
                        <div className="cart-item-controls">
                          <button 
                            className="cart-quantity-btn"
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="cart-quantity">{item.quantity}</span>
                          <button 
                            className="cart-quantity-btn"
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button 
                            className="cart-remove-btn"
                            onClick={() => removeFromCart(productId)}
                          >
                            {language === 'he' ? 'הסר' : 'Remove'}
                          </button>
                        </div>
                        {stockAlerts[productId] != null && (
                          <p className="cart-stock-alert" role="alert">
                            {stockLimitMessage(stockAlerts[productId], language)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="cart-total-label">{language === 'he' ? 'סה"כ:' : 'Total:'}</span>
                  <span className="cart-total-price">{getPriceDisplay(cartTotal)}</span>
                </div>
                <div className="cart-item-count">
                  {language === 'he' 
                    ? `${cartItemCount} ${cartItemCount === 1 ? 'מוצר' : 'מוצרים'}`
                    : `${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`
                  }
                </div>
                <div className="cart-footer-buttons">
                  <button 
                    className="cart-clear-btn"
                    onClick={clearCart}
                    title={language === 'he' ? 'נקה את כל הסל' : 'Clear all items'}
                  >
                    <span className="clear-btn-icon">⚡</span>
                    <span className="clear-btn-text">{language === 'he' ? 'נקה סל' : 'Clear Cart'}</span>
                    <span className="clear-btn-scan"></span>
                  </button>
                  <button 
                    className="cart-checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    {language === 'he' ? 'השלם הזמנה' : 'Checkout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Notification Toast */}
      {cartNotification && (
        <div className="cart-notification">
          <span className="cart-notification-icon">✓</span>
          <span className="cart-notification-text">
            {language === 'he' ? 'המוצר נוסף לסל!' : 'Product added to cart!'}
          </span>
        </div>
      )}

      {/* Custom Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={cancelClearCart}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-tech">⚠</div>
              <h3 className="modal-title">
                {language === 'he' ? 'אישור ניקוי סל' : 'Clear Cart Confirmation'}
              </h3>
            </div>
            <div className="modal-content">
              <p className="modal-message">
                {language === 'he' 
                  ? 'האם אתה בטוח שברצונך להסיר את כל המוצרים מהסל?' 
                  : 'Are you sure you want to remove all items from the cart?'}
              </p>
              <div className="modal-scan-line"></div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={cancelClearCart}
              >
                <span className="modal-btn-icon">✕</span>
                <span>{language === 'he' ? 'ביטול' : 'Cancel'}</span>
              </button>
              <button 
                className="modal-btn modal-btn-confirm"
                onClick={confirmClearCart}
              >
                <span className="modal-btn-icon">✓</span>
                <span>{language === 'he' ? 'אישור' : 'Confirm'}</span>
              </button>
            </div>
            <div className="modal-tech-border"></div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        language={language}
      />

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
        language={language}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={user}
        language={language}
      />
      
      {/* Global WhatsApp floating button */}
      <WhatsAppButton />
        </>
      )}
    </div>
  );
}

export default App;
