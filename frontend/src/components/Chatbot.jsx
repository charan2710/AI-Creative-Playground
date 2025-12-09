// frontend/src/components/Chatbot.jsx
import React, { useState } from "react";
import "./Chatbot.css"; // optional – only if you have custom styles

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello there! How can I inspire your creative process today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleClear = () => {
    setMessages([
      {
        sender: "bot",
        text: "Chat cleared. Ask me anything about your creatives again! 🎨",
      },
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    // Simple fake AI reply for prototype
    setTimeout(() => {
      let reply =
        "I’m here to help! Try asking about layout ideas, color palettes, or ad copy suggestions.";

      if (/color|palette/i.test(trimmed)) {
        reply =
          "For your product, try using a primary brand color for the background gradient and a contrasting accent color for the CTA button.";
      } else if (/layout|composition|design/i.test(trimmed)) {
        reply =
          "Place the product in the focal center or using a diagonal composition, keep text near the edges, and always leave breathing room around the logo.";
      } else if (/copy|text|headline/i.test(trimmed)) {
        reply =
          "Use short, strong headlines like: 'New Arrivals', 'Unleash Your Speed', or 'Limited Edition Drop'. Keep it under 5–6 words.";
      }

      const botMessage = { sender: "bot", text: reply };
      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <>
      {/* Floating button */}
      <button
        className="chatbot-toggle-btn"
        onClick={toggleOpen}
        aria-label="Open creative assistant chat"
      >
        💬
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>AI Creative Assistant</span>
            <div className="chatbot-header-actions">
              <button className="chatbot-clear" onClick={handleClear}>
                Clear Chat
              </button>
              <button className="chatbot-close" onClick={toggleOpen}>
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === "bot"
                    ? "chatbot-message bot-message"
                    : "chatbot-message user-message"
                }
              >
                {msg.text}
              </div>
            ))}
            {isThinking && (
              <div className="chatbot-message bot-message">
                Typing…
              </div>
            )}
          </div>

          {/* THIS replaces "Chat is disabled for prototype" */}
          <form className="chatbot-input-row" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask about layouts, colors, or copy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim() || isThinking}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
