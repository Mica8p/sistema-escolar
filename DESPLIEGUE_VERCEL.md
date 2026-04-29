# 🚀 GUÍA DE DESPLIEGUE A VERCEL

**Fecha:** 28 de abril de 2026  
**Proyecto:** Sistema Escolar  
**Plataforma:** Vercel  
**Tech Stack:** Next.js 16 + PostgreSQL + Prisma  

---

## 📋 ÍNDICE

1. [Requisitos previos](#-requisitos-previos)
2. [Paso 1: Preparar código](#-paso-1-preparar-el-código)
3. [Paso 2: GitHub](#-paso-2-subir-a-github)
4. [Paso 3: Crear cuenta Vercel](#-paso-3-crear-cuenta-en-vercel)
5. [Paso 4: Conectar repositorio](#-paso-4-conectar-repositorio-a-vercel)
6. [Paso 5: Configurar variables de entorno](#-paso-5-configurar-variables-de-entorno)
7. [Paso 6: Configurar PostgreSQL](#-paso-6-base-de-datos)
8. [Paso 7: Deploy](#-paso-7-deploy)
9. [Paso 8: Verificar y mantener](#-paso-8-verificar)
10. [Troubleshooting](#-troubleshooting)

---

# ✅ REQUISITOS PREVIOS

Necesitas tener:

- [ ] **GitHub Account** (para subir código)
- [ ] **Vercel Account** (gratis en vercel.com)
- [ ] **PostgreSQL Database** (remota, no local)
- [ ] **Variables de entorno configuradas** (.env)
- [ ] **Código sin errores de compilación** (npm run build funciona)
- [ ] **Cloudinary Account** (ya lo tienes)

---

# 🔧 PASO 1: PREPARAR EL CÓDIGO

## 1.1 Verificar que compila

```bash
cd d:\Proyecto\ Escolar\ Mica\sistema-escolar
npm run build
```

**Resultado esperado:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Created optimized production build
```

**Si hay errores:**
```
⚠ Compilation errors found
  → Revisa los errores en pantalla
  → Corrígelos antes de continuar
```

---

## 1.2 Crear archivo `.env.example`

En la **raíz del proyecto**, crea un archivo llamado `.env.example`:

```
# DATABASE
DATABASE_URL=postgresql://usuario:contraseña@host:5432/escuela

# NEXTAUTH
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=abc123xyz789secretoaleatorio

# CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# NODEMAILER (SMTP)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=tu_email@gmail.com
NODEMAILER_PASSWORD=tu_contraseña_app

# NEXT
NODE_ENV=production
```

**¿Por qué?** Vercel necesita saber qué variables configurar.

---

## 1.3 Crear archivo `.gitignore`

Si NO existe, crea en raíz:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
```

**Asegúrate de NO commitear:**
- `.env` (nunca!)
- `node_modules/`
- `.next/`
- `.db` (base de datos local)

---

## 1.4 Verificar `package.json`

Debe tener los scripts correctos:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",      // ← Vercel lo usa
    "start": "next start",      // ← Vercel lo usa
    "lint": "eslint",
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

# 📤 PASO 2: SUBIR A GITHUB

## 2.1 Iniciar repositorio Git (si no está)

```bash
cd d:\Proyecto\ Escolar\ Mica\sistema-escolar

# Verificar si ya está inicializado
git status

# Si NO está, inicializar:
git init

# Agregar todo
git add .

# Commit inicial
git commit -m "Initial commit - Sistema Escolar"
```

---

## 2.2 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. **Nombre:** `sistema-escolar`
3. **Descripción:** "Sistema de Gestión Escolar con Next.js"
4. **Privado o Público:** Tu elección
5. **NO inicialices con README, .gitignore, LICENSE** (ya los tienes)
6. **[Create repository]**

---

## 2.3 Conectar repositorio local con GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/sistema-escolar.git

# Cambiar rama a main
git branch -M main

# Subir código
git push -u origin main
```

**Resultado:** Tu código está en GitHub 🎉

---

# 🎯 PASO 3: CREAR CUENTA EN VERCEL

1. Ve a [vercel.com](https://vercel.com)
2. **[Sign Up]** → Elige GitHub
3. Autoriza a Vercel a acceder a GitHub
4. **[Create Team]** o sigue sin equipo
5. Listo ✓

---

# 🔌 PASO 4: CONECTAR REPOSITORIO A VERCEL

## 4.1 Importar proyecto

En dashboard de Vercel:

1. **[Add New...]** → **[Project]**
2. **[Import Git Repository]**
3. Busca y selecciona `sistema-escolar`
4. **[Import]**

---

## 4.2 Configurar proyecto

Aparecerá pantalla con:

```
Project Name: sistema-escolar        ← OK
Framework Preset: Next.js             ← Auto-detectado ✓
Root Directory: ./                    ← OK (si está en raíz)
```

**Build Command:** Déjalo default
```
npm run build
```

**Install Command:** Déjalo default
```
npm install
```

**[Deploy]** (NO hagas click aún - configura variables primero)

---

# 🔐 PASO 5: CONFIGURAR VARIABLES DE ENTORNO

## 5.1 En Vercel Dashboard

**Antes de hacer deploy:**

1. En la pantalla del proyecto → **[Settings]** → **[Environment Variables]**
2. Añade cada variable:

```
DATABASE_URL = postgresql://usuario:pass@host:5432/escuela

NEXTAUTH_URL = https://tu-proyecto.vercel.app

NEXTAUTH_SECRET = (genera uno aleatorio)

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = tu_cloud

CLOUDINARY_API_KEY = tu_key

CLOUDINARY_API_SECRET = tu_secret

NODEMAILER_HOST = smtp.gmail.com

NODEMAILER_PORT = 587

NODEMAILER_USER = email@gmail.com

NODEMAILER_PASSWORD = contraseña_app

NODE_ENV = production
```

**¿Dónde obtener cada una?**

| Variable | Dónde obtenerla |
|----------|-----------------|
| `DATABASE_URL` | Proveedor PostgreSQL (paso 6) |
| `NEXTAUTH_URL` | Tu dominio en Vercel (ej: tu-proyecto.vercel.app) |
| `NEXTAUTH_SECRET` | Ejecuta: `openssl rand -base64 32` |
| `CLOUDINARY_*` | Tu dashboard de Cloudinary |
| `NODEMAILER_*` | Tu email y credenciales SMTP |

---

## 5.2 Generar NEXTAUTH_SECRET

En terminal:

```bash
# Si tienes openssl
openssl rand -base64 32

# Ejemplo resultado:
# aB12cD34eF56gH78iJ90kL12mN34oP56qR78sT90uV12

# Copia este valor en NEXTAUTH_SECRET
```

O usa online (NOT recommended para producción): [generate-secret.vercel.app](https://generate-secret.vercel.app/)

---

# 🗄️ PASO 6: BASE DE DATOS

## 6.1 Opciones para PostgreSQL remota

### OPCIÓN A: Railway (Recomendado para principiantes)

1. Ve a [railway.app](https://railway.app)
2. **[New Project]** → **[Provision PostgreSQL]**
3. Crea cuenta con GitHub
4. En dashboard → Variables → copia `DATABASE_URL`
5. Pega en Vercel

**Ventajas:**
- Fácil de usar
- Incluye 5GB gratuitos
- Buen performance

---

### OPCIÓN B: Neon (También muy bueno)

1. Ve a [neon.tech](https://neon.tech)
2. **[Sign In]** → GitHub
3. **[Create a new project]** → PostgreSQL
4. Copia connection string
5. Pega en Vercel

**Ventajas:**
- Serverless PostgreSQL
- Scaling automático
- Plan gratuito generoso

---

### OPCIÓN C: AWS RDS (Más profesional pero más caro)

1. [aws.amazon.com](https://aws.amazon.com) → RDS
2. Crear instancia PostgreSQL
3. Configurar seguridad
4. Obtener endpoint
5. Pega en Vercel

---

## 6.2 Ejemplo: Railway

```
1. Ir a https://railway.app
2. GitHub Login
3. Create New Project
4. Provision PostgreSQL
5. Esperar a que se provisione
6. Ir a Variables
7. Copiar DATABASE_URL completo:
   
   postgresql://usuario:password@host:5432/railway
   
8. En Vercel Settings → Environment Variables
9. Pegar en DATABASE_URL
10. Save
```

---

# 🚀 PASO 7: DEPLOY

## 7.1 Ejecutar Deploy

**En Vercel Dashboard:**

1. Vuelve a **[Deployments]**
2. **[Deploy Now]** (o **[Redeploy]** si ya iniciaste)

Vercel hará:
```
✓ Installing dependencies (npm install)
✓ Building project (npm run build)
✓ Generating optimizations
✓ Deploying to production
```

**Espera 2-5 minutos...**

---

## 7.2 Resultado

Si todo OK:

```
✓ PRODUCTION Deployed
✓ https://tu-proyecto.vercel.app

Visit: https://tu-proyecto.vercel.app
```

Haz clic en el link para verificar.

---

## 7.3 Ejecutar migraciones en Vercel

Una vez deployado, necesitas correr migraciones en la BD remota:

**OPCIÓN 1: Usando comando en terminal local**

```bash
# Asegurate de que DATABASE_URL apunta a la BD remota
DATABASE_URL=postgresql://... npx prisma migrate deploy

# O
npm run seed   (si quieres agregar datos de prueba)
```

**OPCIÓN 2: Usando Vercel Functions (avanzado)**

Crear archivo `api/init.ts`:

```typescript
export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-init-token'] !== process.env.INIT_TOKEN) {
    return res.status(401).end();
  }

  try {
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    res.status(200).json({ message: 'Migrations executed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Luego ejecutar:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/init \
  -H "x-init-token: tu_token_secreto"
```

---

# ✅ PASO 8: VERIFICAR Y MANTENER

## 8.1 Verificar funcionamiento

```
[ ] ¿Abre la página?
[ ] ¿Carga CSS correctamente?
[ ] ¿Login funciona?
[ ] ¿Puedes crear un alumno?
[ ] ¿Se guardan en BD?
[ ] ¿Cloudinary carga fotos?
```

---

## 8.2 Ver logs

En Vercel Dashboard:

1. Tu proyecto → **[Deployments]** → último deployment
2. **[Function Logs]** → ver errores en tiempo real

---

## 8.3 Redeployar después de cambios

```bash
# En tu PC, hacer cambios

git add .
git commit -m "Descripción del cambio"
git push origin main

# Vercel detecta automáticamente el push
# Auto-redeploy en 30 segundos
```

---

# 🐛 TROUBLESHOOTING

## ❌ Error: "Build failed"

**Probable causa:** Errores de TypeScript o compilación

**Solución:**
```bash
npm run build   # En tu PC
# Verifica errores
# Corrígelos
git push        # Vercel re-intenta automático
```

---

## ❌ Error: "DATABASE_URL not found"

**Causa:** Variable de entorno no configurada

**Solución:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica que `DATABASE_URL` esté ahí
3. Redeploy

---

## ❌ Error: "NEXTAUTH_SECRET is missing"

**Causa:** Falta variable de autenticación

**Solución:**
```bash
# En tu PC, genera:
openssl rand -base64 32

# Copia en Vercel → Environment Variables → NEXTAUTH_SECRET
# Redeploy
```

---

## ❌ Error: "Cannot find module '@prisma/client'"

**Causa:** Prisma no instalado o no built

**Solución:**
```bash
npm install
npx prisma generate
git push
# Vercel reinstala
```

---

## ❌ Error: "Connection refused" (BD)

**Causa:** DATABASE_URL incorrecta o BD no accesible

**Solución:**
1. Verifica DATABASE_URL es correcto
2. Verifica que BD no tiene restricción de IP
3. En Railway/Neon → Settings → IP Whitelist → Allow all

---

## ❌ Error: "Cloudinary API error"

**Causa:** Credenciales de Cloudinary incorrectas

**Solución:**
```
1. Ve a Cloudinary Dashboard
2. Copia CLOUD_NAME, API_KEY, API_SECRET
3. Verifica en Vercel → Environment Variables
4. Redeploy
```

---

## ❌ Error: "Schema drift detected"

**Causa:** Cambios en BD no sincronizados

**Solución:**
```bash
# En tu PC:
npx prisma migrate deploy    # Aplica migraciones pendientes
git push                       # Vercel notificado
```

---

## ✅ Error: "Cannot POST /api/auth/signin"

**Causa:** NextAuth URL mal configurada

**Solución:**
```bash
# En Vercel → Environment Variables
NEXTAUTH_URL = https://TU-PROYECTO.vercel.app   (exacto!)
NEXTAUTH_SECRET = (re-generar)
```

---

# 📊 RESUMEN RÁPIDO

```
1. npm run build              (verificar compilación)
2. git push                   (subir a GitHub)
3. Vercel → Connect repo
4. Variables de entorno ✓
5. PostgreSQL remota ✓
6. Deploy
7. Verificar
8. Done! 🎉
```

---

# 🎯 URL FINAL

Una vez deployado:

```
https://sistema-escolar.vercel.app   (o tu nombre)

Login:
  email: admin@escuela.com
  contraseña: (la que configuraste en seed)
```

---

# 💡 TIPS ADICIONALES

## Re-deployar rápido

```bash
git add .
git commit -m "Cambios"
git push origin main
# Vercel auto-redeploy
```

## Ver logs en vivo

Vercel Dashboard → Deployment → **Function Logs**

## Dominio personalizado

Vercel → Settings → Domains → Agregar tu dominio

## Escalado

Vercel soporta:
- ✓ Auto-scaling
- ✓ Edge Network (CDN global)
- ✓ Serverless functions
- ✓ Databases (Vercel PostgreSQL)

## Próximo paso: Conectar dominio propio

```
1. Compra dominio (GoDaddy, Namecheap, etc)
2. Vercel → Settings → Domains
3. Agregar dominio
4. Vercel te da nameservers
5. Actualizar NS en registrador
6. Esperar propagación (24-48hs)
```

---

# 📞 SOPORTE

Si algo falla:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)

---

**¡Listo para producción! 🚀**
