import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing scanner...");

  const API = "http://3.111.41.149:5000"; // ✅ EC2 backend

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    setStatus("📷 Starting camera...");

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;

        html5QrCode
          .start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 300, height: 300 },
            },
            async (decodedText) => {
              setMessage("✅ Scan Successful!");
              setLoading(true);

              // 🔊 Beep
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

              // ⏸️ small delay before next scan
              setTimeout(() => {
                setMessage("");
              }, 1500);
            },
            () => {
              // ignore scan errors
            }
          )
          .then(() => {
            setStatus("📷 Scanning...");
          })
          .catch((err) => {
            console.error(err);
            setStatus("❌ Camera start failed");
          });
      } else {
        setStatus("❌ No camera found");
      }
    });

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

      {message && <div className="success">{message}</div>}

      <div id="reader" style={{ width: "100%" }}></div>

      <div className="status">{status}</div>

      {loading && <p>⏳ Saving scan...</p>}

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