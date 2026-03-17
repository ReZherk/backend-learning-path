# JavaScript - Objetos vs JSON

## ¿Qué es un Objeto en JavaScript?

Un **objeto en JavaScript** es una estructura de datos fundamental del lenguaje que permite almacenar colecciones de datos relacionados y funcionalidad en una sola entidad.

**Definición técnica:**

Un objeto es una colección no ordenada de propiedades, donde cada propiedad es una asociación entre un nombre (clave) y un valor. Los valores pueden ser de cualquier tipo de dato de JavaScript, incluyendo otros objetos o funciones.

**Características:**

- Estructura nativa del lenguaje JavaScript
- Se define con llaves `{}`
- Contiene pares clave-valor
- Los valores pueden ser de cualquier tipo de dato
- Mutable (puede modificarse después de crearse)
- Existe en memoria durante la ejecución
- Las claves pueden ser strings o símbolos.

### Creación de objetos

#### Sintaxis literal (más común)

```javascript
const persona = {
  nombre: "Patrick",
  edad: 30,
  activo: true,
  hobbies: ["programar", "leer"],
  direccion: {
    ciudad: "Madrid",
    pais: "España",
  },
  saludar: function () {
    console.log(`Hola, soy ${this.nombre}`);
  },
};
```

#### Constructor Object

```javascript
const persona = new Object();
persona.nombre = "Patrick";
persona.edad = 30;
```

#### Object.create()

```javascript
const persona = Object.create(null);
persona.nombre = "Patrick";
```

#### Constructor personalizado

```javascript
function Persona(nombre, edad) {
  this.nombre = nombre;
  this.edad = edad;
}

const persona = new Persona("Patrick", 30);
```

#### Clase (ES6+)

```javascript
class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  saludar() {
    console.log(`Hola, soy ${this.nombre}`);
  }
}

const persona = new Persona("Patrick", 30);
```

### Tipos de valores permitidos

Un objeto JavaScript puede contener:

```javascript
const ejemploCompleto = {
  // Primitivos
  numero: 42,
  texto: "Hola",
  booleano: true,
  nulo: null,
  indefinido: undefined,
  simbolo: Symbol("id"),

  // Estructuras
  array: [1, 2, 3],
  objetoAnidado: { clave: "valor" },

  // Funciones
  metodo: function () {
    return "Hola";
  },
  metodoCorto() {
    return "Hola";
  },
  flecha: () => "Hola",

  // ES6+
  [Symbol.iterator]: function* () {
    yield 1;
  },

  // Getters y Setters
  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  },
  set nombreCompleto(valor) {
    [this.nombre, this.apellido] = valor.split(" ");
  },
};
```

### Manipulación de objetos

#### Acceso a propiedades

```javascript
const persona = { nombre: "Patrick", edad: 30 };

// Notación de punto
console.log(persona.nombre); // "Patrick"

// Notación de corchetes
console.log(persona["edad"]); // 30

// Acceso dinámico
const propiedad = "nombre";
console.log(persona[propiedad]); // "Patrick"
```

#### Agregar propiedades

```javascript
persona.email = "patrick@example.com";
persona["telefono"] = "123456789";
```

#### Modificar propiedades

```javascript
persona.edad = 31;
persona["nombre"] = "Patrick Alexander";
```

#### Eliminar propiedades

```javascript
delete persona.email;
```

#### Verificar existencia de propiedad

```javascript
console.log("nombre" in persona); // true
console.log(persona.hasOwnProperty("nombre")); // true
```

### Métodos útiles de Object

```javascript
const persona = { nombre: "Patrick", edad: 30 };

// Obtener claves
Object.keys(persona); // ["nombre", "edad"]

// Obtener valores
Object.values(persona); // ["Patrick", 30]

// Obtener pares [clave, valor]
Object.entries(persona); // [["nombre", "Patrick"], ["edad", 30]]

// Copiar propiedades
const copia = Object.assign({}, persona);

// Spread operator (ES6+)
const copia2 = { ...persona };

// Congelar objeto (inmutable)
Object.freeze(persona);

// Sellar objeto (no agregar/eliminar props)
Object.seal(persona);
```

## ¿Qué es JSON?

