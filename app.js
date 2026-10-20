const STORAGE_KEYS = {
  products: "shoplocal_products_v1",
  reservations: "shoplocal_reservations_v1",
  profile: "shoplocal_shop_profile_v1", // legacy single-profile key
  profiles: "shoplocal_shop_profiles_v1",
  activeProfile: "shoplocal_active_shop_profile_v1",
  salesHistory:"shoplocal_sales_history_v1"
};

const defaultShopProfile = {
  name: "My Demo Shop",
  category: "General Store",
  address: "Add your shop address",
  phone: "",
  hours: "Mon–Sat, 9:00 AM–8:00 PM",
  description: "Welcome to our neighbourhood shop! Update this profile with your real shop details."
};

function getShopProfiles() {
  const stored = readData(STORAGE_KEYS.profiles, null);
  if (Array.isArray(stored)) return stored;
  // Migrate an existing single profile without deleting the old data.
  const legacy = readData(STORAGE_KEYS.profile, null);
  if (legacy && typeof legacy === "object" && legacy.name) {
    const profiles = [legacy];
    saveData(STORAGE_KEYS.profiles, profiles);
    saveData(STORAGE_KEYS.activeProfile, legacy.name);
    return profiles;
  }
  return [];
}

function getShopProfile(name) {
  const profiles = getShopProfiles();
  const activeName = name || readData(STORAGE_KEYS.activeProfile, "");
  return profiles.find(profile => String(profile.name || "").toLowerCase() === String(activeName || "").toLowerCase()) || profiles[0] || { ...defaultShopProfile };
}

function saveShopProfile(profile, oldName = null) {
  const profiles = getShopProfiles();
  const oldIndex = oldName ? profiles.findIndex(item => String(item.name || "").toLowerCase() === String(oldName).toLowerCase()) : -1;
  if (oldIndex >= 0) profiles[oldIndex] = profile;
  else profiles.push(profile);
  if (!saveData(STORAGE_KEYS.profiles, profiles)) return false;
  saveData(STORAGE_KEYS.activeProfile, profile.name);
  // Keep legacy key current for compatibility with older copies of the prototype.
  saveData(STORAGE_KEYS.profile, profile);
  return true;
}

function hasSavedShopProfile(name) {
  return getShopProfiles().some(profile => {
    if (name && String(profile.name || "").toLowerCase() !== String(name).toLowerCase()) return false;
    return Boolean(String(profile.name || "").trim() && String(profile.address || "").trim() &&
      String(profile.hours || "").trim() && String(profile.description || "").trim());
  });
}

function categoryForShopProfile(profile, product) {
  const category = String(profile && profile.category || "").trim().toLowerCase();
  const categoryMap = { "stationery": "Stationery", "electronics": "Electronics", "food and grocery": "Food", "food": "Food", "household": "Household" };
  return categoryMap[category] || (product && product.category) || "General Store";
}

function profileMatchesProductShop(profile, product) {
  return String(profile && profile.name || "").trim().toLowerCase() === String(product && product.shop || "").trim().toLowerCase();
}

const starterProducts = [
  {
    id: "p1",
    name: "Classmate Notebook",
    category: "Stationery",
    price: 55,
    costPrice: 35,
    stock: 18,
    shop: "City Stationery"
  },
  {
    id: "p2",
    name: "Blue Ball Pen",
    category: "Stationery",
    price: 10,
    costPrice: 5,
    stock: 40,
    shop: "City Stationery"
  },
  {
    id: "p3",
    name: "USB-C Cable",
    category: "Electronics",
    price: 149,
    costPrice: 85,
    stock: 12,
    shop: "Smart Corner"
  },
  {
    id: "p4",
    name: "Wireless Mouse",
    category: "Electronics",
    price: 399,
    costPrice: 250,
    stock: 7,
    shop: "Smart Corner"
  },
  {
    id: "p5",
    name: "Potato Chips",
    category: "Food",
    price: 20,
    costPrice: 14,
    stock: 25,
    shop: "Fresh Basket"
  },
  {
    id: "p6",
    name: "Reusable Water Bottle",
    category: "Household",
    price: 199,
    costPrice: 110,
    stock: 9,
    shop: "Fresh Basket"
  }
];

function readData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error("Could not read ShopLocal data:", error);
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save ShopLocal data:", error);
    alert("Your browser could not save this change. Try another browser window or check browser storage settings.");
    return false;
  }
}

function getProducts() {
  return readData(STORAGE_KEYS.products, starterProducts);
}

function saveProducts(products) {
  return saveData(STORAGE_KEYS.products, products);
}

function getReservations() {
  return readData(STORAGE_KEYS.reservations, []);
}

