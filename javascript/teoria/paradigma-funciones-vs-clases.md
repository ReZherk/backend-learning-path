# JavaScript - Factory Functions vs Clases

## Contexto: Paradigmas de programación

JavaScript es un lenguaje **multi-paradigma** que soporta varios estilos de programación:

- **Imperativo** - Secuencias de instrucciones
- **Funcional** - Funciones como valores de primera clase
- **Orientado a objetos** - Basado en prototipos (no en clases clásicas)

**Diferencia fundamental con Java:**

En Java, los objetos se crean exclusivamente desde clases. En JavaScript, **puedes crear objetos sin necesidad de clases**, usando funciones que retornan objetos (Factory Functions).

## Factory Functions

### ¿Qué es una Factory Function?

Una **Factory Function** es una función que retorna un nuevo objeto cada vez que se invoca. Es un patrón para crear objetos sin usar la palabra clave `new` ni definir una clase.

**Definición técnica:**

Una función que encapsula la lógica de creación de objetos y retorna una nueva instancia con cada invocación, sin requerir `new` ni heredar de un prototipo explícitamente.

**Características:**

- Es una función normal (no constructora)
- Retorna un objeto literal
- No requiere `new`
- Encapsula la lógica de inicialización
- Permite privacidad real mediante closures

### Sintaxis básica

```javascript
function crearPersona(nombre, edad) {
  return {
    nombre: nombre,
    edad: edad,
    saludar: function () {
      console.log(`Hola, soy ${nombre}`);
    },
  };
}

// Uso (sin new)
const persona = crearPersona("Patrick", 30);
persona.saludar(); // "Hola, soy Patrick"
```

**Versión moderna (ES6+):**

```javascript
function crearPersona(nombre, edad) {
  return {
    nombre, // Shorthand property
    edad,
    saludar() {
      // Método conciso
      console.log(`Hola, soy ${nombre}`);
    },
  };
}
```

### Arrow function como factory

```javascript
const crearPersona = (nombre, edad) => ({
  nombre,
  edad,
  saludar() {
    console.log(`Hola, soy ${nombre}`);
  },
});

const persona = crearPersona("Patrick", 30);
```

**Nota:** Los paréntesis alrededor del objeto son necesarios para distinguir entre un objeto literal y el cuerpo de la función.

## Por qué JavaScript permite esto

### 1. Funciones como ciudadanos de primera clase

En JavaScript, las funciones son **first-class citizens** (ciudadanos de primera clase), lo que significa:

- Se pueden asignar a variables
- Se pueden pasar como argumentos
- Se pueden retornar desde otras funciones
- Se pueden almacenar en estructuras de datos
- Pueden tener propiedades como cualquier objeto

**Ejemplo:**

```javascript
// Asignar a variable
const saludar = function () {
  console.log("Hola");
};

// Pasar como argumento
function ejecutar(fn) {
  fn();
}
ejecutar(saludar);

// Retornar función
function crearSaludo(nombre) {
  return function () {
    console.log(`Hola ${nombre}`);
  };
}

const miSaludo = crearSaludo("Patrick");
miSaludo(); // "Hola Patrick"

// Agregar propiedades
saludar.version = "1.0";
console.log(saludar.version); // "1.0"
```

### 2. Flexibilidad y dinamismo

JavaScript fue diseñado como un lenguaje ligero para scripting web, no como un lenguaje orientado a objetos clásico:

- **Tipado dinámico** - No requiere declaración de tipos
- **Prototipos** - Herencia basada en prototipos, no clases
- **Duck typing** - "Si camina como pato y grazna como pato, es un pato"
- **Mutabilidad** - Objetos pueden modificarse en runtime

**Comparación con Java:**

| Aspecto             | Java                          | JavaScript                   |
| ------------------- | ----------------------------- | ---------------------------- |
| Paradigma principal | Orientado a objetos (clásico) | Multi-paradigma              |
| Creación de objetos | Solo con clases               | Literales, funciones, clases |
| Herencia            | Basada en clases              | Basada en prototipos         |
| Tipado              | Estático                      | Dinámico                     |
| Flexibilidad        | Más rígido                    | Más flexible                 |

