const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 3333;

// Fungsi untuk menghapus karakter ANSI
function stripAnsi(string) {
    return string.replace(
        /[\u001b\u009b][[()#;?]*((?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~]*)?)?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[0-9A-ORZcf-nqry=><~])/g,
        ""
    );
}

// Middleware untuk CORS
app.use(
    cors({
        origin: "*", // Ganti dengan origin tertentu jika dibutuhkan
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint untuk streaming hasil dari model
app.post("/api/generate", (req, res) => {
    const { model, prompt } = req.body;

    if (!model || !prompt) {
        return res.status(400).json({ error: "Model dan prompt harus diisi" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ollamaProcess = spawn("ollama", ["run", model], {
        stdio: ["pipe", "pipe", "pipe"],
    });

    let buffer = ""; // Buffer untuk menyimpan chunk sementara

    // Kirim prompt ke stdin dari proses Ollama
    ollamaProcess.stdin.write(prompt + "\n");
    ollamaProcess.stdin.end();

    // Tangkap data dari stdout
    ollamaProcess.stdout.on("data", (data) => {
        const chunk = stripAnsi(data.toString()); // Hapus karakter ANSI
        buffer += chunk; // Tambahkan chunk ke buffer

        // Cek apakah ada akhir kalimat (tanda baca seperti . atau ?)
        if (/[.!?]\s*$/.test(buffer)) {
            const parsedChunk = buffer
                .replace(/\n\s*\n/g, "\n\n") // Tambahkan paragraf dengan dua baris kosong
                .replace(/\s+/g, " ") // Hapus spasi berlebih
                .trim();

            // Kirimkan kalimat/paragraf lengkap ke frontend
            res.write(`data: ${JSON.stringify({ message: parsedChunk })}\n\n`);
            buffer = ""; // Kosongkan buffer setelah data dikirim
        }
    });

    // Tangani akhir proses
    ollamaProcess.on("close", () => {
        // Kirim sisa buffer jika ada
        if (buffer.trim()) {
            const parsedChunk = buffer
                .replace(/\n\s*\n/g, "\n\n")
                .replace(/\s+/g, " ")
                .trim();

            res.write(`data: ${JSON.stringify({ message: parsedChunk })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end(); // Tutup koneksi SSE
    });

    // Tangani error
    ollamaProcess.stderr.on("data", (data) => {
        const error = stripAnsi(data.toString()); // Hapus karakter ANSI
        console.error(`Error: ${error}`); // Log error ke console
        if (error.trim()) {
            res.write(`data: ${JSON.stringify({ error })}\n\n`);
        }
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Backend berjalan di http://0.0.0.0:${PORT}`);
});