function saveReservations(reservations) {
  return saveData(STORAGE_KEYS.reservations, reservations);
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Add sample products on the first visit.
if (localStorage.getItem(STORAGE_KEYS.products) === null) {
  saveProducts(starterProducts);
}

/* SHOPLOCAL MULTI-SHOP DEMO SETUP — v1 */

const demoShopProfiles = [
  {
    name: "City Stationery",
    category: "Stationery",
    address: "Demo Market, Shop 1",
    phone: "",
    hours: "Mon–Sat, 9:00 AM–8:00 PM",
    description: "School supplies, stationery and office essentials."
  },
  {
    name: "Smart Corner",
    category: "Electronics",
    address: "Demo Market, Shop 2",
    phone: "",
    hours: "Mon–Sat, 10:00 AM–9:00 PM",
    description: "Electronics and everyday tech accessories."
  },
  {
    name: "Fresh Basket",
    category: "Food and Grocery",
    address: "Demo Market, Shop 3",
    phone: "",
    hours: "Daily, 8:00 AM–9:00 PM",
    description: "Groceries, snacks and daily essentials."
  },
  {
    name: "Style Street",
    category: "General Store",
    address: "Demo Market, Shop 4",
    phone: "",
    hours: "Mon–Sat, 10:00 AM–9:00 PM",
    description: "Clothing and accessories for everyday style."
  },
  {
    name: "Home Essentials",
    category: "Household",
    address: "Demo Market, Shop 5",
    phone: "",
    hours: "Mon–Sat, 9:00 AM–8:00 PM",
    description: "Useful household products for every home."
  }
];

const demoProductCatalog = {
  "City Stationery": [
    ["Classmate Notebook", "Stationery", 55, 18],
    ["Blue Ball Pen", "Stationery", 10, 40],
    ["Pencil Pack", "Stationery", 25, 30],
    ["Eraser", "Stationery", 5, 50],
    ["Sharpener", "Stationery", 8, 35],
    ["Geometry Box", "Stationery", 120, 12],
    ["Highlighter Set", "Stationery", 80, 15],
    ["A4 Paper Pack", "Stationery", 160, 10],
    ["Sticky Notes", "Stationery", 45, 20],
    ["School Ruler", "Stationery", 15, 25]
  ],
  "Smart Corner": [
    ["USB-C Cable", "Electronics", 149, 12],
    ["Wireless Mouse", "Electronics", 399, 7],
    ["Wired Earphones", "Electronics", 249, 14],
    ["Phone Charger", "Electronics", 299, 10],
    ["USB Flash Drive", "Electronics", 349, 8],
    ["Laptop Stand", "Electronics", 499, 6],
    ["Mouse Pad", "Electronics", 99, 18],
    ["Phone Holder", "Electronics", 129, 15],
    ["Bluetooth Speaker", "Electronics", 699, 5],
    ["Power Bank", "Electronics", 899, 7]
  ],
  "Fresh Basket": [
    ["Potato Chips", "Food", 20, 25],
    ["Reusable Water Bottle", "Household", 199, 9],
    ["Biscuits", "Food", 30, 24],
    ["Fruit Juice", "Food", 40, 18],
    ["Breakfast Cereal", "Food", 180, 10],
    ["Rice Pack", "Food", 75, 20],
    ["Pasta Pack", "Food", 45, 16],
    ["Cooking Oil", "Food", 150, 12],
    ["Tea Pack", "Food", 95, 14],
    ["Chocolate Bar", "Food", 25, 30]
  ],
  "Style Street": [
    ["Cotton T-Shirt", "Clothing", 299, 12],
    ["Casual Cap", "Accessories", 149, 10],
    ["Canvas Tote Bag", "Accessories", 199, 15],
    ["Ankle Socks", "Clothing", 79, 25],
    ["Fabric Belt", "Accessories", 129, 10],
    ["Scarf", "Accessories", 179, 8],
    ["Wallet", "Accessories", 249, 12],
    ["Casual Shirt", "Clothing", 599, 7],
    ["Hair Band Set", "Accessories", 59, 20],
    ["Reusable Shopping Bag", "Accessories", 49, 30]
  ],
  "Home Essentials": [
    ["LED Bulb", "Household", 99, 20],
    ["Kitchen Towel", "Household", 79, 15],
    ["Storage Box", "Household", 149, 12],
    ["Dishwashing Sponge", "Household", 25, 30],
    ["Laundry Basket", "Household", 299, 6],
    ["Cleaning Brush", "Household", 69, 14],
    ["Food Storage Container", "Household", 119, 18],
    ["Door Mat", "Household", 199, 8],
    ["Clothes Hangers Pack", "Household", 129, 16],
    ["Desk Organizer", "Household", 179, 10]
  ]
};

function initializeShopLocalDemoShops() {
  let profiles = getShopProfiles();
  let products = getProducts();
  let changedProfiles = false;
  let changedProducts = false;

  // Add missing demo profiles without deleting existing profiles.
  for (const demoProfile of demoShopProfiles) {
    const exists = profiles.some(profile =>
      String(profile.name || "").trim().toLowerCase() ===
      demoProfile.name.toLowerCase()
    );

    if (!exists) {
      profiles.push({ ...demoProfile });
      changedProfiles = true;
    }
  }

  // Preserve existing products. Fill each demo shop to 10 products.
  for (const [shopName, catalog] of Object.entries(demoProductCatalog)) {
    let shopProducts = products.filter(product =>
      String(product.shop || "").trim().toLowerCase() ===
      shopName.toLowerCase()
    );

    for (const [name, category, price, stock] of catalog) {
      if (shopProducts.length >= 10) break;

      const alreadyExists = shopProducts.some(product =>
        String(product.name || "").trim().toLowerCase() ===
        name.toLowerCase()
      );

      if (alreadyExists) continue;

      const newProduct = {
        id: makeId(),
        name,
        category,
        price,
        stock,
        shop: shopName
      };

      products.push(newProduct);
      shopProducts.push(newProduct);
      changedProducts = true;
    }
  }

  if (changedProfiles && !saveData(STORAGE_KEYS.profiles, profiles)) {
    return false;
  }

  if (changedProducts && !saveProducts(products)) {
    return false;
  }

  // Use City Stationery as the initial active demo shop only if
  // the current active profile is not one of the five demo shops.
  const activeName = readData(STORAGE_KEYS.activeProfile, "");
  const activeExists = profiles.some(profile =>
    String(profile.name || "").toLowerCase() ===
    String(activeName).toLowerCase()
  );

  if (!activeExists) {
    saveData(STORAGE_KEYS.activeProfile, "City Stationery");
  }

  return true;
}

initializeShopLocalDemoShops();

// ---------------- CUSTOMER DASHBOARD ----------------

const searchForm = document.getElementById("searchForm");

if (searchForm) {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productGrid = document.getElementById("productGrid");

  // Preserve category shortcuts from the homepage, e.g. customer.html?category=Stationery.
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  const validCategories = ["Stationery", "Electronics", "Food", "Household"];
  if (requestedCategory && validCategories.includes(requestedCategory)) {
    categoryFilter.value = requestedCategory;
  }
  const emptyResults = document.getElementById("emptyResults");
  const reservationList = document.getElementById("customerReservationList");
  const shopProfileCard = document.getElementById("shopProfileCard");

  function renderCustomerShopProfile(product) {
    if (!shopProfileCard || !product) return;

    const savedProfile = getShopProfiles().find(profile => profileMatchesProductShop(profile, product) && hasSavedShopProfile(profile.name)) || null;
    const isSavedShop = Boolean(savedProfile);
    const sameShopProducts = getProducts().filter(item =>
      String(item.shop || "").trim().toLowerCase() === String(product.shop || "").trim().toLowerCase()
    );
    const inferredCategories = [...new Set(sameShopProducts.map(item => String(item.category || "").trim()).filter(Boolean))];
    const demoProfile = {
      name: product.shop || "Local Shop",
      category: inferredCategories.length === 1 ? inferredCategories[0] : "General Store",
      address: "Shop address not provided in demo data",
      phone: "",
      hours: "Not provided in demo data",
      description: "This is sample shop information. The shopkeeper can add full details by creating a shop profile."
    };
    const profile = isSavedShop ? savedProfile : demoProfile;
    const categoryMap = {
      "Stationery": "Stationery",
      "Electronics": "Electronics",
      "Food and Grocery": "Food",
      "Food": "Food",
      "Household": "Household"
    };
    const profileProductCategory = categoryMap[profile.category] || null;
    let shopProducts = sameShopProducts;
    if (profileProductCategory) {
      shopProducts = shopProducts.filter(item => item.category === profileProductCategory);
    }

    shopProfileCard.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">PRODUCT DETAILS & SHOP PROFILE</p>
          <h2 id="productDetailTitle">${escapeHTML(product.name || "Product")}</h2>
        </div>
        <span class="sample-label">${isSavedShop ? "VERIFIED IN DEMO" : "SAMPLE PROFILE"}</span>
      </div>
      <article class="detail-product-card">
        <p class="eyebrow">${escapeHTML(product.category || "")}</p>
        <h3>${escapeHTML(product.name || "")}</h3>
        <div class="product-price">${money(product.price)}</div>
        <p>${Number(product.stock) > 0 ? `<span class="stock-label">${Number(product.stock)} available</span>` : '<span class="stock-label out">Out of stock</span>'}</p>
        <p>Sold by <strong>${escapeHTML(product.shop || profile.name)}</strong></p>
        <button class="primary-button" type="button" data-detail-reserve="${escapeHTML(product.id || "")}" ${Number(product.stock) < 1 ? "disabled" : ""}>Request reservation</button>
      </article>
      <div class="detail-shop-profile">
        <p class="eyebrow">SHOP PROFILE</p>
        <h3>${escapeHTML(profile.name)}</h3>
        <p>${escapeHTML(profile.description)}</p>
        <div class="shop-profile-details">
          <p><strong>Shop category:</strong> ${escapeHTML(profile.category)}</p>
          <p><strong>Address:</strong> ${escapeHTML(profile.address)}</p>
          <p><strong>Phone:</strong> ${escapeHTML(profile.phone || "Not provided")}</p>
          <p><strong>Opening hours:</strong> ${escapeHTML(profile.hours)}</p>
        </div>
        <h4>Other products from this shop</h4>
        ${shopProducts.length ? `
          <div class="detail-related-products">
            ${shopProducts.map(item => `
              <button type="button" class="related-product" data-product-details="${escapeHTML(item.id || "")}">
                <span>${escapeHTML(item.name || "")}</span><strong>${money(item.price)}</strong>
              </button>
            `).join("")}
          </div>
        ` : `<p>No products in this shop category are listed yet.</p>`}
      </div>
    `;
  }

  function openProductDetails(product) {
    const modal = document.getElementById("productDetailModal");
    if (!modal || !product) return;
    renderCustomerShopProfile(product);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("product-detail-open");
  }

  function closeProductDetails() {
    const modal = document.getElementById("productDetailModal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("product-detail-open");
  }

  function requestProductReservation(productId) {
    const products = getProducts();
    const product = products.find(item => item.id === productId);

        if (
  product &&
  window.ShopLocalPlans &&
  !window.ShopLocalPlans.shopHasPaidPlan(product.shop)
) {
  alert("This shop is not currently accepting online reservations.");
  return;
}

    if (!product || Number(product.stock) < 1) {
      alert("Sorry, this product is currently unavailable.");
      renderProducts();
      return;
    }

    const quantityInput = prompt(
      `How many "${product.name}" would you like to request? Available: ${product.stock}`,
      "1"
    );
    if (quantityInput === null) return;

    const quantity = Number(quantityInput);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > Number(product.stock)) {
      alert("Enter a whole number within the available stock.");
      return;
    }

    const reservations = getReservations();
    reservations.push({
      id: makeId(),
      productId: product.id,
      productName: product.name,
      shop: product.shop,
      price: product.price,
      costPrice: product.costPrice ?? null,
      quantity,
      status: "Pending",
      createdAt: new Date().toISOString()
    });

    if (saveReservations(reservations)) {
  renderShopkeeperReservations();
  renderInventory();

  window.dispatchEvent(
    new Event("shoplocal:sales-history-updated")
  );

  alert("Sale recorded! Your Sales Overview has been updated.");
}
  }

    function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    let products = getProducts().filter(product => {
      const name = String(product.name || "").toLowerCase();
      const shop = String(product.shop || "").toLowerCase();
      const productCategory = String(product.category || "").toLowerCase();

      const matchesQuery =
        name.includes(query) ||
        shop.includes(query) ||
        productCategory.includes(query);

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesQuery && matchesCategory;
    });

    if (sort === "price-low") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    }

    productGrid.innerHTML = products.map(product => `
      <article class="product-card clickable-product-card" data-product-details="${escapeHTML(product.id || "")}" tabindex="0" role="button" aria-label="View ${escapeHTML(product.name || "product")} and shop profile">
        <p class="eyebrow">${escapeHTML(product.category || "")}</p>
        <h3>${escapeHTML(product.name || "")}</h3>
        <p>🏪 ${escapeHTML(product.shop || "")}</p>
        <div class="product-price">${money(product.price)}</div>
        <p>
          ${Number(product.stock) < 1
            ? '<span class="stock-label out">Out of stock</span>'
            : Number(product.stock) <= 5
              ? `<span class="stock-label low">Low stock · ${Number(product.stock)} left</span>`
              : `<span class="stock-label">${Number(product.stock)} available</span>`}
        </p>
        <div class="card-actions">
          <button
            class="primary-button"
            data-reserve="${escapeHTML(product.id || "")}"
            ${Number(product.stock) < 1 ? "disabled" : ""}
          >Request reservation</button>
        </div>
      </article>
    `).join("");

    emptyResults.hidden = products.length > 0;
  }

   
  function renderCustomerReservations() {
    const reservations = getReservations();

    if (reservations.length === 0) {
      reservationList.innerHTML = "<p>No reservations yet. Find a product and request one!</p>";
      return;
    }

    reservationList.innerHTML = reservations.map(reservation => `
      <article class="reservation-card">
        <h3>${escapeHTML(reservation.productName)}</h3>
        <p>Shop: ${escapeHTML(reservation.shop)}</p>
        <p>Quantity: ${reservation.quantity}</p>
        <p>Total: ${money(reservation.price * reservation.quantity)}</p>
        <p>Status: <strong>${escapeHTML(reservation.status)}</strong></p>
      </article>
    `).join("");
  }

  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    renderProducts();
  });

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  sortFilter.addEventListener("change", renderProducts);

  productGrid.addEventListener("click", event => {
    const reserveButton = event.target.closest("[data-reserve]");
    if (reserveButton) {
      event.stopPropagation();
      requestProductReservation(reserveButton.dataset.reserve);
      return;
    }
    const card = event.target.closest("[data-product-details]");
    if (!card) return;
    const product = getProducts().find(item => item.id === card.dataset.productDetails);
    if (product) openProductDetails(product);
  });

  productGrid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-product-details]");
    if (!card || event.target.closest("button")) return;
    event.preventDefault();
    const product = getProducts().find(item => item.id === card.dataset.productDetails);
    if (product) openProductDetails(product);
  });
  // Handle the Request Reservation button inside product details.
  if (shopProfileCard) {
    shopProfileCard.addEventListener("click", event => {
  const reserveButton = event.target.closest("[data-detail-reserve]");
  if (!reserveButton) return;

 const productId = reserveButton.dataset.detailReserve;

try {
  requestProductReservation(productId);
} catch (error) {
  alert("Reservation error: " + error.message);
  console.error(error);
}s
});
  }

  const detailModal = document.getElementById("productDetailModal");
  if (detailModal) {
    detailModal.addEventListener("click", event => {
      if (event.target.closest("[data-close-product-details]")) {
        closeProductDetails();
        return;
      }
      const reserveButton = event.target.closest("[data-detail-reserve]");
      if (reserveButton) {
        requestProductReservation(reserveButton.dataset.detailReserve);
        return;
      }
      const relatedButton = event.target.closest(".related-product[data-product-details]");
      if (relatedButton) {
        const relatedProduct = getProducts().find(item => item.id === relatedButton.dataset.productDetails);
        if (relatedProduct) openProductDetails(relatedProduct);
      }
    });
  }

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE_KEYS.products ||
      event.key === STORAGE_KEYS.reservations ||
      event.key === STORAGE_KEYS.profile ||
      event.key === STORAGE_KEYS.profiles ||
      event.key === STORAGE_KEYS.activeProfile
    ) {
      renderProducts();
      renderCustomerReservations();
    }
  });

  window.addEventListener("focus", () => {
    renderProducts();
    renderCustomerReservations();
  });

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    renderProducts();
    renderCustomerReservations();
  }
});

  renderProducts();
  renderCustomerReservations();
}

// ---------------- SHOPKEEPER DIGITAL SHOP PROFILE ----------------

const shopProfileForm = document.getElementById("shopProfileForm");

if (shopProfileForm) {
  const profileSummary = document.getElementById("shopProfileSummary");
  const profileSelect = document.getElementById("shopProfileSelect");
  const createProfileButton = document.getElementById("createNewShopProfileButton");
  const profileName = document.getElementById("shopProfileName");
  const profileCategory = document.getElementById("shopProfileCategory");
  const profileAddress = document.getElementById("shopProfileAddress");
  const profilePhone = document.getElementById("shopProfilePhone");
  const profileHours = document.getElementById("shopProfileHours");
  const profileDescription = document.getElementById("shopProfileDescription");
  const saveProfileButton = shopProfileForm.querySelector('button[type="submit"]');
  let editingOriginalName = null;

  function clearProfileForm() {
    shopProfileForm.reset();
    profileCategory.value = "General Store";
  }

  function fillShopProfileForm(profile) {
    profileName.value = profile?.name || "";
    profileCategory.value = profile?.category || "General Store";
    profileAddress.value = profile?.address || "";
    profilePhone.value = profile?.phone || "";
    profileHours.value = profile?.hours || "";
    profileDescription.value = profile?.description || "";
  }

  function renderShopProfileEditor() {
    const profiles = getShopProfiles();
    const active = hasSavedShopProfile() ? getShopProfile() : null;
    if (profileSelect) {
      profileSelect.innerHTML = '<option value="">Choose a shop profile</option>' + profiles.map(profile =>
        `<option value="${escapeHTML(profile.name)}">${escapeHTML(profile.name)} (${escapeHTML(profile.category)})</option>`
      ).join("");
      profileSelect.value = active?.name || "";
      profileSelect.hidden = profiles.length === 0;
    }
    if (createProfileButton) createProfileButton.textContent = profiles.length ? "+ Create New Profile" : "+ Create First Profile";
    const editing = editingOriginalName !== null;
    shopProfileForm.hidden = !editing;
    if (profileSummary) {
      profileSummary.hidden = editing || !active;
      if (active && !editing) {
        profileSummary.innerHTML = `
          <div class="saved-profile-heading"><div><p class="eyebrow">SAVED SHOP PROFILE</p><h3>${escapeHTML(active.name)}</h3></div>
            <div class="card-actions">
  <button type="button" class="secondary-button" id="editShopProfileButton">Edit Profile</button>
  <button type="button" class="danger-button" id="deleteShopProfileButton">Delete Shop</button>
</div>
          <p>${escapeHTML(active.description)}</p>
          <div class="shop-profile-details">
            <p><strong>Category:</strong> ${escapeHTML(active.category)}</p><p><strong>Address:</strong> ${escapeHTML(active.address)}</p>
            <p><strong>Phone:</strong> ${escapeHTML(active.phone || "Not provided")}</p><p><strong>Opening hours:</strong> ${escapeHTML(active.hours)}</p>
          </div>`;
        document.getElementById("editShopProfileButton")?.addEventListener("click", () => {
          editingOriginalName = active.name;
          fillShopProfileForm(active);
          saveProfileButton.textContent = "Save Changes";
          shopProfileForm.hidden = false;
          profileSummary.hidden = true;
          profileName.focus();
        });

        document.getElementById("deleteShopProfileButton")?.addEventListener("click", () => {
  const profiles = getShopProfiles();

  if (profiles.length <= 1) {
    alert("Keep at least one shop profile. Create another shop before deleting this one.");
    return;
  }

  const shopName = active.name;
  const shopKey = shopName.trim().toLowerCase();

  if (!confirm(
    `Delete "${shopName}"? This will also permanently delete its products and reservations. This cannot be undone.`
  )) return;

  const remainingProfiles = profiles.filter(
    profile => profile.name.trim().toLowerCase() !== shopKey
  );

  const remainingProducts = getProducts().filter(
    product => String(product.shop || "").trim().toLowerCase() !== shopKey
  );

  const remainingReservations = getReservations().filter(
    reservation => String(reservation.shop || "").trim().toLowerCase() !== shopKey
  );

  const oldProfiles = getShopProfiles();
  const oldProducts = getProducts();
  const oldReservations = getReservations();

  if (!saveProducts(remainingProducts)) return;

  if (!saveReservations(remainingReservations)) {
    saveProducts(oldProducts);
    alert("Could not delete the shop safely. Your previous products have been restored.");
    return;
  }

  if (!saveData(STORAGE_KEYS.profiles, remainingProfiles)) {
    saveProducts(oldProducts);
    saveReservations(oldReservations);
    alert("Could not delete the shop profile. Your previous data has been restored.");
    return;
  }

  const nextShop = remainingProfiles[0];

  if (!saveData(STORAGE_KEYS.activeProfile, nextShop.name)) {
    saveProducts(oldProducts);
    saveReservations(oldReservations);
    saveData(STORAGE_KEYS.profiles, oldProfiles);
    alert("Could not switch shops safely. Your previous data has been restored.");
    return;
  }

  editingOriginalName = null;
  renderShopProfileEditor();
  window.dispatchEvent(new Event("shoplocal:profile-saved"));

  alert(`"${shopName}" was deleted. Switched to "${nextShop.name}".`);
});

      } else if (!active && !editing) {
        profileSummary.innerHTML = "<p>No shop profile yet. Create one to start adding products.</p>";
        profileSummary.hidden = false;
      }
    }
    if (!editing) shopProfileForm.hidden = true;
  }

  profileSelect?.addEventListener("change", () => {
    const selected = profileSelect.value;
    if (!selected) return;
    saveData(STORAGE_KEYS.activeProfile, selected);
    editingOriginalName = null;
    renderShopProfileEditor();
    window.dispatchEvent(new Event("shoplocal:profile-saved"));
  });

  createProfileButton?.addEventListener("click", () => {
    editingOriginalName = null;
    clearProfileForm();
    profileSummary.hidden = true;
    shopProfileForm.hidden = false;
    saveProfileButton.textContent = "Create Shop Profile";
    profileName.focus();
  });

  shopProfileForm.addEventListener("submit", event => {
    event.preventDefault();
    const newName = profileName.value.trim();
    const profile = { name: newName, category: profileCategory.value, address: profileAddress.value.trim(), phone: profilePhone.value.trim(), hours: profileHours.value.trim(), description: profileDescription.value.trim() };
    if (!profile.name || !profile.address || !profile.hours || !profile.description) {
      alert("Please complete the shop name, address, opening hours, and description."); return;
    }
    const profiles = getShopProfiles();
    const duplicate = profiles.some(item => String(item.name).toLowerCase() === newName.toLowerCase() && String(item.name).toLowerCase() !== String(editingOriginalName || "").toLowerCase());
    if (duplicate) { alert("A profile with this shop name already exists. Choose a different name."); return; }
    const oldName = editingOriginalName;
    if (!saveShopProfile(profile, oldName)) return;
    if (oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      const products = getProducts(); let changed = false;
      products.forEach(item => { if (String(item.shop || "").toLowerCase() === oldName.toLowerCase()) { item.shop = newName; changed = true; } });
      if (changed) saveProducts(products);
      const reservations = getReservations(); let changedReservations = false;
      reservations.forEach(item => { if (String(item.shop || "").toLowerCase() === oldName.toLowerCase()) { item.shop = newName; changedReservations = true; } });
      if (changedReservations) saveReservations(reservations);
    }
    editingOriginalName = null;
    renderShopProfileEditor();
    window.dispatchEvent(new Event("shoplocal:profile-saved"));
    alert(oldName ? "Shop profile updated!" : "New shop profile created!");
  });

  renderShopProfileEditor();
}

// ---------------- SHOPKEEPER DASHBOARD ----------------

const productForm = document.getElementById("productForm");

if (productForm) {
  const editingProductId = document.getElementById("editingProductId");
  const productName = document.getElementById("productName");
  const productCategory = document.getElementById("productCategory");
  const productPrice = document.getElementById("productPrice");
  const productCostPrice = document.getElementById("productCostPrice");
  const productStock = document.getElementById("productStock");
  const inventoryList = document.getElementById("inventoryList");
  const reservationList = document.getElementById("shopkeeperReservationList");
  const submitButton = productForm.querySelector('button[type="submit"]');

  function getRequiredProductCategory() {
    if (!hasSavedShopProfile()) return null;
    const category = String(getShopProfile().category || "").trim().toLowerCase();
    const map = {
      "stationery": "Stationery",
      "electronics": "Electronics",
      "food and grocery": "Food",
      "food": "Food",
      "household": "Household"
    };
    return map[category] || null;
  }

  function syncProductCategoryOptions() {
    const requiredCategory = getRequiredProductCategory();
    [...productCategory.options].forEach(option => {
      if (!option.value) return;
      option.disabled = Boolean(requiredCategory && option.value !== requiredCategory);
      option.hidden = Boolean(requiredCategory && option.value !== requiredCategory);
    });
    if (requiredCategory) productCategory.value = requiredCategory;
  }

  // The demo starts with sample products from other shops; this dashboard manages only this profile's shop.
  // New products added here belong to the same demo shop.
  function getMyShopProducts() {
    const profile = getShopProfile();
    if (!hasSavedShopProfile(profile.name)) return [];
    const requiredCategory = categoryForShopProfile(profile, null);
    const categoryIsSpecific = ["Stationery", "Electronics", "Food", "Household"].includes(requiredCategory);
    return getProducts().filter(product =>
      profileMatchesProductShop(profile, product) &&
      (!categoryIsSpecific || product.category === requiredCategory)
    );
  }

  function getMyShopReservations() {
    const profile = getShopProfile();
    if (!hasSavedShopProfile()) return [];
    return getReservations().filter(reservation =>
      String(reservation.shop || "").trim().toLowerCase() === String(profile.name || "").trim().toLowerCase()
    );
  }

  function updateShopkeeperStats() {
    const products = getMyShopProducts();
    const reservations = getMyShopReservations();
    const totalProducts = document.getElementById("totalProducts");
    const lowStockProducts = document.getElementById("lowStockProducts");
    const pendingReservations = document.getElementById("pendingReservations");
    if (totalProducts) totalProducts.textContent = String(products.length);
    if (lowStockProducts) lowStockProducts.textContent = String(products.filter(product => Number(product.stock) <= 5).length);
    if (pendingReservations) pendingReservations.textContent = String(reservations.filter(item => item.status === "Pending").length);
    const completedReservations = reservations.filter(
      item => item.status === "Completed"
    );

    const completedSalesCount = document.getElementById("completedSalesCount");
    const completedSalesRevenue = document.getElementById("completedSalesRevenue");
    const completedSalesUnits = document.getElementById("completedSalesUnits");

    if (completedSalesCount) {
      completedSalesCount.textContent = String(completedReservations.length);
    }

    if (completedSalesRevenue) {
      const revenue = completedReservations.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
      completedSalesRevenue.textContent = money(revenue);
    }

    if (completedSalesUnits) {
      completedSalesUnits.textContent = String(
        completedReservations.reduce(
          (total, item) => total + Number(item.quantity),
          0
        )
      );
    }
  }

  function renderInventory() {
    const products = getMyShopProducts();
    updateShopkeeperStats();

    if (products.length === 0) {
      inventoryList.innerHTML = "<p>No products for this shop yet. Create your shop profile, then add your first product.</p>";
      return;
    }

    inventoryList.innerHTML = products.map(product => `
      <article class="inventory-card">
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.category)} · ${escapeHTML(product.shop)}</p>
        <p>Price: <strong>${money(product.price)}</strong></p>
        <p>Stock:
          ${Number(product.stock) < 1
            ? '<strong class="stock-label out">Out of stock</strong>'
            : Number(product.stock) <= 5
              ? `<strong class="stock-label low">Low stock · ${Number(product.stock)} left</strong>`
              : `<strong class="stock-label">${Number(product.stock)} available</strong>`}
        </p>
        <div class="card-actions">
          <button class="secondary-button" data-edit="${escapeHTML(product.id)}">Edit</button>
          <button class="danger-button" data-delete="${escapeHTML(product.id)}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  function renderProSalesAnalytics() {
  const panel = document.getElementById("proAnalyticsPanel");
  if (!panel) return;

  const reservations = getMyShopReservations();
  const now = new Date();

  const currentStart = new Date(
    now.getFullYear(), now.getMonth(), 1
  );

  const lastStart = new Date(
    now.getFullYear(), now.getMonth() - 1, 1
  );

  const lastEnd = new Date(
    now.getFullYear(), now.getMonth(), 1
  );

  const completedSales = reservations.filter(reservation =>
    reservation.status === "Completed" &&
    reservation.completedAt &&
    Number.isFinite(Date.parse(reservation.completedAt))
  );

  function isInRange(reservation, start, end) {
    const date = new Date(reservation.completedAt);
    return date >= start && date < end;
  }

  function getRevenue(items) {
    return items.reduce((total, reservation) => {
      return total +
        Number(reservation.price || 0) *
        Number(reservation.quantity || 0);
    }, 0);
  }

  function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  }

  const lastMonthItems = completedSales.filter(item =>
    isInRange(item, lastStart, lastEnd)
  );

  const currentMonthItems = completedSales.filter(item =>
    isInRange(item, currentStart, new Date(
      now.getFullYear(), now.getMonth() + 1, 1
    ))
  );

  document.getElementById("lastMonthSales").textContent =
    formatMoney(getRevenue(lastMonthItems));

  document.getElementById("lastMonthOrders").textContent =
    `${lastMonthItems.length} completed orders`;

  document.getElementById("currentMonthSales").textContent =
    formatMoney(getRevenue(currentMonthItems));

  document.getElementById("currentMonthOrders").textContent =
    `${currentMonthItems.length} completed orders`;

  // Profit & Loss — all dated completed reservations
  const revenue = getRevenue(completedSales);

  const reservationsWithCost = completedSales.filter(reservation =>
    Number.isFinite(Number(reservation.costPrice)) &&
    reservation.costPrice !== null &&
    reservation.costPrice !== undefined &&
    Number(reservation.costPrice) >= 0
  );

  const costs = reservationsWithCost.reduce((total, reservation) => {
    return total +
      Number(reservation.costPrice) *
      Number(reservation.quantity || 0);
  }, 0);

  const grossProfit = revenue - costs;
  const missingCostCount = completedSales.length - reservationsWithCost.length;

  document.getElementById("profitRevenue").textContent =
    formatMoney(revenue);

  document.getElementById("profitCosts").textContent =
    formatMoney(costs);

  document.getElementById("grossProfit").textContent =
    formatMoney(grossProfit);

  const profitMessage = document.getElementById("profitMessage");

  if (missingCostCount > 0) {
    profitMessage.textContent =
      `${missingCostCount} completed order(s) have no saved cost price. Gross profit uses only orders with known costs; revenue shows all completed sales.`;
  } else {
    profitMessage.textContent =
      "Gross profit = revenue from orders with known costs minus their product costs. This excludes other business expenses.";
  }

  const chart = document.getElementById("salesChart");
  const message = document.getElementById("salesChartMessage");

  chart.replaceChildren();

  const monthName = currentStart.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  message.textContent = currentMonthItems.length
    ? `Recorded sales for ${monthName}.`
    : `No dated completed sales recorded for ${monthName} yet.`;

  const daysInMonth = new Date(
    currentStart.getMonth() + 1,
    currentStart.getFullYear(),
    0
  ).getDate();

  const dailySales = Array(daysInMonth).fill(0);

  currentMonthItems.forEach(reservation => {
    const date = new Date(reservation.completedAt);
    dailySales[date.getDate() - 1] +=
      Number(reservation.price || 0) *
      Number(reservation.quantity || 0);
  });

  const maxSales = Math.max(...dailySales, 1);

  dailySales.forEach((amount, index) => {
    const column = document.createElement("div");
    column.className = "sales-bar-column";

    const bar = document.createElement("div");
    bar.className = "sales-bar";
    bar.style.height = `${Math.max(
      amount > 0 ? 4 : 0,
      (amount / maxSales) * 100
    )}%`;

    bar.title = `${monthName} ${index + 1}: ${formatMoney(amount)}`;

    const label = document.createElement("span");
    label.className = "sales-bar-label";
    label.textContent = index + 1;

    column.append(bar, label);
    chart.appendChild(column);
  });
}

  function renderShopkeeperReservations() {
    const reservations = getMyShopReservations();
    renderProSalesAnalytics();
    updateShopkeeperStats();

    if (reservations.length === 0) {
      reservationList.innerHTML = "<p>No customer reservation requests yet.</p>";
      return;
    }

    reservationList.innerHTML = reservations.map(reservation => `
      <article class="reservation-card">
        <h3>${escapeHTML(reservation.productName)}</h3>
        <p>Quantity requested: ${reservation.quantity}</p>
        <p>Customer total: ${money(reservation.price * reservation.quantity)}</p>
        <p>Status: <strong>${escapeHTML(reservation.status)}</strong></p>
        <div class="card-actions">
          ${reservation.status === "Pending" ? `
            <button class="primary-button" data-approve="${escapeHTML(reservation.id)}">Approve</button>
            <button class="danger-button" data-reject="${escapeHTML(reservation.id)}">Decline</button>
          ` : reservation.status === "Approved" ? `
            <button class="primary-button" data-complete="${escapeHTML(reservation.id)}">
              Mark Completed
            </button>
          ` : ""}
        </div>
      </article>
    `).join("");
  }

  function resetProductForm() {
    productForm.reset();
    editingProductId.value = "";
    submitButton.textContent = "Add Product";
  }

  productForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!hasSavedShopProfile()) {
      alert("Create and save your shop profile first. Then add products to that shop.");
      document.getElementById("shopProfileForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const name = productName.value.trim();
    const category = productCategory.value;
    const price = Number(productPrice.value);
    const costPrice = Number(productCostPrice.value);
    const stock = Number(productStock.value);
    const editId = editingProductId.value;

   if (
  !name ||
  !category ||
  !Number.isFinite(price) ||
  price <= 0 ||
  !Number.isFinite(costPrice) ||
  costPrice < 0 ||
  !Number.isInteger(stock) ||
  stock < 0
) {
  alert("Please enter a valid name, category, selling price, cost price, and whole-number stock quantity.");
  return;
}

    const requiredCategory = getRequiredProductCategory();
    if (requiredCategory && category !== requiredCategory) {
      alert(`This shop is categorized as ${getShopProfile().category}. Add only ${requiredCategory} products to this shop.`);
      productCategory.value = requiredCategory;
      return;
    }

    const products = getProducts();

    if (editId) {
      const index = products.findIndex(product => product.id === editId);
      if (index === -1) {
        alert("That product could not be found. Please refresh and try again.");
        resetProductForm();
        return;
      }

      products[index] = {
        ...products[index],
        name,
        category,
        price,
        costPrice,
        stock
      };
    } else {
      products.push({
        id: makeId(),
        name,
        category,
        price,
        costPrice,
        stock,
        shop: getShopProfile().name || "My Demo Shop"
      });
    }

    if (saveProducts(products)) {
      resetProductForm();
      renderInventory();
      alert(editId ? "Product updated!" : "Product added!");
    }
  });

  inventoryList.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
      const product = getProducts().find(item => item.id === editButton.dataset.edit);
      if (!product) return;

      editingProductId.value = product.id;
      productName.value = product.name;
      productCategory.value = product.category;
      productPrice.value = product.price;
      productStock.value = product.stock;
      productCostPrice.value = product.costPrice ?? "";
      submitButton.textContent = "Save Changes";

      productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (deleteButton) {
      const id = deleteButton.dataset.delete;
      const product = getProducts().find(item => item.id === id);
      if (!product) return;

      if (!confirm(`Delete "${product.name}" from the demo inventory?`)) return;

      const updated = getProducts().filter(item => item.id !== id);

      if (saveProducts(updated)) {
        renderInventory();
      }
    }
  });

  reservationList.addEventListener("click", event => {
  const approveButton = event.target.closest("[data-approve]");
  const rejectButton = event.target.closest("[data-reject]");
  const completeButton = event.target.closest("[data-complete]");

  if (!approveButton && !rejectButton && !completeButton) return;

  const id = approveButton?.dataset.approve ||
    rejectButton?.dataset.reject ||
    completeButton?.dataset.complete;

  const reservations = getReservations();
  const reservation = reservations.find(item => item.id === id);

  if (!reservation) return;

  if (completeButton) {
    if (reservation.status !== "Approved") return;

    if (!confirm("Mark this reservation as Completed and record the sale?")) {
      return;
    }

    const soldProduct = getProducts().find(
  item => item.id === reservation.productId
);

if (
  reservation.costPrice === null ||
  reservation.costPrice === undefined
) {
  reservation.costPrice = soldProduct
    ? Number(soldProduct.costPrice)
    : null;
}

  reservation.status = "Completed";
reservation.completedAt = new Date().toISOString();

const history = readData(STORAGE_KEYS.salesHistory, []);
const alreadyRecorded = history.some(
  sale => sale.reservationId === reservation.id
);

if (!alreadyRecorded) {
  const soldProduct = getProducts().find(
    item => item.id === reservation.productId
  );

  history.push({
    id: makeId(),
    reservationId: reservation.id,
    shop: reservation.shop,
    productId: reservation.productId,
    productName: reservation.productName || soldProduct?.name || "Product",
    quantity: Number(reservation.quantity),
    unitPrice: Number(reservation.price),
    costPrice: Number(reservation.costPrice),
    total: Number(reservation.price) * Number(reservation.quantity),
    completedAt: reservation.completedAt
  });
 if (!saveData(STORAGE_KEYS.salesHistory, history)) {
    reservation.status = "Approved";
    delete reservation.completedAt;
    return;
  }

  // Refresh the graph and sales history AFTER saving.
  window.dispatchEvent(new Event("shoplocal:sale-recorded"));
  window.dispatchEvent(new Event("shoplocal:sales-history-updated"));
}

if (saveReservations(reservations)) {
  renderShopkeeperReservations();
  renderInventory();
  alert("Sale recorded! Your Sales Overview has been updated.");
}
    return;
  }

  if (reservation.status !== "Pending") return;

  if (approveButton) {
    const originalProducts = getProducts();
    const updatedProducts = originalProducts.map(item => ({ ...item }));
    const product = updatedProducts.find(
      item => item.id === reservation.productId
    );

    if (!product || Number(product.stock) < Number(reservation.quantity)) {
      alert("Not enough stock is available to approve this request.");
      return;
    }

    product.stock = Number(product.stock) - Number(reservation.quantity);

    if (!saveProducts(updatedProducts)) return;

    reservation.status = "Approved";

    if (!saveReservations(reservations)) {
      saveProducts(originalProducts);
      return;
    }

    renderShopkeeperReservations();
    renderInventory();
    alert("Reservation approved! Stock has been updated.");
    return;
  }

  if (rejectButton) {
    reservation.status = "Declined";

    if (saveReservations(reservations)) {
      renderShopkeeperReservations();
      alert("Reservation declined.");
    }
  }
});  

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE_KEYS.products ||
      event.key === STORAGE_KEYS.reservations ||
      event.key === STORAGE_KEYS.profile ||
      event.key === STORAGE_KEYS.profiles ||
      event.key === STORAGE_KEYS.activeProfile
    ) {
      renderInventory();
      renderShopkeeperReservations();
    }
  });

 window.addEventListener("shoplocal:profile-saved", () => {
  resetProductForm();
  syncProductCategoryOptions();
  renderInventory();
  renderShopkeeperReservations();
});

  syncProductCategoryOptions();
  renderInventory();
  renderShopkeeperReservations();
}

