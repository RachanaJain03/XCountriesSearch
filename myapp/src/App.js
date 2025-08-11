import React, { useEffect, useMemo, useState } from "react";

const API =
  "https://countries-search-data-prod-812920491762.asia-south1.run.app/countries";

/* --------------------- Helpers --------------------- */

// Read country name safely from various shapes
const getName = (c) =>
  c?.name?.common ??
  c?.name?.official ??
  c?.countryName ??
  c?.officialName ??
  c?.commonName ??
  (typeof c?.name === "string" ? c.name : "") ??
  "";

// Read flag URL safely from various shapes (img only)
const getFlag = (c) =>
  c?.flags?.png ??
  c?.flags?.svg ??
  c?.flag ??
  c?.flagUrl ??
  c?.flagPNG ??
  c?.png ??
  "";

// Build a stable, unique key
const getKey = (c, idx) =>
  c?.cca3 ??
  c?.cca2 ??
  c?.ccn3 ??
  c?.cioc ??
  c?.code ??
  `${getName(c) || "Unknown"}-${idx}`;

// Small debounce hook for smoother search
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* --------------------- App --------------------- */

export default function App() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) {
          console.error("Failed to fetch countries:", res.status, res.statusText);
          setCountries([]);
          return;
        }
        const data = await res.json();
        // Be defensive about response shape
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.countries) ? data.countries :
          Array.isArray(data?.data) ? data.data :
          [];
        setCountries(list);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debounced, normalized query
  const q = useDebounced(search.trim().toLowerCase(), 250);

  // Filtered list (memoized)
  const filtered = useMemo(() => {
    if (!q) return countries;
    return countries.filter((c) => getName(c).toLowerCase().includes(q));
  }, [countries, q]);

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Country Flags</h1>

      <input
        type="text"
        placeholder="Search countries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search countries"
        style={styles.search}
      />

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <section style={styles.grid} role="list">
          {/* Show nothing when no matches (as required) */}
          {filtered.map((c, idx) => {
            const name = getName(c) || "Unknown";
            const flag = getFlag(c);

            return (
              <div
                className="countryCard"
                role="listitem"
                key={getKey(c, idx)}
                style={styles.card}
              >
                {flag && (
                  <img
                    src={flag}
                    alt={`Flag of ${name}`}
                    loading="lazy"
                    style={styles.flag}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div style={styles.name}>{name}</div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

/* --------------------- Styles --------------------- */

const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  title: { margin: "0 0 12px 0", fontSize: 24, fontWeight: 700 },
  search: {
    width: "100%",
    maxWidth: 420,
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
    outline: "none",
    marginBottom: 16,
  },
  loading: { padding: "24px 0", color: "#555" },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "flex-start",
  },
  card: {
    width: 180,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  flag: {
    width: "100%",
    height: 110,
    objectFit: "cover",
    display: "block",
    background: "#f8fafc",
  },
  name: {
    padding: "10px 12px",
    width: "100%",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 14,
  },
};