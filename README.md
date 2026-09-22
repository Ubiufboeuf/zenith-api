# Zenith API

## Sobre el Proyecto

Zenith API es el backend desacoplado del sistema [Zenith](https://zenith-delta-dusky.vercel.app).
Construido con Bun y Express.js, se encarga de gestionar la lógica de negocios, validaciones estrictas con Zod y la persistencia de datos a través de una base de datos distribuida LibSQL (Turso).

## Stack Tecnológico

- Runtime: Bun
- Framework: Express.js
- Base de datos: LibSQL / Turso
- Validación de esquemas: Zod
- Lenguaje: TypeScript

## Configuración y Ejecución Local

Prerrequisitos
- Tener instalado Bun o pnpm.

### 1. Clonar e instalar dependencias

```sh
git clone --depth 1 https://github.com/Ubiufboeuf/zenith-api
cd zenith-api
bun install # pnpm install
```

### 2. Configurar las Variables de Entorno

Crea un archivo `.env` basado en la configuración requerida tanto para desarrollo local como para producción:

```.env
TURSO_DATABASE_URL='tú_url_de_turso'
TURSO_AUTH_TOKEN='tú_token_de_turso'
LOCAL_DATABASE_URL='file:zenith.db'

PORT=8080
DB='local' # o 'prod'. Indica qué BD usar

ENV_ORIGINS='http://localhost:5173'
```

### 3. Ejecutar en modo desarrollo
Para iniciar el servidor en desarrollo, ejecuta:

```sh
bun run dev
```

## Despliegue
La API está optimizada para ejecutarse en entornos cloud con contenedores y se encuentra desplegada en Railway, conectada directamente a la base de datos de producción en Turso.

## Licencia
Este proyecto está bajo la licencia [LICENSE.md](/LICENSE.md).