# 📋 VALIDACIÓN Y NOTIFICACIONES DE NOTAS - IMPLEMENTACIÓN COMPLETADA

## 🎯 OBJETIVO
Implementar un sistema que:
1. ✅ **Impida cerrar períodos** sin que todos los docentes carguen notas
2. ✅ **Notifique automáticamente** a los docentes 2 días antes del cierre
3. ✅ **Ejecute validaciones diarias** mediante cron

---

## ✨ SOLUCIONES IMPLEMENTADAS

### 1️⃣ VALIDACIÓN AL CERRAR PERÍODO

**Problema:** Se permitía cerrar períodos incompletos.

**Solución:** Antes de cerrar, se valida que TODAS las notas existan.

**Flujo:**
```
Admin → Click "Cerrar Período"
   ↓
validarNotasFaltantesPeriodo()
   ↓
¿Todas las notas cargadas? 
   ├→ SÍ: Período se cierra ✅
   └→ NO: Muestra mensaje detallado ❌
```

**Mensaje de Error (Ejemplo):**
```
❌ Faltan notas para los siguientes alumnos:

📌 Prof. María García:
  • González, Juan - Matemática
  • López, Laura - Química
  ... y 5 más

📌 Prof. Carlos López:
  • Pérez, Marco - English
  ... y 2 más
```

---

### 2️⃣ NOTIFICACIÓN AUTOMÁTICA (2 DÍAS ANTES)

**Todos los días a las 9:00 AM**, el sistema revisa si hay períodos por cerrar en 1-2 días.

**¿Qué pasa?**
- Se identifica a cada docente con notas PENDIENTES
- Se crea un **Comunicado en el Sistema** 
- El docente ve la notificación en su dashboard

**Mensaje que Recibe el Docente:**
```
📋 Recordatorio: Carga de notas - TRIMESTRE_1

Hola Juan,

Te recordamos que el período "TRIMESTRE_1" cierra en 2 día(s). 
Te recomendamos cargar las notas pendientes cuanto antes.

Materia: Matemática
Curso: 3° "A"

¡Gracias!
```

---

### 3️⃣ EJECUCIÓN AUTOMÁTICA DIARIA

**Endpoint Cron:** `GET /api/cron/generar-notificaciones`

**Seguridad:** Requiere Token Bearer en header `Authorization`

**Se ejecuta automáticamente:**
- ✅ En Vercel: Automático (configurado en vercel.json)
- ⚙️ En servidor propio: Via crontab (Linux/Mac) o Task Scheduler (Windows)
- 🧪 Localmente: Con script `run-notifications.ts`

---

## 📦 ARCHIVOS MODIFICADOS/CREADOS

### MODIFICADOS:
1. **`src/service/calificaciones.service.ts`**
   - ✅ Función `validarNotasFaltantesPeriodo()` 
   - ✅ Función `generarNotificacionesNotasPendientes()`

2. **`src/lib/actions/periodo-actions.ts`**
   - ✅ Valida notas antes de cerrar período

3. **`src/lib/actions/calificaciones-actions.ts`**
   - ✅ Valida notas antes de cerrar período

4. **`src/components/periodos-manager.tsx`**
   - ✅ Mejora en manejo de mensajes de error

### CREADOS:
1. **`src/app/api/cron/generar-notificaciones/route.ts`**
   - Endpoint para ejecutar validación diaria
   - Valida Bearer token

2. **`run-notifications.ts`**
   - Script para pruebas locales
   - Ejecución: `npx tsx run-notifications.ts`

3. **`vercel.json`**
   - Configuración de cron para Vercel

4. **`setup-cron.sh`**
   - Script de instalación rápida (Linux/Mac)

5. **`GUIA_NOTIFICACIONES.md`**
   - Documentación completa en español

6. **`NOTIFICACIONES_SETUP.md`**
   - Documentación técnica

---

## ⚙️ CONFIGURACIÓN PASO A PASO

