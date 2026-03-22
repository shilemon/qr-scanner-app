import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        setMessage("✅ Scan Successful!");

        try {
          await axios.post("http://localhost:5000/api/scan", {
            value: decodedText,
            type: "QR/Barcode",
          });

          fetchHistory();
        } catch (err) {
          console.error(err);
        }

        setTimeout(() => setMessage(""), 2000);
      },
      (error) => {
        console.warn(error);
      }
    );

    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>📷 QR & Barcode Scanner</h2>

      {message && <div className="success">{message}</div>}

      <div id="reader"></div>

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