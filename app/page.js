"use client";



import { useState, useEffect, useRef } from "react";



export default function Page() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const usStateCodes = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  New_Hampshire: "NH",
  New_Jersey: "NJ",
  New_Mexico: "NM",
  New_York: "NY",
  North_Carolina: "NC",
  North_Dakota: "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  Rhode_Island: "RI",
  South_Carolina: "SC",
  South_Dakota: "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  West_Virginia: "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};


  
  const inputRef = useRef(null);
  const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
 // Click-away listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the input or suggestions container, clear suggestions
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Fetch city suggestions (debounced)
  useEffect(() => {
    if (!query) return setSuggestions([]);
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            query
          )}&limit=5&appid=${key}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    }, 300); // 300ms debounce

    setDebounceTimer(timer);
  }, [query]);

  const selectCity = async (city) => {
  setSuggestions([]);
  setQuery(`${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`);
  setError(null);
  setWeather(null);
  setForecast([]);

  try {
    // Fetch current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=imperial&appid=${key}`
    );
    const weatherData = await weatherRes.json();

    // Add US state abbreviation if applicable
    const stateKey = city.state ? city.state.replace(/\s/g, "_") : "";
    weatherData.state = city.country === "US" && stateKey ? usStateCodes[stateKey] || city.state : "";

    setWeather(weatherData);

    // Fetch 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=imperial&appid=${key}`
    );
    const forecastData = await forecastRes.json();
    const daily = forecastData.list.filter((_, i) => i % 8 === 0);
    setForecast(daily);
  } catch (err) {
    setError("Failed to fetch weather.");
    console.error(err);
  }
};


  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to bottom right, #003366, #66a6ff)",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
{/* Header */}
{!weather && (
  <header style={{ textAlign: "center", padding: "2rem 0" }}>
    <h1 style={{ fontSize: "4rem", fontWeight: 600, margin: 0 }}>Weather Dashboard</h1>
  </header>
)}


      {/* Search Input */}
      <section
  style={{ marginBottom: "2rem", position: "relative", width: "100%", maxWidth: "400px" }}
  ref={inputRef} // ✅ attach ref here
>
  <input
    type="text"
    placeholder="Enter city..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    style={{
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "none",
      fontSize: "1rem",
      backgroundColor: "white",
      color: "black",
    }}
  />
  {suggestions.length > 0 && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        color: "black",
        borderRadius: "6px",
        marginTop: "0.25rem",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {suggestions.map((s, i) => (
        <div
          key={i}
          style={{ padding: "0.5rem", cursor: "pointer", borderBottom: i < suggestions.length - 1 ? "1px solid #ccc" : "none" }}
          onClick={() => selectCity(s)}
        >
          {s.name}{s.state ? ", " + s.state : ""}, {s.country}
        </div>
      ))}
    </div>
  )}
</section>


      {/* Error */}
      {error && <p style={{ color: "#ffcccc" }}>{error}</p>}

      {/* Current Weather */}
      {weather && (
        <section
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "1.5rem",
            width: "80%",
            maxWidth: "500px",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
<h2 style={{ fontSize: "3rem" }}>
  {weather.name}
  {weather.state ? `, ${weather.state}` : ""}
  {weather.state ? "" : `, ${weather.sys.country}`} {/* only show country if no state */}
</h2>





<div style={{ textAlign: "center" }}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="Weather icon"
              width="80"
              height="80"
              style={{ display: "block", margin: "0 auto" }}
            />
            <p style={{ fontSize: "3rem", fontWeight: 700, margin: "0.25rem 0" }}>
              {Math.round(weather.main.temp)}°F
            </p>
            <p style={{ fontSize: "1.2rem", margin: "0.1rem 0", textTransform: "capitalize" }}>
              {weather.weather[0].description}
            </p>
            <p style={{ margin: "0.1rem 0" }}>💧 {weather.main.humidity}% humidity</p>
            <p style={{ margin: "0.1rem 0" }}>💨 {weather.wind.speed} mph wind</p>
          </div>
        </section>
      )}

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <section
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "1.5rem",
            width: "80%",
            maxWidth: "500px",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3>5-Day Forecast</h3>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            {forecast.map((day, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.15)", padding: "1rem", borderRadius: "8px", width: "80px", textAlign: "center" }}>
                <p>{new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
                <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt={day.weather[0].description} />
                <p>{Math.round(day.main.temp)}°F</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ marginTop: "auto", padding: "1rem", textAlign: "center", fontSize: "0.9rem", opacity: 0.8 }}>
        Built with Next.js & OpenWeather API
      </footer>
    </main>
  );
}
