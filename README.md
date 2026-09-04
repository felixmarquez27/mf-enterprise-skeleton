# Enterprise Microfrontend Architecture Skeleton (Rsbuild & Module Federation)

> **Plataforma base (Skeleton) de frontend de alta gama** construida sobre una arquitectura modular distribuida utilizando **Module Federation 2.0**, **Rsbuild**, **React 19**, **Turborepo** y **pnpm workspaces**.

Este repositorio proporciona un andamiaje industrial y profesional listo para producción, diseñado para soportar aplicaciones web complejas, multi-dominio y de escala empresarial con soporte para marca blanca (white-label).

---

## 🏛️ Arquitectura del Sistema

La solución opera bajo un modelo de orquestación donde un **Host (Shell)** centraliza la autenticación, layouts y enrutamiento global, consumiendo dinámicamente microfrontends remotos independientes:

```text
                                  [ Usuario / Navegador ]
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │        Host Shell (Puerto 3000)         │
                        │  - Enrutamiento Global (React Router)   │
                        │  - Control de Acceso (Route Guards)     │
                        │  - Sesión & Caché (TanStack Query)      │
                        │  - Shell Layout (Sidebar & Header)      │
                        └────────────────────┬────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
       ┌─────────────────────────────┐               ┌─────────────────────────────┐
       │   Users Remote (Puerto 3001)│               │  design-system (Shared Pkg) │
       │ - Dominio de Usuarios       │               │ - Primitivas shadcn/ui      │
       │ - Despliegue Independiente  │               │ - Tokens semánticos HSL     │
       │ - Expuesto vía Manifest MF  │               │ - Presets de Tailwind       │
       └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 📦 Stack Tecnológico y Librerías

Cada herramienta ha sido seleccionada e integrada para conformar una arquitectura de rendimiento extremo y mantenibilidad a largo plazo:

| Categoría | Librería / Herramienta | Propósito y Función en el Proyecto |
| :--- | :--- | :--- |
| **Monorepo & Build** | **Turborepo** | Orquestador de tareas de compilación con caché inteligente local/remota y paralelización de pipelines. |
| **Gestión de Paquetes** | **pnpm Workspaces & Catalog** | Gestión eficiente de dependencias monorepo con enlaces simbólicos estrictos y control de versiones centralizado mediante `pnpm catalog:`. |
| **Empaquetado (Bundler)** | **Rsbuild & Rspack** | Motor de construcción ultrarrápido basado en Rust (sucesor de Webpack), reduciendo los tiempos de arranque y compilación a milisegundos con soporte nativo de Module Federation. |
| **Microfrontends** | **@module-federation/rsbuild-plugin** | Carga dinámica en tiempo de ejecución de microfrontends remotos independientes vía `mf-manifest.json`, con compartición de dependencias singleton (`React`, `react-router-dom`, `@tanstack/react-query`). |
| **Core UI** | **React 19 & React DOM 19** | Biblioteca base con la última generación de hooks, concurrencia y optimizaciones de renderizado. |
| **Enrutamiento** | **React Router DOM v7** | Navegación del lado del cliente, jerarquía de layouts anidados mediante `<Outlet />`, y control de acceso mediante Route Guards (`ProtectedRoute` y `GuestRoute`). |
| **Estado Asíncrono & Caché** | **TanStack React Query v5** | Gestión de datos del servidor, cacheo global, deduplicación de llamadas HTTP, hidratación de sesión de usuario y Query Key Factories compartidas entre microfrontends. |
| **Estilos & Diseño** | **Tailwind CSS & Tailwind Animate** | Sistema de diseño utility-first con variables semánticas HSL y presets de diseño compartidos. |
| **Formularios** | **React Hook Form** | Manejo de formularios de alto rendimiento basado en inputs no controlados, minimizando re-renderizados. |
| **Validación de Datos** | **Zod** | Definición e inferencia estricta de esquemas de validación de datos en tiempo de ejecución integrados con `react-hook-form` vía `@hookform/resolvers`. |
| **Cliente HTTP** | **Axios** | Cliente HTTP configurado con interceptores automáticos para inyección de token Bearer y gestión centralizada de respuestas `401 Unauthorized`. |
| **Iconografía** | **Lucide React** | Librería moderna de iconos vectoriales SVG con soporte completo de tree-shaking. |
| **Componentes Atómicos** | **`design-system`** | Paquete compartido interno (`packages/design-system`) que provee componentes base inspirados en shadcn/ui (`Button`, `Card`, `Input`, `Badge`) desacoplados de lógica de negocio. |
| **Contenedores & Proxy** | **Docker & Nginx** | Multi-stage builds con `turbo prune`, red unificada `mf-network` y reverse proxy Nginx con cabeceras CORS optimizadas para Module Federation. |

---

## 🎯 Skills y Reglas de Desarrollo Incluidas

El repositorio incluye estándares arquitectónicos y guías de ingeniería formalizadas en la carpeta [`.agents/skills/`](./.agents/skills):

* **`frontend-feature-structure`**: Patrón de diseño modular por dominios (`components/`, `hooks/`, `services/`, `types/`) con convenciones estrictas de exportación barril.
* **`frontend-auth-session-pattern`**: Arquitectura del ciclo de vida JWT, interceptores de Axios, Route Guards (`ProtectedRoute` y `GuestRoute`) y sincronización de sesión en el cliente.
* **`frontend-forms-and-validation`**: Integración canónica de `react-hook-form`, esquemas Zod con tipos inferidos (`z.infer`), y manejo semántico de errores.
* **`frontend-ui-components-pattern`**: Jerarquía de componentes en 3 capas (Tier 1: Primitivas atómicas en `design-system`, Tier 2: Bloques comunes, Tier 3: Layouts en Shell).
* **`frontend-loaders-and-feedback`**: Estandarización de estados de carga, spinners reactivos (`Loader2`), y retroalimentación accesible para el usuario.
* **`frontend-react-query-pattern`**: Gestión de query keys estructuradas, invalidación reactiva de caché y consumo de servicios REST asíncronos.

---

## ⚠️ Nota de Arquitectura: ¿Cuándo implementar esta solución?

> [!IMPORTANT]
> **Esta arquitectura NO es recomendable para proyectos en fase MVP (Producto Mínimo Viable) ni para equipos pequeños.**
> 
> La arquitectura de microfrontends introduce una sobrecarga técnica inherente (orquestación de monorepo, contratos de federación, sincronización de dependencias singleton, despliegues coordinados y configuración de red). Para un MVP o un producto temprano, un **monolito modular** (como una SPA única con Vite o Next.js) proporcionará mucha mayor velocidad de entrega, menor complejidad cognitiva y ciclos de feedback más rápidos.

### Casos donde SÍ se justifica implementar esta arquitectura:
1. **Múltiples escuadras de desarrollo independientes (Cross-functional Squads):** Cuando diferentes equipos necesitan desarrollar, probar y desplegar módulos de negocio (ej. Catálogo, Pagos, Usuarios, Reportes) de forma completamente desacoplada y sin coordinar releases.
2. **Grandes plataformas corporativas y empresariales:** Proyectos con decenas de vistas y lógicas donde un monolito ralentizaría los pipelines de CI/CD y los tiempos de compilación.
3. **Despliegues autónomos en producción:** Necesidad de desplegar una actualización o hotfix crítico en un módulo (remoto) sin tener que re-compilar ni re-desplegar la aplicación anfitriona (Host).
4. **Evolución y modernización tecnológica gradual:** Capacidad de migrar o integrar nuevas versiones de frameworks o librerías en un sub-dominio sin reescribir la plataforma completa.

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos
* **Node.js**: Versión `>= 22.13.0`
* **pnpm**: Versión `>= 10.0.0`

### 2. Instalación de Dependencias
Clona el repositorio e instala las dependencias de todos los workspaces:

```bash
git clone <url-del-repositorio>
cd <directorio-del-proyecto>
pnpm install
```

### 3. Configuración de Entorno (Marca Blanca)
El Host está diseñado para operar con configuración dinámica de marca. Copia el archivo de ejemplo:

```bash
cp host/.env.example host/.env
```

Configura las variables según tu plataforma en `host/.env`:
```env
PUBLIC_API_URL=https://api.example.com/v1
PUBLIC_BRAND_NAME=Platform
PUBLIC_APP_NAME=Admin Platform
PUBLIC_APP_SUBTITLE=Shell Microfrontends
PUBLIC_SUPPORT_EMAIL=admin@example.com
```

### 4. Modo Desarrollo Local

Ejecuta todos los microfrontends y paquetes compartidos en paralelo:

```bash
pnpm dev
```

* **Host Shell**: [http://localhost:3000](http://localhost:3000)
* **Users Remote**: [http://localhost:3001](http://localhost:3001)

> **Simulación de Login**: El skeleton cuenta con un fallback mock interactivo en desarrollo. En `/login`, ingresa cualquier correo válido y cualquier contraseña de al menos 6 caracteres para entrar al Dashboard autenticado.

### 5. Verificación de Tipos y Compilación

* **Validación de TypeScript en todo el monorepo**:
  ```bash
  pnpm typecheck
  ```
* **Build de Producción de todos los paquetes**:
  ```bash
  pnpm build
  ```

---

## 🐳 Arquitectura y Ejecución con Docker

El repositorio cuenta con una infraestructura de contenedores desacoplada y lista para entornos de desarrollo y producción bajo la red bridge interna `mf-network`.

### Componentes de Contenedores

1. **Multi-Stage Builds (`turbo prune --docker`)**:
   Los `Dockerfile` de producción utilizan la poda de Turborepo en tres etapas (`pruner`, `installer` y `runner`), aislando únicamente el código y las dependencias estrictamente necesarias para cada microfrontend, reduciendo drásticamente el tamaño final de las imágenes.
2. **Reverse Proxy Centralizado (Nginx)**:
   El contenedor `mf-proxy` (puerto `80`) actúa como API Gateway y router frontal unificado:
   * Enruta el tráfico raíz (`localhost` y `host.localhost`) hacia `mf-host`.
   * Enruta el tráfico federado (`users.localhost`) hacia `mf-users`.
   * Inyecta automáticamente los encabezados **CORS** (`Access-Control-Allow-Origin: *`) indispensables para la descarga de manifests y chunks remotos en Module Federation.
   * Aplica políticas de caché inmutable para archivos estáticos `.js`.

### Comandos de Ejecución

* **Modo Desarrollo (con hot-reload y montura de volúmenes de código)**:
  ```bash
  docker compose -f docker-compose.dev.yml up -d --build
  ```
  * Host dev: [http://localhost:3000](http://localhost:3000)
  * Users dev: [http://localhost:3001](http://localhost:3001)

* **Modo Producción (con Nginx Proxy)**:
  ```bash
  docker compose up -d --build
  ```
  * Acceso unificado en producción: [http://localhost](http://localhost) (puerto 80).

* **Detener los contenedores**:
  ```bash
  docker compose down
  ```

