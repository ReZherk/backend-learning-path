# Node.js - require y Sistema de Módulos

## ¿Qué es require?

`require` es una función incorporada en Node.js que forma parte del sistema de módulos CommonJS. Su función principal es **importar y cargar módulos** en el contexto actual de ejecución.

**Definición técnica:**

`require()` es una función sincrónica que carga módulos, ejecuta su código, cachea el resultado y retorna lo que el módulo exportó mediante `module.exports` o `exports`.

**Características:**

- Sincrónico (bloquea la ejecución hasta cargar el módulo)
- Sistema de caché (módulos solo se cargan una vez)
- Resolución de rutas automática
- Parte del estándar CommonJS

**Propósito:**

- Reutilización de código
- Organización modular de proyectos
- Gestión de dependencias
- Encapsulación de funcionalidad

## Sistema de módulos CommonJS

Node.js utiliza el sistema de módulos **CommonJS**, que define:

- `require()` - Para importar
- `module.exports` - Para exportar
- `exports` - Alias de `module.exports`

**Cada archivo en Node.js es un módulo independiente** con su propio scope.

## Sintaxis básica

### Importar módulo

```javascript
const modulo = require("nombre-modulo");
```

### Patrones de uso

```javascript
// Módulo interno de Node.js
const fs = require("fs");

// Módulo externo (npm package)
const express = require("express");

// Módulo propio (ruta relativa)
const miModulo = require("./utils/miModulo");
const otroModulo = require("../helpers/helper");

// Importar JSON
const config = require("./config.json");

// Destructuring
const { readFile, writeFile } = require("fs");
const { Router } = require("express");
```

## Tipos de módulos

### 1. Módulos internos (Core Modules)

Módulos incluidos con Node.js, no requieren instalación.

**Módulos core comunes:**

| Módulo           | Descripción                                  |
| ---------------- | -------------------------------------------- |
| `fs`             | Sistema de archivos (leer, escribir, borrar) |
| `path`           | Manipulación de rutas de archivos            |
| `http` / `https` | Crear servidores HTTP/HTTPS                  |
| `os`             | Información del sistema operativo            |
| `events`         | Sistema de eventos (EventEmitter)            |
| `util`           | Utilidades varias                            |
| `crypto`         | Funciones criptográficas                     |
| `stream`         | Streams de datos                             |
| `buffer`         | Manejo de datos binarios                     |

**Ejemplo:**

```javascript
const fs = require("fs");
const path = require("path");
const os = require("os");

// Usar módulos core
const contenido = fs.readFileSync("archivo.txt", "utf-8");
const rutaCompleta = path.join(__dirname, "carpeta", "archivo.txt");
const plataforma = os.platform();
```

### 2. Módulos externos (NPM Packages)

Librerías de terceros instaladas mediante npm.

**Instalación:**

```bash
npm install express
npm install lodash mongoose
```

**Uso:**

```javascript
const express = require("express");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
const numeros = _.shuffle([1, 2, 3, 4, 5]);
```

**Módulos externos populares:**

- `express` - Framework web
- `lodash` - Utilidades JavaScript
- `mongoose` - ODM para MongoDB
- `axios` - Cliente HTTP
- `dotenv` - Variables de entorno
- `moment` - Manipulación de fechas (deprecated, usar `date-fns`)

### 3. Módulos propios (User Modules)

Archivos creados por ti en el proyecto.

**Características:**

- Deben usar rutas relativas (`./` o `../`)
- Extensión `.js` es opcional
- Deben exportar algo con `module.exports`

**Ejemplo:**

```javascript
// Archivo: utils/math.js
function sumar(a, b) {
  return a + b;
}

function restar(a, b) {
  return a - b;
}

module.exports = { sumar, restar };
```

```javascript
// Archivo: app.js
const { sumar, restar } = require("./utils/math");

console.log(sumar(5, 3)); // 8
console.log(restar(10, 4)); // 6
```

## Qué retorna require

Lo que `require()` devuelve depende de cómo el módulo fue exportado.

### Retorna un objeto

**Módulo exporta objeto:**

