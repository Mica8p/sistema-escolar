# 🔐 Credenciales de Acceso - Sistema Escolar

## Información General
- **URL de acceso:** `http://localhost:3000`
- **Base de datos:** SQLite (dev.db)
- **Estado del sistema:** ✅ Completamente poblado con datos de 2024 y 2025

---

## 👨‍💼 Cuenta Administrador

| Campo | Valor |
|-------|-------|
| **Email** | `admin@escuela.local` |
| **Contraseña** | `admin123` |
| **Rol** | Admin |
| **Acceso** | Acceso total al sistema |

### Funcionalidades del Admin:
- ✅ Gestión de usuarios y roles
- ✅ Configuración del sistema
- ✅ Reportes generales
- ✅ Gestión de ciclos académicos
- ✅ Gestión de finanzas
- ✅ Inventario

---

## 👨‍🏫 Cuentas Profesores

Se han creado **5 profesores** con acceso de lectura/escritura en su área correspondiente.

**Contraseña para todos:** `prof123`

| # | Nombre | Apellido | Email |
|---|--------|----------|-------|
| 1 | María | García | usuario[random]@escuela.local |
| 2 | Carlos | López | usuario[random]@escuela.local |
| 3 | Ana | Martínez | usuario[random]@escuela.local |
| 4 | Pedro | Rodríguez | usuario[random]@escuela.local |
| 5 | Laura | Pérez | usuario[random]@escuela.local |

### Funcionalidades de Profesores:
- ✅ Ver sus asignaciones académicas
- ✅ Cargar calificaciones
- ✅ Registrar asistencias
- ✅ Ver comunicados
- ✅ Acceder a horarios

---

## 👨‍🎓 Cuentas Alumnos

Se han creado **60 alumnos** en el sistema distribuidos en varios cursos.

**Contraseña para todos:** `alumno123`

### Cursos disponibles:
- **Primaria:**
  - 1° A (Mañana) - ~8 alumnos
  - 1° B (Mañana) - ~8 alumnos
  - 2° A (Tarde) - ~8 alumnos
  - 2° B (Tarde) - ~8 alumnos
  - 3° A (Mañana) - ~8 alumnos

- **Secundaria:**
  - 1° A (Mañana) - ~8 alumnos
  - 2° A (Tarde) - ~8 alumnos
  - 3° A (Mañana) - ~8 alumnos

### Funcionalidades de Alumnos:
- ✅ Ver sus calificaciones
- ✅ Ver asistencias
- ✅ Ver horarios de clases
- ✅ Leer comunicados

---

## 👨‍👩‍👧 Cuentas Padres/Tutores

Se han creado **10 padres** en el sistema, asignados a estudiantes aleatorios.

**Contraseña para todos:** `padre123`

### Funcionalidades de Padres:
- ✅ Ver calificaciones de sus hijos
- ✅ Ver asistencias
- ✅ Leer comunicados
- ✅ Ver información de contacto

---

## 📊 Datos Poblados

### Ciclos Lectivos
- **2024:** Cerrado ✓
- **2025:** Cerrado ✓
- **2026:** Activo (actual)

### Períodos Académicos
- Trimestre 1, 2, 3
- Diciembre
- Febrero (para recuperatorios)

### Materias Disponibles
1. Matemática
2. Lengua
3. Ciencias Naturales
4. Ciencias Sociales
5. Educación Física
6. Educación Artística
7. Inglés
8. Informática

### Registros Históricos
- ✅ Matrículas desde 2024
- ✅ Calificaciones de períodos anteriores
- ✅ Asistencias del 2024
- ✅ Cargos y pagos de 2024-2025
- ✅ Comunicados diversos
- ✅ Inventario de insumos

---

## 🔄 Cómo Ingresar al Sistema

### Para Administrador:
1. Ir a `http://localhost:3000`
2. Hacer clic en "Iniciar Sesión"
3. Ingresar email: `admin@escuela.local`
4. Ingresar contraseña: `admin123`
5. Hacer clic en "Ingresar"

### Para Profesores, Alumnos o Padres:
1. Ir a `http://localhost:3000`
2. Hacer clic en "Iniciar Sesión"
3. Seleccionar el rol correspondiente (si es necesario)
4. Ingresar los datos de la cuenta
5. Usar la contraseña según el rol:
   - Profesores: `prof123`
   - Alumnos: `alumno123`
   - Padres: `padre123`

---

## ⚙️ Información Técnica

### Base de Datos
- **Proveedor:** SQLite
- **Ubicación:** `prisma/dev.db`
- **Esquema:** PostgreSQL-compatible (Better SQLite3 adapter)

### Autenticación
- **Método:** NextAuth.js v5
- **Hash de contraseñas:** bcryptjs
- **Token expiration:** Configurable

### Roles Disponibles
- Admin
- Director
- Profesor
- Alumno
- Padre

---

## 🛠️ Notas Importantes

1. **Contraseñas por defecto:** Todos los usuarios creados con el seed tienen contraseña por defecto
2. **Cambio de contraseña:** Se recomienda que cada usuario cambie su contraseña en el primer acceso
3. **DNI de los usuarios:** Generados aleatoriamente (no son reales)
4. **Teléfonos:** Generados aleatoriamente
5. **Datos historicos:** Los datos de 2024 y 2025 son ficticios para pruebas

---

## 📱 Funcionalidades por Rol

### Admin
```
✅ Dashboard completo
✅ Gestión de usuarios
✅ Gestión de ciclos y períodos
✅ Reportes y estadísticas
✅ Configuración general
✅ Gestión de finanzas
✅ Inventario
```

### Profesor
```
✅ Ver asignaciones
✅ Cargar calificaciones
✅ Registrar asistencias
✅ Ver comunicados
✅ Ver horarios
```

### Alumno
```
✅ Ver calificaciones
✅ Ver asistencias
✅ Ver horarios
✅ Leer comunicados
```

### Padre
```
✅ Ver calificaciones de hijos
✅ Ver asistencias de hijos
✅ Leer comunicados
✅ Ver información general
```

---

## 💡 Sugerencias para Pruebas

1. **Ingresar como Admin** para ver el dashboard completo
2. **Ingresar como Profesor** para cargar calificaciones y asistencias
3. **Ingresar como Alumno** para ver su información académica
4. **Ingresar como Padre** para ver el seguimiento de sus hijos
5. **Revisar reportes** del 2024 y 2025 para ver datos históricos

---

## 📞 Soporte

Si necesitas:
- ✅ Generar nuevos usuarios
- ✅ Cambiar contraseñas
- ✅ Resetear la base de datos
- ✅ Agregar más datos

Contacta al administrador del sistema.

---

**Última actualización:** 11 de marzo de 2026  
**Estado:** ✅ Sistema operativo
