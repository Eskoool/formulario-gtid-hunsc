/**
 * Backend del formulario de solicitudes del Grupo de Trabajo de Innovación Digital (HUNSC).
 *
 * Qué hace:
 *   - Recibe el POST del formulario (index.html).
 *   - Registra la solicitud como una fila en una Hoja de cálculo de Google (trazabilidad, ap. 5.5).
 *   - Envía un correo con la solicitud al buzón configurado (DESTINATARIO).
 *
 * Cómo se despliega: ver README.md → "Despliegue del backend".
 *
 * IMPORTANTE (protección de datos): este script recoge datos identificativos de profesionales.
 * Revisa el aviso del README sobre el uso de un Gmail personal frente a un buzón corporativo
 * del SCS antes de publicar el formulario.
 */

// ======================= CONFIGURACIÓN =======================
var CONFIG = {
  // Correo(s) que reciben aviso de cada solicitud. Separar varios por comas.
  DESTINATARIO: 'yaredgpz@gmail.com',

  // Nombre de la pestaña de la Hoja donde se registran las filas.
  HOJA: 'Solicitudes',

  // Asunto del correo de aviso.
  ASUNTO: '[GTID HUNSC] Nueva solicitud recibida',

  // Orígenes permitidos para CORS. Usa '*' en pruebas; en producción pon el dominio
  // donde alojes index.html (p. ej. 'https://usuario.github.io').
  ORIGEN_PERMITIDO: '*'
};

// Orden y etiquetas de las columnas registradas en la Hoja.
var COLUMNAS = [
  ['_fecha_envio', 'Fecha de envío'],
  ['tipo',         'Tipo'],
  ['nombre',       'Nombre'],
  ['servicio',     'Servicio/unidad'],
  ['email',        'Correo'],
  // Vía proyecto
  ['p_titulo',     'Proyecto: nombre'],
  ['p_fase',       'Proyecto: fase'],
  ['p_desc',       'Proyecto: descripción'],
  // Vía consulta
  ['c_consulta',   'Consulta'],
  // Común
  ['enlace',       'Enlace']
];

// ======================= ENTRADA POST =======================
function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);

    // Validación mínima en servidor.
    if (!datos.tipo || !datos.nombre || !datos.email) {
      return _json({ ok: false, error: 'Faltan campos obligatorios.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(datos.email))) {
      return _json({ ok: false, error: 'Correo no válido.' });
    }

    _registrarEnHoja(datos);
    _enviarCorreo(datos);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// Comprobación de salud (abrir la URL en el navegador devuelve un OK).
function doGet() {
  return _json({ ok: true, servicio: 'Formulario GTID HUNSC', estado: 'activo' });
}

// ======================= REGISTRO EN HOJA =======================
function _registrarEnHoja(datos) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(CONFIG.HOJA);
  }
  // Cabecera si la hoja está vacía.
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS.map(function (c) { return c[1]; }));
    hoja.setFrozenRows(1);
  }
  var fila = COLUMNAS.map(function (c) {
    var v = datos[c[0]];
    return (v === undefined || v === null) ? '' : String(v);
  });
  hoja.appendRow(fila);
}

// ======================= CORREO DE AVISO =======================
function _enviarCorreo(datos) {
  var esProyecto = datos.tipo === 'proyecto';
  var lineas = [];
  lineas.push('Se ha recibido una nueva solicitud a través del formulario del GTID.');
  lineas.push('');
  lineas.push('Tipo: ' + (esProyecto ? 'Propuesta de proyecto' : 'Consulta'));
  lineas.push('Fecha: ' + (datos._fecha_envio || ''));
  lineas.push('');
  lineas.push('— Solicitante —');
  lineas.push('Nombre: ' + (datos.nombre || ''));
  lineas.push('Servicio/unidad: ' + (datos.servicio || ''));
  lineas.push('Correo: ' + (datos.email || ''));
  lineas.push('');

  if (esProyecto) {
    lineas.push('— Proyecto —');
    lineas.push('Nombre del proyecto: ' + (datos.p_titulo || ''));
    lineas.push('Fase: ' + (datos.p_fase || ''));
    if (datos.p_desc) lineas.push('Descripción: ' + datos.p_desc);
  } else {
    lineas.push('— Consulta —');
    lineas.push((datos.c_consulta || ''));
  }

  lineas.push('');
  if (datos.enlace) lineas.push('Enlace: ' + datos.enlace);
  lineas.push('');
  lineas.push('— — —');
  lineas.push('Solicitud registrada automáticamente en la Hoja de cálculo asociada.');

  var opciones = { name: 'Formulario GTID HUNSC' };
  // Permite responder directamente al solicitante.
  if (datos.email) opciones.replyTo = datos.email;

  MailApp.sendEmail(CONFIG.DESTINATARIO, CONFIG.ASUNTO, lineas.join('\n'), opciones);
}

// ======================= RESPUESTA JSON =======================
function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