**JSON (JavaScript Object Notation)** es un formato de texto ligero para el intercambio de datos estructurados. Es completamente independiente del lenguaje de programación, aunque su sintaxis deriva de JavaScript.

**Definición técnica:**

JSON es un formato de serialización de datos basado en texto que representa estructuras de datos simples y objetos. Es fácil de leer y escribir para humanos y fácil de parsear y generar para máquinas.

**Características:**

- Formato de texto plano (string)
- Estándar abierto definido en RFC 7159
- Independiente del lenguaje de programación
- Usado para intercambio de datos
- Sintaxis más restrictiva que objetos JavaScript
- Las claves DEBEN ser strings entre comillas dobles
- No puede contener funciones, métodos, o valores undefined

### Valores permitidos en JSON

JSON solo admite los siguientes tipos de datos:

| Tipo    | Ejemplo              | Descripción           |
| ------- | -------------------- | --------------------- |
| String  | `"texto"`            | Entre comillas dobles |
| Number  | `42`, `3.14`         | Enteros o decimales   |
| Boolean | `true`, `false`      | Valores booleanos     |
| null    | `null`               | Valor nulo            |
| Object  | `{"clave": "valor"}` | Objeto JSON           |
| Array   | `[1, 2, 3]`          | Array de valores      |

### Sintaxis JSON válida

```json
{
  "nombre": "Patrick",
  "edad": 30,
  "activo": true,
  "salario": 50000.5,
  "departamento": null,
  "habilidades": ["JavaScript", "Python", "Java"],
  "direccion": {
    "ciudad": "Madrid",
    "codigoPostal": "28001"
  }
}
```

### Sintaxis NO válida en JSON

```javascript
// ❌ Comillas simples
{ 'nombre': 'Patrick' }

// ❌ Claves sin comillas
{ nombre: "Patrick" }

// ❌ Funciones
{ "saludar": function() { } }

// ❌ undefined
{ "valor": undefined }

// ❌ Comentarios
{
    // Este es un comentario
    "nombre": "Patrick"
}

// ❌ Trailing commas
{
    "nombre": "Patrick",
    "edad": 30,
}
```

## Diferencias clave: Objeto JS vs JSON

### Tabla comparativa

| Aspecto                | Objeto JavaScript                                   | JSON                                               |
| ---------------------- | --------------------------------------------------- | -------------------------------------------------- |
| **Naturaleza**         | Estructura nativa en memoria                        | Texto plano (string) con formato                   |
| **Tipo de dato**       | Object                                              | String                                             |
| **Valores permitidos** | Cualquier tipo (functions, undefined, Symbol, etc.) | Solo: string, number, boolean, null, array, object |
| **Claves**             | Strings o Symbols (pueden ir sin comillas)          | Solo strings (DEBEN ir con comillas dobles)        |
| **Funciones**          | ✅ Permitidas                                       | ❌ No permitidas                                   |
| **undefined**          | ✅ Permitido                                        | ❌ No permitido                                    |
| **Date**               | ✅ Como objeto Date                                 | ❌ Solo como string                                |
| **Comentarios**        | ✅ Permitidos en el código                          | ❌ No permitidos                                   |
| **Trailing commas**    | ✅ Permitidas                                       | ❌ No permitidas                                   |
| **Uso**                | Manipulación directa en código                      | Intercambio de datos (APIs, archivos)              |
| **Conversión**         | No necesita conversión                              | Requiere `JSON.parse()` y `JSON.stringify()`       |

### Ejemplo comparativo

**Objeto JavaScript:**

```javascript
const usuario = {
  nombre: "Patrick",
  edad: 30,
  activo: true,
  ultimoAcceso: new Date(),
  credenciales: undefined,
  saludar: function () {
    console.log(`Hola, soy ${this.nombre}`);
  },
};

usuario.saludar(); // ✅ Funciona
```

**JSON (string):**

```json
{
  "nombre": "Patrick",
  "edad": 30,
  "activo": true,
  "ultimoAcceso": "2024-01-30T10:00:00.000Z"
}
```

**Nota:** Las funciones, undefined y Date se pierden o convierten al serializar a JSON.

## Conversión entre Objeto JS y JSON

### JSON.stringify() - De objeto a JSON

