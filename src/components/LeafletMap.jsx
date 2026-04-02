import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMoon, FaSun } from "react-icons/fa";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function LeafletMap() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState([20, 0]);
  const [darkMode, setDarkMode] = useState(false);

  // Autocomplete search
  const searchPlaces = async (value) => {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`,
    );
    const data = await res.json();
    setResults(data);
  };

  // Select place
  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setSelectedPosition([lat, lon]);
    setResults([]);
    setQuery(place.display_name);
  };

  // Current location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setSelectedPosition([lat, lon]);
    });
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query) searchPlaces(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="h-screen w-full relative">
      {/* Search UI */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[1000] w-[400px]">
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => searchPlaces(e.target.value)}
              placeholder="Search location..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            />
            <button
              onClick={getCurrentLocation}
              className="cursor-pointer bg-blue-500 text-white px-3 rounded-lg"
            >
              Search
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="cursor-pointer bg-gray-800 text-white px-3 rounded-lg"
            >
              {darkMode ? <FaMoon /> : <FaSun />}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {results.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
              {results.map((place, index) => (
                <div
                  key={index}
                  onClick={() => selectPlace(place)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {place.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={selectedPosition}
        zoom={2}
        className="h-full w-full"
      >
        <ChangeView center={selectedPosition} />

        {/* <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
        {/* <TileLayer
          attribution="&copy; OpenStreetMap & CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        /> */}
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/*Multiple markers */}
        {results.map((place, index) => (
          <Marker key={index} position={[place.lat, place.lon]}>
            <Popup>{place.display_name}</Popup>
          </Marker>
        ))}

        {/*Selected marker */}
        <Marker position={selectedPosition}>
          <Popup>Selected Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
