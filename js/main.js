/* ===== AgroTrac · lógica del frontend ===== */

/* 1. CONFIGURACIÓN: edita solo esto */
const CONFIG = {
  PHONE: "59174439888",                    // WhatsApp con código de país, sin + ni espacios
  API_URL: "/api/contacto",                // backend (ver carpeta backend/)
  MAPS_URL: "https://maps.app.goo.gl/cKnWCcs6W3CCqhuv7" // enlace a tu ubicación
};

/* 2. SERVICIOS (añade, quita o edita tarjetas aquí) */
const SERVICIOS = [
  { nombre: "Romplow",   foto: "img/romplow.jpg",   texto: "Preparación profunda de suelos duros y compactados.", icono: "<circle cx='12' cy='12' r='8'/><circle cx='12' cy='12' r='2'/><path d='M12 4v3M12 17v3M4 12h3M17 12h3'/>" },
  { nombre: "Arado",     foto: "img/arado.jpg",     texto: "Volteo y oxigenación del terreno antes de la siembra.", icono: "<path d='M4 8h16M4 12h16M4 16h16'/><path d='M7 20l-2-4M12 20l-2-4M17 20l-2-4'/>" },
  { nombre: "Rastreada", foto: "img/rastreada.jpg", texto: "Desterronado, nivelación y acabado fino de la tierra.", icono: "<path d='M3 9h18M3 15h18'/><path d='M6 9v8M10 9v8M14 9v8M18 9v8'/>" },
  { nombre: "Boleadora", foto: "img/boleadora.jpg", texto: "Dispersión uniforme de fertilizantes y semillas.", icono: "<path d='M8 4h8l-2 7h-4z'/><circle cx='8' cy='16' r='1'/><circle cx='12' cy='19' r='1'/><circle cx='16' cy='16' r='1'/>" },
  { nombre: "Fumigada",  foto: "img/fumigada.jpg",  texto: "Control de plagas y malezas con aplicación de precisión.", icono: "<path d='M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z'/><path d='M9.5 14a2.5 2.5 0 0 0 2.5 2.5'/>" },
  { nombre: "Tractor pequeño", foto: "img/tractor.jpg", texto: "Servicio de tractor pequeño para tareas de mantenimiento.", icono: "<circle cx='12' cy='12' r='8'/><circle cx='12' cy='12' r='2'/><path d='M12 4v3M12 17v3M4 12h3M17 12h3'/>" }
];

/* 3. UTILIDADES */
const $ = (s) => document.querySelector(s);
const waUrl = (txt) => `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(txt)}`;

/* 4. TARJETAS DE SERVICIO */
function renderServicios() {
  const grid = $("#grid"), sel = $("#sel");
  SERVICIOS.forEach((s) => {
    const msg = `Hola, quisiera cotizar un servicio de ${s.nombre} para [X] hectáreas.`;
    grid.insertAdjacentHTML("beforeend", `
      <article class="svc">
        <div class="slot photo-svc" data-label="${s.foto} · 1200×750"><img src="${s.foto}" alt="${s.nombre} con tractor" loading="lazy"></div>
        <div class="ic"><svg class="i" viewBox="0 0 24 24">${s.icono}</svg></div>
        <h3>${s.nombre}</h3><p>${s.texto}</p>
        <span class="tag">Cotización por hora / hectárea</span>
        <a href="${waUrl(msg)}" target="_blank" rel="noopener">Cotizar ${s.nombre}</a>
      </article>`);
    sel.insertAdjacentHTML("beforeend", `<option>${s.nombre}</option>`);
  });
}

/* 5. FOTOS: si falta el archivo, se muestra el recuadro "Pon aquí tu foto" */
function setupFotos() {
  document.querySelectorAll(".slot img").forEach((img) => {
    const slot = img.parentElement;
    const ok = () => { if (slot.classList.contains("hero-bg")) $("#inicio").classList.add("has-photo"); };
    img.addEventListener("error", () => slot.classList.add("missing"));
    img.addEventListener("load", ok);
    if (img.complete) img.naturalWidth ? ok() : slot.classList.add("missing");
  });
}

/* 6. FORMULARIO → backend → WhatsApp (si el backend falla, abre WhatsApp directo) */
function setupForm() {
  const form = $("#form"), msg = $("#msg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre.trim() || !d.telefono.trim() || !d.ubicacion.trim()) {
      msg.textContent = "Completa nombre, teléfono y ubicación."; return;
    }
    const texto = `Hola, quisiera cotizar un servicio de ${d.servicio} para ${d.hectareas || "[X]"} hectáreas. Soy ${d.nombre}, mi teléfono es ${d.telefono} y la propiedad está en ${d.ubicacion}.`;
    let url = waUrl(texto);
    try {
      const r = await fetch(CONFIG.API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const j = await r.json();
      if (!r.ok) { msg.textContent = j.error || "Revisa los datos."; return; }
      url = j.whatsappUrl || url;
    } catch (_) { /* sin backend: seguimos con WhatsApp directo */ }
    msg.textContent = "Listo, abriendo WhatsApp…";
    window.open(url, "_blank", "noopener");
    form.reset();
  });
}

/* 7. NAVEGACIÓN Y ENLACES */
function setupNav() {
  const ln = $("#links");
  $("#menu").onclick = () => ln.classList.toggle("open");
  ln.addEventListener("click", () => ln.classList.remove("open"));
  document.querySelectorAll(".js-wa").forEach((a) => (a.href = waUrl("Hola, quisiera cotizar un servicio agrícola con tractor.")));
  $("#mapLink").href = CONFIG.MAPS_URL;
}

renderServicios(); setupFotos(); setupForm(); setupNav();
