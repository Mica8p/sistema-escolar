# Sistema Escolar Pro

Sistema de gestión escolar completo desarrollado con Next.js, Prisma y SQLite.

## 🚀 Configuración Inicial

Sigue estos pasos para configurar el proyecto en tu computadora:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-escolar
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo `.env`
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# Autenticación (generar con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu_clave_secreta_aqui"

# Email (para envío de notificaciones)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app

# Cloudinary (para almacenamiento de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Configurar la base de datos
Primero, genera el cliente de Prisma:
```bash
npx prisma generate
```

Luego, ejecuta las migraciones de Prisma:
```bash
npx prisma migrate dev --url="file:./prisma/dev.db"
```

### 5. (Opcional) Llenar la base de datos con datos iniciales
```bash
npx tsx prisma/seed.ts
```

Esto creará:
- Roles: ADMIN, DOCENTE, PADRE, ALUMNO
- Usuario admin con contraseña: `admin123`

### 6. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📋 Scripts disponibles

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Construye la aplicación para producción
npm run start     # Inicia servidor de producción
npm run lint      # Ejecuta validaciones de código
```

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Cloudinary
- **Validación**: React Hook Form, ESLint
- **Emailing**: Nodemailer

---

## 📁 Estructura del Proyecto

```
src/
  ├── app/           # Páginas y layouts de Next.js
  ├── components/    # Componentes reutilizables
  ├── lib/           # Utilidades y conectores
  ├── service/       # Servicios de negocio
  └── types/         # Tipos TypeScript
prisma/
  ├── schema.prisma  # Esquema de la base de datos
  ├── seed.ts        # Script de inicialización
  └── migrations/    # Historial de migraciones
```

---

## 🔐 Notas Importantes

- **Nunca** hagas commit del archivo `.env` al repositorio
- Las variables de entorno son necesarias para que la aplicación funcione
- En producción, configura las variables en las plataformas correspondientes
- La contraseña admin por defecto debe cambiarse inmediatamente después de instalar

---

## 📚 Más Información

- [Next.js Documentation](https://nextjs.org/docs) - Aprende sobre Next.js
- [Prisma Documentation](https://www.prisma.io/docs/) - Documentación de Prisma ORM
- [NextAuth.js Documentation](https://next-auth.js.org/) - Autenticación con NextAuth