### 3. Patrón histórico

Antes de ES6 (2015), JavaScript **no tenía clases** en absoluto. Los desarrolladores usaban:

- Factory functions
- Constructor functions + prototipos
- Mixins y composición

**Constructor function (pre-ES6):**

```javascript
function Persona(nombre, edad) {
  this.nombre = nombre;
  this.edad = edad;
}

Persona.prototype.saludar = function () {
  console.log(`Hola, soy ${this.nombre}`);
};

const persona = new Persona("Patrick", 30);
persona.saludar();
```

## Factory Functions en frameworks

### Express.js

Express es un ejemplo clásico de factory function:

```javascript
const express = require("express");

// express() es una factory function
const app = express(); // Retorna objeto con métodos

app.get("/", (req, res) => {
  res.send("Hola");
});

app.listen(3000);
```

**¿Qué devuelve `express()`?**

Un objeto con métodos como:

- `app.get()`
- `app.post()`
- `app.use()`
- `app.listen()`

**Equivalente conceptual:**

```javascript
function express() {
  return {
    routes: [],
    get(path, handler) {
      this.routes.push({ method: "GET", path, handler });
    },
    post(path, handler) {
      this.routes.push({ method: "POST", path, handler });
    },
    listen(port) {
      console.log(`Servidor en puerto ${port}`);
    },
  };
}
```

### Mongoose

```javascript
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  nombre: String,
  edad: Number,
});

// model() es una factory function
const Usuario = mongoose.model("Usuario", schema);

// Crea instancias
const usuario = new Usuario({ nombre: "Patrick", edad: 30 });
```

## Clases en JavaScript (ES6+)

### Introducción de clases

Desde ES6 (2015), JavaScript tiene sintaxis de clases:

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
persona.saludar();
```

### ¿Son clases reales?

**No.** Las clases de JavaScript son **azúcar sintáctico** (syntactic sugar) sobre el sistema de prototipos existente.

**Internamente, esto:**

```javascript
class Persona {
  constructor(nombre) {
    this.nombre = nombre;
  }

  saludar() {
    console.log(`Hola, soy ${this.nombre}`);
  }
}
```

**Es equivalente a esto:**

```javascript
function Persona(nombre) {
  this.nombre = nombre;
}

Persona.prototype.saludar = function () {
  console.log(`Hola, soy ${this.nombre}`);
};
```

### Verificación

```javascript
class Persona {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

console.log(typeof Persona); // "function"
console.log(Persona.prototype.constructor === Persona); // true
```

**Conclusión:** Una clase en JavaScript es simplemente una función con prototype.

## Factory Functions vs Clases

### Comparación técnica

| Aspecto          | Factory Function           | Clase (ES6)                |
| ---------------- | -------------------------- | -------------------------- |
| **Sintaxis**     | Función que retorna objeto | `class` keyword            |
| **Uso de new**   | No necesario               | Requerido                  |
| **Herencia**     | Composición manual         | `extends`                  |
| **Privacidad**   | Real (via closures)        | # campos privados (ES2022) |
| **this**         | No relevante               | Puede causar problemas     |
| **Prototipos**   | No usa                     | Usa prototipos             |
| **Polimorfismo** | Composición                | Herencia clásica           |

### Ejemplo comparativo

#### Factory Function

```javascript
function crearContador(valorInicial = 0) {
  let valor = valorInicial; // Variable privada real

  return {
    incrementar() {
      valor++;
    },
    decrementar() {
      valor--;
    },
    getValor() {
      return valor;
    },
  };
}

const contador = crearContador(10);
contador.incrementar();
console.log(contador.getValor()); // 11
console.log(contador.valor); // undefined (privado)
```

#### Clase ES6

```javascript
class Contador {
  #valor; // Campo privado (ES2022)