### Si usas VERCEL (Recomendado)
```
✅ Ya configurado en vercel.json
✅ Se ejecuta automáticamente cada día a las 9 AM UTC
✅ No requiere configuración adicional
```

### Si usas SERVIDOR PROPIO (Linux/Mac)
```bash
# 1. Editar .env y agregar:
CRON_SECRET=tu_contraseña_seg_88xx

# 2. Ejecutar setup:
bash setup-cron.sh

# 3. Configurar crontab:
crontab -e

# Agregar línea (se ejecuta todos los días a las 9 AM):
0 9 * * * curl -H "Authorization: Bearer tu_contraseña_seg_88xx" \
  "https://tu-sitio.com/api/cron/generar-notificaciones"
```

### Si usas WINDOWS
Usar Windows Task Scheduler o servicio externo tipo Cron-as-a-Service.

---

## 🧪 PRUEBAS RÁPIDAS

### Prueba 1: Validación al Cerrar
```
1. Admin → Ciclos/Períodos
2. Crear período sin cargar todas las notas
3. Click "Cerrar"
4. ✅ Debe mostrar error con lista detallada
5. Cargar todas las notas
6. Click "Cerrar" otra vez
7. ✅ Ahora DEBE cerrar exitosamente
```

### Prueba 2: Ejecutar Notificaciones (Local)
```bash
npx tsx run-notifications.ts

# Output esperado:
# 🔔 Iniciando generación de notificaciones...
# 📚 Ciclo actual: 2025
# 📊 Períodos abiertos encontrados: 2
# ▶️  Procesando: TRIMESTRE_1
#    Días faltantes: 2
#    ✅ Generando notificaciones...
```

### Prueba 3: Endpoint HTTP
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Llamar endpoint (con CRON_SECRET=development en .env.local)
curl "http://localhost:3000/api/cron/generar-notificaciones" \
  -H "Authorization: Bearer development"
```

---

## 🔐 SEGURIDAD

- ✅ Endpoint protegido con Bearer token
- ✅ `CRON_SECRET` debe ser único y fuerte
- ✅ En Vercel, cron se autentica automáticamente
- ✅ Base de datos usa tabla `COMUNICADO` existente

---

## 📊 MONITOREO

### Ver Comunicados Generados:
```sql
SELECT titulo, idUsuario, fecha FROM COMUNICADO 
WHERE titulo LIKE '%Recordatorio%' 
ORDER BY fecha DESC;
```

### Desde Prisma Studio:
```bash
npx prisma studio
# Ir a COMUNICADO → Filter por "Recordatorio"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Función de validación de notas
- [x] Función de generación de notificaciones
- [x] Validación antes de cerrar períodos
- [x] Endpoint API cron
- [x] Manejo de errores mejorado
- [x] Configuración Vercel
- [x] Script de prueba
- [x] Documentación completa
- [ ] ⚠️ **IMPORTANTE**: Configurar cron en producción (según plataforma)

---

## 🚀 PRÓXIMOS PASOS

1. **En Vercel:** 
   - No requiere nada más, está configurado automáticamente
   
2. **En servidor propio:**
   - Ejecutar `bash setup-cron.sh`
   - Configurar crontab
   - Verificar con `npm run dev` + manual cron call

3. **Pruebas finales:**
   - Ver que se cierre período con notas completas
   - Ver que se rechace cierre sin notas
   - Ejecutar script de notificaciones
   - Verificar que aparece comunicado (próximo login docente)

---

## 📧 SOPORTE

Para problemas:
1. Ver `GUIA_NOTIFICACIONES.md`
2. Revisar logs de Next.js en terminal
3. Verificar `CRON_SECRET` en .env
4. Confirmar que períodos tienen `fechaFin` válida

---

**Implementado por:** Sistema Escolar Mica
**Fecha:** 9 de marzo de 2025
**Estado:** ✅ LISTO PARA USAR