Convierte un objeto JavaScript a una cadena JSON.

**Sintaxis:**

```javascript
JSON.stringify(valor[, reemplazador[, espacio]])
```

**Ejemplos:**

```javascript
const persona = { nombre: "Patrick", edad: 30 };

// Conversión básica
const jsonString = JSON.stringify(persona);
console.log(jsonString); // '{"nombre":"Patrick","edad":30}'
console.log(typeof jsonString); // "string"

// Con formato legible (indentación de 2 espacios)
const jsonFormatted = JSON.stringify(persona, null, 2);
console.log(jsonFormatted);
/*
{
  "nombre": "Patrick",
  "edad": 30
}
*/

// Con formato usando tabulación
const jsonTabbed = JSON.stringify(persona, null, "\t");
```

#### Parámetro replacer (filtrar propiedades)

```javascript
const usuario = {
  nombre: "Patrick",
  password: "secreto123",
  email: "patrick@example.com",
  edad: 30,
};

// Array de propiedades a incluir
const jsonFiltrado = JSON.stringify(usuario, ["nombre", "email"]);
console.log(jsonFiltrado);
// '{"nombre":"Patrick","email":"patrick@example.com"}'

// Función para transformar valores
const jsonTransformado = JSON.stringify(usuario, (key, value) => {
  if (key === "password") {
    return undefined; // Excluir password
  }
  return value;
});
console.log(jsonTransformado);
// '{"nombre":"Patrick","email":"patrick@example.com","edad":30}'
```

#### Comportamiento con tipos especiales

```javascript
const ejemploComplejo = {
  texto: "Hola",
  numero: 42,
  booleano: true,
  nulo: null,
  indefinido: undefined, // Se omite
  funcion: function () {}, // Se omite
  fecha: new Date(), // Se convierte a string ISO
  simbolo: Symbol("id"), // Se omite
  array: [1, 2, 3],
  objeto: { a: 1 },
};

const json = JSON.stringify(ejemploComplejo);
console.log(json);
// {"texto":"Hola","numero":42,"booleano":true,"nulo":null,"fecha":"2024-01-30T10:00:00.000Z","array":[1,2,3],"objeto":{"a":1}}
```

**Propiedades omitidas:**

- `undefined`
- Funciones
- Símbolos

**Nota:** En arrays, `undefined` se convierte a `null`:

```javascript
JSON.stringify([1, undefined, 3]); // "[1,null,3]"
```

#### Método toJSON personalizado

```javascript
const usuario = {
  nombre: "Patrick",
  password: "secreto",
  toJSON() {
    // Control total de la serialización
    return {
      nombre: this.nombre,
      // password se omite
    };
  },
};

JSON.stringify(usuario); // '{"nombre":"Patrick"}'
```

### JSON.parse() - De JSON a objeto

Convierte una cadena JSON a un objeto JavaScript.

**Sintaxis:**

```javascript
JSON.parse(texto[, reviver])
```

**Ejemplos:**

```javascript
// JSON string
const jsonString = '{"nombre":"Patrick","edad":30}';

// Convertir a objeto
const persona = JSON.parse(jsonString);
console.log(persona.nombre); // "Patrick"
console.log(typeof persona); // "object"
```

#### Parámetro reviver (transformar valores)

```javascript
const jsonConFecha =
  '{"nombre":"Patrick","registro":"2024-01-30T10:00:00.000Z"}';

const usuario = JSON.parse(jsonConFecha, (key, value) => {
  // Detectar y convertir strings de fecha a objetos Date
  if (key === "registro") {
    return new Date(value);
  }
  return value;
});

console.log(usuario.registro instanceof Date); // true
```

#### Manejo de errores

```javascript
const jsonInvalido = '{nombre: "Patrick"}'; // Falta comillas en clave

try {
  const objeto = JSON.parse(jsonInvalido);
} catch (error) {
  console.error("JSON inválido:", error.message);
  // SyntaxError: Unexpected token n in JSON at position 1
}
```

**Siempre validar JSON antes de parsear:**

```javascript
function parseJSONSafely(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parseando JSON:", error);
    return null;
  }
}

const resultado = parseJSONSafely('{"nombre":"Patrick"}');
```

## Casos de uso