  constructor(valorInicial = 0) {
    this.#valor = valorInicial;
  }

  incrementar() {
    this.#valor++;
  }

  decrementar() {
    this.#valor--;
  }

  getValor() {
    return this.#valor;
  }
}

const contador = new Contador(10);
contador.incrementar();
console.log(contador.getValor()); // 11
// console.log(contador.#valor);  // SyntaxError (privado)
```

### Ventajas de Factory Functions

**1. Privacidad real mediante closures**

```javascript
function crearUsuario(nombre, password) {
  // password es privada - closure
  return {
    nombre,
    validarPassword(input) {
      return input === password;
    },
    // No hay forma de acceder a password desde fuera
  };
}

const usuario = crearUsuario("Patrick", "secreto123");
console.log(usuario.password); // undefined
console.log(usuario.validarPassword("secreto123")); // true
```

**2. No requiere `new`**

```javascript
// Factory
const obj = crearObjeto(); // Simple

// Clase
const obj = new MiClase(); // Requiere new
```

**3. Flexibilidad en retorno**

```javascript
function crearObjeto(tipo) {
  if (tipo === "A") {
    return { tipo: "A", metodoA() {} };
  }
  return { tipo: "B", metodoB() {} };
}
```

**4. Composición más fácil**

```javascript
function conNombre(nombre) {
  return { nombre };
}

function conSaludo() {
  return {
    saludar() {
      console.log(`Hola, soy ${this.nombre}`);
    },
  };
}

function crearPersona(nombre) {
  return {
    ...conNombre(nombre),
    ...conSaludo(),
  };
}
```

### Ventajas de Clases

**1. Sintaxis más familiar**

Para desarrolladores de Java, C#, etc.

```javascript
class Animal {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

class Perro extends Animal {
  ladrar() {
    console.log("Guau!");
  }
}
```

**2. Herencia más clara**

```javascript
class Vehiculo {
  arrancar() {
    console.log("Arrancando...");
  }
}

class Auto extends Vehiculo {
  acelerar() {
    console.log("Acelerando...");
  }
}

const auto = new Auto();
auto.arrancar(); // Hereda de Vehiculo
auto.acelerar();
```

**3. Performance**

Métodos en prototype se comparten entre instancias (menos memoria).

```javascript
class Persona {
  constructor(nombre) {
    this.nombre = nombre;
  }

  saludar() {
    // Compartido en prototype
    console.log(`Hola ${this.nombre}`);
  }
}

const p1 = new Persona("A");
const p2 = new Persona("B");
console.log(p1.saludar === p2.saludar); // true (mismo método)
```

En factory functions, cada instancia tiene su propia copia del método:

```javascript
function crearPersona(nombre) {
  return {
    nombre,
    saludar() {
      // Nueva función por instancia
      console.log(`Hola ${nombre}`);
    },
  };
}

const p1 = crearPersona("A");
const p2 = crearPersona("B");
console.log(p1.saludar === p2.saludar); // false (diferentes funciones)
```

## Patrones comunes

### Patrón Módulo (Module Pattern)

```javascript
const modulo = (function () {
  // Variables privadas
  let privado = "secreto";

  // API pública
  return {
    getPrivado() {
      return privado;
    },
    setPrivado(valor) {
      privado = valor;
    },
  };
})();

console.log(modulo.getPrivado()); // "secreto"
modulo.setPrivado("nuevo");
console.log(modulo.privado); // undefined (privado)
```

### Factory con configuración

```javascript
function crearAPI(config = {}) {
  const baseURL = config.baseURL || "http://localhost";
  const timeout = config.timeout || 5000;

  return {
    get(endpoint) {
      return fetch(`${baseURL}${endpoint}`, { timeout });
    },
    post(endpoint, data) {
      return fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(data),
        timeout,
      });
    },
  };
}

const api = crearAPI({ baseURL: "https://api.example.com" });
api.get("/users");
```

### Mixins con Factory

```javascript
const conNombre = (nombre) => ({ nombre });

