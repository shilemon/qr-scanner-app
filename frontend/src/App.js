import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing scanner...");

  // ✅ YOUR EC2 BACKEND
  const API = "http://3.109.209.159:5000";

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 5,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    });

    setStatus("📷 Scanning...");

    scanner.render(
      async (decodedText) => {
        setMessage("✅ Scan Successful!");
        setLoading(true);

        // 🔊 Beep sound
        const audio = new Audio(
          "https://www.soundjay.com/buttons/sounds/beep-01a.mp3"
        );
        audio.play();

        try {
          await axios.post(`${API}/api/scan`, {
            value: decodedText,
            type: "QR/Barcode",
          });

          fetchHistory();
        } catch (err) {
          console.error(err);
          setStatus("❌ Failed to save scan");
        }

        setLoading(false);

        setTimeout(() => setMessage(""), 2000);
      },
      () => {} // ignore errors
    );

    fetchHistory();

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load history");
    }
  };

  return (
    <div className="container">
      <h2>📷 QR & Barcode Scanner</h2>

      {/* ✅ Success */}
      {message && <div className="success">{message}</div>}

      {/* ✅ Scanner */}
      <div id="reader"></div>

      {/* ✅ Status */}
      <div className="status">{status}</div>

      {/* ✅ Loading */}
      {loading && <p>⏳ Saving scan...</p>}

      {/* ✅ History */}
      <h3>📜 Scan History</h3>

      <div className="history">
        {history.length === 0 ? (
          <p>No scans yet</p>
        ) : (
          history.map((item) => (
            <div className="card" key={item.id}>
              <p><strong>Value:</strong> {item.value}</p>
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Time:</strong> {item.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
