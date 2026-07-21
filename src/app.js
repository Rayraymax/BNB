import {
  createInquiry,
  currentUser,
  deleteBooking,
  deleteRoom,
  deleteService,
  getContent,
  isSupabaseConfigured,
  rangesOverlap,
  saveBooking,
  saveRoom,
  saveService,
  saveSettings,
  signIn,
  signOut,
  slugify,
  uploadMedia
} from "./lib/db.js";
import { lodgingJsonLd, roomJsonLd, serviceJsonLd, setSeo } from "./lib/seo.js";
import { roomBookingMessage, serviceOrderMessage, whatsappUrl } from "./lib/whatsapp.js";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const header = document.querySelector("#site-header");
const nav = document.querySelector("[data-nav]");
let store = null;
let user = null;
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  renderInstallBanner();
});

window.addEventListener("popstate", render);
window.addEventListener("bnb:data-changed", async () => {
  store = await getContent();
  render();
});

document.addEventListener("click", async (event) => {
  const link = event.target.closest("[data-link]");
  if (link) {
    const url = new URL(link.href);
    if (url.origin === location.origin) {
      event.preventDefault();
      go(url.pathname);
      nav.classList.remove("open");
    }
  }

  if (event.target.closest("[data-nav-toggle]")) {
    nav.classList.toggle("open");
  }

  const installButton = event.target.closest("[data-install-app]");
  if (installButton && deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt = null;
    renderInstallBanner(false);
  }
});

async function init() {
  store = await getContent();
  user = await currentUser();
  hydrateChrome();
  render();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
}

function go(path) {
  history.pushState({}, "", path);
  render();
  app.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: "smooth" });
}

function hydrateChrome() {
  document.querySelectorAll("[data-brand-name]").forEach((node) => {
    node.textContent = store.settings.shortName || store.settings.name;
  });
  document.querySelector("[data-whatsapp-global]").href = whatsappUrl(
    store.settings.whatsapp,
    `Hello ${store.settings.shortName || store.settings.name}, I have a question about booking.`
  );
  renderFooter();
}

function renderFooter() {
  document.querySelector("[data-footer]").innerHTML = `
    <div class="footer-grid">
      <section>
        <h2>${esc(store.settings.name)}</h2>
        <p>${esc(store.settings.metaDescription)}</p>
      </section>
      <section>
        <h2>Explore</h2>
        <a href="/rooms" data-link>Rooms</a>
        <a href="/services" data-link>Services</a>
        <a href="/about" data-link>About and hosts</a>
      </section>
      <section>
        <h2>Reach us</h2>
        <a href="/contact" data-link>Contact and map</a>
        <a href="${whatsappUrl(store.settings.whatsapp, "Hello, I would like help with a stay.")}">Chat on WhatsApp</a>
        <a href="/auth" data-link>Owner login</a>
      </section>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(store.settings.name)}, Nairobi.</span>
      <span>Built for Supabase, Netlify and WhatsApp booking.</span>
    </div>
  `;
}

function render() {
  hydrateChrome();
  setActiveNav();
  const parts = location.pathname.split("/").filter(Boolean);
  const [section, slug] = parts;

  if (!section) return renderHome();
  if (section === "rooms" && slug) return renderRoomDetail(slug);
  if (section === "rooms") return renderRooms();
  if (section === "services" && slug) return renderServiceDetail(slug);
  if (section === "services") return renderServices();
  if (section === "about") return renderAbout();
  if (section === "contact") return renderContact();
  if (section === "auth") return renderAuth();
  if (section === "admin") return renderAdmin(parts[1] || "dashboard");
  renderNotFound();
}

function setActiveNav() {
  document.querySelectorAll(".main-nav a").forEach((item) => {
    const url = new URL(item.href);
    item.classList.toggle("active", url.pathname === location.pathname);
  });
  header.classList.toggle("admin-open", location.pathname.startsWith("/admin"));
}