const conEdad = (edad) => ({
  edad,
  esAdulto() {
    return this.edad >= 18;
  },
});

const conEmail = (email) => ({
  email,
  validarEmail() {
    return this.email.includes("@");
  },
});

function crearUsuario(nombre, edad, email) {
  return {
    ...conNombre(nombre),
    ...conEdad(edad),
    ...conEmail(email),
  };
}

const usuario = crearUsuario("Patrick", 30, "patrick@example.com");
console.log(usuario.esAdulto()); // true
console.log(usuario.validarEmail()); // true
```

## Cuándo usar cada uno

### Usa Factory Functions cuando:

- Necesitas **privacidad real** de datos
- Quieres evitar problemas con `this`
- Prefieres **composición** sobre herencia
- No necesitas herencia clásica
- Trabajas con funciones como paradigma principal
- Quieres código más funcional

### Usa Clases cuando:

- Necesitas **herencia clásica** (`extends`)
- Trabajas en equipo con background en Java/C#
- La **performance** es crítica (muchas instancias)
- Quieres sintaxis más **familiar** para OOP
- Necesitas **instanceof** para type checking
- Trabajas con frameworks que esperan clases (React components)

## Conversión entre patrones

### De Factory a Clase

**Factory:**

```javascript
function crearPersona(nombre, edad) {
  return {
    nombre,
    edad,
    saludar() {
      console.log(`Hola, soy ${nombre}`);
    },
  };
}
```

**Clase:**

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
```

### De Clase a Factory

**Clase:**

```javascript
class Contador {
  constructor(inicial) {
    this.valor = inicial;
  }

  incrementar() {
    this.valor++;
  }
}
```

**Factory:**

```javascript
function crearContador(inicial) {
  let valor = inicial;

  return {
    incrementar() {
      valor++;
    },
    getValor() {
      return valor;
    },
  };
}
```

## Buenas prácticas

### 1. Nombrado consistente

```javascript
// Factory functions - verbos descriptivos
function crearUsuario() {}
function construirAPI() {}

// Clases - sustantivos con PascalCase
class Usuario {}
class APIClient {}
```

### 2. No mezclar patrones sin razón

```javascript
// ❌ Confuso - mezcla innecesaria
function crearObjeto() {
  return new MiClase();
}

// ✔ Usar uno u otro consistentemente
function crearObjeto() {
  return {
    /* ... */
  };
}
```

### 3. Documentar el patrón usado

```javascript
/**
 * Factory function para crear instancias de Usuario
 * @param {string} nombre
 * @param {string} email
 * @returns {Object} Objeto usuario con métodos
 */
function crearUsuario(nombre, email) {
  return { nombre, email };
}
```

### 4. Privacidad real solo cuando necesario

```javascript
// Si no necesitas privacidad, clase es más simple
class Persona {
  constructor(nombre) {
    this.nombre = nombre; // Público está bien
  }
}

// Si necesitas privacidad, factory
function crearCuenta(saldo) {
  let saldoPrivado = saldo; // Privado necesario

  return {
    depositar(monto) {
      saldoPrivado += monto;
    },
    getSaldo() {
      return saldoPrivado;
    },
  };
}
```

## Resumen

**JavaScript no es desordenado, es multi-paradigma:**

- **Java:** Todo es clase → objeto
- **JavaScript:** Todo puede ser función → objeto, clase → objeto, literal → objeto

**Factory Functions:**

- Funciones que retornan objetos
- No requieren `new`
- Privacidad real via closures
- Favorecen composición

**Clases ES6:**

- Azúcar sintáctico sobre prototipos
- Requieren `new`
- Sintaxis familiar para OOP
- Mejor performance con muchas instancias

**Ambos son válidos** - elige según tu caso de uso:

- **Factory** → Privacidad, composición, paradigma funcional
- **Clases** → Herencia, performance, familiaridad OOP

**Regla de oro:**

> No hay un patrón "mejor" universal. Elige basándote en los requisitos del proyecto y las convenciones del equipo.