/* ==============================
   SHOPLOCAL HOMEPAGE INTERACTIONS
   ============================== */

(function initShopLocalHomepage() {
  const homePage = document.querySelector(".home-page");

  // Do nothing on customer.html or shopkeeper.html.
  if (!homePage) return;

  const customerTab = document.getElementById("homeCustomerTab");
  const shopkeeperTab = document.getElementById("homeShopkeeperTab");
  const journeyContent = document.getElementById("homeJourneyContent");

  if (!customerTab || !shopkeeperTab || !journeyContent) return;

  const journeys = {
    customer: {
      title: "Find what you need nearby.",
      description:
        "Browse products, compare prices and request reservations from participating shops.",
      steps: [
        ["STEP 01", "Discover", "Explore products and categories."],
        ["STEP 02", "Compare", "Review prices and stock details."],
        ["STEP 03", "Reserve", "Send a request for the shop to review."]
      ],
      button: "Open customer dashboard →",
      url: "customer.html"
    },

    shopkeeper: {
      title: "Bring your shop online.",
      description:
        "Manage product listings, update stock and respond to customer requests.",
      steps: [
        ["STEP 01", "List products", "Add product names, prices and stock."],
        ["STEP 02", "Manage inventory", "Edit listings and availability."],
        ["STEP 03", "Handle requests", "Review and respond to reservations."]
      ],
      button: "Open shopkeeper dashboard →",
      url: "shopkeeper.html"
    }
  };

  function showJourney(type) {
    const journey = journeys[type];

    customerTab.classList.toggle("active", type === "customer");
    shopkeeperTab.classList.toggle("active", type === "shopkeeper");

    customerTab.setAttribute("aria-pressed", String(type === "customer"));
    shopkeeperTab.setAttribute("aria-pressed", String(type === "shopkeeper"));

    journeyContent.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = journey.title;

    const description = document.createElement("p");
    description.textContent = journey.description;

    const stepsContainer = document.createElement("div");
    stepsContainer.className = "journey-steps";

    journey.steps.forEach(function (step) {
      const article = document.createElement("article");
      article.className = "journey-step";

      const number = document.createElement("span");
      number.className = "step-number";
      number.textContent = step[0];

      const title = document.createElement("strong");
      title.textContent = step[1];

      const details = document.createElement("p");
      details.textContent = step[2];

      article.append(number, title, details);
      stepsContainer.appendChild(article);
    });

    const action = document.createElement("div");
    action.className = "journey-action";

    const link = document.createElement("a");
    link.className = "primary-button";
    link.href = journey.url;
    link.textContent = journey.button;

    action.appendChild(link);
    journeyContent.append(heading, description, stepsContainer, action);
  }

  customerTab.addEventListener("click", function () {
    showJourney("customer");
  });

  shopkeeperTab.addEventListener("click", function () {
    showJourney("shopkeeper");
  });
}
)();

