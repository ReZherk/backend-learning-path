# Protocolo HTTP

## ¿Qué es HTTP?

HTTP (HyperText Transfer Protocol) es un protocolo de comunicación que define cómo se intercambian mensajes entre un cliente y un servidor. Es el lenguaje que permite que los navegadores web y las aplicaciones se comuniquen con servidores para solicitar y recibir información.

### Ejemplo llevado a la vida real de una petición HTTP

Imagina una tienda:

- 🧍 **Cliente** → tú
- 🧑‍💼 **Vendedor** → servidor
- 🧾 **Pedido** → request
- 📦 **Producto** → response

**Flujo real:**

1. Tú pides algo
2. El vendedor escucha
3. El vendedor responde

💡 **El vendedor no recuerda quién eres si no le das información cada vez.**

👉 Eso es HTTP.

## REQUEST (PETICIÓN)

Un HTTP Request es todo lo que el cliente envía al servidor.

Contiene 4 cosas importantes:

### 1. Métodos HTTP

| Método | Significado      |
| ------ | ---------------- |
| GET    | Obtener datos    |
| POST   | Crear datos      |
| PUT    | Actualizar todo  |
| PATCH  | Actualizar parte |
| DELETE | Eliminar         |

### 2. URL (Recurso)

```
GET /api/patients
```

**Interpretación:**

Servidor, dame el recurso `patients`

### 3. Headers (Metadatos)

Los headers son información extra, como:

- Tipo de contenido
- Idioma
- Token de seguridad

**Ejemplo:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### 4. Body (Cuerpo)

Solo existe en métodos como POST / PUT. Es la información "real" que mandas.

**Ejemplo:**

```json
{
  "username": "patrick",
  "password": "123456"
}
```

## RESPONSE (RESPUESTA)

El HTTP Response es lo que el servidor devuelve.

Contiene:

### 1. Status Code (MUY IMPORTANTE)

| Código | Significado        |
| ------ | ------------------ |
| 200    | OK                 |
| 201    | Created            |
| 400    | Bad Request        |
| 401    | Unauthorized       |
| 403    | Forbidden          |
| 404    | Not Found          |
| 500    | Error del servidor |

### 2. Headers de respuesta

**Ejemplo:**

```
Content-Type: application/json
```

### 3. Body de respuesta

**Ejemplo:**

```json
{
  "id": 10,
  "name": "Patrick",
  "role": "ADMIN"
}
```

## ¿Qué significa que HTTP es stateless?

Esto significa que el servidor **no recuerda quién eres**. Cada vez que mandas una petición debes darle tu información nuevamente. El servidor no mantiene un estado o "memoria" de peticiones anteriores.

**Nota:** Una forma de solucionar esto y tener seguridad es usando tokens (como JWT), los cuales el servidor toma y valida para determinar si son válidos antes de entregar información.

```
HTTP = Stateless
    ↓
No memoria
    ↓
Necesito token
    ↓
JWT
```

## Ejemplo en Spring Boot

### Controlador de Backend (Simple)

```java
@RestController
@RequestMapping("/api/hello")
public class HelloController {

    @GetMapping
    public String hello() {
        return "Hola Patrick";
    }
}
```

### Petición de afuera

```
GET http://localhost:8080/api/hello
```

### Acciones del servidor

1. Lee el Request
2. Ejecuta el método
3. Construye el Response
4. Devuelve 200 OK

### Respuesta

```
HTTP/1.1 200 OK
Content-Type: text/plain

Hola Patrick
```
