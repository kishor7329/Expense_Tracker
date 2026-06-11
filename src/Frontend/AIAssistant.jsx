import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./style/AIAssistant.css";

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("mistral-tiny");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const models = [
    {
      id: "mistral-tiny",
      name: "Mistral Tiny",
      description: "Fastest responses",
    },
    {
      id: "mistral-small",
      name: "Mistral Small",
      description: "Balanced quality",
    },
    {
      id: "mistral-medium",
      name: "Mistral Medium",
      description: "Best reasoning",
    },
  ];

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("ai_chat_history");
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChatHistory(parsed);
      if (parsed.length > 0) {
        setCurrentChatId(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chatHistory.length + 1}`,
      messages: [],
      createdAt: new Date(),
    };
    setChatHistory([newChat, ...chatHistory]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const newHistory = chatHistory.filter((c) => c.id !== chatId);
    setChatHistory(newHistory);
    if (currentChatId === chatId) {
      if (newHistory.length > 0) {
        setCurrentChatId(newHistory[0].id);
        setMessages(newHistory[0].messages);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  };

  const updateCurrentChatMessages = (newMessages) => {
    setMessages(newMessages);
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: newMessages,
              title: newMessages[0]?.content?.slice(0, 30) || chat.title,
            }
          : chat,
      ),
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    updateCurrentChatMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const history = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

 try {
   const token = localStorage.getItem("token");
   const response = await axios.post(
     "http://localhost:5000/api/ai/chat",
     {
       message: input,
       model: selectedModel,
       history: history,
     },
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     },
   );

   if (response.data.success) {
     const aiMessage = {
       role: "assistant",
       content: response.data.response,
       timestamp: new Date(),
       model: selectedModel,
     };
     updateCurrentChatMessages([...updatedMessages, aiMessage]);
   } else {
     throw new Error(response.data.error);
   }
 } catch (error) {
   console.error("AI Chat Error:", error); // ADD THIS LINE
   console.error("Error Response:", error.response); // ADD THIS LINE
   const errorMessage = {
     role: "assistant",
     content: "⚠️ Something went wrong. Please try again.",
     timestamp: new Date(),
     isError: true,
   };
   updateCurrentChatMessages([...updatedMessages, errorMessage]);
 } finally {
   setIsLoading(false);
   inputRef.current?.focus();
 }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getSelectedModelName = () => {
    return models.find((m) => m.id === selectedModel)?.name || "Select Model";
  };

  return (
    <div className="ai-assistant-container">
      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`ai-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-history-list">
          {chatHistory.length === 0 ? (
            <p className="no-chats">No chats yet. Start a new conversation!</p>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`chat-history-item ${currentChatId === chat.id ? "active" : ""}`}
                onClick={() => loadChat(chat.id)}
              >
                <span className="chat-title">{chat.title}</span>
                <button
                  className="delete-chat-btn"
                  onClick={(e) => deleteChat(chat.id, e)}
                >
                  delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header with Sidebar Toggle Icon */}
        <div className="chat-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? "◀" : "☰"}
          </button>

          <div className="header-placeholder"></div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🤖</div>
              <h2>Welcome to SynTropy AI</h2>
              <p>Your personal financial assistant and productivity coach.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-author">
                      {msg.role === "user" ? "You" : "SynTropy AI"}
                    </span>
                    {msg.role === "assistant" && (
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="message-text">
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.model && msg.role === "assistant" && (
                    <div className="message-model-badge">{msg.model}</div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Model Dropdown for all devices */}
        <div className="input-area">
          {/* Model Dropdown for all devices */}
          <div className="model-dropdown-container">
            <button
              className="model-dropdown-btn"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
            >
              {getSelectedModelName()} <span className="dropdown-arrow">▼</span>
            </button>
            {showModelDropdown && (
              <div className="model-dropdown-menu">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`model-dropdown-item ${selectedModel === model.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="model-desc">{model.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about Expenses..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className={`send-btn ${isLoading ? "disabled" : ""}`}
              onClick={sendMessage}
              disabled={isLoading}
            >
              <img src="/sendBtn.svg" alt="Send" className="send-btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