/* ==========================================
   SHOPLOCAL DEMO SUBSCRIPTIONS
   ========================================== */

(function initShopLocalSubscriptions() {
  const SUBSCRIPTION_KEY = "shoplocal_subscriptions_v1";

  const planNames = {
    free: "Free",
    basic: "Basic",
    pro: "Pro"
  };

  function shopKey(name) {
    return String(name || "").trim().toLowerCase();
  }

  function getSubscriptions() {
    const data = readData(SUBSCRIPTION_KEY, {});
    return data && typeof data === "object" && !Array.isArray(data)
      ? data
      : {};
  }

  function getSubscription(shopName) {
    const key = shopKey(shopName);
    const record = getSubscriptions()[key];

    if (!record || !["free", "basic", "pro"].includes(record.plan)) {
      return { plan: "free", expiresAt: null, expired: false };
    }

    if (
      record.plan !== "free" &&
      record.expiresAt &&
      Date.parse(record.expiresAt) <= Date.now()
    ) {
      return { plan: "free", expiresAt: null, expired: true };
    }

    return { ...record, expired: false };
  }

  function shopHasPaidPlan(shopName) {
    const exists = getShopProfiles().some(
      profile => shopKey(profile.name) === shopKey(shopName)
    );

    // Keep the prototype's original sample shops working.
    if (!exists) return true;

    const plan = getSubscription(shopName).plan;
    return plan === "basic" || plan === "pro";
  }

  function saveSubscription(shopName, plan) {
    const key = shopKey(shopName);
    if (!key || !["free", "basic", "pro"].includes(plan)) return false;

    const subscriptions = getSubscriptions();

    if (plan === "free") {
      subscriptions[key] = {
        plan: "free",
        expiresAt: null
      };
    } else {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      subscriptions[key] = {
        plan,
        expiresAt: expiry.toISOString()
      };
    }

    return saveData(SUBSCRIPTION_KEY, subscriptions);
  }

  // Expose a small, read-only helper for the customer dashboard.
  window.ShopLocalPlans = {
    getSubscription,
    shopHasPaidPlan
  };

  const panel = document.getElementById("subscriptionPanel");

  // The customer dashboard also loads this file, but has no plan panel.
  if (!panel) return;

  const status = document.getElementById("subscriptionStatus");
  const profileForm = document.getElementById("shopProfileForm");
  const productForm = document.getElementById("productForm");
  const inventory = document.getElementById("inventoryList");
  const reservations = document.getElementById("shopkeeperReservationList");

  function currentProfile() {
    const profile = getShopProfile();
    return hasSavedShopProfile(profile.name) ? profile : null;
  }

  function updatePlanPanel() {
    const profile = currentProfile();
    const buttons = panel.querySelectorAll("[data-demo-plan]");

    const planLabels = {
      free: "Free Plan",
      basic: "Activate Basic · ₹150/month",
      pro: "Activate Pro · ₹450/month"
    };

    buttons.forEach(button => {
      const selected = profile &&
        button.dataset.demoPlan === getSubscription(profile.name).plan;

      button.disabled = !profile;
      button.classList.toggle("primary-button", Boolean(selected));
      button.classList.toggle("secondary-button", !selected);

      button.textContent = selected
        ? `${planLabels[button.dataset.demoPlan].replace(/^Activate /, "")} · Current Plan`
        : planLabels[button.dataset.demoPlan];
    });

    if (!profile) {
      status.textContent =
        "Create and save a shop profile first. Your profile remains free.";
      setPaidFeaturesVisible(false);
      return;
    }

    const subscription = getSubscription(profile.name);
    const plan = subscription.plan;

    let message = `Current plan: ${planNames[plan]}.`;

    if (subscription.expired) {
      message =
        "Your previous demo subscription has expired. Paid features are locked; your shop profile remains available.";
    } else if (subscription.expiresAt) {
      message += ` Demo expiry: ${new Date(subscription.expiresAt).toLocaleDateString("en-IN")}.`;
    } else if (plan === "free") {
      message += " Only your digital shop profile is enabled.";
    }

    status.textContent = message;
    setPaidFeaturesVisible(plan === "basic" || plan === "pro");
  }

  function setPaidFeaturesVisible(enabled) {
  if (productForm) {
    productForm.closest("section").hidden = !enabled;
  }

  const stats = document.querySelector(".stats-grid");
  if (stats) stats.hidden = !enabled;

  const inventorySection = document.querySelector(".products-section");
  if (inventorySection) inventorySection.hidden = !enabled;

  const reservationSection = document.querySelector(".reservations-section");
  if (reservationSection) reservationSection.hidden = !enabled;

  const salesPanel = document.getElementById("salesOverview");
  if (salesPanel) salesPanel.hidden = !enabled;
  console.log("Sales panel visibility:",salesPanel?.hidden,"Enabled:",enabled)

  const proPanel = document.getElementById("proAnalyticsPanel");
  const profile = currentProfile();
  const plan = profile ? getSubscription(profile.name).plan : "free";

  if (proPanel) {
    proPanel.hidden = plan !== "pro";
  }
}

// Connect the subscription plan buttons.
  panel.addEventListener("click", event => {
    const button = event.target.closest("[data-demo-plan]");
    if (!button) return;

    event.preventDefault();

    const profile = currentProfile();

    if (!profile) {
      alert("Please create and save your shop profile first.");
      return;
    }

    const selectedPlan = button.dataset.demoPlan;

    if (!["free", "basic", "pro"].includes(selectedPlan)) return;

    const saved = saveSubscription(profile.name, selectedPlan);

    if (!saved) {
      alert("Could not save your plan. Please try again.");
      return;
    }

    updatePlanPanel();

    window.dispatchEvent(
      new CustomEvent("shoplocal:subscription-changed", {
        detail: {
          shopName: profile.name,
          plan: selectedPlan
        }
      })
    );

    alert(
      selectedPlan === "pro"
        ? "Demo Pro plan activated for 30 days!"
        : selectedPlan === "basic"
          ? "Demo Basic plan activated for 30 days!"
          : "Your Free plan is now active."
    );
  });
  // Block product creation/editing even if someone triggers the hidden form.
  document.addEventListener("submit", event => {
    if (event.target !== productForm) return;

    const profile = currentProfile();

    if (!profile || !shopHasPaidPlan(profile.name)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert("A Basic or Pro subscription is required to manage products.");
    }
  }, true);

  // Block inventory and reservation-management actions on the Free plan.
  document.addEventListener("click", event => {
    const target = event.target;

    const protectedAction = target.closest(
      "#inventoryList [data-edit], " +
      "#inventoryList [data-delete], " +
      "#shopkeeperReservationList [data-approve], " +
      "#shopkeeperReservationList [data-reject]"
    );

    if (!protectedAction) return;

    const profile = currentProfile();

    if (!profile || !shopHasPaidPlan(profile.name)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert("A Basic or Pro subscription is required for this action.");
    }
  }, true);

  window.addEventListener("shoplocal:profile-saved", updatePlanPanel);

  window.addEventListener("storage", event => {
    if (
      event.key === SUBSCRIPTION_KEY ||
      event.key === STORAGE_KEYS.profiles ||
      event.key === STORAGE_KEYS.activeProfile
    ) {
      updatePlanPanel();
    }
  });

  updatePlanPanel();
})();