### Caso 1: Guardar configuración en archivo

```javascript
const fs = require("fs");

// Objeto de configuración
const config = {
  port: 3000,
  database: {
    host: "localhost",
    name: "mydb",
  },
};

// Guardar como JSON
fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

// Leer JSON y convertir a objeto
const configCargado = JSON.parse(fs.readFileSync("config.json", "utf-8"));
console.log(configCargado.port); // 3000
```

### Caso 2: API REST

```javascript
// Servidor (Node.js + Express)
app.get("/api/user", (req, res) => {
  const usuario = {
    id: 1,
    nombre: "Patrick",
    email: "patrick@example.com",
  };

  // Express convierte automáticamente a JSON
  res.json(usuario);
  // Equivalente a: res.send(JSON.stringify(usuario))
});

// Cliente (Fetch API)
fetch("/api/user")
  .then((response) => response.json()) // Parsea JSON automáticamente
  .then((usuario) => {
    console.log(usuario.nombre); // "Patrick"
  });
```

### Caso 3: LocalStorage (navegador)

```javascript
// Guardar objeto en localStorage
const usuario = { nombre: "Patrick", preferencias: { tema: "oscuro" } };
localStorage.setItem("usuario", JSON.stringify(usuario));

// Recuperar objeto de localStorage
const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
console.log(usuarioRecuperado.preferencias.tema); // "oscuro"
```

### Caso 4: Deep copy de objetos

```javascript
// Crear copia profunda simple (con limitaciones)
const original = { nombre: "Patrick", datos: { edad: 30 } };
const copia = JSON.parse(JSON.stringify(original));

copia.datos.edad = 31;
console.log(original.datos.edad); // 30 (no afectado)

// ⚠️ Limitación: pierde funciones, Date, undefined, etc.
```

**Alternativa moderna (mejor):**

```javascript
const copia = structuredClone(original); // Preserva Date, etc.
```

## Validación de JSON

### Verificar si un string es JSON válido

```javascript
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

console.log(isValidJSON('{"nombre":"Patrick"}')); // true
console.log(isValidJSON('{nombre: "Patrick"}')); // false
```

### Esquemas JSON (JSON Schema)

Para validaciones más robustas, usar librerías como **Ajv**:

```javascript
const Ajv = require("ajv");
const ajv = new Ajv();

const schema = {
  type: "object",
  properties: {
    nombre: { type: "string" },
    edad: { type: "number", minimum: 0 },
  },
  required: ["nombre", "edad"],
};

const validate = ajv.compile(schema);

const valido = validate({ nombre: "Patrick", edad: 30 });
console.log(valido); // true

const invalido = validate({ nombre: "Patrick" });
console.log(invalido); // false (falta edad)
console.log(validate.errors); // Detalles del error
```

## Errores comunes

### Error 1: Confundir objeto con JSON

```javascript
// ❌ MAL - No es JSON, es un objeto
const dato = { nombre: "Patrick" };
console.log(dato.nombre); // Funciona porque ES un objeto

// Si quieres JSON:
const json = JSON.stringify(dato);
console.log(json.nombre); // undefined (es un string)
```

### Error 2: Parsear algo que ya es objeto

```javascript
const objeto = { nombre: "Patrick" };

// ❌ MAL - Intenta parsear un objeto (no un string)
const resultado = JSON.parse(objeto); // Error

// ✔ CORRECTO - Solo parsear strings
const json = '{"nombre":"Patrick"}';
const resultado = JSON.parse(json);
```

### Error 3: JSON inválido por comillas simples

```javascript
// ❌ MAL - Comillas simples no son válidas en JSON
const jsonInvalido = "{'nombre':'Patrick'}";
JSON.parse(jsonInvalido); // SyntaxError

// ✔ CORRECTO - Comillas dobles
const jsonValido = '{"nombre":"Patrick"}';
JSON.parse(jsonValido);
```

### Error 4: Trailing commas

```javascript
// ❌ MAL - Trailing comma
const jsonInvalido = '{"nombre":"Patrick","edad":30,}';
JSON.parse(jsonInvalido); // SyntaxError

// ✔ CORRECTO - Sin trailing comma
const jsonValido = '{"nombre":"Patrick","edad":30}';
JSON.parse(jsonInvalido);
```