function renderHome() {
  const settings = store.settings;
  const rooms = published(store.rooms);
  const services = published(store.services).slice(0, 3);
  setSeo({
    title: `${settings.name} | Roysambu Serviced Apartments`,
    description: settings.metaDescription,
    image: settings.coverImage,
    canonical: "/",
    jsonLd: lodgingJsonLd(settings)
  });

  app.innerHTML = `
    <section class="hero">
      ${settings.coverVideo ? `<video class="hero-media" autoplay muted loop playsinline poster="${esc(settings.coverImage)}"><source src="${esc(settings.coverVideo)}" type="video/mp4"></video>` : `<img class="hero-media" src="${esc(settings.coverImage)}" alt="${esc(settings.name)} serviced apartment exterior" />`}
      <div class="hero-shade"></div>
      <div class="hero-content page-pad">
        <p class="eyebrow">Luxury serviced stays in Roysambu</p>
        <h1>${esc(settings.tagline)}</h1>
        <p>${esc(settings.about.split(". ").slice(0, 2).join(". "))}.</p>
        <div class="button-row">
          <a class="button light" href="/rooms" data-link>Explore rooms</a>
          <a class="button accent" href="${whatsappUrl(settings.whatsapp, `Hello ${settings.shortName}, I would like to book a stay.`)}">Book on WhatsApp</a>
        </div>
        <form class="hero-booking" data-hero-booking>
          <label>Check in <input name="startDate" type="date" required /></label>
          <label>Check out <input name="endDate" type="date" required /></label>
          <label>Guests <input name="guests" type="number" min="1" value="2" required /></label>
          <label>Room <select name="roomId">${rooms.map((room) => `<option value="${esc(room.id)}">${esc(room.name)}</option>`).join("")}</select></label>
          <button class="button accent" type="submit">Search</button>
        </form>
        <div class="availability-dots" aria-label="Live availability preview">
          ${availabilityDots().map((dot) => `<span class="${dot}"></span>`).join("")}
          <small>next 14 nights, live availability</small>
        </div>
      </div>
    </section>

    <section class="section page-pad why-luxury">
      <div class="why-luxury-head">
        <p class="eyebrow">Why guests love staying with us</p>
        <h2>Comfort, convenience and exceptional hospitality designed to make every stay memorable.</h2>
      </div>
      <div class="why-luxury-grid">
        ${settings.whyChoose.map((item) => `
          <article>
            <span class="why-icon" aria-hidden="true">${iconGlyph(item.icon)}</span>
            <div>
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.text)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section page-pad">
      <div class="section-head">
        <div>
          <p class="eyebrow">Stay</p>
          <h2>The two rooms</h2>
        </div>
        <a class="text-link" href="/rooms" data-link>View all rooms</a>
      </div>
      <div class="room-grid">
        ${rooms.map(roomCard).join("")}
      </div>
    </section>

    <section class="section page-pad services-strip">
      <div class="section-head">
        <div>
          <p class="eyebrow">Beyond the room</p>
          <h2>Services, on request</h2>
          <p>Cleaning, laundry, groceries, airport transfers and more, ordered straight from WhatsApp.</p>
        </div>
        <a class="button ghost" href="/services" data-link>View all services</a>
      </div>
      <div class="service-grid">
        ${services.map(serviceCard).join("")}
      </div>
    </section>

    <section class="section page-pad story-band">
      <div class="story-copy">
        <p class="eyebrow">Our story</p>
        <h2>Comfort, convenience and hospitality that feels personal.</h2>
        <p>${esc(settings.story || settings.about)}</p>
      </div>
      <div class="story-stats">
        ${(settings.stats || []).map((item) => `<article><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`).join("")}
      </div>
    </section>

    <section class="section page-pad">
      <p class="eyebrow">What guests say</p>
      <h2>Recent stays</h2>
      <div class="testimonial-grid">
        ${store.testimonials.map((item) => `
          <blockquote>
            <div aria-label="5 star rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p>"${esc(item.quote)}"</p>
            <cite> ${esc(item.name)}</cite>
          </blockquote>
        `).join("")}
      </div>
    </section>

    ${locationBlock()}
  `;
  app.querySelector("[data-hero-booking]").addEventListener("submit", handleHeroBooking);
}

function renderRooms() {
  setSeo({
    title: `Rooms | ${store.settings.name}`,
    description: "Compare ALKEY Homes rooms in Roysambu and book directly on WhatsApp.",
    canonical: "/rooms",
    image: store.rooms[0]?.coverImage
  });

  app.innerHTML = `
    ${pageHero("Rooms", "Two serviced apartments in Roysambu, prepared for comfort and easy self check-in.", store.settings.coverImage)}
    <section class="section page-pad">
      <div class="room-grid">
        ${published(store.rooms).map(roomCard).join("")}
      </div>
    </section>
  `;
}

function renderRoomDetail(slug) {
  const room = store.rooms.find((item) => item.slug === slug);
  if (!room) return renderNotFound();
  const params = new URLSearchParams(location.search);
  setSeo({
    title: room.seoTitle || `${room.name} | ${store.settings.name}`,
    description: room.seoDescription || room.description,
    image: room.coverImage,
    canonical: `/rooms/${room.slug}`,
    jsonLd: roomJsonLd(room, store.settings)
  });

  app.innerHTML = `
    <section class="detail-hero page-pad">
      <div>
        <p class="eyebrow">Room</p>
        <h1>${esc(room.name)}</h1>
        <p>${esc(room.description)}</p>
        <div class="facts">
          <span>Sleeps ${esc(room.capacity)}</span>
          <span>${esc(room.size)}</span>
          <span>${esc(room.beds)}</span>
          <span>${esc(room.priceLabel)}</span>
        </div>
      </div>
      ${roomHeroMedia(room)}
    </section>
    <section class="section page-pad detail-layout">
      <div>
        <h2>Gallery</h2>
        <div class="gallery">
          ${(room.gallery || [room.coverImage]).map((image) => mediaTile(image, `${room.name} room photo`)).join("")}
        </div>
        <h2>Amenities</h2>
        <div class="pill-grid">
          ${(room.amenities || []).map((item) => `<span>${esc(item)}</span>`).join("")}
        </div>
      </div>
      <aside class="booking-panel">
        <h2>Book this room</h2>
        <p class="muted">Blocked dates cannot be selected. Confirmed bookings are also protected in Supabase with a no-overlap database rule.</p>
        ${availabilityCalendar(room)}
        <form data-room-booking="${esc(room.id)}" class="stack">
          <label>Check-in <input name="startDate" type="date" value="${esc(params.get("start") || "")}" required /></label>
          <label>Check-out <input name="endDate" type="date" value="${esc(params.get("end") || "")}" required /></label>
          <label>Guests <input name="guests" type="number" min="1" max="${esc(room.capacity)}" value="${esc(params.get("guests") || "1")}" required /></label>
          <label>Your name <input name="guestName" type="text" placeholder="Jane" /></label>
          <label>Phone <input name="guestPhone" type="tel" placeholder="+254..." /></label>
          <label>Note <textarea name="note" rows="3" placeholder="Arrival time, requests, questions"></textarea></label>
          <button class="button accent wide" type="submit">Book on WhatsApp</button>
          <p data-booking-error class="form-error"></p>
        </form>
      </aside>
    </section>
  `;

  app.querySelector("[data-room-booking]").addEventListener("submit", handleRoomBooking);
}

function renderServices() {
  const categories = [...new Set(published(store.services).map((service) => service.category))];
  setSeo({
    title: `Guest Services | ${store.settings.name}`,
    description: "Order laundry, cleaning, groceries, transfers and guest services directly on WhatsApp.",
    canonical: "/services",
    image: store.services[0]?.coverImage
  });

  app.innerHTML = `
    ${pageHero("Guest services", "Cleaning, groceries, transfers and extras without leaving WhatsApp.", "/assets/services/services.png")}
    <section class="section page-pad">
      <div class="tabs" role="tablist">
        <button class="active" data-service-filter="all">All</button>
        ${categories.map((category) => `<button data-service-filter="${esc(category)}">${title(category)}</button>`).join("")}
      </div>
      <div class="service-grid" data-service-list>
        ${published(store.services).map(serviceCard).join("")}
      </div>
    </section>
  `;

  app.querySelectorAll("[data-service-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      app.querySelectorAll("[data-service-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.serviceFilter;
      const list = filter === "all" ? published(store.services) : published(store.services).filter((service) => service.category === filter);
      app.querySelector("[data-service-list]").innerHTML = list.map(serviceCard).join("");
    });
  });
}

function renderServiceDetail(slug) {
  const service = store.services.find((item) => item.slug === slug);
  if (!service) return renderNotFound();
  setSeo({
    title: `${service.name} | ${store.settings.name}`,
    description: service.shortDescription || service.description,
    image: service.coverImage,
    canonical: `/services/${service.slug}`,
    jsonLd: serviceJsonLd(service, store.settings)
  });

  app.innerHTML = `
    <section class="detail-hero page-pad">
      <div>
        <p class="eyebrow">${esc(service.category)}</p>
        <h1>${esc(service.name)}</h1>
        <p>${esc(service.description)}</p>
        <div class="facts">
          <span>${esc(service.priceLabel)}</span>
          <span>${esc(service.hours)}</span>
          <span>${esc(service.contactName)}</span>
        </div>
      </div>
      <img src="${esc(service.coverImage)}" alt="${esc(service.name)} at ${esc(store.settings.name)}" />
    </section>
    <section class="section page-pad detail-layout">
      <div>
        <h2>Prices</h2>
        <div class="price-list">
          ${(service.items || []).map((item) => `
            <label>
              <input type="checkbox" name="serviceItem" value="${esc(item.name)}" data-price="${esc(item.price)}" />
              <span>${esc(item.name)}</span>
              <strong>${esc(item.price)}</strong>
            </label>
          `).join("")}
        </div>
      </div>
      <aside class="booking-panel">
        <h2>Order on WhatsApp</h2>
        <form data-service-order="${esc(service.id)}" class="stack">
          <label>Your name <input name="guestName" type="text" placeholder="Jane" /></label>
          <label>Note <textarea name="note" rows="4" placeholder="Room number, timing, grocery list, flight number"></textarea></label>
          <button class="button accent wide" type="submit">Send request</button>
        </form>
      </aside>
    </section>
  `;

  app.querySelector("[data-service-order]").addEventListener("submit", handleServiceOrder);
}

function renderAbout() {
  setSeo({
    title: `About | ${store.settings.name}`,
    description: `Meet the hosts and story behind ${store.settings.name}.`,
    canonical: "/about",
    image: store.settings.coverImage
  });
  app.innerHTML = `
    ${pageHero("About and hosts", "Premium Roysambu stays managed with care, speed and local hospitality.", store.settings.coverImage)}
    <section class="section page-pad prose">
      <h2>Our story</h2>
      <p>${esc(store.settings.story || store.settings.about)}</p>
      <p>The promise is simple: clear prices, clean rooms, a responsive WhatsApp line and helpful local support when guests need groceries, laundry, pickup or directions.</p>
      <h2>What we value</h2>
      <div class="why-grid">
        ${store.settings.whyChoose.map((item) => `<article><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderContact() {
  setSeo({
    title: `Contact | ${store.settings.name}`,
    description: `Contact ${store.settings.name} by WhatsApp, phone or email and view the map.`,
    canonical: "/contact",
    image: store.settings.coverImage
  });
  app.innerHTML = `
    ${pageHero("Contact", "Questions, directions and same-day guest support.", store.settings.coverImage)}
    ${locationBlock()}
  `;
}

function renderAuth() {
  setSeo({
    title: `Owner login | ${store.settings.name}`,
    description: "Owner login for managing rooms, services, site media and bookings.",
    canonical: "/auth"
  });
  app.innerHTML = `
    <section class="auth-screen page-pad">
      <form class="auth-card" data-login-form>
        <p class="eyebrow">Owner access</p>
        <h1>Sign in</h1>
        <p class="muted">${isSupabaseConfigured() ? "Use the owner email and password created in Supabase Auth." : "Local demo mode: owner@bnb.local / demo-admin. Add Supabase keys in src/config.js for production login."}</p>
        <label>Email <input name="email" type="email" value="${isSupabaseConfigured() ? "" : "owner@bnb.local"}" required /></label>
        <label>Password <input name="password" type="password" value="${isSupabaseConfigured() ? "" : "demo-admin"}" required /></label>
        <button class="button accent wide" type="submit">Sign in</button>
        <p class="form-error" data-login-error></p>
      </form>
    </section>
  `;
  app.querySelector("[data-login-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      user = await signIn(form.email.value, form.password.value);
      showToast("Signed in.");
      go("/admin");
    } catch (error) {
      form.querySelector("[data-login-error]").textContent = error.message;
    }
  });
}

async function renderAdmin(section) {
  user = await currentUser();
  if (!user) return renderAuth();
  setSeo({
    title: `Admin | ${store.settings.name}`,
    description: "Owner dashboard for managing the BnB platform.",
    canonical: "/admin"
  });

  const content = {
    dashboard: adminDashboard,
    rooms: adminRooms,
    services: adminServices,
    site: adminSite,
    bookings: adminBookings,
    media: adminMedia
  }[section] || adminDashboard;

  app.innerHTML = `
    <section class="admin-shell page-pad">
      <aside class="admin-sidebar">
        <h1>Owner dashboard</h1>
        <a href="/admin" data-link class="${section === "dashboard" ? "active" : ""}">Dashboard</a>
        <a href="/admin/rooms" data-link class="${section === "rooms" ? "active" : ""}">Rooms</a>
        <a href="/admin/services" data-link class="${section === "services" ? "active" : ""}">Services</a>
        <a href="/admin/bookings" data-link class="${section === "bookings" ? "active" : ""}">Bookings</a>
        <a href="/admin/site" data-link class="${section === "site" ? "active" : ""}">Site settings</a>
        <a href="/admin/media" data-link class="${section === "media" ? "active" : ""}">Media</a>
        <button class="button ghost wide" data-sign-out>Sign out</button>
      </aside>
      <div class="admin-content">${content()}</div>
    </section>
  `;

  app.querySelector("[data-sign-out]").addEventListener("click", async () => {
    await signOut();
    user = null;
    go("/");
  });
  bindAdmin(section);
}

function occupancyTonight() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = addDaysIso(today, 1);
  const rooms = store.rooms.length;
  const booked = store.rooms.filter((room) => roomBlocked(room.id, today, tomorrow)).length;
  return { booked, total: rooms };
}

function weeklyBookingChart() {
  const today = new Date();
  const maxRooms = Math.max(1, store.rooms.length);
  const bars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const next = addDaysIso(iso, 1);
    const booked = store.rooms.filter((room) => roomBlocked(room.id, iso, next)).length;
    const available = Math.max(0, maxRooms - booked);
    const bookedHeight = Math.round((booked / maxRooms) * 100);
    const availableHeight = Math.round((available / maxRooms) * 100);
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    return `
      <div class="chart-day" aria-label="${label}: ${booked} booked, ${available} available">
        <div class="bar-stack">
          <span class="available" style="height:${availableHeight}%"></span>
          <span class="booked" style="height:${bookedHeight}%"></span>
        </div>
        <small>${esc(label)}</small>
      </div>
    `;
  }).join("");
  return `
    <div class="chart-legend"><span class="booked"></span>Booked <span class="available"></span>Available</div>
    <div class="week-chart">${bars}</div>
  `;
}

function arrivalRows() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = store.bookings
    .filter((booking) => booking.startDate >= today || booking.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  if (!rows.length) return "<p>No arrivals or departures coming up.</p>";
  return `<div class="arrival-list">${rows.map((booking) => {
    const room = store.rooms.find((item) => item.id === booking.roomId);
    const arriving = booking.startDate >= today;
    const message = `Hello ${booking.guestName}, this is ${store.settings.shortName}. We are confirming your ${room?.name || "room"} stay from ${booking.startDate} to ${booking.endDate}.`;
    return `
      <article>
        <div><strong>${esc(booking.guestName)}</strong><span>${arriving ? "Arriving" : "Departing"}</span></div>
        <div><span>${esc(room?.name || "Unknown room")}</span><small>${esc(arriving ? booking.startDate : booking.endDate)}</small></div>
        <a class="button ghost small" href="${whatsappUrl(store.settings.whatsapp, message)}">WhatsApp</a>
      </article>
    `;
  }).join("")}</div>`;
}

function adminDashboard() {
  const pending = store.inquiries.filter((item) => item.status !== "closed").length;
  const occupancy = occupancyTonight();
  const revenue = store.rooms.reduce((sum, room) => sum + Number(room.price || 0), 0) * Math.max(1, store.bookings.length);
  return `
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Owner dashboard</p>
        <h2>Good day, ALKEY.</h2>
        <p>${isSupabaseConfigured() ? "Connected to Supabase. Your live rooms, services, bookings and media are being managed from here." : "Local demo mode. Add Supabase keys in src/config.js when you are ready for production."}</p>
      </div>
    </section>
    <div class="stat-grid luxury-stats">
      <article><span>Occupancy tonight</span><strong>${occupancy.booked}/${occupancy.total}</strong><small>rooms</small></article>
      <article><span>Revenue guide</span><strong>KSh ${revenue.toLocaleString()}</strong><small>sample estimate</small></article>
      <article><span>Upcoming blocks</span><strong>${store.bookings.length}</strong><small>confirmed ranges</small></article>
      <article><span>Service requests</span><strong>${pending}</strong><small>pending</small></article>
    </div>
    <div class="admin-dashboard-grid">
      <section class="admin-panel booking-chart">
        <div class="panel-head"><h3>Bookings this week</h3><small>${store.rooms.length} total rooms</small></div>
        ${weeklyBookingChart()}
      </section>
      <section class="admin-panel arrivals-panel">
        <div class="panel-head"><h3>Today&apos;s arrivals and departures</h3><small>Use WhatsApp for guest follow-up</small></div>
        ${arrivalRows()}
      </section>
    </div>
    <section class="admin-panel">
      <div class="panel-head"><h3>Service requests</h3><small>${pending} active</small></div>
      ${inquiryList(store.inquiries.slice(0, 8))}
    </section>
  `;
}

function adminRooms() {
  return `
    <div class="admin-head"><h2>Rooms</h2><p>Add, edit, delete, price and publish rooms from here.</p></div>
    <section class="admin-panel">
      <form data-room-form class="admin-form">
        <input type="hidden" name="id" />
        <label>Name <input name="name" required /></label>
        <label>Slug <input name="slug" placeholder="auto if blank" /></label>
        <label>Status <select name="status"><option>published</option><option>draft</option></select></label>
        <label>Price number <input name="price" type="number" min="0" required /></label>
        <label>Price label <input name="priceLabel" placeholder="KSh 4,500/night" required /></label>
        <label>Capacity <input name="capacity" type="number" min="1" required /></label>
        <label>Size <input name="size" /></label>
        <label>Beds <input name="beds" /></label>
        <label>Cover image URL <input name="coverImage" /></label>
        <label>Cover video URL <input name="coverVideo" /></label>
        <label>Upload cover image <input name="media" type="file" accept="image/*" /></label>
        <label>Upload room video <input name="videoMedia" type="file" accept="video/mp4,video/webm" /></label>
        <label class="full">Description <textarea name="description" rows="4"></textarea></label>
        <label class="full">Amenities, comma-separated <textarea name="amenities" rows="3"></textarea></label>
        <label class="full">Gallery URLs, one per line <textarea name="gallery" rows="3"></textarea></label>
        <label>SEO title <input name="seoTitle" /></label>
        <label>SEO description <input name="seoDescription" /></label>
        <button class="button accent" type="submit">Save room</button>
        <button class="button ghost" type="reset">Clear form</button>
      </form>
    </section>
    <section class="admin-panel"><h3>Existing rooms</h3>${adminTable(store.rooms, "room")}</section>
  `;
}

function adminServices() {
  return `
    <div class="admin-head"><h2>Services</h2><p>Manage laundry, groceries, cleaning, transfers and every item guests can order.</p></div>
    <section class="admin-panel">
      <form data-service-form class="admin-form">
        <input type="hidden" name="id" />
        <label>Name <input name="name" required /></label>
        <label>Slug <input name="slug" placeholder="auto if blank" /></label>
        <label>Category <input name="category" placeholder="housekeeping" required /></label>
        <label>Status <select name="status"><option>published</option><option>draft</option></select></label>
        <label>Price preview <input name="priceLabel" placeholder="from KSh 800" required /></label>
        <label>Hours <input name="hours" /></label>
        <label>Contact name <input name="contactName" /></label>
        <label>WhatsApp <input name="whatsapp" /></label>
        <label>Cover image URL <input name="coverImage" /></label>
        <label>Upload cover <input name="media" type="file" accept="image/*" /></label>
        <label class="full">Short description <textarea name="shortDescription" rows="2"></textarea></label>
        <label class="full">Full description <textarea name="description" rows="4"></textarea></label>
        <label class="full">Items and prices, one per line as: item | price <textarea name="items" rows="5"></textarea></label>
        <button class="button accent" type="submit">Save service</button>
        <button class="button ghost" type="reset">Clear form</button>
      </form>
    </section>
    <section class="admin-panel"><h3>Existing services</h3>${adminTable(store.services, "service")}</section>
  `;
}

function adminSite() {
  const settings = store.settings;
  return `
    <div class="admin-head"><h2>Site settings</h2><p>Edit the homepage, WhatsApp number, contact details, map and SEO description in one place.</p></div>
    <section class="admin-panel">
      <form data-site-form class="admin-form">
        <label>Name <input name="name" value="${esc(settings.name)}" required /></label>
        <label>Short name <input name="shortName" value="${esc(settings.shortName)}" /></label>
        <label>WhatsApp <input name="whatsapp" value="${esc(settings.whatsapp)}" required /></label>
        <label>Phone <input name="phone" value="${esc(settings.phone)}" /></label>
        <label>Email <input name="email" value="${esc(settings.email)}" /></label>
        <label>Address <input name="address" value="${esc(settings.address)}" /></label>
        <label>Check-in <input name="checkIn" value="${esc(settings.checkIn)}" /></label>
        <label>Check-out <input name="checkOut" value="${esc(settings.checkOut)}" /></label>
        <label class="full">Tagline <textarea name="tagline" rows="2">${esc(settings.tagline)}</textarea></label>
        <label class="full">About <textarea name="about" rows="6">${esc(settings.about)}</textarea></label>
        <label class="full">Our story <textarea name="story" rows="5">${esc(settings.story || "")}</textarea></label>
        <label class="full">Meta description <textarea name="metaDescription" rows="3">${esc(settings.metaDescription)}</textarea></label>
        <label>Cover image URL <input name="coverImage" value="${esc(settings.coverImage)}" /></label>
        <label>Cover video URL <input name="coverVideo" value="${esc(settings.coverVideo || "")}" /></label>
        <label>Upload cover image <input name="coverUpload" type="file" accept="image/*" /></label>
        <label>Upload short video <input name="videoUpload" type="file" accept="video/mp4,video/webm" /></label>
        <label class="full">Map embed URL <input name="mapEmbed" value="${esc(settings.mapEmbed)}" /></label>
        <label class="full">Why choose us, one per line as: heading | text <textarea name="whyChoose" rows="5">${esc(settings.whyChoose.map((item) => `${item.title} | ${item.text}`).join("\n"))}</textarea></label>
        <label class="full">Homepage stats, one per line as: value | label <textarea name="stats" rows="4">${esc((settings.stats || []).map((item) => `${item.value} | ${item.label}`).join("\n"))}</textarea></label>
        <button class="button accent" type="submit">Save site settings</button>
      </form>
    </section>
  `;
}

function adminBookings() {
  return `
    <div class="admin-head"><h2>Bookings and blocked dates</h2><p>Confirmed blocks stop duplicate bookings in the public calendar and in the Supabase database.</p></div>
    <section class="admin-panel">
      <form data-booking-form class="admin-form compact">
        <label>Room <select name="roomId">${store.rooms.map((room) => `<option value="${esc(room.id)}">${esc(room.name)}</option>`).join("")}</select></label>
        <label>Guest/block label <input name="guestName" required /></label>
        <label>Start date <input name="startDate" type="date" required /></label>
        <label>End date <input name="endDate" type="date" required /></label>
        <button class="button accent" type="submit">Add confirmed block</button>
      </form>
    </section>
    <section class="admin-panel"><h3>Confirmed blocks</h3>${bookingTable()}</section>
    <section class="admin-panel"><h3>Inquiries</h3>${inquiryList(store.inquiries)}</section>
  `;
}

function adminMedia() {
  return `
    <div class="admin-head"><h2>Media</h2><p>Upload images and short videos, choose where they belong, and the dashboard can apply the URL for you.</p></div>
    <section class="admin-panel">
      <form data-media-form class="admin-form compact">
        <label>Media target
          <select name="target">
            <option value="site-cover-image">Homepage cover image</option>
            <option value="site-cover-video">Homepage background video</option>
            <option value="room-cover-image">Room cover image</option>
            <option value="room-cover-video">Room video</option>
            <option value="room-gallery">Room gallery image/video</option>
            <option value="service-cover-image">Service cover image</option>
            <option value="other">Other / just give me the URL</option>
          </select>
        </label>
        <label>Room
          <select name="roomId">
            <option value="">No room</option>
            ${store.rooms.map((room) => `<option value="${esc(room.id)}">${esc(room.name)}</option>`).join("")}
          </select>
        </label>
        <label>Service
          <select name="serviceId">
            <option value="">No service</option>
            ${store.services.map((service) => `<option value="${esc(service.id)}">${esc(service.name)}</option>`).join("")}
          </select>
        </label>
        <label>File <input name="media" type="file" accept="image/*,video/mp4,video/webm" required /></label>
        <button class="button accent" type="submit">Upload and apply</button>
      </form>
      <div class="copy-box" data-upload-result>No upload yet.</div>
    </section>
  `;
}

function bindAdmin(section) {
  if (section === "rooms") bindRoomAdmin();
  if (section === "services") bindServiceAdmin();
  if (section === "site") bindSiteAdmin();
  if (section === "bookings") bindBookingAdmin();
  if (section === "media") bindMediaAdmin();
}

function bindRoomAdmin() {
  const form = app.querySelector("[data-room-form]");
  app.querySelectorAll("[data-edit-room]").forEach((button) => {
    button.addEventListener("click", () => fillRoomForm(store.rooms.find((room) => room.id === button.dataset.editRoom), form));
  });
  app.querySelectorAll("[data-delete-room]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this room?")) return;
      await deleteRoom(button.dataset.deleteRoom);
      await reloadAdmin("rooms", "Room deleted.");
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (form.media.files[0]) values.coverImage = await uploadMedia(form.media.files[0], "room-images");
    if (form.videoMedia.files[0]) values.coverVideo = await uploadMedia(form.videoMedia.files[0], "room-images");
    await saveRoom({
      id: values.id || undefined,
      name: values.name,
      slug: values.slug || slugify(values.name),
      status: values.status,
      price: Number(values.price),
      priceLabel: values.priceLabel,
      capacity: Number(values.capacity),
      size: values.size,
      beds: values.beds,
      coverImage: values.coverImage,
      coverVideo: values.coverVideo,
      description: values.description,
      amenities: splitComma(values.amenities),
      gallery: splitLines(values.gallery || values.coverImage),
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription
    });
    await reloadAdmin("rooms", "Room saved.");
  });
}

function bindServiceAdmin() {
  const form = app.querySelector("[data-service-form]");
  app.querySelectorAll("[data-edit-service]").forEach((button) => {
    button.addEventListener("click", () => fillServiceForm(store.services.find((service) => service.id === button.dataset.editService), form));
  });
  app.querySelectorAll("[data-delete-service]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this service?")) return;
      await deleteService(button.dataset.deleteService);
      await reloadAdmin("services", "Service deleted.");
    });
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (form.media.files[0]) values.coverImage = await uploadMedia(form.media.files[0], "service-images");
    await saveService({
      id: values.id || undefined,
      name: values.name,
      slug: values.slug || slugify(values.name),
      category: values.category,
      status: values.status,
      priceLabel: values.priceLabel,
      coverImage: values.coverImage,
      shortDescription: values.shortDescription,
      description: values.description,
      hours: values.hours,
      contactName: values.contactName,
      whatsapp: values.whatsapp || store.settings.whatsapp,
      items: splitLines(values.items).map((line) => {
        const [name, price] = line.split("|").map((part) => part.trim());
        return { name, price: price || "" };
      }).filter((item) => item.name)
    });
    await reloadAdmin("services", "Service saved.");
  });
}

function bindSiteAdmin() {
  const form = app.querySelector("[data-site-form]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (form.coverUpload.files[0]) values.coverImage = await uploadMedia(form.coverUpload.files[0], "site-media");
    if (form.videoUpload.files[0]) values.coverVideo = await uploadMedia(form.videoUpload.files[0], "site-media");
    await saveSettings({
      ...store.settings,
      ...values,
      socials: store.settings.socials,
      whyChoose: splitLines(values.whyChoose).map((line, index) => {
        const [itemTitle, text] = line.split("|").map((part) => part.trim());
        return { icon: store.settings.whyChoose[index]?.icon || defaultWhyIcon(index), title: itemTitle, text: text || "" };
      }).filter((item) => item.title),
      stats: splitLines(values.stats).map((line) => {
        const [value, label] = line.split("|").map((part) => part.trim());
        return { value, label: label || "" };
      }).filter((item) => item.value)
    });
    await reloadAdmin("site", "Site settings saved.");
  });
}

function bindBookingAdmin() {
  const form = app.querySelector("[data-booking-form]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (values.startDate >= values.endDate) {
      showToast("End date must be after start date.", true);
      return;
    }
    await saveBooking({ ...values, status: "confirmed", source: "admin" });
    await reloadAdmin("bookings", "Dates blocked.");
  });
  app.querySelectorAll("[data-delete-booking]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("Remove this blocked date range?")) return;
      await deleteBooking(button.dataset.deleteBooking);
      await reloadAdmin("bookings", "Booking block removed.");
    });
  });
}

function bindMediaAdmin() {
  const form = app.querySelector("[data-media-form]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const bucket = bucketForTarget(values.target);
    const url = await uploadMedia(form.media.files[0], bucket);
    const applied = await applyUploadedMedia(values, url);
    store = await getContent();
    app.querySelector("[data-upload-result]").innerHTML = `<strong>${applied}</strong><code>${esc(url)}</code>`;
    showToast(applied);
  });
}

function bucketForTarget(target) {
  if (String(target || "").startsWith("room")) return "room-images";
  if (String(target || "").startsWith("service")) return "service-images";
  return "site-media";
}

async function applyUploadedMedia(values, url) {
  if (values.target === "site-cover-image") {
    await saveSettings({ ...store.settings, coverImage: url });
    return "Homepage cover image updated.";
  }
  if (values.target === "site-cover-video") {
    await saveSettings({ ...store.settings, coverVideo: url });
    return "Homepage background video updated.";
  }
  if (values.target?.startsWith("room")) {
    const room = store.rooms.find((item) => item.id === values.roomId);
    if (!room) return "Uploaded. Select a room to apply it automatically.";
    if (values.target === "room-cover-image") {
      await saveRoom({ ...room, coverImage: url });
      return `${room.name} cover image updated.`;
    }
    if (values.target === "room-cover-video") {
      await saveRoom({ ...room, coverVideo: url });
      return `${room.name} video updated.`;
    }
    await saveRoom({ ...room, gallery: [...(room.gallery || []), url] });
    return `${room.name} gallery updated.`;
  }
  if (values.target === "service-cover-image") {
    const service = store.services.find((item) => item.id === values.serviceId);
    if (!service) return "Uploaded. Select a service to apply it automatically.";
    await saveService({ ...service, coverImage: url });
    return `${service.name} cover image updated.`;
  }
  return "Media uploaded. Copy this URL into any field you need.";
}

async function reloadAdmin(section, message) {
  store = await getContent();
  hydrateChrome();
  showToast(message);
  history.replaceState({}, "", `/admin/${section === "dashboard" ? "" : section}`.replace(/\/$/, ""));
  renderAdmin(section);
}

function handleHeroBooking(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const room = store.rooms.find((item) => item.id === values.roomId) || published(store.rooms)[0];
  if (!room) return;
  if (values.startDate >= values.endDate) {
    showToast("Check-out must be after check-in.", true);
    return;
  }
  if (roomBlocked(room.id, values.startDate, values.endDate)) {
    showToast(`${room.name} is already booked for those dates. Check the calendar and choose another range.`, true);
    go(`/rooms/${room.slug}`);
    return;
  }
  go(`/rooms/${room.slug}?start=${encodeURIComponent(values.startDate)}&end=${encodeURIComponent(values.endDate)}&guests=${encodeURIComponent(values.guests)}`);
}

async function handleRoomBooking(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const room = store.rooms.find((item) => item.id === form.dataset.roomBooking);
  const values = Object.fromEntries(new FormData(form));
  const error = form.querySelector("[data-booking-error]");
  error.textContent = "";

  if (values.startDate >= values.endDate) {
    error.textContent = "Check-out must be after check-in.";
    return;
  }
  if (roomBlocked(room.id, values.startDate, values.endDate)) {
    error.textContent = "Those dates are already booked. Please choose different dates.";
    return;
  }

  const message = roomBookingMessage({ room, settings: store.settings, ...values });
  await createInquiry({
    type: "room",
    roomId: room.id,
    guestName: values.guestName,
    guestPhone: values.guestPhone,
    startDate: values.startDate,
    endDate: values.endDate,
    message
  });
  openWhatsapp(store.settings.whatsapp, message);
}

async function handleServiceOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const service = store.services.find((item) => item.id === form.dataset.serviceOrder);
  const values = Object.fromEntries(new FormData(form));
  const selectedItems = [...app.querySelectorAll('input[name="serviceItem"]:checked')].map((input) => ({
    name: input.value,
    price: input.dataset.price
  }));
  const message = serviceOrderMessage({ service, settings: store.settings, selectedItems, ...values });
  await createInquiry({
    type: "service",
    serviceId: service.id,
    guestName: values.guestName,
    message
  });
  openWhatsapp(service.whatsapp || store.settings.whatsapp, message);
}

function openWhatsapp(number, message) {
  window.open(whatsappUrl(number, message), "_blank", "noopener,noreferrer");
  showToast("Opening WhatsApp with your pre-filled message.");
}

function roomCard(room) {
  return `
    <article class="room-card">
      <a href="/rooms/${esc(room.slug)}" data-link><img src="${esc(room.coverImage)}" alt="${esc(room.name)} at ${esc(store.settings.name)}" loading="lazy" /></a>
      <div>
        <h3>${esc(room.name)}</h3>
        <div class="room-meta">
          <span>Sleeps ${esc(room.capacity)}</span>
          <span>${esc(room.size)}</span>
          <strong>from ${esc(room.priceLabel)}</strong>
        </div>
        <p>${esc(room.description)}</p>
        <div class="button-row">
          <a class="button ghost small" href="/rooms/${esc(room.slug)}" data-link>View room</a>
          <a class="button accent small" href="${whatsappUrl(store.settings.whatsapp, `Hello ${store.settings.shortName}, I would like to book ${room.name}.`)}">Book on WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function serviceCard(service) {
  return `
    <article class="service-card">
      <img src="${esc(service.coverImage)}" alt="${esc(service.name)} service preview" loading="lazy" />
      <div>
        <span class="tag">${esc(service.category)}</span>
        <h3>${esc(service.name)}</h3>
        <p>${esc(service.shortDescription)}</p>
        <strong>${esc(service.priceLabel)}</strong>
        <a class="button ghost small" href="/services/${esc(service.slug)}" data-link>Details and prices</a>
      </div>
    </article>
  `;
}

function locationBlock() {
  const settings = store.settings;
  return `
    <section class="section page-pad location-grid">
      <iframe title="Map to ${esc(settings.name)}" src="${esc(settings.mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div>
        <p class="eyebrow">Find us</p>
        <h2>How to get here</h2>
        <dl class="contact-list">
          <div><dt>Address</dt><dd>${esc(settings.address)}</dd></div>
          <div><dt>Hours</dt><dd>Check-in ${esc(settings.checkIn)} &middot; Check-out ${esc(settings.checkOut)}</dd></div>
          <div><dt>Phone</dt><dd>${esc(settings.phone)}</dd></div>
          <div><dt>Email</dt><dd>${esc(settings.email)}</dd></div>
        </dl>
        <a class="button accent" href="${whatsappUrl(settings.whatsapp, `Hello ${settings.shortName}, I need directions.`)}">Chat on WhatsApp</a>
      </div>
    </section>
  `;
}

function pageHero(titleText, subtitle, image) {
  return `
    <section class="page-hero page-pad">
      <div>
        <p class="eyebrow">${esc(store.settings.shortName)}</p>
        <h1>${esc(titleText)}</h1>
        <p>${esc(subtitle)}</p>
      </div>
      <img src="${esc(image)}" alt="${esc(titleText)} at ${esc(store.settings.name)}" />
    </section>
  `;
}

function roomHeroMedia(room) {
  if (room.coverVideo) {
    return `<video class="detail-media" autoplay muted loop playsinline poster="${esc(room.coverImage)}"><source src="${esc(room.coverVideo)}" type="video/mp4"></video>`;
  }
  return `<img class="detail-media" src="${esc(room.coverImage)}" alt="${esc(room.name)} at ${esc(store.settings.name)}" />`;
}

function mediaTile(src, alt) {
  if (isVideo(src)) {
    return `<video controls playsinline preload="metadata"><source src="${esc(src)}"></video>`;
  }
  return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" />`;
}

function isVideo(src) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(String(src || ""));
}

function availabilityCalendar(room) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekdayHead = ["M", "T", "W", "T", "F", "S", "S"].map((day) => `<span class="day-head">${day}</span>`).join("");
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const blocked = roomBlocked(room.id, iso, addDaysIso(iso, 1));
    const label = `${iso} ${blocked ? "booked" : "available"}`;
    return `<span class="${blocked ? "blocked" : "available"}" aria-label="${label}" title="${blocked ? "Booked" : "Available"}">${date.getDate()}</span>`;
  }).join("");
  return `
    <div class="calendar-card" aria-label="Availability calendar for ${esc(room.name)}">
      <div class="calendar-head">
        <strong>${esc(month)}</strong>
        <div><span class="legend open"></span>Available <span class="legend blocked"></span>Booked</div>
      </div>
      <div class="mini-calendar">${weekdayHead}${days}</div>
    </div>
  `;
}

