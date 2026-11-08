
import { useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/v1";

const demoRides = [
  { id: 1, from: "Ghaziabad", to: "Delhi", date: "Today", time: "08:30 AM", price: 120, seats: 3, driver: "Rahul Sharma", rating: "4.9", car: "Hyundai i20" },
  { id: 2, from: "Noida", to: "Greater Noida", date: "Today", time: "09:15 AM", price: 90, seats: 2, driver: "Aman Verma", rating: "4.8", car: "Maruti Swift" },
  { id: 3, from: "Ghaziabad", to: "Meerut", date: "Tomorrow", time: "07:00 AM", price: 180, seats: 3, driver: "Priya Singh", rating: "5.0", car: "Honda City" },
];

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("movemate_user")); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("movemate_token"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState({ from: "", to: "", date: "" });
  const [results, setResults] = useState(demoRides);
  const [ride, setRide] = useState({
    from: "", to: "", date: "", time: "", seats: "1", price: ""
  });

  const notify = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  };

  async function authenticate(e) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const isRegister = authMode === "register";

    const body = isRegister
      ? {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          password: form.get("password"),
          community: form.get("community"),
          consent: form.get("consent") === "on",
        }
      : {
          identifier: form.get("identifier"),
          password: form.get("password"),
        };

    try {
      const response = await fetch(
        `${API}/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      const loggedUser = data.data.user;
      const jwt = data.data.token;

      localStorage.setItem("movemate_user", JSON.stringify(loggedUser));
      localStorage.setItem("movemate_token", jwt);
      setUser(loggedUser);
      setToken(jwt);
      setPage("dashboard");
      notify(isRegister ? "Welcome to MoveMate!" : "Login successful!");
    } catch (error) {
      notify(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("movemate_user");
    localStorage.removeItem("movemate_token");
    setUser(null);
    setToken(null);
    setPage("home");
    notify("You have logged out.");
  }

  function findRides(e) {
    e.preventDefault();
    const filtered = demoRides.filter((r) =>
      (!search.from || r.from.toLowerCase().includes(search.from.toLowerCase())) &&
      (!search.to || r.to.toLowerCase().includes(search.to.toLowerCase()))
    );
    setResults(filtered);
    setPage("rides");
  }

  function offerRide(e) {
    e.preventDefault();
    notify("Ride form saved as a demo. Ride creation API is not available yet.");
  }

  function requireLogin(target) {
    if (!user) {
      setAuthMode("login");
      setPage("auth");
      notify("Please log in to continue.");
      return;
    }
    setPage(target);
  }

  const nav = (target) => {
    setPage(target);
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#" onClick={() => nav("home")}>
          <span className="brand-icon">M</span>
          Move<span>Mate</span>
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <button onClick={() => nav("home")}>Home</button>
          <button onClick={() => nav("rides")}>Find a ride</button>
          <button onClick={() => requireLogin("offer")}>Offer a ride</button>
          <button onClick={() => requireLogin("dashboard")}>Dashboard</button>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome-user">Hi, {user.name?.split(" ")[0]}</span>
              <button className="btn btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => { setAuthMode("login"); nav("auth"); }}>Log in</button>
              <button className="btn btn-primary" onClick={() => { setAuthMode("register"); nav("auth"); }}>Sign up</button>
            </>
          )}
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      <main>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">SMARTER TRAVEL. STRONGER COMMUNITY.</span>
                <h1>Every journey is better <span>together.</span></h1>
                <p>
                  Connect with people travelling your way. Share rides,
                  split costs and make everyday journeys affordable.
                </p>
                <div className="hero-actions">
                  <button className="btn btn-primary btn-large" onClick={() => nav("rides")}>Find your ride ↗</button>
                  <button className="btn btn-white btn-large" onClick={() => requireLogin("offer")}>Offer a ride</button>
                </div>
                <div className="hero-trust">
                  <span>✓ Community driven</span>
                  <span>✓ Affordable travel</span>
                  <span>✓ Easy booking</span>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-circle">
                  <div className="visual-car">🚙</div>
                  <div className="floating-card card-one">📍 Your next destination</div>
                  <div className="floating-card card-two">💚 Share. Save. Travel.</div>
                </div>
              </div>
            </section>

            <section className="search-section">
              <div className="section-heading">
                <span className="eyebrow">START YOUR JOURNEY</span>
                <h2>Where are you going?</h2>
              </div>
              <form className="search-box" onSubmit={findRides}>
                <label>FROM
                  <input required placeholder="Leaving from" value={search.from}
                    onChange={e => setSearch({...search, from:e.target.value})}/>
                </label>
                <label>TO
                  <input required placeholder="Going to" value={search.to}
                    onChange={e => setSearch({...search, to:e.target.value})}/>
                </label>
                <label>TRAVEL DATE
                  <input type="date" value={search.date}
                    onChange={e => setSearch({...search, date:e.target.value})}/>
                </label>
                <button className="btn btn-primary search-button">Search rides →</button>
              </form>
            </section>

            <section className="features section">
              <div className="section-heading">
                <span className="eyebrow">WHY MOVEMATE?</span>
                <h2>Travel smarter, together.</h2>
                <p>Everything you need for a better everyday commute.</p>
              </div>
              <div className="feature-grid">
                <Feature icon="🚘" title="Share your ride" text="Offer empty seats and connect with people travelling in the same direction."/>
                <Feature icon="💰" title="Split the cost" text="Make travelling more affordable by sharing estimated journey expenses."/>
                <Feature icon="🤝" title="Build connections" text="Meet fellow commuters and grow a trusted local travel community."/>
              </div>
            </section>

            <section className="cta">
              <div>
                <span className="eyebrow">YOUR JOURNEY STARTS HERE</span>
                <h2>Don't travel alone. Move together.</h2>
                <p>Join the community and make every journey count.</p>
              </div>
              <button className="btn btn-white btn-large" onClick={() => {setAuthMode("register"); nav("auth");}}>Join MoveMate →</button>
            </section>
          </>
        )}

        {page === "auth" && (
          <section className="auth-section">
            <div className="auth-card">
              <span className="eyebrow">WELCOME TO MOVEMATE</span>
              <h2>{authMode === "login" ? "Welcome back!" : "Create your account"}</h2>
              <p className="muted">Your community journey begins here.</p>
              <div className="auth-switch">
                <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Log in</button>
                <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Sign up</button>
              </div>
              <form onSubmit={authenticate} className="form-stack">
                {authMode === "register" && <>
                  <label>Full name<input name="name" required minLength="2" placeholder="Your full name"/></label>
                  <label>Mobile number<input name="phone" type="tel" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number"/></label>
                  <label>Community<input name="community" placeholder="College, workplace or city"/></label>
                </>}
                <label>{authMode === "login" ? "Email or mobile number" : "Email address"}
                  <input name={authMode === "login" ? "identifier" : "email"}
                    type={authMode === "register" ? "email" : "text"}
                    required placeholder={authMode === "login" ? "Email or phone" : "you@example.com"}/>
                </label>
                <label>Password<input name="password" type="password" required minLength={authMode === "register" ? 8 : 1} placeholder="Enter your password"/></label>
                {authMode === "register" && <label className="consent">
                  <input type="checkbox" name="consent" required/>
                  I agree to the terms and privacy policy.
                </label>}
                <button disabled={loading} className="btn btn-primary btn-full">
                  {loading ? "Please wait..." : authMode === "login" ? "Log in to MoveMate →" : "Create account →"}
                </button>
              </form>
              <p className="auth-bottom">
                {authMode === "login" ? "New to MoveMate?" : "Already have an account?"}
                <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
                  {authMode === "login" ? " Sign up" : " Log in"}
                </button>
              </p>
            </div>
          </section>
        )}

        {page === "rides" && (
          <section className="page-section">
            <span className="eyebrow">EXPLORE JOURNEYS</span>
            <h1 className="page-title">Find your next ride.</h1>
            <form className="search-box rides-search" onSubmit={findRides}>
              <label>FROM<input required placeholder="Leaving from" value={search.from} onChange={e => setSearch({...search,from:e.target.value})}/></label>
              <label>TO<input required placeholder="Going to" value={search.to} onChange={e => setSearch({...search,to:e.target.value})}/></label>
              <label>DATE<input type="date" value={search.date} onChange={e => setSearch({...search,date:e.target.value})}/></label>
              <button className="btn btn-primary">Search</button>
            </form>
            <h2 className="results-title">{results.length} rides found</h2>
            <div className="ride-grid">
              {results.map(r => <article className="ride-card" key={r.id}>
                <div className="ride-top"><span className="ride-tag">Available ride</span><strong>₹{r.price}<small>/person</small></strong></div>
                <div className="route">
                  <div><span className="route-dot green"></span><strong>{r.from}</strong><small>{r.time}</small></div>
                  <div className="route-line"></div>
                  <div><span className="route-dot orange"></span><strong>{r.to}</strong><small>{r.date}</small></div>
                </div>
                <div className="ride-info"><span>🚘 {r.car}</span><span>💺 {r.seats} seats</span></div>
                <div className="driver"><span className="avatar">{r.driver[0]}</span><div><strong>{r.driver}</strong><small>★ {r.rating} rating</small></div></div>
                <button className="btn btn-primary btn-full" onClick={() => requireLogin("dashboard")}>Request to join</button>
              </article>)}
              {results.length === 0 && <p className="muted">No demo rides match your search. Try another location.</p>}
            </div>
            <p className="demo-note">These are sample rides for interface demonstration, not live bookings.</p>
          </section>
        )}

        {page === "dashboard" && (
          <section className="page-section">
            <span className="eyebrow">YOUR MOVEMATE SPACE</span>
            <h1 className="page-title">Hello, {user?.name || "Traveller"} 👋</h1>
            <p className="muted">Manage your journeys and account in one place.</p>
            <div className="stats-grid">
              <Stat label="Upcoming rides" value="0" icon="🚘"/>
              <Stat label="Ride requests" value="0" icon="📩"/>
              <Stat label="Community" value={user?.community || "Member"} icon="🤝"/>
            </div>
            <div className="dashboard-grid">
              <div className="panel"><h2>Quick actions</h2>
                <button className="action-row" onClick={() => nav("rides")}>🔎 Find a ride <span>→</span></button>
                <button className="action-row" onClick={() => nav("offer")}>🚘 Offer a ride <span>→</span></button>
                <button className="action-row" onClick={() => notify("Booking management API is coming soon.")}>📋 My bookings <span>→</span></button>
              </div>
              <div className="panel"><h2>Profile information</h2>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email || "Not provided"}</p>
                <p><strong>Phone:</strong> {user?.phone || "Not provided"}</p>
                <button className="btn btn-outline" onClick={logout}>Log out</button>
              </div>
            </div>
          </section>
        )}

        {page === "offer" && (
          <section className="auth-section">
            <div className="auth-card offer-card">
              <span className="eyebrow">SHARE YOUR JOURNEY</span>
              <h2>Offer a ride</h2>
              <p className="muted">Tell fellow travellers about your journey.</p>
              <form className="form-stack" onSubmit={offerRide}>
                <label>Starting point<input required placeholder="e.g. Ghaziabad" value={ride.from} onChange={e=>setRide({...ride,from:e.target.value})}/></label>
                <label>Destination<input required placeholder="e.g. Delhi" value={ride.to} onChange={e=>setRide({...ride,to:e.target.value})}/></label>
                <label>Travel date<input type="date" required value={ride.date} onChange={e=>setRide({...ride,date:e.target.value})}/></label>
                <label>Departure time<input type="time" required value={ride.time} onChange={e=>setRide({...ride,time:e.target.value})}/></label>
                <label>Available seats<input type="number" min="1" max="8" required value={ride.seats} onChange={e=>setRide({...ride,seats:e.target.value})}/></label>
                <label>Estimated cost per passenger (₹)<input type="number" min="0" required placeholder="120" value={ride.price} onChange={e=>setRide({...ride,price:e.target.value})}/></label>
                <button className="btn btn-primary btn-full">Continue →</button>
              </form>
              <p className="demo-note">Ride publishing will work once the ride API is implemented.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <a className="brand" href="#" onClick={() => nav("home")}><span className="brand-icon">M</span>Move<span>Mate</span></a>
        <p>Making everyday journeys better, together.</p>
        <span>© {new Date().getFullYear()} MoveMate. All rights reserved.</span>
      </footer>
    </div>
  );
}

function Feature({icon,title,text}) {
  return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>;
}
function Stat({label,value,icon}) {
  return <article className="stat-card"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>;
}

export default App;
