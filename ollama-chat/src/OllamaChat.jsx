import React, { useState } from "react";
import Chatbox from "./components/Chatbox";

const OllamaChat = () => {
     const [messages, setMessages] = useState([]);
     const [selectedModel, setSelectedModel] = useState("deepseek-r1:1.5b");

     // Melacak pesan yang sudah diproses untuk menghindari duplikasi
     const processedChunks = new Set();

     // Fungsi fetchData untuk mengambil data dari API
     const fetchData = async (message) => {
          try {
               const response = await fetch("http://139.59.113.251:3333/api/generate", {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         model: selectedModel,
                         prompt: message,
                    }),
               });

               const reader = response.body.getReader();
               const decoder = new TextDecoder("utf-8");

               let chunk = "";
               while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunk += decoder.decode(value, { stream: true });

                    // Proses data streaming
                    const dataChunks = chunk.split("data:");
                    dataChunks.forEach((dataChunk) => {
                         if (dataChunk.trim()) {
                              try {
                                   const jsonData = JSON.parse(dataChunk.trim());

                                   // Periksa jika pesan sudah diproses sebelumnya
                                   if (jsonData.message && !processedChunks.has(jsonData.message)) {
                                        processedChunks.add(jsonData.message); // Tandai sebagai diproses
                                        const newMessage = { sender: "ollama", text: jsonData.message };
                                        setMessages((prevMessages) => [...prevMessages, newMessage]);
                                   } else if (jsonData.error) {
                                        console.error("Ollama Error:", jsonData.error);
                                   }
                              } catch (error) {
                                   console.log("Error parsing chunk:", error);
                              }
                         }
                    });
               }
          } catch (error) {
               console.error("Error fetching data:", error);
          }
     };

     // Fungsi mengirim pesan ke backend
     const sendMessage = (message) => {
          if (!message.trim()) return; // Hindari pengiriman pesan kosong

          const newMessage = { sender: "user", text: message };
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          // Mengambil data dari API setelah mengirim pesan
          fetchData(message);
     };

     return (
          <div className="flex justify-center items-center min-h-screen bg-gray-100 p-12">
               <div className="w-full w-lg bg-white shadow-lg rounded-lg p-6 border border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Ollama Chatbox</h2>

                    {/* Dropdown untuk memilih model */}
                    <div className="mb-6">
                         <label className="block text-sm font-medium text-gray-600">Pilih Model:</label>
                         <select
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300"
                         >
                              <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B</option>
                              <option value="deepseek-r1:7b">DeepSeek R1 7B</option>
                         </select>
                    </div>

                    {/* Komponen Chatbox */}
                    <Chatbox messages={messages} sendMessage={sendMessage} />
               </div>
          </div>
     );
};

export default OllamaChat;