```javascript
// logger.js
module.exports = {
  info: (msg) => console.log(`INFO: ${msg}`),
  error: (msg) => console.error(`ERROR: ${msg}`),
};
```

**Uso:**

```javascript
const logger = require("./logger");

logger.info("Aplicación iniciada");
logger.error("Error en conexión");
```

### Retorna una función

**Módulo exporta función:**

```javascript
// greet.js
module.exports = function (nombre) {
  return `Hola, ${nombre}!`;
};
```

**Uso:**

```javascript
const greet = require("./greet");

console.log(greet("Patrick")); // "Hola, Patrick!"
```

### Retorna una clase

**Módulo exporta clase:**

```javascript
// Usuario.js
class Usuario {
  constructor(nombre, email) {
    this.nombre = nombre;
    this.email = email;
  }

  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
}

module.exports = Usuario;
```

**Uso:**

```javascript
const Usuario = require("./Usuario");

const user = new Usuario("Patrick", "patrick@example.com");
console.log(user.saludar()); // "Hola, soy Patrick"
```

### Retorna objeto JSON

**Archivo JSON:**

```json
// config.json
{
  "port": 3000,
  "database": {
    "host": "localhost",
    "name": "mydb"
  }
}
```

**Uso:**

```javascript
const config = require("./config.json");

console.log(config.port); // 3000
console.log(config.database.host); // "localhost"
```

**Nota:** Los archivos JSON se convierten automáticamente en objetos JavaScript.

### Ejemplos con módulos core

#### fs (File System) - Retorna objeto

```javascript
const fs = require("fs");

// fs es un objeto con muchos métodos
fs.readFileSync("archivo.txt", "utf-8");
fs.writeFileSync("nuevo.txt", "contenido");
fs.existsSync("ruta/archivo.txt");
```

#### express - Retorna función

```javascript
const express = require("express");

// express es una función que retorna una app
const app = express();

app.get("/", (req, res) => {
  res.send("Hola mundo");
});
```

#### EventEmitter - Retorna clase

```javascript
const EventEmitter = require("events");

// EventEmitter es una clase
const emisor = new EventEmitter();

emisor.on("evento", () => {
  console.log("Evento disparado");
});

emisor.emit("evento");
```

## Exportar módulos

### module.exports (recomendado)

**Exportar objeto:**

```javascript
// math.js
module.exports = {
  sumar: (a, b) => a + b,
  restar: (a, b) => a - b,
  PI: 3.14159,
};
```

**Exportar función:**

```javascript
// greet.js
module.exports = function (nombre) {
  return `Hola, ${nombre}`;
};
```

**Exportar clase:**

```javascript
// Usuario.js
class Usuario {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

module.exports = Usuario;
```

**Exportar múltiples elementos:**

```javascript
// utils.js
function utilidad1() {}
function utilidad2() {}
const CONSTANTE = "valor";

module.exports = {
  utilidad1,
  utilidad2,
  CONSTANTE,
};
```

### exports (shorthand)

`exports` es una referencia a `module.exports`.

**Funciona:**

```javascript
// helpers.js
exports.helper1 = function () {};
exports.helper2 = function () {};
exports.VALOR = 42;
```

**NO funciona (sobrescribe referencia):**

```javascript
// ❌ MAL - Rompe la referencia
exports = function () {}; // No se exporta nada

// ✔ CORRECTO
module.exports = function () {};
```

**Regla de oro:**

- Usa `exports.prop = ...` para agregar propiedades
- Usa `module.exports = ...` para exportar un único valor

## Resolución de rutas

### Cómo Node.js resuelve módulos

**1. Módulos core:**

```javascript
require("fs"); // Busca en módulos internos primero
```

**2. Módulos npm (en node_modules):**

```javascript
require("express");
// Busca en:
// ./node_modules/express
// ../node_modules/express
// ../../node_modules/express
// (sube hasta encontrar o llegar a raíz)
```

**3. Módulos con ruta:**

```javascript
require("./modulo"); // Busca en directorio actual
require("../modulo"); // Busca en directorio padre
require("/absolute/path/modulo"); // Ruta absoluta
```

### Extensiones automáticas

