/**
 * GUÍA RÁPIDA DE CÓDIGO - Sistema de Validación y Notificaciones
 * Ejemplos y snippets reutilizables
 */

// ============================================
// 1. VALIDAR SI PERÍODO TIENE NOTAS FALTANTES
// ============================================

import { validarNotasFaltantesPeriodo } from "@/service/calificaciones.service";

// Uso:
const resultado = await validarNotasFaltantesPeriodo(idPeriodo);

if (!resultado.ok) {
  console.log("❌", resultado.mensaje);
  // Muestra:
  // Faltan notas para los siguientes alumnos:
  // 📌 Prof. Juan García: 
  // - González, Laura - Matemática
  // ...
} else {
  console.log("✅ Todas las notas están cargadas");
}

// ============================================
// 2. OBTENER NOTIFICACIONES PARA EL DASHBOARD DEL DOCENTE
// ============================================

import { getDocenteDashboardPendingNotifications } from "@/service/calificaciones.service";

// Uso (desde el componente del dashboard del docente):
const idProfesorActual = 1; // Obtener del usuario logueado
const idCicloActual = 1;    // Obtener del ciclo actual

const notificacionesDocente = await getDocenteDashboardPendingNotifications(idProfesorActual, idCicloActual);

if (notificacionesDocente.length > 0) {
  console.log("El docente tiene las siguientes notificaciones pendientes:", notificacionesDocente);
  // Renderizar estas notificaciones en el dashboard
} else {
  console.log("El docente no tiene notificaciones de notas pendientes.");
}

// ============================================
// 3. CERRAR PERÍODO (CON VALIDACIÓN)
// ============================================

import { togglePeriodoCerradoAction } from "@/lib/actions/periodo-actions";

const result = await togglePeriodoCerradoAction(idPeriodo, true);

if (result.success) {
  toast.success("Período cerrado");
} else {
  // Muestra mensaje detallado:
  toast.error(result.message);
}

// ============================================
// 4. EL ENDPOINT CRON HA SIDO ELIMINADO
// ============================================

// El endpoint `/api/cron/generar-notificaciones` y el script `run-notifications.ts`
// han sido eliminados. La lógica de notificación ahora es dinámica y se ejecuta
// al cargar el dashboard del docente.

// ============================================
// 5. VERIFICAR QULÉ NOTAS FALTAN EN BD
// ============================================

import db from "@/lib/db";

// Obtener todos los alumnos sin nota en un período
const alumnosSinNota = await db.$queryRaw`
  SELECT 
    p.nombre,
    p.apellido,
    m.nombre as materia
  FROM MATRICULA mat
  JOIN ALUMNO a ON mat.idAlumno = a.idAlumno
  JOIN PERSONA p ON a.idPersona = p.idPersona
  JOIN CICLO_LECTIVO c ON mat.idCiclo = c.idCiclo
  JOIN ASIGNACION_ACADEMICA asig ON asig.idCiclo = c.idCiclo 
    AND asig.idCurso = mat.idCurso
  JOIN MATERIA m ON asig.idMateria = m.idMateria
  LEFT JOIN NOTA n ON n.idMatricula = mat.idMatricula 
    AND n.idAsignacion = asig.idAsignacion
    AND n.idPeriodo = ${idPeriodo}
  WHERE mat.estadoAcademico = 'Activo'
    AND asig.estado = true
    AND n.idNota IS NULL
`;

console.log(alumnosSinNota);

// ============================================
// 6. LOS COMUNICADOS AUTOMÁTICOS YA NO SE GENERAN
// ============================================

// La funcionalidad de generar comunicados automáticos para recordatorios de notas
// ha sido eliminada. La notificación ahora es dinámica en el dashboard del docente.
// La tabla `COMUNICADO` sigue existiendo para comunicados manuales.

// ============================================
// 7. MARCAR COMUNICADO COMO LEÍDO (PROFESOR)
// ============================================

await db.comunicadoVisto.create({
  data: {
    idComunicado: idCom,
    idUsuario: idUsuarioProfesor,
    fechaLectura: new Date()
  }
});

// ============================================
// 8. ENVÍO VÍA EMAIL (FUTURO)
// ============================================

// Por ahora solo crea comunicado (dashboard)
// Para email, sugiero integrar Nodemailer:

import { sendEmail } from "@/lib/email";

await sendEmail({
  to: profesor.email,
  subject: `📋 Recordatorio: Cierre de ${periodo.nombre}`,
  html: `
    <h2>Hola ${profesor.nombre},</h2>
    <p>Te recordamos que el período cierra ${diasFaltantes} días.</p>
    <p>Materia: ${materia.nombre}</p>
    <p>Curso: ${curso.grado}° "${curso.seccion}"</p>
  `
});

// ============================================
// 9. LA CONFIGURACIÓN DE CRON HA SIDO ELIMINADA
// ============================================

// Ya no se requiere configuración de horarios para las notificaciones de notas pendientes,
// ya que se muestran dinámicamente al cargar el dashboard del docente.

// ============================================
// 10. DEBUGGING: LOGS EN PRODUCCIÓN
// ============================================

// En validarNotasFaltantesPeriodo():
console.log(`[DEBUG] Validando período ${idPeriodo}`);
console.log(`[DEBUG] Encontradas ${matriculas.length} matrículas`);
console.log(`[DEBUG] Encontradas ${asignaciones.length} asignaciones`);
console.log(`[DEBUG] Total notas faltantes: ${notasFaltantes.length}`);

// Ver en:
// - Terminal (local): npm run dev
// - Vercel: Dashboard → Logs
// - Servidor: /var/log/next.log o similar

// ============================================
// CASOS DE USO PRÁCTPICO
// ============================================

// CASO 1: Admin cierra período
// - Click "Cerrar Período" 
//   → validarNotasFaltantesPeriodo()
//   → Si OK: cierra, si NO: muestra error detallado

// CASO 2: Docente accede a su dashboard
// - Se llama a `getDocenteDashboardPendingNotifications()`
// - Si hay notificaciones, se muestran directamente en el dashboard
// - No se crean comunicados en la base de datos

// CASO 3: Profesor intenta cargar nota en período cerrado
// - En guardarNota(), se valida:
//   if (periodo?.cerrado) throw "Período cerrado"

// ============================================
// REFERENCIAS ÚTILES
// ============================================

/*
Base de datos:
- COMUNICADO: Donde se guardan las notificaciones
- PERIODO_ACADEMICO: Períodos con fechas
- NOTA: Calificaciones (que se validan)
Funciones clave:
- validarNotasFaltantesPeriodo(): Verifica si faltan notas
- getDocenteDashboardPendingNotifications(): Obtiene notificaciones para el dashboard del docente
- togglePeriodoCerradoAction(): Cierra período (valida)
*/