function availabilityDots() {
  const rooms = published(store.rooms);
  const today = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const next = addDaysIso(iso, 1);
    const hasOpenRoom = rooms.some((room) => !roomBlocked(room.id, iso, next));
    return hasOpenRoom ? "open" : "full";
  });
}

function roomBlocked(roomId, startDate, endDate) {
  return store.bookings.some((booking) => (
    booking.roomId === roomId &&
    booking.status === "confirmed" &&
    rangesOverlap(booking.startDate, booking.endDate, startDate, endDate)
  ));
}

function adminTable(items, typeName) {
  if (!items.length) return "<p>No records yet.</p>";
  return `
    <div class="responsive-table">
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>Preview price</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${esc(item.name)}</td>
              <td>${esc(item.status || "published")}</td>
              <td>${esc(item.priceLabel || "")}</td>
              <td>
                <button class="icon-button" data-edit-${typeName}="${esc(item.id)}">Edit</button>
                <button class="icon-button danger" data-delete-${typeName}="${esc(item.id)}">Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bookingTable() {
  if (!store.bookings.length) return "<p>No blocked dates yet.</p>";
  return `
    <div class="responsive-table">
      <table>
        <thead><tr><th>Room</th><th>Label</th><th>Dates</th><th></th></tr></thead>
        <tbody>
          ${store.bookings.map((booking) => `
            <tr>
              <td>${esc(store.rooms.find((room) => room.id === booking.roomId)?.name || "Unknown room")}</td>
              <td>${esc(booking.guestName)}</td>
              <td>${esc(booking.startDate)} to ${esc(booking.endDate)}</td>
              <td><button class="icon-button danger" data-delete-booking="${esc(booking.id)}">Remove</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function inquiryList(items) {
  if (!items.length) return "<p>No inquiries yet.</p>";
  return `<div class="inquiry-list">${items.map((item) => `
    <article>
      <strong>${esc(item.type || "inquiry")} ${item.guestName || item.guest_name ? `&middot; ${esc(item.guestName || item.guest_name)}` : ""}</strong>
      <p>${esc(item.message || "")}</p>
      <small>${esc(item.createdAt || item.created_at || "")}</small>
    </article>
  `).join("")}</div>`;
}

function fillRoomForm(room, form) {
  form.id.value = room.id;
  form.name.value = room.name || "";
  form.slug.value = room.slug || "";
  form.status.value = room.status || "published";
  form.price.value = room.price || "";
  form.priceLabel.value = room.priceLabel || "";
  form.capacity.value = room.capacity || "";
  form.size.value = room.size || "";
  form.beds.value = room.beds || "";
  form.coverImage.value = room.coverImage || "";
  form.coverVideo.value = room.coverVideo || "";
  form.description.value = room.description || "";
  form.amenities.value = (room.amenities || []).join(", ");
  form.gallery.value = (room.gallery || []).join("\n");
  form.seoTitle.value = room.seoTitle || "";
  form.seoDescription.value = room.seoDescription || "";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillServiceForm(service, form) {
  form.id.value = service.id;
  form.name.value = service.name || "";
  form.slug.value = service.slug || "";
  form.category.value = service.category || "";
  form.status.value = service.status || "published";
  form.priceLabel.value = service.priceLabel || "";
  form.hours.value = service.hours || "";
  form.contactName.value = service.contactName || "";
  form.whatsapp.value = service.whatsapp || "";
  form.coverImage.value = service.coverImage || "";
  form.shortDescription.value = service.shortDescription || "";
  form.description.value = service.description || "";
  form.items.value = (service.items || []).map((item) => `${item.name} | ${item.price}`).join("\n");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderInstallBanner(show = true) {
  let banner = document.querySelector("[data-install-banner]");
  if (!show) {
    banner?.remove();
    return;
  }
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "install-banner";
    banner.dataset.installBanner = "true";
    banner.innerHTML = `<span>Install ${esc(store?.settings?.shortName || "this BnB")} on this device.</span><button class="button accent small" data-install-app>Install</button>`;
    document.body.appendChild(banner);
  }
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function renderNotFound() {
  setSeo({
    title: `Page not found | ${store.settings.name}`,
    description: "The page you requested could not be found.",
    canonical: location.pathname
  });
  app.innerHTML = `
    <section class="section page-pad not-found">
      <h1>Page not found</h1>
      <p>This page may have moved.</p>
      <a class="button accent" href="/" data-link>Go home</a>
    </section>
  `;
}

function published(items) {
  return items.filter((item) => item.status !== "draft");
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function title(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function iconGlyph(name) {
  const icons = {
    bed: '<svg viewBox="0 0 24 24"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 18v2M21 18v2"/><path d="M3 13h18"/><path d="M7 13V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="14" r="4.2"/><path d="M11 11l9-9M17 5l3 3M14 8l2 2"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M2 8.5a17 17 0 0 1 20 0"/><path d="M5.5 12.5a12 12 0 0 1 13 0"/><path d="M9 16.5a7 7 0 0 1 6 0"/><circle cx="12" cy="20" r="1"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
    message: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5z"/><path d="M8 9h8M8 12h5"/></svg>'
  };
  return icons[name] || icons.sparkles;
}

function defaultWhyIcon(index) {
  return ["bed", "shield", "pin", "key", "sparkles", "wifi", "bell", "message"][index] || "sparkles";
}

function splitLines(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function splitComma(value) {
  return String(value || "").split(",").map((line) => line.trim()).filter(Boolean);
}

function addDaysIso(iso, days) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

init().catch((error) => {
  console.error(error);
  app.innerHTML = `<section class="section page-pad"><h1>Something went wrong</h1><p>${esc(error.message)}</p></section>`;
});