Si no especificas extensión, Node.js prueba en orden:

```javascript
require("./modulo");

// Busca en orden:
// 1. modulo.js
// 2. modulo.json
// 3. modulo.node (addon compilado)
```

### Importar carpetas

Si pasas una carpeta, Node.js busca:

```javascript
require("./mi-modulo");

// Busca en orden:
// 1. ./mi-modulo/package.json (campo "main")
// 2. ./mi-modulo/index.js
// 3. ./mi-modulo/index.json
```

**Ejemplo con package.json:**

```json
// mi-modulo/package.json
{
  "main": "lib/main.js"
}
```

```javascript
require("./mi-modulo"); // Carga ./mi-modulo/lib/main.js
```

## Sistema de caché

Node.js cachea módulos después de la primera carga.

**Ejemplo:**

```javascript
// contador.js
let contador = 0;

module.exports = {
  incrementar: () => ++contador,
  getValor: () => contador,
};
```

```javascript
// app.js
const contador1 = require("./contador");
const contador2 = require("./contador");

contador1.incrementar(); // contador = 1
console.log(contador2.getValor()); // 1 (mismo objeto en caché)

console.log(contador1 === contador2); // true
```

### Ver caché de módulos

```javascript
console.log(require.cache);
```

### Limpiar caché (raro en producción)

```javascript
delete require.cache[require.resolve("./modulo")];
const moduloFresco = require("./modulo"); // Se carga de nuevo
```

**Uso común:** Hot-reloading en desarrollo.

## Rutas especiales

### \_\_dirname

Directorio del archivo actual (absoluto).

```javascript
console.log(__dirname);
// /home/user/proyecto/src
```

### \_\_filename

Ruta completa del archivo actual.

```javascript
console.log(__filename);
// /home/user/proyecto/src/app.js
```

### Uso con require

```javascript
const path = require("path");

// Construir ruta relativa al archivo actual
const rutaConfig = path.join(__dirname, "config", "database.json");
const config = require(rutaConfig);
```

## Patrones comunes

### Patrón Singleton

```javascript
// database.js
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = null;
    Database.instance = this;
  }

  connect() {
    // Lógica de conexión
  }
}

module.exports = new Database(); // Exporta instancia única
```

```javascript
// Cualquier archivo
const db = require("./database");
db.connect(); // Siempre la misma instancia
```

### Patrón Factory

```javascript
// userFactory.js
class User {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
  }
}

module.exports = function createUser(data) {
  return new User(data);
};
```

```javascript
const createUser = require("./userFactory");
const user = createUser({ name: "Patrick", email: "p@example.com" });
```

### Patrón de configuración

```javascript
// config.js
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    port: 3000,
    db: "mongodb://localhost/dev",
  },
  production: {
    port: process.env.PORT,
    db: process.env.DB_URL,
  },
};

module.exports = config[env];
```

```javascript
const config = require("./config");
console.log(config.port); // Según entorno
```

## require vs import (ES Modules)

### CommonJS (require)

```javascript
// Sintaxis
const modulo = require("./modulo");

// Características
// - Sincrónico
// - Carga dinámica en runtime
// - usado en Node.js tradicional
```

### ES Modules (import)

```javascript
// Sintaxis
import modulo from "./modulo.js";

// Características
// - Asíncrono
// - Análisis estático
// - Estándar de JavaScript moderno
// - Requiere "type": "module" en package.json
```

### Comparación

| Aspecto    | CommonJS         | ES Modules                 |
| ---------- | ---------------- | -------------------------- |
| Sintaxis   | `require()`      | `import`                   |
| Carga      | Sincrónica       | Asíncrona                  |
| Análisis   | Runtime          | Compile-time               |
| Scope      | Archivo          | Módulo                     |
| Default    | Node.js < 12     | Node.js >= 12 (con config) |
| Uso actual | Backend (legacy) | Frontend + Backend moderno |

### Migración a ES Modules

```json
// package.json
{
  "type": "module"
}
```

```javascript
// Antes (CommonJS)
const express = require("express");
module.exports = router;

// Después (ES Modules)
import express from "express";
export default router;
```