/* =========================================
   SHOPLOCAL PRO: MARKET PRICE INTELLIGENCE
   ========================================= */

(function initMarketPriceIntelligence() {
  const panel = document.getElementById("marketPricePanel");

  // This feature belongs only on the shopkeeper dashboard.
  if (!panel) return;

  const results = document.getElementById("marketPriceResults");
  const summary = document.getElementById("marketPriceSummary");

  // Sample market prices for the six original demo products only.
  const demoMarketPrices = {
    p1: 50,   // Classmate Notebook
    p2: 8,    // Blue Ball Pen
    p3: 129,  // USB-C Cable
    p4: 349,  // Wireless Mouse
    p5: 20,   // Potato Chips
    p6: 179   // Reusable Water Bottle
  };

 function currentShopName() {
  const profile = getShopProfile(
    readData(STORAGE_KEYS.activeProfile, "")
  );

  if (!profile || !profile.name) return "";

  return String(profile.name).trim();
}

  function renderMarketPrices() {
    const shopName = currentShopName();

    // Market prices are available to Pro shops only.
    const plans = window.ShopLocalPlans;

    if (!shopName || !plans) {
  console.log("Market panel hidden:", {
    shopName: shopName,
    plansAvailable: !!plans
  });
  panel.hidden = true;
  return;
}

    const subscription = plans.getSubscription(shopName);

    if (
      !subscription ||
      subscription.plan !== "pro" ||
      subscription.expired
    ) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;

    // Only original demo products belonging to this shop
    // and currently in stock are included.
    const products = getProducts().filter(product =>
  String(product.shop || "").trim().toLowerCase() ===
    shopName.trim().toLowerCase() &&
  Number(product.stock) > 0
);

    if (products.length === 0) {
      summary.innerHTML = "";
      results.innerHTML =
        "<p>No available demo products found in this shop.</p>";
      return;
    }

    let lowerCount = 0;
    let higherCount = 0;

    results.innerHTML = products.map(product => {
      const sellingPrice = Number(product.price);
      const marketPrice = demoMarketPrices[product.id];

      if (marketPrice === undefined) {
  return `
    <article class="inventory-card">
      <p class="eyebrow">SHOP INVENTORY</p>
      <h3>${escapeHTML(product.name)}</h3>
      <p>Available stock: <strong>${Number(product.stock)}</strong></p>
      <p>Your selling price:
        <strong>₹${Number(product.price).toFixed(2)}</strong>
      </p>
      <p>Sample market price: Not available for this product.</p>
      <p>No sample-based selling-price recommendation is available.</p>
    </article>
  `;
}

      // Recommendation balances the shop's current price
      // with the sample market price.
      const recommendedPrice = Math.round(
        ((sellingPrice + marketPrice) / 2) * 100
      ) / 100;

      const difference = sellingPrice - marketPrice;

      let comparison;

      if (difference > 0) {
        higherCount++;
        comparison =
          `₹${difference.toFixed(2)} above sample market price`;
      } else if (difference < 0) {
        lowerCount++;
        comparison =
          `₹${Math.abs(difference).toFixed(2)} below sample market price`;
      } else {
        comparison = "Same as sample market price";
      }

      return `
        <article class="inventory-card">
          <p class="eyebrow">DEMO MARKET DATA</p>
          <h3>${escapeHTML(product.name)}</h3>
          <p>Available stock: <strong>${Number(product.stock)}</strong></p>
          <p>Your selling price:
            <strong>₹${sellingPrice.toFixed(2)}</strong>
          </p>
          <p>Sample market price:
            <strong>₹${marketPrice.toFixed(2)}</strong>
          </p>
          <p>${comparison}</p>
          <p>Recommended selling price:
            <strong>₹${recommendedPrice.toFixed(2)}</strong>
          </p>
        </article>
      `;
    }).join("");

    summary.innerHTML = `
      <article class="stat-card">
        <p>Available demo products</p>
        <strong>${products.length}</strong>
      </article>
      <article class="stat-card">
        <p>Priced above market</p>
        <strong>${higherCount}</strong>
      </article>
      <article class="stat-card">
        <p>Priced below market</p>
        <strong>${lowerCount}</strong>
      </article>
    `;
  }

  // Refresh when inventory, shop profile or subscription changes.
  window.addEventListener("shoplocal:profile-saved", () => {
  renderMarketPrices();
});

  // Keep market panel in sync with the active Pro plan.

  window.addEventListener("storage", event => {
    if (
      event.key === "shoplocal_products_v1" ||
      event.key === "shoplocal_shop_profiles_v1" ||
      event.key === "shoplocal_active_shop_profile_v1" ||
      event.key === "shoplocal_subscriptions_v1"
    ) {
      renderMarketPrices();
    }
  });

  // Refresh when the shopkeeper edits inventory on this page.
  const inventory = document.getElementById("inventoryList");

  if (inventory) {
    inventory.addEventListener("click", () => {
      setTimeout(renderMarketPrices, 100);
    });
  }

  const productForm = document.getElementById("productForm");

  if (productForm) {
    productForm.addEventListener("submit", () => {
      setTimeout(renderMarketPrices, 100);
    });
  }

  renderMarketPrices();
})();

