import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing scanner...");

  const API = "http://192.168.1.105:5000";

useEffect(() => {
  const scanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 300,
  });

  setStatus("📷 Scanning...");

  scanner.render(
    async (decodedText) => {
      // 🛑 STOP scanner after success
      scanner.clear();

      setMessage("✅ Scan Successful!");
      setLoading(true);

      // 🔊 Beep
      const audio = new Audio(
        "https://www.soundjay.com/buttons/sounds/beep-01a.mp3"
      );
      audio.play();

      try {
        await axios.post("http://192.168.1.105:5000/api/scan", {
          value: decodedText,
          type: "QR/Barcode",
        });

        fetchHistory();
      } catch (err) {
        console.error(err);
        setStatus("❌ Failed to save scan");
      }

      setLoading(false);

      // 🔄 Restart scanner after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    (error) => {
      // ignore continuous scan errors
    }
  );

  fetchHistory();
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

      {/* Success Message */}
      {message && <div className="success">{message}</div>}

      {/* Scanner */}
      <div id="reader"></div>

      {/* Status */}
      <div className="status">{status}</div>

      {/* Loading */}
      {loading && <p>⏳ Saving scan...</p>}

      {/* History */}
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