## Errores comunes

### Error 1: Cannot find module

```javascript
Error: Cannot find module './modulo'
```

**Causas:**

- Ruta incorrecta
- Falta extensión en casos especiales
- Módulo no instalado (npm packages)

**Solución:**

```javascript
// Verificar ruta
console.log(__dirname);
const path = require('path');
console.log(path.resolve('./modulo'));

// Verificar instalación
npm list express
```

### Error 2: Module exports undefined

```javascript
const valor = require("./modulo");
console.log(valor); // undefined
```

**Causa:**

```javascript
// modulo.js
// ❌ No exporta nada
function miFuncion() {}
```

**Solución:**

```javascript
// modulo.js
// ✔ Exportar correctamente
function miFuncion() {}
module.exports = miFuncion;
```

### Error 3: Sobrescribir exports

```javascript
// ❌ MAL
exports = { valor: 42 }; // Rompe referencia

// ✔ CORRECTO
module.exports = { valor: 42 };
// O
exports.valor = 42;
```

### Error 4: Dependencia circular

```javascript
// a.js
const b = require("./b");
module.exports = { nombre: "A", b };

// b.js
const a = require("./a");
module.exports = { nombre: "B", a };
```

**Problema:** Puede causar `undefined` o carga incompleta.

**Solución:** Refactorizar para evitar circularidad.

### Error 5: Require dinámico con variable

```javascript
// Funciona pero no recomendado
const modulo = "express";
const express = require(modulo);

// Mejor
const express = require("express");
```

## Buenas prácticas

### 1. Organizar imports

```javascript
// Módulos core primero
const fs = require("fs");
const path = require("path");

// Módulos externos después
const express = require("express");
const mongoose = require("mongoose");

// Módulos propios al final
const config = require("./config");
const routes = require("./routes");
```

### 2. Destructuring para claridad

```javascript
// ❌ Menos claro
const fs = require('fs');
fs.readFileSync(...);
fs.writeFileSync(...);

// ✔ Más claro
const { readFileSync, writeFileSync } = require('fs');
readFileSync(...);
writeFileSync(...);
```

### 3. Constantes en mayúsculas

```javascript
// constants.js
module.exports = {
  MAX_USERS: 100,
  API_VERSION: "v1",
  TIMEOUT: 5000,
};
```

### 4. Validar módulos opcionales

```javascript
let optionalModule;
try {
  optionalModule = require("optional-package");
} catch (e) {
  console.warn("optional-package no disponible");
  optionalModule = null;
}
```

### 5. Usar path para rutas

```javascript
// ❌ Puede fallar en Windows
const modulo = require("./carpeta/subcarpeta/modulo");

// ✔ Multiplataforma
const path = require("path");
const modulo = require(path.join(__dirname, "carpeta", "subcarpeta", "modulo"));
```

## Debugging de módulos

### Ver qué módulos están cargados

```javascript
console.log(Object.keys(require.cache));
```

### Resolver ruta de módulo

```javascript
console.log(require.resolve("express"));
// /proyecto/node_modules/express/index.js
```

### Información de módulo

```javascript
console.log(require.cache[require.resolve("./modulo")]);
// { exports: {...}, filename: '...', loaded: true, ... }
```

## Recursos útiles

**Documentación oficial:**

- [Node.js Modules](https://nodejs.org/api/modules.html)
- [CommonJS Specification](http://www.commonjs.org/specs/modules/1.0/)

**Guías:**

- [Node.js Module System](https://nodejs.org/docs/latest/api/modules.html)
- [NPM Documentation](https://docs.npmjs.com/)

## Resumen

- **require** es la función de CommonJS para importar módulos en Node.js
- **Tipos de módulos:** Core (internos), externos (npm), propios
- **module.exports** para exportar, `require()` para importar
- **Sistema de caché:** Módulos se cargan una sola vez
- **Resolución:** Core → node_modules → rutas relativas
- **Retorno:** Depende de cómo se exportó (objeto, función, clase, JSON)
- **ES Modules** es el estándar moderno (import/export)
- Organizar imports, usar path para rutas, validar módulos opcionales