(function initSalesHistory() {
  const panel = document.getElementById("salesHistoryPanel");
  if (!panel) return;

  const searchInput = document.getElementById("salesHistorySearch");
  const dateInput = document.getElementById("salesHistoryDate");
  const list = document.getElementById("salesHistoryList");

  if (!searchInput || !dateInput || !list) return;

  function getActiveShopName() {
    const activeId = readData(STORAGE_KEYS.activeProfile, "");
    const profile = getShopProfile(activeId);

    return profile && hasSavedShopProfile(profile.name)
      ? String(profile.name).trim()
      : "";
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function render() {
    const shopName = getActiveShopName().toLowerCase();
    const search = searchInput.value.trim().toLowerCase();
    const selectedDate = dateInput.value;

    const savedSales = readData(STORAGE_KEYS.salesHistory, []);
    const sales = (Array.isArray(savedSales) ? savedSales : [])
      .filter(sale =>
        String(sale.shop || "").trim().toLowerCase() === shopName
      )
      .filter(sale =>
        String(sale.productName || "").toLowerCase().includes(search)
      )
      .filter(sale => {
        if (!selectedDate) return true;

        const date = new Date(sale.completedAt);
        if (Number.isNaN(date.getTime())) return false;

        const localDate = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0")
        ].join("-");

        return localDate === selectedDate;
      })
      .sort((a, b) =>
        Date.parse(b.completedAt) - Date.parse(a.completedAt)
      );

    list.replaceChildren();

    if (sales.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 5;
      cell.textContent = search || selectedDate
        ? "No matching transactions found."
        : "No sales recorded yet.";

      row.appendChild(cell);
      list.appendChild(row);
      return;
    }

    sales.forEach(sale => {
      const row = document.createElement("tr");

      const values = [
        formatDate(sale.completedAt),
        sale.productName || "Product",
        String(Number(sale.quantity) || 0),
        formatMoney(sale.unitPrice),
        formatMoney(sale.total)
      ];

      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      list.appendChild(row);
    });
  }

  searchInput.addEventListener("input", render);
  dateInput.addEventListener("change", render);

  window.addEventListener("shoplocal:profile-saved", render);
  window.addEventListener("shoplocal:sales-history-updated", render);

  render();
})();

