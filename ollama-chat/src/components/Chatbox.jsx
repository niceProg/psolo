import React, { useState, useEffect, useRef } from "react";

const Chatbox = ({ messages, sendMessage }) => {
     const [input, setInput] = useState("");
     const chatRef = useRef(null);

     // Auto-scroll ke bawah saat ada pesan baru
     useEffect(() => {
          chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
     }, [messages]);

     const handleSend = () => {
          if (input.trim() === "") return;
          sendMessage(input);
          setInput("");
     };

     return (
          <div className="flex flex-col h-96 border rounded-lg shadow-inner p-3 bg-gray-50">
               {/* Chat messages */}
               <div ref={chatRef} className="flex-grow overflow-y-auto mb-2 p-2 border rounded-md bg-white space-y-2">
                    {messages.length === 0 ? (
                         <p className="text-center text-gray-400">Mulai percakapan...</p>
                    ) : (
                         messages.map((msg, index) => (
                              <div key={index} className={`p-2 rounded-md ${msg.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}>
                                   <strong>{msg.sender === "user" ? "You" : "Ollama"}:</strong> {msg.text}
                              </div>
                         ))
                    )}
               </div>

               {/* Input field */}
               <div className="flex gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-grow border p-2 rounded-md focus:ring focus:ring-blue-300" />
                    <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                         Send
                    </button>
               </div>
          </div>
     );
};

export default Chatbox;
