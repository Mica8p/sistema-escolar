# 📋 Sistema de Validación y Notificaciones de Notas

## ✨ ¿Qué se implementó?

### Problema Original
Los administradores podían cerrar períodos incluso si los docentes no habían cargado todas las notas. Además, los docentes no recibían recordatorios.

### Soluciones Implementadas

#### 1. ✅ Validación al Cerrar Período
**Cuando un admin intenta cerrar un período:**
- Se valida que TODAS las notas estén cargadas
- Si faltan notas, se muestra un mensaje detallado
- El período NO se cierra hasta que esté completo

**Qué informa el mensaje:**
El mensaje de error detallado se mantiene igual para el administrador.

#### 2. 📬 Notificación en Dashboard del Docente (Dinámica)
**Cuando un docente ingresa a su dashboard:**
- El sistema revisa si hay períodos por cerrar en 1-2 días.
- Si el docente tiene notas pendientes en esos períodos, se le muestra un mensaje directamente en su dashboard.
- **Ya no se crean comunicados automáticos en el sistema.** El mensaje es dinámico.

**Mensajes que reciben los docentes:**
```
📋 Recordatorio: Carga de notas - TRIMESTRE_1

Hola Juan,

Te recordamos que el período "TRIMESTRE_1" cierra en 2 día(s). 
Te recomendamos cargar las notas pendientes cuanto antes.

Materia: Matemática
Curso: 3° "A"

¡Gracias!
```

#### 3. 🔄 Ejecución Automática (Cron Job)
Se ejecuta automáticamente todos los días a las **9:00 AM UTC**.

---

## 🛠️ Configuración Necesaria

### Opción 1: Vercel (Recomendado)
Agregar a `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generar-notificaciones",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Opción 2: Servidor Propio (Linux/Mac)
1. Agregar en `.env`:
```
CRON_SECRET=tu_contraseña_super_segura_aqui_123
```

2. Agregar cron (ejecutar `crontab -e`):
```bash
# Se ejecuta a las 9 AM todos los días
0 9 * * * curl -H "Authorization: Bearer tu_contraseña_super_segura_aqui_123" \
  "https://tusitio.com/api/cron/generar-notificaciones"
```

### Opción 3: Pruebas Locales
```bash
# Opción A: Script Node directo
npx tsx run-notifications.ts

# Opción B: Llamada HTTP (con CRON_SECRET=development en .env.local)
curl "http://localhost:3000/api/cron/generar-notificaciones" \
  -H "Authorization: Bearer development"
```

---

## 📁 Archivos Modificados/Creados

| Archivo | Cambio |
|---------|--------|
| `src/service/calificaciones.service.ts` | ✅ Agregadas funciones de validación y notificación |
| `src/lib/actions/periodo-actions.ts` | ✅ Validación antes de cerrar período |
| `src/lib/actions/calificaciones-actions.ts` | ✅ Validación antes de cerrar período |
| `src/components/periodos-manager.tsx` | ✅ Mejora de mensajes de error |
| `src/app/api/cron/generar-notificaciones/route.ts` | ✨ NUEVO: Endpoint cron |
| `run-notifications.ts` | ✨ NUEVO: Script de prueba |
| `NOTIFICACIONES_SETUP.md` | ✨ NUEVO: Documentación técnica |

---

## 🧪 Cómo Probar

### Prueba 1: Validación al Cerrar (LOCAL)
```typescript
1. Abrir admin → Ciclos → Períodos
2. Crear/editar un período
3. Asegurarse que algunas notas falten
4. Click en "Cerrar"
5. ✅ Debe mostrar error con detalles

// Para que PASEN las notas faltantes:
6. Ir a calificaciones, cargar todas las notas
7. Intentar cerrar de nuevo
8. ✅ Ahora SÍ debe cerrar correctamente
```

### Prueba 2: Notificaciones (LOCAL)
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Ejecutar script
npx tsx run-notifications.ts

# Resultado esperado:
# 🔔 Iniciando generación de notificaciones...
# 📚 Ciclo actual: 2025
# 📊 Períodos abiertos encontrados: 3
# ▶️  Procesando: TRIMESTRE_1
#    Días faltantes: 2
#    ✅ Generando notificaciones...
#    ✔️  Completado
```

### Prueba 3: Verificar Comunicados
```typescript
// En consola de navegador (dashboard de profesor)
- Ir a "Comunicados" o "Notificaciones"
- Debe aparecer el recordatorio sobre notas pendientes
```

---

## 🔐 Seguridad

- `CRON_SECRET` debe ser una contraseña fuerte
- En Vercel, los crons se ejecutan automáticamente con autenticación
- El endpoint valida el header `Authorization` antes de ejecutar

---

## 📊 Monitoreo

### Ver comunicados generados (SQL):
```sql
SELECT * FROM COMUNICADO 
WHERE titulo LIKE '%Recordatorio%' 
ORDER BY fecha DESC
LIMIT 10;
```

### Ver a través de Prisma Studio:
```bash
npx prisma studio
# Navegar a COMUNICADO → Filtrar por "Recordatorio"
```

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si cierro período y luego encuentro un error?**
R: Usa el botón "Abrir" para reabrirlo. Los docentes pueden volver a cargar notas.

**P: ¿Se envía email a los docentes?**
R: No, por ahora solo se crea comunicado en el sistema. Para email, contactar desarrollo.

**P: ¿Qué hora se ejecuta el cron?**
R: 9:00 AM UTC (hora de servidor). Contactar si necesitas cambiarla.

**P: ¿Se notifica a todos los docentes o solo a los que faltan?**
R: Solo a los que tienen notas PENDIENTES en cursos del período.

**P: ¿Puedo ejecutar el cron manualmente?**
R: Sí, con el script `run-notifications.ts` o llamando el endpoint HTTP.

---

## 🚀 Próximas Mejoras (Futuro)

- [ ] Envío de emails además de comunicado
- [ ] Recordatorio a 5 días también
- [ ] Dashboard con estadísticas de notas pendientes
- [ ] Notificación cuando el ÚLTIMO docente carga notas