(function initSalesGraph() {
  const svg = document.getElementById("salesGraph");
  const summary = document.getElementById("salesGraphSummary");

  if (!svg || !summary) return;

  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs = {}, text = "") {
    const node = document.createElementNS(NS, tag);

    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });

    if (text !== "") node.textContent = text;
    return node;
  }

  function render() {
    const activeId = readData(STORAGE_KEYS.activeProfile, "");
    const profile = getShopProfile(activeId);
    const shopName = String(profile?.name || "").trim().toLowerCase();

    const stored = readData(STORAGE_KEYS.salesHistory, []);
    const sales = (Array.isArray(stored) ? stored : []).filter(sale =>
      String(sale.shop || "").trim().toLowerCase() === shopName
    );

    // Show the most recent seven calendar days.
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");

      days.push({
        key,
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        }),
        revenue: 0,
        count: 0
      });
    }

    const byDate = new Map(days.map(day => [day.key, day]));

    sales.forEach(sale => {
      const date = new Date(sale.completedAt);
      if (Number.isNaN(date.getTime())) return;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");

      const day = byDate.get(key);
      if (!day) return;

      // Adjust these field names if your sale records use different ones.
      const amount = Number(
        sale.totalAmount ?? sale.total ?? sale.amount ?? 0
      );

      day.revenue += Number.isFinite(amount) ? amount : 0;
      day.count += 1;
    });

    const totalRevenue = sales.reduce((sum, sale) => {
      const amount = Number(
        sale.totalAmount ?? sale.total ?? sale.amount ?? 0
      );
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    summary.replaceChildren();

    [
      ["Total revenue", "₹" + totalRevenue.toFixed(2)],
      ["Completed sales", String(sales.length)],
      ["Last 7 days", "₹" + days.reduce((sum, day) =>
        sum + day.revenue, 0
      ).toFixed(2)]
    ].forEach(([label, value]) => {
      const card = document.createElement("article");
      card.className = "stat-card";

      const p = document.createElement("p");
      p.textContent = label;

      const strong = document.createElement("strong");
      strong.textContent = value;

      card.append(p, strong);
      summary.appendChild(card);
    });

    svg.replaceChildren();

    const W = 700;
    const H = 300;
    const left = 55;
    const right = 15;
    const top = 20;
    const bottom = 45;
    const chartW = W - left - right;
    const chartH = H - top - bottom;
    const maxValue = Math.max(
      1,
      ...days.map(day => day.revenue)
    ) * 1.15;

    // Horizontal grid and revenue labels.
    for (let i = 0; i <= 4; i++) {
      const y = top + chartH * i / 4;
      const value = maxValue * (4 - i) / 4;

      svg.appendChild(el("line", {
        x1: left, y1: y, x2: W - right, y2: y,
        class: "chart-grid"
      }));

      svg.appendChild(el("text", {
        x: left - 8, y: y + 4,
        "text-anchor": "end",
        class: "chart-label"
      }, "₹" + value.toFixed(0)));
    }

    const slot = chartW / days.length;
    const barW = slot * 0.52;

    days.forEach((day, i) => {
      const height = day.revenue / maxValue * chartH;
      const x = left + i * slot + (slot - barW) / 2;
      const y = top + chartH - height;

      const bar = el("rect", {
        x, y, width: barW,
        height: Math.max(0, height),
        rx: 5,
        class: "chart-bar"
      });

      bar.appendChild(el("title", {},
        `${day.label}: ₹${day.revenue.toFixed(2)} (${day.count} sales)`
      ));

      svg.appendChild(bar);

      svg.appendChild(el("text", {
        x: left + i * slot + slot / 2,
        y: H - 15,
        "text-anchor": "middle",
        class: "chart-label"
      }, day.label));
    });

    if (sales.length === 0) {
      svg.appendChild(el("text", {
        x: W / 2,
        y: H / 2,
        "text-anchor": "middle",
        class: "chart-label"
      }, "No completed sales yet"));
    }
  }

  window.addEventListener("storage", render);
  window.addEventListener("shoplocal:sale-recorded", render);
  window.addEventListener("shoplocal:profile-saved", render);

  // Refresh after sales are added on this page.
  window.addEventListener("focus", render);

  render();

  // Make refreshing available to the existing sale-recording code.
  window.refreshShopLocalSalesGraph = render;
})();