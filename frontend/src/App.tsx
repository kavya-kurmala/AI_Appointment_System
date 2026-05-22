import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [phone, setPhone] = useState("9876543210");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [language, setLanguage] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const [listening, setListening] = useState(false);

  const sendMessage = async (text?: string) => {
    const finalMessage = text || message;

    if (!finalMessage.trim()) return;

    const res = await axios.post("http://127.0.0.1:8000/chat", {
      phone,
      message: finalMessage,
    });

    setReply(res.data.reply);
    setLanguage(res.data.language);
    setLatency(res.data.latency_ms);

    speak(res.data.reply);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);

    if (language === "hi") utterance.lang = "hi-IN";
    else if (language === "ta") utterance.lang = "ta-IN";
    else utterance.lang = "en-IN";

    window.speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
      sendMessage(voiceText);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Real-Time Multilingual Voice AI Agent</h1>
        <p>Clinical Appointment Booking Assistant</p>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Patient Phone Number"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type or speak your request..."
        />

        <div className="buttons">
          <button onClick={() => sendMessage()}>Send</button>
          <button onClick={startVoice}>
            {listening ? "Listening..." : "Start Voice"}
          </button>
        </div>

        {reply && (
          <div className="response">
            <h3>Agent Response</h3>
            <p>{reply}</p>
            <p><b>Language:</b> {language}</p>
            <p><b>Latency:</b> {latency} ms</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;