### Error 5: Serializar referencias circulares

```javascript
const obj = { nombre: "Patrick" };
obj.self = obj; // Referencia circular

// ❌ Error: Converting circular structure to JSON
JSON.stringify(obj);

// ✔ Solución: Manejar con replacer
JSON.stringify(obj, (key, value) => {
  if (key === "self") return undefined;
  return value;
});
```

### Error 6: Perder métodos al serializar

```javascript
const usuario = {
  nombre: "Patrick",
  saludar() {
    return `Hola, ${this.nombre}`;
  },
};

const json = JSON.stringify(usuario);
const recuperado = JSON.parse(json);

// ❌ La función se perdió
console.log(recuperado.saludar); // undefined
```

**Solución:** Reconstruir métodos después de parsear:

```javascript
class Usuario {
  constructor(data) {
    Object.assign(this, data);
  }

  saludar() {
    return `Hola, ${this.nombre}`;
  }
}

const json = JSON.stringify({ nombre: "Patrick" });
const data = JSON.parse(json);
const usuario = new Usuario(data);
usuario.saludar(); // Funciona
```

## Buenas prácticas

### 1. Siempre validar JSON antes de parsear

```javascript
function parseJSONSafely(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parsing error:", error.message);
    return defaultValue;
  }
}
```

### 2. Usar try-catch con JSON.parse()

```javascript
try {
  const data = JSON.parse(externalData);
  // Procesar data
} catch (error) {
  // Manejar error apropiadamente
  console.error("Invalid JSON:", error);
}
```

### 3. No confiar en JSON externo sin validar

```javascript
// Validar estructura después de parsear
const data = JSON.parse(jsonString);

if (!data.nombre || typeof data.edad !== "number") {
  throw new Error("Invalid data structure");
}
```

### 4. Usar JSON para deep copy solo cuando sea apropiado

```javascript
// ✅ Bien para objetos simples
const copia = JSON.parse(JSON.stringify(objetoSimple));

// ❌ Mal para objetos con métodos, Date, etc.
const copiaIncompleta = JSON.parse(JSON.stringify(objetoComplejo));

// ✔ Mejor alternativa moderna
const copiaCompleta = structuredClone(objetoComplejo);
```

### 5. Formatear JSON para legibilidad en desarrollo

```javascript
// Desarrollo - legible
console.log(JSON.stringify(data, null, 2));

// Producción - compacto
res.send(JSON.stringify(data));
```

## Alternativas y herramientas

### Superset de JSON

**JSON5** - JSON más permisivo:

```javascript
// JSON5 permite:
{
    nombre: 'Patrick',  // Comillas simples
    edad: 30,           // Sin comillas en claves
    // Comentarios
    activo: true,
}  // Trailing comma
```

### Librerías útiles

- **Ajv** - Validación de esquemas JSON
- **JSON5** - Parser más permisivo
- **fast-json-stringify** - Serialización rápida
- **jsonwebtoken** - JWT (JSON Web Tokens)

## Recursos

**Especificaciones:**

- [RFC 7159 - The JavaScript Object Notation (JSON) Data Interchange Format](https://tools.ietf.org/html/rfc7159)
- [ECMA-404 - The JSON Data Interchange Syntax](https://www.ecma-international.org/publications-and-standards/standards/ecma-404/)

**Herramientas:**

- [JSONLint](https://jsonlint.com/) - Validador online
- [JSON Formatter](https://jsonformatter.org/) - Formatear y validar

## Resumen

**Objeto JavaScript:**

- Estructura nativa del lenguaje
- Existe en memoria
- Acepta cualquier tipo de valor
- Se manipula directamente

**JSON:**

- Formato de texto para intercambio de datos
- Es un string, no un objeto
- Sintaxis más restrictiva
- Requiere conversión con `JSON.parse()` / `JSON.stringify()`

**Conversión:**

- **Objeto → JSON:** `JSON.stringify(objeto)`
- **JSON → Objeto:** `JSON.parse(jsonString)`

**Regla de oro:**

> Si lo vas a enviar por red o guardar en archivo, es JSON (string).  
> Si lo vas a usar en JavaScript, es un objeto (Object).
