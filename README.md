# AgroTrac
Estructura:
  index.html · css/styles.css · js/main.js · img/ (tus fotos) · backend/ (Node)

## Solo frontend (sin backend)
Abre index.html. El formulario enviará directo a WhatsApp.

## Con backend
  cd backend
  npm install
  cp .env.example .env     # pon tu número y clave
  npm start                # http://localhost:3000
Los pedidos se guardan en backend/leads.json. Ver: GET /api/leads con header x-admin-key.

## Qué editar
js/main.js → CONFIG (teléfono, mapa) y SERVICIOS.  index.html → textos, zonas, horarios, redes.
