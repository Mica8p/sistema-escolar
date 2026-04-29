# 🎓 EXPLICACIÓN COMPLETA DEL SISTEMA ESCOLAR

**Fecha:** 28 de abril de 2026  
**Proyecto:** Sistema Escolar - Gestión Académica y Financiera  

---

## 📑 ÍNDICE

1. [Gestión de Alumnos / Inscripciones](#-gestión-de-alumnos--inscripciones)
2. [Módulo Académico](#-módulo-académico)
3. [Módulo Perfil](#-módulo-perfil)
4. [Tecnologías Utilizadas](#-tecnologías-utilizadas)

---

# 1️⃣ GESTIÓN DE ALUMNOS / INSCRIPCIONES

## 🎯 Propósito General

La sección de **Alumnos / Inscripciones** es el módulo donde comienza todo el proceso académico y administrativo de cada estudiante. Es donde se registra quién cursa, en qué grado, y se prepara la base para todo lo demás: calificaciones, asistencias, pagos, etc.

---

## 📋 DIAGRAMA DE FLUJO GENERAL

```
PERSONA ALUMNO EN EL SISTEMA
           ↓
    [INSCRIPCIÓN AQUÍ]
           ↓
   Crear MATRICULA
           ↓
┌─────────────────────────────────────────┐
│ Ahora el alumno puede:                  │
│ ✓ Recibir calificaciones               │
│ ✓ Tomar asistencia                     │
│ ✓ Tener cargos de pago                 │
│ ✓ Consultar horarios                   │
│ ✓ Vincular con padres                  │
└─────────────────────────────────────────┘
```

---

## 🔄 PASO A PASO: INSCRIBIR UN ALUMNO

### Paso 1️⃣ → Admin/Preceptor abre la sección
```
Dashboard → Alumnos → Inscripciones
```

### Paso 2️⃣ → Ve el listado de alumnos
Aquí ve:
- Todos los inscritos en el ciclo actual
- Información básica: nombre, DNI, curso, estado
- Opciones: ver detalle, editar, cambiar estado

### Paso 3️⃣ → Hace clic en "Nueva Inscripción"
Aparece un formulario con 2 campos:

```
┌─────────────────────────────────────────┐
│ FORMULARIO DE INSCRIPCIÓN               │
├─────────────────────────────────────────┤
│                                         │
│ Alumno: [▼ Selector de personas]       │
│         (muestra: "García, Juan")       │
│                                         │
│ Curso: [▼ Selector de cursos]          │
│        (muestra: "3°A - Primario")      │
│                                         │
│         [INSCRIBIR]                    │
│                                         │
└─────────────────────────────────────────┘
```

### Paso 4️⃣ → Selecciona alumno y curso

**¿Dónde viene la información?**

- **Alumno:** De la tabla `PERSONA` filtrada por rol `ALUMNO`
  - Si no existe, debe ser creado primero en "Todas las personas"
  
- **Curso:** De la tabla `CURSO`
  - Ej: "3°A", "1°B", etc.

### Paso 5️⃣ → El sistema valida

Antes de guardar, valida:

```
✓ ¿Existe la persona seleccionada?
✓ ¿Existe el curso seleccionado?
✓ ¿El curso está activo en este ciclo?
✓ ¿El alumno ya está inscrito en otro curso del mismo ciclo?
  (Un alumno NO puede cursar 2 cursos a la vez en el mismo año)
```

Si algo falla, muestra error y no permite guardar.

### Paso 6️⃣ → Se crea la MATRICULA

El sistema crea automáticamente:

```javascript
// Lo que sucede "detrás de escenas"
const matricula = await db.matricula.create({
  data: {
    idAlumno: 542,              // El alumno seleccionado
    idCurso: 3,                 // El curso seleccionado
    idCiclo: 2026,              // El ciclo actual (2026)
    fechaInscripcion: "2026-04-28",  // Hoy
    estadoAcademico: "Activo"   // Siempre empieza ACTIVO
  }
});
```

### Paso 7️⃣ → Se genera LEGAJO único

```
Fórmula: LEG-{idPersona}-{año}

Ejemplo: LEG-542-2026
         ↑    ↑   ↑
      Prefijo ID  Año actual
      
Este legajo es:
✓ Único en todo el sistema
✓ Se usa en reportes
✓ Lo ve el padre en su perfil
✓ Se mantiene histórico (año que viene será LEG-542-2027)
```

### Paso 8️⃣ → ¡INSCRIPCIÓN COMPLETADA!

Ahora el alumno:
- Aparece en el listado
- Tiene estado "Activo"
- Está listo para calificaciones
- Está listo para asistencias
- Se pueden registrar cargos de pago
- Se pueden agregar padres

---

## 👁️ ¿QUÉ SE VE EN EL LISTADO DE INSCRIPCIONES?

```
┌──────────────────────────────────────────────────────────────┐
│ ALUMNOS INSCRITOS - CICLO 2026                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Filtros: [Curso ▼] [Estado ▼] [Buscar: ___________]         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ # │ Nombre          │ DNI      │ Legajo      │ Curso  │ Est.│
├──────────────────────────────────────────────────────────────┤
│ 1 │ García, Juan    │ 30.1234  │ LEG-542-26  │ 3°A    │ ✓   │
│ 2 │ López, María    │ 35.5678  │ LEG-543-26  │ 3°A    │ ✓   │
│ 3 │ Martínez, Pedro │ 32.9012  │ LEG-544-26  │ 2°B    │ ✓   │
│ 4 │ Rodríguez, Ana  │ 31.3456  │ LEG-545-26  │ 1°C    │ ⏸   │
│    │                │          │             │        │     │
└──────────────────────────────────────────────────────────────┘

Leyenda: ✓ Activo  ⏸ Suspendido  ⏹ Retirado  ✔ Egresado
```

**Funciones al hacer clic en un alumno:**
- 👁️ **Ver detalle:** Información completa
- ✏️ **Editar:** Cambiar datos personales
- 📋 **Cambiar estado:** Activo → Retirado/Egresado/Suspendido
- 📄 **Ver boletín:** PDF con horarios
- 💰 **Ver pagos:** Estado de cuenta
- 👨‍👩‍👧 **Gestionar padres:** Agregar/quitar

---

## 📊 VISTA DETALLADA DE UN ALUMNO

Cuando haces clic en un alumno para "Ver Detalle":

### Sección 1: DATOS PERSONALES

```
┌────────────────────────────────────┐
│ GARCÍA, JUAN                       │
├────────────────────────────────────┤
│ [AVATAR]                           │
│                                    │
│ DNI:          30.123.456          │
│ Fecha Nac:    15/05/2013          │
│ Email:        juan.garcia@email   │
│ Teléfono:     1234567890          │
│ Dirección:    Calle 123, Dpto B   │
│ Legajo:       LEG-542-2026        │
│ Estado:       ACTIVO ✓            │
│ Inscripción:  01/03/2026          │
└────────────────────────────────────┘
```

### Sección 2: INFORMACIÓN ACADÉMICA

```
┌────────────────────────────────────┐
│ ACADÉMICO                          │
├────────────────────────────────────┤
│ Curso:        3°A                  │
│ Nivel:        Primario             │
│ Turno:        Mañana               │
│ Ciclo:        2026                 │
│                                    │
│ ÚLTIMAS CALIFICACIONES:            │
│ • Matemática:     8.5              │
│ • Lengua:         9                │
│ • C. Naturales:   7                │
│ • Historia:       8                │
│                                    │
│ HORARIOS:                          │
│ • Lunes 08:00-09:00                │
│ • Martes 08:00-09:00               │
│ • Jueves 09:00-10:00               │
│ • Viernes 09:00-10:00              │
│                                    │
│ [DESCARGAR BOLETÍN PDF]            │
└────────────────────────────────────┘
```

### Sección 3: PADRES/TUTORES

```
┌────────────────────────────────────┐
│ PADRES Y TUTORES                   │
├────────────────────────────────────┤
│                                    │
│ 👤 Carlos García (Padre)           │
│    Email: carlos.garcia@email      │
│    Teléfono: 9876543210           │
│    [Eliminar relación]             │
│                                    │
│ 👤 Roxana Martínez (Madre)         │
│    Email: roxana.martinez@email    │
│    Teléfono: 9876543211           │
│    [Eliminar relación]             │
│                                    │
│ [+ AGREGAR PADRE/TUTOR]            │
│                                    │
└────────────────────────────────────┘
```

**¿Cómo se vincula un padre?**
1. Hacer clic en "[+ AGREGAR PADRE/TUTOR]"
2. Aparece formulario:
   ```
   Persona: [▼ Selector de personas con rol PADRE]
   Relación: [▼ Padre / Madre / Tutor / Abuelo / Otro]
   [GUARDAR]
   ```
3. Se crea registro en tabla `ALUMNO_PADRE`
4. El padre en su próximo login verá este alumno

### Sección 4: ESTADO DE CUENTA (PAGOS)

```
┌────────────────────────────────────┐
│ ESTADO DE CUENTA                   │
├────────────────────────────────────┤
│                                    │
│ DEUDAS:                            │
│ • Cuota Abril         $50.000      │
│   Vencimiento: 30/04  VENCIDO ❌   │
│                                    │
│ • Cuota Mayo          $50.000      │
│   Vencimiento: 31/05  PENDIENTE ⏳ │
│                                    │
│ • Matrícula           $10.000      │
│   Vencimiento: 01/04  PAGADO ✓     │
│                                    │
│ TOTAL ADEUDADO:       $100.000     │
│                                    │
│ [VER HISTORIAL DE PAGOS]           │
│                                    │
└────────────────────────────────────┘
```

---

## 🔄 CAMBIO DE ESTADO ACADÉMICO

El alumno puede estar en 4 estados:

| Estado | Descripción | ¿Permite calificar? | ¿Permite asistencia? |
|--------|-------------|-------------------|----------------------|
| **ACTIVO** | Cursando normalmente | ✅ SÍ | ✅ SÍ |
| **RETIRADO** | Se fue de la escuela | ❌ NO | ❌ NO |
| **EGRESADO** | Completó el año | ✅ SÍ (histórico) | ✅ SÍ (histórico) |
| **SUSPENDIDO** | Pausado temporalmente | ❌ NO | ❌ NO |

**Cómo cambiar estado:**
1. En vista detalle, hay selector "Estado"
2. Cambiar a nuevo estado
3. Se registra con timestamp automático
4. Los datos antiguos se conservan

---

## 🏷️ INFORMACIÓN IMPORTANTE DE LA INSCRIPCIÓN

### Constrain UNIQUE en la BD
```sql
-- Un alumno NO puede estar inscrito 2 veces en el mismo ciclo
UNIQUE [idAlumno, idCiclo]

Ejemplo:
✓ Juan en 3°A - Ciclo 2026 (PERMITIDO)
✗ Juan en 2°B - Ciclo 2026 (RECHAZADO - ya está inscrito)
✓ Juan en 1°A - Ciclo 2027 (PERMITIDO - es otro ciclo)
```

### Estados de Cuota (Finanzas)
```
Concepto de Pago: "Cuota Abril"
Monto fijo: $50.000
Vencimiento: 30/04/2026

Cargos generados por alumno:

CARGO 1:
  - Alumno: García, Juan
  - Concepto: Cuota Abril
  - Monto: $50.000
  - Estado: PENDIENTE (no pagó)
  - Vencimiento: 30/04/2026

CARGO 2:
  - Alumno: López, María
  - Concepto: Cuota Abril
  - Monto: $50.000
  - Estado: PAGADO (pagó $50.000 el 25/04)
  - Vencimiento: 30/04/2026

CARGO 3:
  - Alumno: Martínez, Pedro
  - Concepto: Cuota Abril
  - Monto: $50.000
  - Estado: PARCIAL (pagó $30.000 el 20/04)
  - Vencimiento: 30/04/2026
```

---

## 🔐 PERMISOS PARA INSCRIPCIONES

Solo pueden:
- ✅ **ADMIN** - acceso total
- ✅ **PRECEPTOR** - gestión de inscripciones

No pueden:
- ❌ Alumno
- ❌ Padre
- ❌ Profesor

---

## ✅ CHECKLIST: ANTES DE INSCRIBIR

- [ ] La persona alumno fue creada en el sistema
- [ ] La persona tiene rol ALUMNO
- [ ] El curso existe y está activo
- [ ] El ciclo está activo (configurado)
- [ ] El alumno no está inscrito en otro curso del mismo ciclo
- [ ] La persona tiene email (recomendado para comunicaciones)
- [ ] Si tiene padres, agregarlos después de la inscripción

---

---

# 2️⃣ MÓDULO ACADÉMICO

## 🎯 Propósito General

El módulo académico maneja todo lo relacionado con la **enseñanza y aprendizaje**:
- Quién enseña qué (Asignación Docente)
- Qué notas sacan (Calificaciones)
- Quiénes asisten (Asistencias)
- Cuándo es cada clase (Horarios)

**Estos 4 elementos están conectados:**

```
ASIGNACIÓN DOCENTE
    ↓
    ├─ HORARIOS (días y horas de clase)
    ├─ CALIFICACIONES (notas que registra profesor)
    └─ ASISTENCIAS (lista de asistencia)
```

---

# A) ASIGNACIÓN DOCENTE

## 🎓 ¿QUÉ ES?

La **asignación docente** es la relación entre:
- **Un profesor** → García, Juan
- **Una materia** → Matemática
- **Un curso** → 3°A - Primario - Mañana
- **Un ciclo** → 2026
- **Carga horaria** → 5 horas/semana

### Ejemplo práctico:

```
"El profesor García enseña Matemática en 3°A, 
 5 horas por semana, en el ciclo 2026"
```

---

## 🔄 PASO A PASO: CREAR ASIGNACIÓN

### Paso 1️⃣ → Admin abre módulo de Asignaciones

```
Dashboard → Académico → Asignaciones
```

### Paso 2️⃣ → Ve listado de asignaciones actuales

```
┌──────────────────────────────────────────────────────┐
│ ASIGNACIONES ACADÉMICAS - CICLO 2026                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Filtros: [Profesor ▼] [Curso ▼] [Materia ▼]        │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Profesor    │ Materia      │ Curso   │ Carga │ Acción
├──────────────────────────────────────────────────────┤
│ García      │ Matemática   │ 3°A     │ 5 h/s │ [⋮]
│ López       │ Lengua       │ 3°A     │ 5 h/s │ [⋮]
│ Martínez    │ C.Naturales  │ 3°A     │ 3 h/s │ [⋮]
│             │              │         │       │
└──────────────────────────────────────────────────────┘
```

### Paso 3️⃣ → Hace clic en "Nueva Asignación"

Aparece formulario:

```
┌─────────────────────────────────────┐
│ CREAR ASIGNACIÓN                    │
├─────────────────────────────────────┤
│                                     │
│ Profesor: [▼ García, Juan]         │
│                                     │
│ Materia: [▼ Matemática]            │
│                                     │
│ Curso: [▼ 3°A - Primario - Mañana] │
│                                     │
│ Carga Horaria: [5] horas/semana    │
│                                     │
│ [CREAR] [CANCELAR]                 │
│                                     │
└─────────────────────────────────────┘
```

### Paso 4️⃣ → Completa y valida

Sistema valida:
```
✓ ¿Profesor existe y está activo?
✓ ¿Materia existe?
✓ ¿Curso existe?
✓ ¿El ciclo es el actual?
✓ ¿No hay asignación duplicada?
  (mismo profesor, materia, curso, ciclo)
```

### Paso 5️⃣ → Se crea la ASIGNACIÓN

```javascript
const asignacion = await db.asignacionAcademica.create({
  data: {
    idProfesor: 12,      // García
    idMateria: 3,        // Matemática
    idCurso: 1,          // 3°A
    idCiclo: 2026,       // 2026
    cargaHoraria: 5,     // 5 horas/semana
    estado: true         // Activa por defecto
  }
});
```

### Paso 6️⃣ → Ahora se pueden agregar HORARIOS a esa asignación

```
Asignación creada: García enseña Math en 3°A
                    ↓
         [AGREGAR HORARIOS]
                    ↓
    ┌─────────────────────────────────┐
    │ HORARIO 1                       │
    │ Día: Lunes                      │
    │ Desde: 08:00                    │
    │ Hasta: 09:00                    │
    │ Aula: 301                       │
    └─────────────────────────────────┘
                    ↓
    ┌─────────────────────────────────┐
    │ HORARIO 2                       │
    │ Día: Martes                     │
    │ Desde: 08:00                    │
    │ Hasta: 09:00                    │
    │ Aula: 301                       │
    └─────────────────────────────────┘
                    ↓
    [y así sucesivamente...]
```

---

## 🔀 CLONAR ASIGNACIONES DEL CICLO ANTERIOR

**Propósito:** Copiar todas las asignaciones del año pasado para ahorrar tiempo.

**Paso a paso:**

1. Admin entra a "Asignaciones"
2. Busca botón "[CLONAR DEL CICLO ANTERIOR]" (si existe)
3. Sistema copia:
   - Profesores
   - Materias
   - Cursos
   - Cargas horarias
   - **TAMBIÉN LOS HORARIOS**
4. Se crean automáticamente para el nuevo ciclo
5. Admin puede ajustar si es necesario

**Resultado:**

```
Ciclo 2025 → García, Math, 3°A, Lunes 8-9, Martes 8-9
                                ↓
                            [CLONAR]
                                ↓
Ciclo 2026 → García, Math, 3°A, Lunes 8-9, Martes 8-9
             (misma configuración, nuevo año)
```

---

## 🔴 DESACTIVAR ASIGNACIÓN (Baja)

Si un profesor renuncia o se va:

```
Asignación estado: ACTIVA
                ↓
        [DESACTIVAR]
                ↓
┌──────────────────────────────────┐
│ FORMULARIO DE BAJA               │
├──────────────────────────────────┤
│ Motivo: [Profesor renunció]     │
│ Fecha: [25/04/2026]             │
│ [GUARDAR]                        │
└──────────────────────────────────┘
                ↓
Asignación estado: INACTIVA ❌
- Ya no se pueden registrar notas
- Ya no se pueden tomar asistencias
- Los registros antiguos se guardan
```

---

## 📋 ESTRUCTURA TÉCNICA DE ASIGNACIÓN

```
TABLA: ASIGNACION_ACADEMICA

Campos:
  - idAsignacion (PK)
  - idProfesor (FK)         → Profesor
  - idMateria (FK)          → Materia
  - idCurso (FK)            → Curso
  - idCiclo (FK)            → Ciclo
  - cargaHoraria (INT)      → Horas/semana
  - estado (BOOLEAN)        → Activa/Inactiva
  - motivoBaja (STRING)     → Por qué se desactivó
  - fechaBaja (DATE)        → Cuándo se desactivó

Relaciones:
  ↓ HORARIOS (muchos)
  ↓ NOTAS (muchas)
```

---

# B) CALIFICACIONES

## 🎯 ¿QUÉ SON?

Las calificaciones son las **notas que registra el profesor** de sus estudiantes.

Una calificación tiene:
- **Alumno:** De quién es la nota
- **Materia:** Qué asignatura (Math, Lengua, etc.)
- **Período:** Cuándo (Trimestre 1, 2, 3, etc.)
- **Tipo:** Qué evaluación (Parcial, Recuperatorio, Examen)
- **Nota:** Del 0 al 10
- **Observación:** Comentario opcional

---

## 🔄 PASO A PASO: REGISTRAR CALIFICACIÓN

### Paso 1️⃣ → Profesor entra a "Académico > Calificaciones"

```
Dashboard → Académico → Calificaciones
```

### Paso 2️⃣ → Elige qué calificar (filtros)

```
┌──────────────────────────────────────┐
│ REGISTRAR CALIFICACIONES             │
├──────────────────────────────────────┤
│                                      │
│ Curso: [▼ 3°A]                      │
│ Materia: [▼ Matemática]             │
│ Período: [▼ TRIMESTRE_1]            │
│ Tipo Eval: [▼ Parcial]              │
│                                      │
│ [CARGAR]                            │
│                                      │
└──────────────────────────────────────┘
```

### Paso 3️⃣ → Aparece tabla de alumnos

```
┌─────────────────────────────────────────┐
│ ALUMNOS DE 3°A - MATEMÁTICA             │
│ TRIMESTRE 1 - PARCIAL                   │
├─────────────────────────────────────────┤
│                                         │
│ García, Juan     [_8_]                 │
│ López, María     [_9_]                 │
│ Martínez, Pedro  [_5_]                 │
│ Rodríguez, Ana   [_7_]                 │
│ (sin calificar)  [___]                 │
│                                         │
│ Observaciones:                          │
│ García:          "Muy bien"             │
│ López:           "Excelente"            │
│ Martínez:        "Debe recuperar"       │
│ Rodríguez:       ""                     │
│                                         │
│ [GUARDAR] [CANCELAR]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Paso 4️⃣ → Valida antes de guardar

```
Para CADA nota:
  ✓ ¿Está entre 0 y 10?
  ✓ ¿El alumno está inscrito en este curso?
  ✓ ¿El período está abierto (no cerrado)?
  ✓ ¿El profesor tiene asignación activa en este curso?
```

### Paso 5️⃣ → Se guardan las notas

```javascript
// Para cada alumno con nota:
await db.nota.create({
  data: {
    idMatricula: 542,        // García en 3°A - 2026
    idAsignacion: 15,        // García enseña Math en 3°A
    idPeriodo: 1,            // TRIMESTRE_1
    tipo: "Parcial",         // Tipo evaluación
    nota: 8,                 // La nota
    observacion: "Muy bien",
    fechaRegistro: "2026-04-28",
    idUsuario: 5             // Profesor García (quien registra)
  }
});
```

---

## 📊 PERÍODOS DISPONIBLES

```
TRIMESTRE_1 (T1)
├─ Marzo a Mayo
├─ Evaluaciones: Parciales, recuperatorios
└─ Resultado: Promedio trimestral

TRIMESTRE_2 (T2)
├─ Junio a Agosto
├─ Evaluaciones: Parciales, recuperatorios
└─ Resultado: Promedio trimestral

TRIMESTRE_3 (T3)
├─ Septiembre a Noviembre
├─ Evaluaciones: Parciales, recuperatorios
└─ Resultado: Promedio trimestral

DICIEMBRE (DIC)
├─ Exámenes de previos
├─ Para alumnos que no llegaron a 6
└─ Oportunidad de recuperar

FEBRERO (FEB)
├─ Exámenes de verano/recuperación
├─ Para alumnos que no pasaron en diciembre
└─ Última oportunidad del ciclo

JULIO_PREVIAS (JUL)
├─ Exámenes de materias de años anteriores
├─ Alumnos que rinden "deudas"
└─ Materias que deben recuperar

ANUAL
├─ Promedio final del ciclo
├─ No se califica aquí, es resultado
└─ Sistema calcula automáticamente
```

---

## 📈 TIPOS DE EVALUACIÓN

| Tipo | Descripción | Cuándo se usa |
|------|-------------|--------------|
| **PARCIAL** | Examen durante el trimestre | Mes 1 y 2 de trimestre |
| **RECUPERATORIO** | Segunda oportunidad | Al final de trimestre |
| **EXAMEN_MESA** | Examen formal en diciembre/febrero | Diciembre o febrero |

**Ejemplo de progresión:**

```
Inicio de Trimestre 1 (marzo)
    ↓
Abril: Profesor García hace PARCIAL de Math
    - García: 8
    - López: 4 (bajita)
    - Martínez: 9
    ↓
Mayo: Al final de trimestre, oportunidad de RECUPERATORIO
    - García: No necesita (ya tiene 8)
    - López: 7 (RECUPERATORIO - mejoró!)
    - Martínez: No necesita
    ↓
Fin de Trimestre 1: Promedio Math = (8+7+9) / 3 = 8
    
Si López no llegaba a 6 en el promedio:
    ↓
Diciembre: EXAMEN_MESA (mesa examinadora)
    - López rinde Math de nuevo formalmente
```

---

## 🔐 PERMISOS EN CALIFICACIONES

| Rol | ¿Qué puede hacer? |
|-----|-------------------|
| **DOCENTE** | Ver/editar solo sus propias calificaciones |
| **ADMIN** | Ver/editar cualquier calificación |
| **Otros** | ❌ No acceso |

**Validación técnica:**

```javascript
// Cuando un profesor intenta guardar nota:
if (usuarioAutenticado.rol !== "DOCENTE") {
  // Es admin, permitir
  OK
}

if (usuarioAutenticado.rol === "DOCENTE") {
  // Verificar que sea su asignación
  if (asignacion.idProfesor === usuarioAutenticado.idProfesor) {
    OK  // Es SU asignación
  } else {
    ERROR  // Intenta calificar a otro profesor
  }
}
```

---

## ⚙️ VALIDACIONES IMPORTANTES

1. **Asignación ACTIVA:**
   - No puedo calificar si la asignación está desactivada

2. **Período ABIERTO:**
   - No puedo calificar si el período está cerrado administrativamente

3. **Alumno INSCRITO:**
   - El alumno debe tener matrícula en ese curso

4. **Nota entre 0-10:**
   - Sistema rechaza valores fuera de rango

5. **Profesor AUTORIZADO:**
   - Solo quien enseña esa materia puede calificar

---

# C) ASISTENCIAS / REPORTE DE ASISTENCIAS

## 🎯 ¿QUÉ SON?

Las asistencias son el **registro de quiénes asisten a clase cada día**.

Cada asistencia registra:
- **Alumno:** De quién es el registro
- **Clase:** Qué día, qué hora (el horario específico)
- **Fecha:** En qué día se toma
- **Estado:** Presente, Ausente, Tarde, Justificado
- **Profesor/Preceptor:** Quién toma lista

---

## 🔄 PASO A PASO: TOMAR ASISTENCIA

### Paso 1️⃣ → Profesor/Preceptor abre "Académico > Asistencias"

```
Dashboard → Académico → Asistencias
```

### Paso 2️⃣ → Selecciona qué clase (hoy)

```
┌──────────────────────────────────────┐
│ TOMAR ASISTENCIA                     │
├──────────────────────────────────────┤
│                                      │
│ Fecha: [28/04/2026] (HOY)           │
│ (No permite fechas futuras)          │
│                                      │
│ Curso: [▼ 3°A - Primario - Mañana]  │
│                                      │
│ Materia: [▼ Matemática]             │
│                                      │
│ Horario: [▼ 08:00 - 09:00 Aula 301]│
│                                      │
│ [CARGAR LISTADO]                    │
│                                      │
└──────────────────────────────────────┘
```

### Paso 3️⃣ → Aparece el listado de alumnos

```
┌──────────────────────────────────────────────────┐
│ LISTA DE ASISTENCIA                              │
│ Lunes 28/04/2026 - 08:00 - Matemática - 3°A     │
├──────────────────────────────────────────────────┤
│                                                  │
│ □ García, Juan        [◉ Presente ○ Ausente]   │
│ □ López, María        [◉ Presente ○ Ausente]   │
│ □ Martínez, Pedro     [○ Presente ◉ Ausente]   │
│ □ Rodríguez, Ana      [◉ Presente ○ Tarde]     │
│ □ Fernández, Carlos   [○ Presente ◉ Justificado] │
│                                                  │
│ Leyenda:                                         │
│ ◉ Presente: Asistió                             │
│ ○ Ausente: No vino                              │
│ ○ Tarde: Llegó tarde                            │
│ ○ Justificado: Faltó pero con razón             │
│                                                  │
│ [GUARDAR] [CANCELAR]                            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Paso 4️⃣ → Marca cada alumno

**Opciones:**
- **Presente** = 1 día completo de asistencia
- **Ausente** = 1 día de falta
- **Tarde** = 0.5 día (llegó tarde pero estuvo)
- **Justificado** = 1 día (faltó pero con justificación)

### Paso 5️⃣ → Valida antes de guardar

```
✓ ¿La fecha es hoy o pasada? (no futuro)
✓ ¿El horario existe? (está creado en asignación)
✓ ¿El alumno está inscrito en este curso?
✓ ¿La asignación está activa?
✓ ¿No hay registro duplicado para hoy?
```

### Paso 6️⃣ → Se guardan los registros

```javascript
// Por cada alumno:
await db.asistencia.create({
  data: {
    idMatricula: 542,        // García inscrito en 3°A
    idHorario: 10,           // Lunes 08:00-09:00
    fecha: "2026-04-28",     // Hoy
    estado: "Presente",      // O Ausente/Tarde/Justificado
    idUsuario: 5,            // Profesor García (quien registra)
    fechaRegistro: "2026-04-28T08:00:00"
  }
});
```

---

## 📊 CÁLCULO AUTOMÁTICO DE ESTADÍSTICAS

El sistema calcula automáticamente:

```
POR MATERIA, POR ALUMNO:

García, Juan en MATEMÁTICA (Ciclo 2026)
├─ Presentes: 45 días
├─ Ausentes: 5 días
├─ Tardanzas: 3 (= 1.5 días)
├─ Justificados: 2 (cuentan como presentes)
├─ Total clases: 55
└─ Porcentaje: (45 + 1.5 + 2) / 55 = 87.2%

López, María en LENGUA (Ciclo 2026)
├─ Presentes: 52 días
├─ Ausentes: 1 día
├─ Tardanzas: 2 (= 1 día)
├─ Justificados: 0
├─ Total clases: 55
└─ Porcentaje: (52 + 1) / 55 = 96.4%
```

---

## 📈 ESTADOS DE ASISTENCIA

| Estado | Valor | Usa para | Ejemplo |
|--------|-------|----------|---------|
| **Presente** | 1 | Asistencias | Vino a clase |
| **Ausente** | 0 | Faltas | No vino |
| **Tarde** | 0.5 | Asistencias parciales | Llegó a los 15 min |
| **Justificado** | 1 | Ausencias válidas | Fue a médico |

**Cálculo de porcentaje:**
```
Días asistidos = Presentes + (Tardanzas × 0.5) + Justificados
Porcentaje = (Días asistidos / Total de clases) × 100

Ejemplo:
García: 45 presentes + (3 tardanzas × 0.5) + 2 justificados = 48.5 días
Total: 55 clases
Porcentaje: (48.5 / 55) × 100 = 87.27%
```

---

## 🔐 PERMISOS EN ASISTENCIAS

| Rol | ¿Qué puede hacer? |
|-----|-------------------|
| **DOCENTE** | Tomar asistencia en sus materias |
| **PRECEPTOR** | Tomar asistencia de cualquier materia |
| **ADMIN** | Ver/tomar/editar cualquier asistencia |
| **Otros** | ❌ No acceso |

---

## ⚙️ VALIDACIONES IMPORTANTES

1. **No fechas futuras:**
   ```
   Hoy es 28/04/2026
   ✓ Puedo registrar 28/04 y antes
   ❌ No puedo registrar 29/04
   ```

2. **Asignación ACTIVA:**
   ```
   Si desactivo la asignación, no puedo tomar más listas
   (pero las antiguas quedan guardadas)
   ```

3. **Alumno INSCRITO:**
   ```
   Solo aparecen alumnos con matrícula ACTIVA en ese curso
   ```

4. **Un registro por horario/fecha:**
   ```
   UNIQUE [idMatricula, idHorario, fecha]
   
   No puedo tomar lista dos veces el mismo lunes 8-9
   (Si lo intento, actualiza el registro anterior)
   ```

---

## 📋 FLUJO PRÁCTICO DE UN TRIMESTRE

```
MARZO - Inicio de Trimestre 1
    └─ Lunes 01/03: Tomo lista Matemática 3°A - García presente
    └─ Martes 02/03: Tomo lista Lengua 3°A - López presente
    └─ ... (todos los días)

ABRIL - Continuación T1
    └─ Lunes 08/04: García ausente (enfermo)
    └─ Martes 09/04: García presente
    └─ Jueves 11/04: García tarde (llegó 8:15 a clase de 8-9)
    └─ ... (continuamos)

MAYO - Final de Trimestre 1
    └─ ... (seguimos registrando)
    └─ Viernes 31/05: Último día de trimestre

JUNIO - Se cierra TRIMESTRE 1
    └─ Admin cierra el período TRIMESTRE_1
    └─ Sistema calcula promedios automáticamente
    └─ Reporte final: "García tuvo 87% asistencia en Math T1"

JUNIO EN ADELANTE - Trimestre 2
    └─ Nuevo período, nuevas listas
    └─ Las del T1 quedan guardadas
```

---

# D) HORARIOS

## 🎯 ¿QUÉ SON?

Los horarios son **los bloques de tiempo** en que sucede cada clase.

**Ejemplo:**

```
Asignación: García enseña Matemática en 3°A

HORARIOS:
- Lunes 08:00-09:00 (Aula 301)
- Martes 08:00-09:00 (Aula 301)
- Jueves 09:00-10:00 (Aula 301)
- Viernes 09:00-10:00 (Aula 301)
```

---

## 🔄 PASO A PASO: CREAR HORARIOS

### Paso 1️⃣ → Crear/editar asignación

```
Asignación: García, Matemática, 3°A, 2026 ← CREADA
```

### Paso 2️⃣ → En la asignación, agregar horarios

```
┌────────────────────────────────────┐
│ ASIGNACIÓN CREADA                  │
│ García - Matemática - 3°A - 2026   │
├────────────────────────────────────┤
│                                    │
│ [+ AGREGAR HORARIO]                │
│                                    │
│ HORARIOS ACTUALES:                 │
│ (vacío - sin horarios aún)         │
│                                    │
└────────────────────────────────────┘
```

### Paso 3️⃣ → Cliquea "[+ AGREGAR HORARIO]"

```
┌────────────────────────────────────┐
│ NUEVO HORARIO                      │
├────────────────────────────────────┤
│                                    │
│ Día: [▼ Lunes]                    │
│       (LUNES-DOMINGO)              │
│                                    │
│ Hora Inicio: [08:00] (HH:MM)      │
│                                    │
│ Hora Fin: [09:00] (HH:MM)         │
│                                    │
│ Aula: [301] (opcional)            │
│                                    │
│ [GUARDAR] [CANCELAR]               │
│                                    │
└────────────────────────────────────┘
```

### Paso 4️⃣ → Valida y guarda

```javascript
// Se crea:
await db.horario.create({
  data: {
    idAsignacion: 15,      // García Math 3°A
    diaSemana: "LUNES",
    horaInicio: "08:00",
    horaFin: "09:00",
    aula: "301"
  }
});
```

### Paso 5️⃣ → Aparece en la lista

```
┌────────────────────────────────────┐
│ HORARIOS DE GARCÍA - MATH - 3°A    │
├────────────────────────────────────┤
│                                    │
│ ✓ LUNES 08:00-09:00 Aula 301     │
│   [Editar] [Eliminar]             │
│                                    │
│ [+ AGREGAR OTRO]                  │
│                                    │
└────────────────────────────────────┘
```

### Paso 6️⃣ → Repetir para todos los horarios

```
Agregar:
  ✓ Martes 08:00-09:00 Aula 301
  ✓ Jueves 09:00-10:00 Aula 301
  ✓ Viernes 09:00-10:00 Aula 301
  
Resultado: 5 horas/semana (según carga horaria)
```

---

## 📋 INFORMACIÓN TÉCNICA DE HORARIOS

```
TABLA: HORARIO

Campos:
  - idHorario (PK)
  - idAsignacion (FK)      → A qué asignación pertenece
  - diaSemana (ENUM)       → LUNES, MARTES, MIERCOLES, ...
  - horaInicio (STRING)    → "08:00"
  - horaFin (STRING)       → "09:00"
  - aula (STRING)          → "301" (opcional)

Nota: Las horas son STRING, no DATETIME
      ¿Por qué? Para evitar problemas con zonas horarias
      La escuela siempre es la misma, no cambia zona
```

---

## 🔗 ¿CÓMO SE CONECTAN HORARIOS CON ASISTENCIAS?

```
ASIGNACIÓN: García enseña Math en 3°A
    ↓
HORARIOS:
  - Lunes 08:00-09:00 Aula 301  ← ID: 10
  - Martes 08:00-09:00 Aula 301 ← ID: 11
    ↓
LUNES 28/04 - Profesor toma lista
    → Selecciona "Lunes 08:00-09:00"
    → Sistema crea asistencias referenciadas a HORARIO ID 10
    ↓
Se guardan asistencias:
  - García: Presente (Horario 10)
  - López: Ausente (Horario 10)
  - Martínez: Tarde (Horario 10)
```

---

## 📊 FUNCIONALIDADES DE HORARIOS

### 1. Ver horarios por CURSO

```
Entrada: Curso = "3°A"

Resultado:
  LUNES:
    - 08:00-09:00: Matemática (García) - Aula 301
    - 09:00-10:00: Lengua (López) - Aula 301
    - 10:00-11:00: C. Naturales (Martínez) - Aula 302
    
  MARTES:
    - 08:00-09:00: Matemática (García) - Aula 301
    - 10:00-11:00: Historia (Rodríguez) - Aula 303
    
  ... (y así para todos los días)
```

### 2. Ver horarios por PROFESOR

```
Entrada: Profesor = "García"

Resultado:
  LUNES 08:00-09:00:    Matemática - 3°A - Aula 301
  MARTES 08:00-09:00:   Matemática - 3°A - Aula 301
  JUEVES 09:00-10:00:   Matemática - 3°A - Aula 301
  VIERNES 09:00-10:00:  Matemática - 3°A - Aula 301
  VIERNES 13:00-14:00:  Matemática - 2°B - Aula 302
```

### 3. DESCARGAR BOLETÍN (para padres)

```
Padre descarga PDF:

┌─────────────────────────────────┐
│ HORARIO DE JUAN GARCÍA          │
│ Legajo: LEG-542-2026            │
│ Curso: 3°A - Primario - Mañana  │
├─────────────────────────────────┤
│                                 │
│ LUNES:                          │
│  08:00-09:00 Matemática (García)│
│  09:00-10:00 Lengua (López)    │
│                                 │
│ MARTES:                         │
│  08:00-09:00 Matemática (García)│
│  10:00-11:00 Historia (Rdguez)  │
│                                 │
│ MIÉRCOLES:                      │
│  09:00-10:00 Lengua (López)    │
│  10:00-11:00 C. Naturales (Mtz) │
│                                 │
│ ... (completo para toda semana) │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 CLONAR HORARIOS (con asignaciones)

Cuando clonas asignaciones del ciclo anterior:

```
Ciclo 2025:
  García - Math - 3°A
    ├─ Lunes 08:00-09:00
    ├─ Martes 08:00-09:00
    └─ Jueves 09:00-10:00
        ↓
      [CLONAR]
        ↓
Ciclo 2026:
  García - Math - 3°A (NUEVA)
    ├─ Lunes 08:00-09:00 ✓
    ├─ Martes 08:00-09:00 ✓
    └─ Jueves 09:00-10:00 ✓
       (mismos horarios, nueva asignación)
```

---

## ⚙️ VALIDACIONES

```
Al agregar horario:
  ✓ ¿El día es válido? (LUNES-DOMINGO)
  ✓ ¿La hora inicio < hora fin?
  ✓ ¿Las horas tienen formato correcto? (HH:MM)
  ✓ ¿No hay conflicto?
    - ¿El mismo profesor no está en otro lado a esa hora?
    - ¿El aula no está ocupada a esa hora?
```

---

## 🔗 RELACIÓN FINAL: TODO CONECTADO

```
ASIGNACIÓN DOCENTE (García, Math, 3°A, 2026)
│
├─ HORARIOS
│  ├─ Lunes 08:00-09:00
│  ├─ Martes 08:00-09:00
│  └─ Jueves 09:00-10:00
│
├─ CALIFICACIONES (registra profesor)
│  ├─ García T1 Parcial: 8
│  ├─ López T1 Parcial: 4
│  ├─ García T1 Recuperatorio: 8
│  └─ López T1 Recuperatorio: 7
│
└─ ASISTENCIAS (registra profesor/preceptor)
   ├─ 28/04 Lunes - García: Presente
   ├─ 28/04 Lunes - López: Ausente
   ├─ 29/04 Martes - García: Presente
   └─ 30/04 Jueves - García: Tarde
```

---

---

# 3️⃣ MÓDULO PERFIL

## 🎯 Propósito General

El **Perfil** es donde cada usuario ve y edita su información personal dentro del sistema.

Cada usuario tiene un perfil diferente según su rol:
- **Alumno:** Ve sus datos, calificaciones, horarios
- **Padre:** Ve sus datos y los de sus hijos
- **Profesor:** Ve sus datos, materias y horarios que enseña
- **Admin:** Ve estadísticas del sistema

---

## 👤 INFORMACIÓN BÁSICA DEL PERFIL

Todo usuario tiene:

```
┌─────────────────────────────────────┐
│ PERFIL DE USUARIO                   │
├─────────────────────────────────────┤
│                                     │
│ [AVATAR - FOTO DE PERFIL]           │
│                                     │
│ Nombre:       Juan García           │
│ DNI:          30.123.456            │
│ Email:        juan.garcia@email.com │
│ Teléfono:     1234567890            │
│ Dirección:    Calle 123, Dpto B     │
│ Rol:          ALUMNO                │
│ Cuenta desde: 01/03/2026            │
│ Estado:       ACTIVA ✓              │
│                                     │
│ [EDITAR] [CAMBIAR CONTRASEÑA]       │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 PASO A PASO: ACCEDER AL PERFIL

### Paso 1️⃣ → Usuario entra al sistema

Después de autenticarse y estar en dashboard.

### Paso 2️⃣ → Busca opción "Mi Perfil"

Generalmente en la esquina superior derecha:

```
┌─────────────────────────────────────┐
│ Dashboard    Académico    Finanzas  │
│                    [👤 ▼]           │
│                    Mi Perfil        │
│                    Cambiar contraseña
│                    Cerrar sesión    │
│                                     │
└─────────────────────────────────────┘
```

### Paso 3️⃣ → Se abre la página de perfil

```
URL: /dashboard/perfil
```

---

## 👥 TIPOS DE PERFIL SEGÚN ROL

### 1️⃣ PERFIL DE ALUMNO

```
┌──────────────────────────────────────────┐
│ PERFIL DE ALUMNO                         │
├──────────────────────────────────────────┤
│                                          │
│ [AVATAR]                                 │
│ Juan García                              │
│ DNI: 30.123.456                         │
│                                          │
│ INFORMACIÓN PERSONAL                     │
│  Email: juan.garcia@email.com            │
│  Teléfono: 1234567890                    │
│  Dirección: Calle 123, Dpto B            │
│  Fecha Nacimiento: 15/05/2013            │
│                                          │
│ INFORMACIÓN ACADÉMICA                    │
│  Legajo: LEG-542-2026                   │
│  Curso: 3°A - Primario - Mañana         │
│  Estado: ACTIVO ✓                       │
│  Inscripción: 01/03/2026                 │
│                                          │
│ PADRES/TUTORES VINCULADOS               │
│  👤 Carlos García (Padre)                │
│  👤 Roxana Martínez (Madre)              │
│                                          │
│ [EDITAR] [CAMBIAR CONTRASEÑA]            │
│ [CAMBIAR FOTO]                           │
│                                          │
└──────────────────────────────────────────┘
```

**Lo que VE el alumno:**
- ✓ Sus datos personales
- ✓ Su legajo
- ✓ Su curso actual
- ✓ Sus padres asociados
- ✗ No ve información de pagos (optional)
- ✗ No ve información de otros alumnos

---

### 2️⃣ PERFIL DE PADRE/TUTOR

```
┌──────────────────────────────────────────┐
│ PERFIL DE PADRE                          │
├──────────────────────────────────────────┤
│                                          │
│ [AVATAR]                                 │
│ Carlos García                            │
│ DNI: 25.987.654                         │
│                                          │
│ INFORMACIÓN PERSONAL                     │
│  Email: carlos.garcia@email.com          │
│  Teléfono: 9876543210                    │
│  Dirección: Calle 456, Casa 12           │
│                                          │
│ MIS HIJOS/PUPILOS                        │
│                                          │
│  👨 Juan García                          │
│     Legajo: LEG-542-2026                │
│     Curso: 3°A - Primario               │
│     Estado: ACTIVO ✓                    │
│     [VER DETALLE] [VER CALIFICACIONES]  │
│                                          │
│  👧 María García                         │
│     Legajo: LEG-543-2026                │
│     Curso: 1°B - Primario               │
│     Estado: ACTIVO ✓                    │
│     [VER DETALLE] [VER CALIFICACIONES]  │
│                                          │
│ [EDITAR] [CAMBIAR CONTRASEÑA]            │
│ [CAMBIAR FOTO]                           │
│                                          │
└──────────────────────────────────────────┘
```

**Lo que VE el padre:**
- ✓ Sus datos personales
- ✓ Lista de hijos asociados
- ✓ Legajo, curso, estado de cada hijo
- ✓ Puede hacer clic para ver más detalles del hijo
- ✓ Puede ver calificaciones (si está habilitado)
- ✓ Puede ver estado de cuenta (pagos)
- ✗ No ve datos de otros padres
- ✗ No ve datos de alumnos que no son sus hijos

---

### 3️⃣ PERFIL DE PROFESOR

```
┌──────────────────────────────────────────┐
│ PERFIL DE PROFESOR                       │
├──────────────────────────────────────────┤
│                                          │
│ [AVATAR]                                 │
│ García, Juan                             │
│ DNI: 28.555.666                         │
│                                          │
│ INFORMACIÓN PERSONAL                     │
│  Email: jgarcia@escuela.edu.ar           │
│  Teléfono: 5555555555                    │
│  Dirección: Avenida 123                  │
│                                          │
│ INFORMACIÓN PROFESIONAL                  │
│  Fecha Ingreso: 01/03/2020               │
│  Estado: ACTIVO ✓                       │
│  Cuenta desde: 01/03/2026                │
│                                          │
│ ASIGNACIONES ACTUALES                    │
│  📚 Matemática - 3°A (Primario)         │
│     Carga: 5 h/semana                    │
│     [Ver horarios] [Ver alumnos]         │
│                                          │
│  📚 Matemática - 2°B (Primario)         │
│     Carga: 4 h/semana                    │
│     [Ver horarios] [Ver alumnos]         │
│                                          │
│ [EDITAR] [CAMBIAR CONTRASEÑA]            │
│ [CAMBIAR FOTO]                           │
│                                          │
└──────────────────────────────────────────┘
```

**Lo que VE el profesor:**
- ✓ Sus datos personales
- ✓ Fecha de ingreso
- ✓ Sus asignaciones activas
- ✓ Carga horaria
- ✓ Puede acceder a horarios
- ✓ Puede ver listado de alumnos de sus cursos
- ✗ No ve datos de otros profesores
- ✗ No ve información administrativa completa

---

### 4️⃣ PERFIL DE ADMINISTRADOR

```
┌──────────────────────────────────────────┐
│ PERFIL DE ADMINISTRADOR                  │
├──────────────────────────────────────────┤
│                                          │
│ [AVATAR]                                 │
│ García, Juan                             │
│ DNI: 20.123.456                         │
│                                          │
│ INFORMACIÓN PERSONAL                     │
│  Email: admin@escuela.edu.ar             │
│  Teléfono: 1111111111                    │
│  Dirección: Calle Admin 1                │
│                                          │
│ ESTADÍSTICAS DEL SISTEMA                 │
│                                          │
│  💰 FINANZAS                            │
│     Pagos registrados: $2.450.000        │
│     Movimientos de stock: 234            │
│     Gastos totales: $125.000             │
│                                          │
│  📢 COMUNICADOS                          │
│     Total enviados: 45                   │
│     Últimos: 3 hoy                       │
│                                          │
│  📦 INVENTARIO                           │
│     Movimientos totales: 156             │
│     Insumos activos: 34                  │
│                                          │
│  👥 USUARIOS                             │
│     Total registrados: 487               │
│     Roles:                               │
│       - Alumnos: 245                     │
│       - Padres: 150                      │
│       - Profesores: 35                   │
│       - Admins: 2                        │
│                                          │
│ [EDITAR] [CAMBIAR CONTRASEÑA]            │
│ [CAMBIAR FOTO]                           │
│ [ACCEDER A ADMIN PANEL] ⚙️               │
│                                          │
└──────────────────────────────────────────┘
```

**Lo que VE el admin:**
- ✓ Sus datos personales
- ✓ Estadísticas completas del sistema
- ✓ Resumen de finanzas
- ✓ Resumen de comunicados
- ✓ Resumen de inventario
- ✓ Resumen de usuarios
- ✓ Acceso a panel administrativo
- ✓ Puede editar cualquier información

---

## 🚪 INGRESO DE CUENTA DE PADRE (Detalles Críticos)

### ¿CÓMO SE VINCULA UN PADRE?

**PASO 1: Crear la PERSONA PADRE**

```
Admin va a: Gestión > Todas las Personas > Nueva Persona

┌──────────────────────────────────────┐
│ CREAR NUEVA PERSONA                  │
├──────────────────────────────────────┤
│                                      │
│ Nombre: Carlos                       │
│ Apellido: García                     │
│ DNI: 25.987.654                     │
│ Email: carlos.garcia@email.com       │
│ Teléfono: 9876543210                 │
│ Dirección: Calle 456                 │
│                                      │
│ Rol: [▼ PADRE]                      │
│      (opciones: ALUMNO, PADRE,       │
│       DOCENTE, ADMIN, PRECEPTOR)     │
│                                      │
│ [CREAR]                              │
│                                      │
└──────────────────────────────────────┘
```

Resultado: Se crea `PERSONA` con rol `PADRE`

**PASO 2: Crear el USUARIO**

```
Sistema crea automáticamente o admin lo hace:

┌──────────────────────────────────────┐
│ CREAR USUARIO                        │
├──────────────────────────────────────┤
│                                      │
│ Persona: Carlos García (PADRE)      │
│ Contraseña: [generar aleatorio]     │
│            "Abc12345" (temporal)     │
│                                      │
│ Estado: ACTIVO ✓                    │
│ ¿Primer login?: SÍ                   │
│ (Fuerza al padre a cambiar contraseña)
│                                      │
│ [CREAR]                              │
│                                      │
└──────────────────────────────────────┘
```

Resultado: Se crea `USUARIO` vinculado a la PERSONA

**PASO 3: VINCULAR CON ALUMNO**

```
Admin va al detalle del alumno (Juan García):

┌──────────────────────────────────────┐
│ ALUMNO: Juan García                  │
├──────────────────────────────────────┤
│ ...                                  │
│ PADRES/TUTORES:                      │
│ [+ AGREGAR PADRE/TUTOR]              │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ NUEVA RELACIÓN                 │   │
│ ├────────────────────────────────┤   │
│ │ Persona: [▼ Carlos García]    │   │
│ │           (filtra solo PADRES) │   │
│ │                                │   │
│ │ Relación: [▼ Padre]           │   │
│ │    opciones: Padre, Madre,     │   │
│ │    Tutor, Abuelo, Otro         │   │
│ │                                │   │
│ │ [GUARDAR]                      │   │
│ └────────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

Resultado: Se crea registro en tabla `ALUMNO_PADRE`

### ¿QUÉ SUCEDE TÉCNICAMENTE?

```
TABLA PERSONA:
  idPersona: 1203
  nombre: Carlos
  apellido: García
  dni: 25987654
  rol: PADRE

TABLA USUARIO:
  idUsuario: 150
  idPersona: 1203 (FK)
  passwordHash: "$2a$10$..."
  estado: true

TABLA PADRE:
  idPadre: 1203 (FK a PERSONA)
  
TABLA ALUMNO_PADRE:
  idAlumno: 542 (Juan)
  idPadre: 1203 (Carlos)
  relacion: "Padre"
```

### 🔑 PRIMER LOGIN DEL PADRE

**Paso 1️⃣ → Padre recibe credenciales**

```
Email: "Tu cuenta ha sido creada en el Sistema Escolar"
Usuario: carlos.garcia@email.com
Contraseña: Abc12345 (temporal)
Link: https://sistemacolar.edu.ar/login
```

**Paso 2️⃣ → Abre enlace e ingresa**

```
┌──────────────────────────────────────┐
│ LOGIN - SISTEMA ESCOLAR              │
├──────────────────────────────────────┤
│                                      │
│ Email: [carlos.garcia@email.com___] │
│ Contraseña: [Abc12345____________] │
│                                      │
│ [INGRESAR]                           │
│                                      │
└──────────────────────────────────────┘
```

**Paso 3️⃣ → Sistema detecta PRIMER LOGIN**

```
if (usuario.defaultPassword === true) {
  // Redirigir a forzar cambio de contraseña
  redirect("/reset-password")
}
```

**Paso 4️⃣ → DEBE cambiar contraseña**

```
┌──────────────────────────────────────┐
│ CAMBIAR CONTRASEÑA (OBLIGATORIO)     │
├──────────────────────────────────────┤
│                                      │
│ Contraseña actual: [Abc12345______] │
│ Nueva contraseña:  [______________] │
│ Confirmar:         [______________] │
│                                      │
│ Requisitos:                          │
│  ✓ Mínimo 6 caracteres              │
│  ✓ Debe confirmar                   │
│                                      │
│ [CAMBIAR] [CANCELAR]                │
│                                      │
└──────────────────────────────────────┘
```

**Paso 5️⃣ → Se actualiza y accede al dashboard**

```javascript
// Se guarda nueva contraseña (encriptada con bcryptjs)
await db.usuario.update({
  where: { idUsuario: 150 },
  data: {
    passwordHash: bcrypt.hashSync(nuevaContra),
    defaultPassword: false  // Ya no es primer login
  }
});

// Redirige a:
redirect("/dashboard")
```

**Paso 6️⃣ → Ve su perfil con sus HIJOS**

```
┌──────────────────────────────────────────┐
│ PERFIL DE CARLOS GARCÍA                  │
├──────────────────────────────────────────┤
│ [AVATAR]                                 │
│ Carlos García                            │
│ DNI: 25.987.654                         │
│ Email: carlos.garcia@email.com           │
│                                          │
│ MIS HIJOS/PUPILOS:                       │
│                                          │
│ 👨 Juan García                           │
│    Legajo: LEG-542-2026                 │
│    Curso: 3°A - Primario - Mañana       │
│    Estado: ACTIVO ✓                     │
│    Inscripción: 01/03/2026               │
│    [VER DETALLE]                         │
│    [VER CALIFICACIONES]                  │
│    [VER ESTADO DE PAGOS]                 │
│                                          │
│ (Si tiene más hijos, aparecen aquí)     │
│                                          │
└──────────────────────────────────────────┘
```

---

## ✏️ FUNCIONALIDADES DEL PERFIL

### 1️⃣ CAMBIAR CONTRASEÑA

**Acceso:**
```
Mi Perfil → [CAMBIAR CONTRASEÑA]
```

**Formulario:**
```
┌──────────────────────────────────────┐
│ CAMBIAR CONTRASEÑA                   │
├──────────────────────────────────────┤
│                                      │
│ Contraseña actual:                   │
│ [________________________] (oculta)  │
│                                      │
│ Nueva contraseña:                    │
│ [________________________] (oculta)  │
│                                      │
│ Confirmar contraseña:                │
│ [________________________] (oculta)  │
│                                      │
│ Requisitos:                          │
│ • Mínimo 6 caracteres ✓              │
│ • Debe confirmar ✓                   │
│                                      │
│ [CAMBIAR] [CANCELAR]                 │
│                                      │
└──────────────────────────────────────┘
```

**Validaciones:**
```
1. Contraseña actual correcta?
   ✓ Compara contra passwordHash almacenado
   
2. Nueva contraseña tiene 6+ caracteres?
   ✓ Valida longitud
   
3. Confirmación coincide con nueva?
   ✓ Deben ser exactamente iguales
   
4. Nueva ≠ Anterior?
   ✓ No puede usar misma contraseña
```

**Resultado:**
```javascript
// Se encripta la contraseña
const passwordHash = await bcryptjs.hash(nuevaContra, 10);

// Se actualiza en BD
await db.usuario.update({
  where: { idUsuario: usuarioAutenticado.id },
  data: { passwordHash }
});

// Mensaje: "Contraseña actualizada correctamente"
```

---

### 2️⃣ EDITAR DATOS PERSONALES

**Acceso:**
```
Mi Perfil → [EDITAR]
```

**Formulario:**
```
┌──────────────────────────────────────┐
│ EDITAR PERFIL                        │
├──────────────────────────────────────┤
│                                      │
│ Nombre: [Juan________________]      │
│ Apellido: [García______________]    │
│                                      │
│ Email: [juan@email.com_________]    │
│ (formato validado)                   │
│                                      │
│ Teléfono: [1234567890_________]     │
│ (opcional)                           │
│                                      │
│ Dirección: [Calle 123, Dpto B____]  │
│ (opcional)                           │
│                                      │
│ DNI: 30.123.456                     │
│ (NO editable - solo admin)           │
│                                      │
│ Fecha Nacimiento: 15/05/2013        │
│ (NO editable - solo admin)           │
│                                      │
│ [GUARDAR] [CANCELAR]                 │
│                                      │
└──────────────────────────────────────┘
```

**Campos editables:**
- ✏️ Nombre y Apellido
- ✏️ Email (validado)
- ✏️ Teléfono
- ✏️ Dirección

**Campos NO editables:**
- ❌ DNI (para evitar fraudes)
- ❌ Fecha nacimiento (datos fijos)
- ❌ Legajo (si es alumno - identificador único)

**Validaciones:**
```
• Email debe tener formato válido (incluir @)
• Nombre y Apellido requeridos
• Teléfono: solo dígitos (si se proporciona)
• Dirección: máximo 255 caracteres
```

**Nota importante:**
```
Si eres ALUMNO o PADRE y ves un error en tu DNI:
  → Debes contactar al Administrador
  → El admin es quien puede corregir datos críticos
```

---

### 3️⃣ ACTUALIZAR FOTO DE PERFIL

**Acceso:**
```
Mi Perfil → [CAMBIAR FOTO]
  o
Hacer clic en el avatar
```

**Proceso:**

```
Paso 1️⃣ → Seleccionar archivo
┌──────────────────────────────────────┐
│ ACTUALIZAR AVATAR                    │
├──────────────────────────────────────┤
│                                      │
│ Foto actual: [AVATAR]               │
│                                      │
│ [ELEGIR ARCHIVO] (del explorador)   │
│                                      │
│ Formatos permitidos: JPEG, PNG, WebP │
│ Tamaño máximo: 2MB                   │
│                                      │
│ [GUARDAR] [CANCELAR]                 │
│                                      │
└──────────────────────────────────────┘

Paso 2️⃣ → Validar archivo
  ✓ ¿Es JPEG, PNG o WebP?
  ✓ ¿Pesa menos de 2MB?

Paso 3️⃣ → Subir a Cloudinary
  (servicio de almacenamiento en la nube)

Paso 4️⃣ → Guardar URL en base de datos
  PERSONA.avatarUrl = "https://res.cloudinary.com/..."
  PERSONA.avatarPublicId = "id-publico-123"

Paso 5️⃣ → Actualizar en toda la aplicación
  ✓ Mi perfil
  ✓ Mensajes
  ✓ Comentarios
  ✓ Listados (donde aparezca)
```

**Permisos:**
```
Quién puede cambiar foto:
  ✓ El mismo usuario
  ✓ Un administrador
  ✓ Si eres alumno, también tu padre puede
```

---

## 🔐 PERMISOS GENERALES DEL PERFIL

| Acción | Alumno | Padre | Profesor | Admin |
|--------|--------|-------|----------|-------|
| Ver su perfil | ✓ | ✓ | ✓ | ✓ |
| Editar su perfil | ✓ | ✓ | ✓ | ✓ |
| Cambiar su contraseña | ✓ | ✓ | ✓ | ✓ |
| Cambiar su foto | ✓ | ✓ | ✓ | ✓ |
| Ver perfil otro usuario | ✗ | ✗ | ✗ | ✓ |
| Editar perfil otro usuario | ✗ | ✗ | ✗ | ✓ |
| Ver hijos (padre) | N/A | ✓ | N/A | ✓ |
| Ver asignaciones (profesor) | N/A | N/A | ✓ | ✓ |

---

## 📋 FLUJO COMPLETO: ALUMNO CON PADRE

```
1. ADMIN crea PERSONA ALUMNO (Juan)
   └─ Rol: ALUMNO
   └─ Datos: nombre, DNI, etc.

2. ADMIN crea USUARIO para Juan
   └─ Contraseña: temporal
   └─ Email: juan@escuela.com

3. ADMIN inscribe a Juan en curso
   └─ Crear MATRICULA
   └─ Generar LEGAJO: LEG-542-2026

4. ADMIN crea PERSONA PADRE (Carlos)
   └─ Rol: PADRE
   └─ Datos: nombre, DNI, etc.

5. ADMIN crea USUARIO para Carlos
   └─ Contraseña: temporal
   └─ Email: carlos@mail.com

6. ADMIN VINCULA padre con alumno
   └─ ALUMNO_PADRE: Juan (542) ← Carlos (1203)
   └─ Relación: "Padre"

7. Juan LOGIN (primer ingreso)
   └─ Email: juan@escuela.com
   └─ Contraseña temporal
   └─ DEBE cambiar contraseña
   └─ Ve su perfil:
       ├─ Datos personales
       ├─ Legajo
       ├─ Curso
       ├─ Padres: Carlos García (Padre)
       └─ Botones: Editar, Cambiar contraseña, etc.

8. Carlos LOGIN (primer ingreso)
   └─ Email: carlos@mail.com
   └─ Contraseña temporal
   └─ DEBE cambiar contraseña
   └─ Ve su perfil:
       ├─ Datos personales
       ├─ MIS HIJOS:
       │   └─ Juan García
       │       ├─ Legajo: LEG-542-2026
       │       ├─ Curso: 3°A - Primario
       │       ├─ Estado: ACTIVO
       │       └─ [VER DETALLE]
       └─ Botones: Editar, Cambiar contraseña, etc.

9. Cualquiera edita su perfil
   └─ Cambiar nombre, email, teléfono, etc.
   └─ Cambiar foto
   └─ Cambiar contraseña
   └─ Admin puede editar a otros

RESULTADO: Sistema completamente operativo
```

---

---

# 4️⃣ TECNOLOGÍAS UTILIZADAS

## 🎯 ¿Por qué explicar tecnologías?

Es importante que sepan:
- **Qué herramientas** usamos
- **Por qué** las elegimos
- **Cómo** se conectan entre sí
- **Ventajas** de usar estas tecnologías

---

## 📊 STACK COMPLETO

```
FRONTEND (Lo que ve el usuario)
├── Next.js 16 (framework React)
├── React 19 (librería UI)
├── TypeScript (lenguaje con tipos)
├── Tailwind CSS (estilos)
├── React Hook Form (formularios)
├── Lucide React (iconos)
└── html2canvas + jsPDF (exportar PDF)

BACKEND (Lo que procesa el servidor)
├── Next.js API Routes
├── Server Actions (acciones del servidor)
├── Node.js (entorno JavaScript)
└── TypeScript (lenguaje con tipos)

BASE DE DATOS (Donde se guardan los datos)
├── PostgreSQL (motor de BD)
├── Prisma ORM (acceso a BD)
├── PrismaPg Adapter (conecta Prisma con PostgreSQL)
└── Connection Pool (gestiona conexiones)

AUTENTICACIÓN (Control de acceso)
├── NextAuth v5 (framework autenticación)
├── bcryptjs (encriptación de contraseñas)
└── JWT tokens (sesiones)

SERVICIOS EXTERNOS
├── Cloudinary (almacenamiento de fotos)
└── Nodemailer (envío de emails)
```

---

## 🎯 ¿QUÉ ES PRISMA?

### Explicación Simple

**Prisma es un ORM (Object-Relational Mapping).**

Un ORM es una **herramienta que traduce datos de la base de datos a objetos en JavaScript.**

### Ejemplo ANTES (sin ORM - SQL puro):

```javascript
// Consulta SQL directa
const resultado = await db.query(
  `SELECT a.idAlumno, a.legajo, p.nombre, p.apellido 
   FROM alumnos a
   JOIN personas p ON a.idPersona = p.idPersona
   WHERE a.legajo = $1`,
  ['LEG-542-2026']
);

// Resultado: Array de datos sin estructura
console.log(resultado);
// [{id: 542, legajo: 'LEG-542-2026', nombre: 'Juan', ...}]
// Es solo datos, necesito saber qué significa cada campo
```

### Ejemplo DESPUÉS (con Prisma ORM):

```javascript
// Consulta Prisma
const alumno = await db.alumno.findUnique({
  where: { legajo: 'LEG-542-2026' },
  include: { persona: true }  // Incluir datos de persona
});

// Resultado: Objeto TypeScript con estructura clara
console.log(alumno);
// {
//   idAlumno: 542,
//   legajo: 'LEG-542-2026',
//   persona: {
//     nombre: 'Juan',
//     apellido: 'García',
//     dni: '30.123.456'
//   }
// }
// Claro qué es cada cosa, con autocompletado en editor
```

---

### ✅ VENTAJAS DE PRISMA

#### 1️⃣ **Type Safety (Seguridad de tipos)**

```javascript
// Sin Prisma:
const nombre = resultado[0].nom;  // ¿Es "nom" o "nombre"? ❌
// Solo descubro el error cuando se ejecuta

// Con Prisma:
const alumno = await db.alumno.findUnique(...);
const nombre = alumno.persona.nombre;  // ✓ TypeScript sabe
// El editor me avisa si escribo mal
// alumno.noombre = ERROR ❌ (auto-detecta)
```

#### 2️⃣ **Sintaxis legible**

```javascript
// SQL puro (difícil):
`SELECT * FROM alumnos a
 JOIN personas p ON a.idPersona = p.idPersona
 LEFT JOIN alumno_padres ap ON a.idAlumno = ap.idAlumno
 WHERE a.estado = 'Activo'
   AND p.apellido LIKE $1
 ORDER BY p.apellido ASC
 LIMIT 10 OFFSET 0`

// Prisma (fácil y clara):
db.alumno.findMany({
  where: {
    estado: 'Activo',
    persona: {
      apellido: {
        contains: apellido,
        mode: 'insensitive'
      }
    }
  },
  include: {
    persona: true,
    alumno_padres: {
      include: { padre: true }
    }
  },
  orderBy: { persona: { apellido: 'asc' } },
  take: 10,
  skip: 0
});
```

#### 3️⃣ **Migraciones (Historial de cambios)**

```
Empiezo con tabla:
CREATE TABLE CICLO (
  idCiclo INT,
  anio INT
)

Luego agrego campo:
ALTER TABLE CICLO ADD mostrarImportacion BOOLEAN

Prisma crea archivo:
/prisma/migrations/20260420_add_mostrar_importacion/
  migration.sql

Beneficio:
✓ Historial completo de cambios
✓ Otros desarrolladores ven qué pasó
✓ Se puede revertir un cambio si falla
✓ Reproducible: si clono el proyecto, puedo recrear la BD
```

#### 4️⃣ **Relaciones automáticas**

```javascript
// Obtener alumno CON sus padres, sus calificaciones, etc.
const alumno = await db.alumno.findUnique({
  where: { idAlumno: 542 },
  include: {
    persona: true,                    // Sus datos personales
    matriculas: {                      // Sus matrículas
      include: { curso: true }         // Y los cursos
    },
    alumno_padres: {                  // Sus padres
      include: { padre: true }        // Con datos de cada padre
    }
  }
});

// Todo en una sola query, bien organizado
// SQL puro: Múltiples JOINS complicados
```

#### 5️⃣ **Validación automática**

```javascript
// Si intento guardar dato incorrecto:
await db.alumno.create({
  data: {
    idPersona: "texto",  // ❌ Debe ser número
    fechaNacimiento: "no-es-fecha"  // ❌ Debe ser DATE
  }
});
// Prisma rechaza: "Tipos incorrectos"
// Sin ORM: Se guarda incorrectamente y falla después
```

---

## 🗄️ ¿POR QUÉ POSTGRESQL Y NO SQLITE?

### Comparación Directa

#### SQLITE (Lo que usamos al inicio)

**Ventajas:**
```
✅ Muy fácil de comenzar
   - Archivo único (escuela.db)
   - Cero configuración
   - Funciona en una carpeta

✅ Perfecto para desarrollo inicial
   - Sin dependencias complejas
   - Rápido para prototipos

✅ Bajo requerimientos
   - No necesita servidor
   - Funciona en cualquier máquina
```

**Desventajas:**
```
❌ No soporta conexiones concurrentes
   Problema: Si 10 usuarios entran juntos:
   
   Usuario 1: Lee datos
   Usuario 2: Intenta escribir → BLOQUEADO ❌
   Usuario 3: Intenta leer → BLOQUEADO ❌
   
   ¿Por qué? SQLite bloquea toda la BD mientras escribe

❌ Muy lento con muchos datos
   - Tabla con 50.000 registros → lento
   - Sin índices complejos
   - Sin optimizaciones de query

❌ No es escalable
   - Funciona para 10 usuarios
   - 100 usuarios → problemas
   - 500 usuarios → colapso total

❌ No soporta roles y permisos nativos
   - Hay que implementar en código
   - Sin control de acceso a nivel BD

❌ Sin validación de tipos
   - TODO es texto/número
   - Sin tipos de datos avanzados (JSON, Arrays, UUID)
```

### Ejemplo del problema en SQLite:

```
08:00 - Usuario A abre inscripciones
        → Lee tabla ALUMNO

08:01 - Usuario B intenta inscribir alumno
        → ESCRIBE en tabla MATRICULA
        → Base de datos BLOQUEADA

08:02 - Usuarios C, D, E intentan entrar
        → ESPERANDO que A termine de leer...
        
08:05 - A termina de leer, B puede escribir

RESULTADO: Sistema lento, usuarios esperando
```

---

#### POSTGRESQL (Lo que usamos ahora)

**Ventajas:**

```
✅ Múltiples conexiones simultáneas
   Usuarios A, B, C, D pueden trabajar juntos
   sin bloquearse unos a otros
   
   (Todos pueden escribir y leer a la vez)

✅ MUY RÁPIDO
   - Índices avanzados
   - Optimizador de queries
   - Caché inteligente
   - Millones de registros: rápido

✅ Escalable
   - 10 usuarios: ✓
   - 100 usuarios: ✓
   - 1000 usuarios: ✓
   - 10.000 usuarios: ✓

✅ Seguridad ACID
   Si algo falla en mitad de una operación:
   - TODO se revierte (no queda parcial)
   - Consistency garantizada
   
   Ejemplo:
   Inscribir alumno = crear PERSONA + ALUMNO + MATRICULA
   Si falla en MATRICULA:
   → Se revierte TODO (no queda alumno sin matrícula)

✅ Tipos de datos avanzados
   - JSON (guardar datos complejos)
   - Arrays (listas de valores)
   - UUID (IDs universales)
   - Enums (valores limitados)

✅ Roles y permisos nativos
   Control de acceso a nivel base de datos

✅ Replicación y Backup
   - Respaldos automáticos
   - Recuperación ante desastres
   - Datos duplicados en múltiples servidores
```

**Desventajas:**

```
❌ Requiere servidor ejecutándose
   PostgreSQL debe estar levantado siempre

❌ Más complejo de configurar
   - Credenciales
   - Host y puerto
   - SSL
   - Pool de conexiones

❌ Potencial costo
   - Si es cloud: paga por uso
   - Pero la mayoría de hosting lo incluye
```

---

### 🔄 MIGRACIÓN: SQLite → PostgreSQL

**Antes (desarrollo inicial):**
```
Proyecto
├── escuela.db (SQLite, archivo local)
├── package.json
│   └── "sqlite3": "^3.x"
├── prisma/schema.prisma
│   └── datasource db {
│         provider = "sqlite"
│       }
└── src/lib/db.ts
    └── import Database from 'better-sqlite3'
```

**Después (ahora):**
```
Proyecto
├── .env
│   └── DATABASE_URL=postgresql://usuario:pass@host:5432/escuela
├── package.json
│   ├── "pg": "^8.11.3"
│   └── "@prisma/adapter-pg": "latest"
├── prisma/schema.prisma
│   └── datasource db {
│         provider = "postgresql"
│       }
└── src/lib/db.ts
    ├── import { Pool } from 'pg'
    ├── import { PrismaPg } from '@prisma/adapter-pg'
    └── const pool = new Pool({ ... })
        const adapter = new PrismaPg(pool)
        const db = new PrismaClient({ adapter })
```

---

## 🔧 CONFIGURACIÓN ACTUAL (PostgreSQL + Prisma)

### Archivo: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"    // Motor: PostgreSQL
  url      = env("DATABASE_URL")  // Credenciales en .env
}

// Después vienen las tablas...
model Alumno {
  idAlumno      Int     @id
  idPersona     Int     @unique
  persona       Persona @relation(fields: [idPersona], references: [idPersona])
  // ...
}
```

### Archivo: `src/lib/db.ts`

```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  // POOL DE CONEXIONES
  const pool = new Pool({
    connectionString,
    max: 15,                    // Máximo 15 conexiones
    idleTimeoutMillis: 30000,   // 30 segundos sin usar → cierra
    connectionTimeoutMillis: 10000,  // 10 segundos para conectar
    ssl: { rejectUnauthorized: false }  // SSL habilitado
  });

  // ADAPTADOR PRISMA PARA POSTGRESQL
  const adapter = new PrismaPg(pool);

  // CLIENTE PRISMA
  return new PrismaClient({
    adapter,
    log: ["error"],  // Solo registra errores
  });
};

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

// Reutilizar conexión en desarrollo
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
```

---

## 📊 POOL DE CONEXIONES

### ¿Qué es?

Un pool es un grupo de conexiones reutilizables a la base de datos.

```
SIN POOL:
Usuario 1 → Abre conexión → Consulta → Cierra conexión (Lento)
Usuario 2 → Abre conexión → Consulta → Cierra conexión (Lento)
Usuario 3 → Abre conexión → Consulta → Cierra conexión (Lento)
           Cada operación: abrir + consultar + cerrar = 3 pasos

CON POOL:
Pool de conexiones preabiertas: [Conn1] [Conn2] [Conn3]... [Conn15]

Usuario 1 → Toma Conn1 → Consulta → Devuelve Conn1
Usuario 2 → Toma Conn2 → Consulta → Devuelve Conn2
Usuario 3 → Toma Conn3 → Consulta → Devuelve Conn3

           Cada operación: tomar + consultar + devolver = MÁS RÁPIDO
```

### Configuración actual:

```
max: 15
  → Máximo 15 conexiones simultáneas
  → Si 16 usuarios usan > 15 conexiones, espera a que se libere una

idleTimeoutMillis: 30000
  → Si conexión no se usa 30 segundos → cierra automáticamente
  → Libera recursos del servidor PostgreSQL

connectionTimeoutMillis: 10000
  → Si tarda más de 10 segundos conectar → error timeout
  → Evita que quede colgada esperando

ssl: { rejectUnauthorized: false }
  → Conexión segura (encriptada)
```

---

## 🔄 MIGRACIONES EN PRISMA

### ¿Qué es una migración?

Una migración es un **registro de cambios en la estructura de la BD**.

### Ejemplo: Agregar campo a tabla

**Paso 1️⃣ → Editar schema.prisma**

```prisma
// Antes:
model CicloLectivo {
  idCiclo Int     @id
  anio    Int     @unique
  estado  Boolean
}

// Después (agregamos campo):
model CicloLectivo {
  idCiclo               Int     @id
  anio                  Int     @unique
  estado                Boolean
  mostrarImportacion    Boolean @default(false)  // ← NUEVO
}
```

**Paso 2️⃣ → Ejecutar Prisma Migrate**

```bash
npx prisma migrate dev --name add_mostrar_importacion

// Prisma:
// 1. Detecta cambios en schema.prisma
// 2. Crea archivo SQL de cambios
// 3. Aplica cambios a BD
// 4. Actualiza cliente Prisma
```

**Paso 3️⃣ → Se crea archivo de migración**

```
/prisma/migrations/
  └── 20260420004505_add_mostrar_importacion/
      └── migration.sql
```

**Contenido del archivo:**
```sql
-- AlterTable
ALTER TABLE "CicloLectivo" ADD COLUMN "mostrarImportacion" BOOLEAN NOT NULL DEFAULT false;
```

### Beneficios:

```
✓ Historial completo
  - Qué cambió
  - Cuándo cambió
  - Por qué cambió (nombre descriptivo)

✓ Reproducible
  - Clono proyecto → ejecuto migraciones → BD idéntica

✓ Reversible
  - npx prisma migrate resolve --rolled-back migration_name
  - Si algo sale mal, puedo revertir

✓ Trabajo en equipo
  - Otros desarrolladores ven cambios
  - Conflictos claros si modifica dos personas

✓ CI/CD
  - Automatizar cambios en producción
```

---

## 🎯 FLUJO COMPLETO: DE USUARIO A BASE DE DATOS

```
┌─────────────────────────────────────────────────────┐
│ 1. USUARIO VE PANTALLA (Frontend)                   │
├─────────────────────────────────────────────────────┤
│ /dashboard/alumnos/inscripciones                    │
│                                                     │
│ ┌──────────────────────────────────────┐            │
│ │ Alumno: [▼ García, Juan]             │            │
│ │ Curso: [▼ 3°A - Primario - Mañana]   │            │
│ │ [INSCRIBIR]                          │            │
│ └──────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
                    ↓ (clic)
┌─────────────────────────────────────────────────────┐
│ 2. NAVEGADOR ENVÍA PETICIÓN HTTP (Network)          │
├─────────────────────────────────────────────────────┤
│ POST /api/alumno/inscribir                          │
│ {                                                   │
│   "idAlumno": 542,                                  │
│   "idCurso": 3                                      │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. SERVIDOR RECIBE (Node.js + Next.js Backend)      │
├─────────────────────────────────────────────────────┤
│ src/lib/actions/alumno-actions.ts                   │
│                                                     │
│ export async function inscribirAlumno(...) {        │
│   // Lógica de validación                           │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. PRISMA ORM PROCESA (Mapeo a Objeto)              │
├─────────────────────────────────────────────────────┤
│ const matricula = await db.matricula.create({       │
│   data: {                                           │
│     idAlumno: 542,                                  │
│     idCurso: 3,                                     │
│     idCiclo: 2026,                                  │
│     estadoAcademico: "Activo"                       │
│   }                                                 │
│ });                                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. ADAPTADOR PRISMAPG (Conecta a PostgreSQL)        │
├─────────────────────────────────────────────────────┤
│ Toma conexión del POOL                              │
│ Convierte Prisma query → SQL                        │
│ Envía a PostgreSQL                                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6. POSTGRESQL (Base de Datos)                       │
├─────────────────────────────────────────────────────┤
│ INSERT INTO matricula (                             │
│   idAlumno, idCurso, idCiclo, estadoAcademico       │
│ ) VALUES (542, 3, 2026, 'Activo');                  │
│                                                     │
│ ✓ Validaciones de base de datos                     │
│ ✓ Constraints (UNIQUE, FOREIGN KEY)                 │
│ ✓ Transacciones ACID                                │
│                                                     │
│ RESULTADO: INSERT id = 1234                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 7. RESPUESTA AL SERVIDOR (Prisma)                   │
├─────────────────────────────────────────────────────┤
│ {                                                   │
│   idMatricula: 1234,                                │
│   idAlumno: 542,                                    │
│   idCurso: 3,                                       │
│   idCiclo: 2026,                                    │
│   estadoAcademico: "Activo",                        │
│   fechaInscripcion: "2026-04-28"                    │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 8. SERVIDOR RESPONDE AL CLIENTE (HTTP Response)     │
├─────────────────────────────────────────────────────┤
│ 200 OK                                              │
│ {                                                   │
│   "success": true,                                  │
│   "matricula": {                                    │
│     "idMatricula": 1234,                            │
│     "legajo": "LEG-542-2026"                        │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 9. NAVEGADOR ACTUALIZA INTERFAZ (Frontend React)    │
├─────────────────────────────────────────────────────┤
│ ✓ Inscripción exitosa                               │
│ ✓ Nuevo alumno aparece en listado                   │
│ ✓ Mensaje de confirmación                           │
│ ✓ Redirecciona a detalle del alumno                 │
└─────────────────────────────────────────────────────┘
```

---

## 📝 RESUMEN TÉCNICO

| Componente | Función | Tecnología |
|------------|---------|------------|
| **Frontend** | Lo que ve usuario | Next.js + React + TypeScript |
| **Backend** | Procesa solicitudes | Next.js Server Actions + Node.js |
| **ORM** | Mapea datos a objetos | Prisma |
| **Adaptador** | Conecta ORM a BD | PrismaPg |
| **Pool** | Gestiona conexiones | pg (15 conexiones máx) |
| **Base de Datos** | Almacena datos | PostgreSQL |
| **Seguridad** | Encriptación, tokens | bcryptjs + NextAuth + JWT |
| **Almacenamiento** | Fotos de perfil | Cloudinary |
| **Email** | Envío de correos | Nodemailer |

---

## 💡 CONCEPTOS CLAVE PARA RECORDAR

### ✅ Prisma permite:
- Escribir código más limpio y seguro
- Cambios a la BD sin escribir SQL
- Historial completo de migraciones
- Type safety (errores antes de ejecutar)
- Relaciones automáticas

### ✅ PostgreSQL permite:
- Múltiples usuarios simultáneos
- Operaciones ACID (confiable)
- Escalabilidad (miles de usuarios)
- Seguridad robusta
- Pool de conexiones (performance)

### ✅ Por qué SQL puro NO es suficiente:
- SQL crudo: propenso a errores
- Difícil de leer y mantener
- Sin type safety
- Sin historial de cambios

### ✅ Por qué SQLite NO es suficiente para producción:
- Sin concurrencia
- Bloqueos de BD
- No escalable
- Lento con muchos datos

---

## 🎯 CONCLUSIÓN

```
Sistema Escolar = Stack Moderno y Robusto

Frontend: Next.js + React
  ↓ (requests)
Backend: Node.js + Next.js
  ↓ (queries)
ORM: Prisma (traduce a SQL)
  ↓
Adaptador: PrismaPg (conecta a PostgreSQL)
  ↓
BD: PostgreSQL (guarda datos)
  ↓ (connection pool)
  15 conexiones máximo, reutilizables

RESULTADO:
✓ Sistema rápido
✓ Seguro
✓ Escalable
✓ Mantenible
✓ Profesional
```

---

