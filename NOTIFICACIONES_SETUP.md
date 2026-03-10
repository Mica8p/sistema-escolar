# Sistema de Validación y Notificaciones de Notas - GUÍA IMPLEMENTACIÓN

## ¿Qué cambió?

Se implementaron 3 funcionalidades principales:

### 1. ✅ Validación al Cerrar Período
**Problema:** Se permitía cerrar períodos sin que todos los docentes hayan cargado notas.
**Solución:** Ahora al intentar cerrar un período, se valida que todas las notas estén cargadas. Si faltan, muestra un mensaje detallado indicando:
- Qué alumnos les falta nota
- En qué materia
- Qué docente debe cargarlas

**Ubicación del código:**
- `src/service/calificaciones.service.ts` → Función `validarNotasFaltantesPeriodo()`
- `src/lib/actions/periodo-actions.ts` → Función `togglePeriodoCerradoAction()` 
- `src/lib/actions/calificaciones-actions.ts` → Función `cambiarEstadoPeriodoAction()`

### 2. 📬 Notificaciones a Docentes (2 días antes)
**Automático:** Se genera un comunicado en el sistema que notifica a cada docente que faltan 2 días para cerrar el período.

**Ubicación del código:**
- `src/service/calificaciones.service.ts` → Función `generarNotificacionesNotasPendientes()`

### 3. 🔄 Endpoint para Ejecutar la Validación Diaria
**¡EL ENDPOINT CRON HA SIDO ELIMINADO!**
La notificación a docentes ahora es dinámica y se muestra al acceder al dashboard, sin necesidad de una ejecución programada diaria.

**Ubicación:**
- `src/service/calificaciones.service.ts` → Nueva función `getDocenteDashboardPendingNotifications()`

---

## ⚙️ CONFIGURACIÓN REQUERIDA

**¡YA NO SE REQUIERE CONFIGURACIÓN DE CRON NI `CRON_SECRET`!**
El sistema de notificaciones para docentes es ahora dinámico y se activa al cargar el dashboard del profesor.

---

## 📝 Ejemplos de Uso

### Frontend - Al intentar cerrar período:
El comportamiento de validación al cerrar un período por parte del administrador se mantiene igual.

```
Usuario: Intenta cerrar período TRIMESTRE_1
Sistema: ❌ "Faltan notas para los siguientes alumnos:

📌 Prof. Juan García:
  • Pérez, Mario - Matemática
  • González, Laura - Matemática
  ... y 5 más"
```

### Backend - La validación se ejecuta automáticamente:

```typescript
// Cada día a las 9 AM, se ejecuta:
GET /api/cron/generar-notificaciones?auth=tu_secret

Respuesta:
{
  "success": true,
  "message": "Notificaciones generadas para 2 período(s)",
  "timestamp": "2025-03-09T09:00:00.000Z"
}
```

---

## 🧪 Pruebas Locales

Para probar sin esperar al cron:

```typescript
// En tu terminal (Node.js):
import { generarNotificacionesNotasPendientes } from "@/service/calificaciones.service";

await generarNotificacionesNotasPendientes(1); // ID del período
```

O llamá el endpoint en desarrollo:

```bash
curl "http://localhost:3000/api/cron/generar-notificaciones" \
  -H "Authorization: Bearer development"
```

(Pero primero agregá `CRON_SECRET=development` a `.env.local`)

---

## 📦 Base de Datos

✅ No requiere migraciones nuevas. Usa la tabla `COMUNICADO` existente.

Las notificaciones se guardan como comunicados con:
- `target`: "DOCENTE"
- `titulo`: Recordatorio con periodo
- `contenido`: Aviso sobre cierre en X días
- `idUsuario`: ID del docente

---

## 🔍 Monitoreo

Para ver qué notificaciones se generaron:

**SQL:**
```sql
SELECT * FROM COMUNICADO 
WHERE titulo LIKE '%Recordatorio%' 
ORDER BY fecha DESC;
```

**Prisma:**
```typescript
const notificaciones = await db.comunicado.findMany({
  where: { titulo: { contains: 'Recordatorio' } },
  orderBy: { fecha: 'desc' }
});
```

---

## ⚠️ Notas Importantes

1. **Seguridad:** El `CRON_SECRET` debe ser único y seguro. En Vercel, usa secrets automáticos.
2. **Zona horaria:** El horario del cron es UTC. Ajustá según tu zona.
3. **Validación de notas:** Considera cualquier tipo de nota (Parcial, Final, Recuperatorio).
4. **Docentes sin usuario:** Se saltan automáticamente si no tienen usuario asociado.

---

## 📧 Próximas mejoras posibles

- [ ] Enviar email además de comunicado en sistema
- [ ] Configurarle recordatorio 5 días antes también
- [ ] Dashboard mostrando docentes con notas pendientes
- [ ] Diferencias por materia/profesor
