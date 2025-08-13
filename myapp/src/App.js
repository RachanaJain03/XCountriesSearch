import React, { useEffect, useState } from "react";

const API = "https://countries-search-data-prod-812920491762.asia-south1.run.app/countries";

const getName = (c) => {
  if (!c) return "";
  if (typeof c?.common === "string") return c.common;            // payload A: { common, png }
  if (typeof c?.name?.common === "string") return c.name.common; // payload B: { name: { common }, flags: { png } }
  if (typeof c?.name === "string") return c.name;
  if (typeof c?.countryName === "string") return c.countryName;
  if (typeof c?.country === "string") return c.country;
  return "";
};

const getFlag = (c) =>
  c?.png || c?.flags?.png || c?.flags?.svg || "";

export default function App() {
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCountries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? countries
      : countries.filter((c) => getName(c).toLowerCase().includes(q));

  return (
    <div style={styles.page}>
      <input
        type="text"
        placeholder="Search for countries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      {loading ? (
        <p style={styles.note}>Loading…</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((c, i) => {
            const name = getName(c) || "Unknown";
            const flagSrc = getFlag(c);
            return (
              <div
                key={c?.cca3 || c?.cca2 || c?.ccn3 || c?.cioc || `${name}-${i}`}
                className="countryCard"
                style={styles.card}
              >
                {flagSrc && <img src={flagSrc} alt={`flag of ${name}`} style={styles.flag} />}
                <h4 style={styles.name}>{name}</h4>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 16 },
  input: {
    width: "100%", maxWidth: 600, display: "block",
    margin: "0 auto 16px", padding: "8px 10px",
    border: "1px solid #ccc", borderRadius: 4, outline: "none",
  },
  grid: { display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" },
  card: {
    width: 160, minHeight: 160, border: "1px solid #e0e0e0",
    borderRadius: 8, padding: 12, display: "flex",
    flexDirection: "column", alignItems: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  flag: { width: 96, height: 64, objectFit: "cover", display: "block", marginBottom: 8 },
  name: { margin: 0, fontSize: 14, textAlign: "center" },
  note: { textAlign: "center", opacity: 0.7 },
};