import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent config
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini SDK initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not set or placeholder. AI consultant features will use fallback.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini SDK:", err);
}

// ==========================================
// API ENDPOINTS
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Faraidh Scholar Consultation Endpoint
app.post("/api/explain", async (req, res) => {
  const { question, heirContext, assetsContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Pertanyaan wajib diisi." });
  }

  // If Gemini is not set up, return a supportive informative fallback mock
  if (!ai) {
    return res.json({
      answer: `**[Koneksi AI Terbatas]** Terimakasih atas pertanyaan Anda mengenai: *"${question}"*.\n\n` +
        `Untuk menggunakan konsultasi interaktif berbasis AI secara penuh, harap konfigurasikan **GEMINI_API_KEY** Anda di menu **Settings > Secrets**.\n\n` +
        `**Analisis Berdasarkan Kitab Ar-Rahbiyyah:**\n` +
        `- Ilmu Faraidh adalah kewajiban agama yang sangat mulia berdasarkan surah An-Nisa ayat 11, 12, dan 176.\n` +
        `- Sesuai kaidah Kitab Ar-Rahbiyyah, usahakan selalu mendahulukan penyelesaian tajhiz (pengurusan jenazah), pelunasan hutang-hutang pewaris, kemudian pelaksanaan wasiat (maksimal 1/3 harta) sebelum membagikan sisa tirkah kepada ahli waris ashabul furudh dan ashabah.`
    });
  }

  try {
    const prompt = `
Anda adalah seorang Ahli Faraidh (Ilmu Waris Islam) senior, berspesialisasi dalam Kitab klasik Ar-Rahbiyyah.
Tugas Anda adalah menanggapi pertanyaan pengguna tentang pembagian waris atau bait-bait dalam Kitab Ar-Rahbiyyah secara bijak, akademis, dan penuh rasa hormat.

Konteks saat ini:
- Pertanyaan Pengguna: "${question}"
- Konteks Ahli Waris Aktif di Kalkulator: ${JSON.stringify(heirContext || {})}
- Nominal Harta Peninggalan: Rp ${(assetsContext || 0).toLocaleString('id-ID')}

Tuntunan Jawaban:
1. Jawab menggunakan Bahasa Indonesia yang santun, profesional, dan mudah dipahami oleh masyarakat awam.
2. Cantumkan rujukan fikih terkait (misalnya pandangan Imam Syafi'i atau bait khusus dari Kitab Ar-Rahbiyyah jika relevan).
3. Berikan disclaimer di akhir jawaban bahwa ini adalah sarana edukasi simulatif, dan kepastian hukum nyata tetap harus dikonsultasikan langsung ke Pengadilan Agama atau lembaga syariat terpercaya.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({
      answer: response.text || "Maaf, AI tidak dapat menyusun tanggapan saat ini."
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Terjadi kesalahan sistem saat menghubungi konsultan AI Faraidh.",
      details: error.message
    });
  }
});

// ==========================================
// VITE DEV / PROD HANDLERS
// ==========================================

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Waris Rahbiyyah Server] Running locally on port ${PORT}`);
  });
}

setupServer();
