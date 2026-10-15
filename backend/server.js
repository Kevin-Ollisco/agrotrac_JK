/* ===== AgroTrac · backend (Node + Express) =====
   - Sirve el sitio (carpeta superior)
   - POST /api/contacto : valida, guarda el pedido en leads.json y devuelve el enlace de WhatsApp
   - GET  /api/leads    : lista los pedidos (header x-admin-key) */
require("dotenv").config();
const express = require("express"), cors = require("cors"), fs = require("fs"), path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PHONE = process.env.WHATSAPP_PHONE || "591XXXXXXXX";
const FILE = path.join(__dirname, "leads.json");
const SERVICIOS = ["Romplow", "Arado", "Rastreada", "Boleadora", "Fumigada"];
const hits = new Map(); // límite simple: 5 envíos por IP cada 10 min

app.use(cors());
app.use(express.json({ limit: "10kb" }));
const root = path.join(__dirname, "..");
app.use("/css", express.static(path.join(root, "css")));
app.use("/js", express.static(path.join(root, "js")));
app.use("/img", express.static(path.join(root, "img")));
app.get("/", (req, res) => res.sendFile(path.join(root, "index.html")));

const clean = (v, n = 120) => String(v || "").replace(/[<>]/g, "").trim().slice(0, n);
const readLeads = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : []);

app.post("/api/contacto", (req, res) => {
  const ip = req.ip, now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return res.status(429).json({ error: "Demasiados envíos. Intenta en unos minutos." });
  hits.set(ip, [...recent, now]);

  if (req.body.web) return res.json({ ok: true }); // honeypot anti-spam
  const lead = {
    nombre: clean(req.body.nombre), telefono: clean(req.body.telefono, 20),
    ubicacion: clean(req.body.ubicacion), hectareas: clean(req.body.hectareas, 10),
    servicio: SERVICIOS.includes(req.body.servicio) ? req.body.servicio : "Otro",
    fecha: new Date().toISOString()
  };
  if (!lead.nombre || !/^[0-9+\s-]{6,20}$/.test(lead.telefono) || !lead.ubicacion)
    return res.status(400).json({ error: "Revisa nombre, teléfono y ubicación." });

  const leads = readLeads(); leads.push(lead);
  fs.writeFileSync(FILE, JSON.stringify(leads, null, 2));

  const texto = `Hola, quisiera cotizar un servicio de ${lead.servicio} para ${lead.hectareas || "[X]"} hectáreas. Soy ${lead.nombre}, mi teléfono es ${lead.telefono} y la propiedad está en ${lead.ubicacion}.`;
  res.json({ ok: true, whatsappUrl: `https://wa.me/${PHONE}?text=${encodeURIComponent(texto)}` });
});

app.get("/api/leads", (req, res) => {
  if (req.get("x-admin-key") !== process.env.ADMIN_KEY) return res.status(401).json({ error: "No autorizado" });
  res.json(readLeads());
});

app.listen(PORT, () => console.log(`AgroTrac en http://localhost:${PORT}`));
