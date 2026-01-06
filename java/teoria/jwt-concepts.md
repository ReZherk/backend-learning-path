# JWT - JSON Web Tokens

## El problema que resuelve JWT

Como vimos en [Protocolo HTTP](./http_protocol.md), HTTP es **stateless** (sin estado).

Esto significa:

- El servidor **no recuerda** al cliente entre peticiones
- Cada request es completamente independiente
- No hay "memoria" de peticiones anteriores

**Pregunta clave:**

> ❓ ¿Cómo sabe el servidor que un usuario ya se logueó en peticiones posteriores?

**Soluciones:**

- **Antigua:** Sesiones en servidor (stateful)
- **Moderna:** JWT (stateless)

## ¿Qué es JWT?

**JWT (JSON Web Token)** es un estándar abierto (RFC 7519) que define una forma compacta y autónoma de transmitir información de forma segura entre partes como un objeto JSON. Esta información puede ser verificada y confiable porque está firmada digitalmente.

**Características:**

- 📌 Es un **String** codificado
- 📌 Viaja en cada request (típicamente en headers)
- 📌 El **cliente** lo guarda (localStorage, sessionStorage, cookies)
- 📌 El **servidor** solo lo valida, no lo almacena
- 📌 Contiene información del usuario (claims)
- 📌 Está **firmado digitalmente** para prevenir alteraciones

### Ejemplo de la vida real

Imagina un **evento con múltiples áreas**:

- **Compras tu entrada** → Login
- **Te dan un brazalete** → JWT
- **Cada vez que entras a una zona, muestras el brazalete** → Envías JWT en request

📌 El staff **no te vuelve a registrar**
📌 Solo revisa si el brazalete es válido

👉 El brazalete = JWT

## Estructura de un JWT

Un JWT tiene **3 partes**, separadas por puntos:

```
xxxxx.yyyyy.zzzzz
```

```
Header.Payload.Signature
```

### Ejemplo real de JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXRyaWNrIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 1. Header (Encabezado)

Contiene el tipo de token y el algoritmo de firma usado.

**JSON decodificado:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`: Algoritmo de firma (HS256, RS256, etc.)
- `typ`: Tipo de token (siempre "JWT")

### 2. Payload (Carga útil / Claims)

Contiene las declaraciones (claims) sobre el usuario y datos adicionales.

**JSON decodificado:**

```json
{
  "sub": "patrick",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

👉 Esta es la **información del usuario** que viaja en el token

### 3. Signature (Firma)

Garantiza que el token no ha sido alterado. Se crea combinando el header y payload codificados con una clave secreta.

**Algoritmo:**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

📌 Solo quien conoce la clave secreta puede generar una firma válida
📌 Cualquier modificación del header o payload invalida la firma

## ¿Qué son los Claims?

Los **claims** son declaraciones sobre una entidad (típicamente el usuario) y metadatos adicionales que viajan dentro del payload del JWT.

### Tipos de claims

**Claims registrados (estándar):**

| Claim | Nombre completo | Significado               |
| ----- | --------------- | ------------------------- |
| `sub` | Subject         | Identificador del usuario |
| `iat` | Issued At       | Timestamp de creación     |
| `exp` | Expiration Time | Timestamp de expiración   |
| `iss` | Issuer          | Quién emitió el token     |
| `aud` | Audience        | Para quién es el token    |

**Claims personalizados:**

```json
{
  "userId": 123,
  "role": "ADMIN",
  "email": "patrick@example.com",
  "permissions": ["read", "write"]
}
```

📌 Tú decides qué claims incluir según tus necesidades
📌 **NUNCA pongas datos sensibles** (contraseñas, números de tarjeta, etc.)

### ¿Por qué no datos sensibles?

El JWT está **codificado**, NO **encriptado**. Cualquiera puede decodificar el payload y leer su contenido. La firma solo previene alteraciones, no oculta la información.

## ¿Por qué JWT es seguro?

JWT es seguro por las siguientes razones:

✔ **Está firmado digitalmente** - Cualquier alteración invalida la firma
✔ **No se puede modificar** sin conocer la clave secreta
✔ **El servidor valida la firma** en cada petición
✔ **Tiene expiración** - Los tokens viejos dejan de ser válidos
✔ **Autocontenido** - Toda la información necesaria está en el token

**Importante:**

📌 JWT está **firmado**, NO **encriptado**
📌 El contenido es **legible** si lo decodificas (base64)
📌 La firma previene **alteraciones**, no **lectura**

## ¿Dónde se guarda el JWT?

### En el cliente

- **localStorage** - Persiste entre sesiones
- **sessionStorage** - Solo dura la sesión del navegador
- **Cookies** - Puede ser HttpOnly para mayor seguridad

### En las peticiones HTTP

El JWT se envía en el **header Authorization**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Formato:**

```
Authorization: Bearer <token>
```

📌 **Siempre en headers** para peticiones API REST
📌 **Nunca en el body** para requests normales
📌 **"Bearer"** es el esquema de autenticación estándar

## Flujo completo con JWT

```
1. Usuario envía credenciales (login)
    ↓
2. Servidor valida credenciales
    ↓
3. Servidor genera JWT firmado con claims del usuario
    ↓
4. Servidor retorna JWT al cliente
    ↓
5. Cliente guarda JWT (localStorage/sessionStorage)
    ↓
6. Cliente envía JWT en header Authorization en cada request
    ↓
7. Filter de Spring intercepta el request
    ↓
8. Filter extrae y valida el JWT
    ↓
9. Filter crea objeto Authentication con los datos del JWT
    ↓
10. Filter guarda Authentication en SecurityContext
    ↓
11. Controller se ejecuta con usuario autenticado
```

👉 **NO hay sesión en el servidor**
👉 **NO hay estado guardado**
👉 **El servidor solo valida, no almacena**

## JWT vs Sesiones tradicionales

| Característica | Sesión tradicional                                     | JWT                                             |
| -------------- | ------------------------------------------------------ | ----------------------------------------------- |
| Estado         | Stateful (servidor guarda estado)                      | Stateless (sin estado en servidor)              |
| Almacenamiento | Memoria/Base de datos del servidor                     | Cliente (localStorage, cookies)                 |
| Escalabilidad  | Difícil (requiere sticky sessions o sesión compartida) | Fácil (cualquier servidor puede validar)        |
| Rendimiento    | Requiere lookup en cada request                        | Solo validación de firma                        |
| Invalidación   | Fácil (eliminar de servidor)                           | Difícil (debe esperar expiración o lista negra) |
| Overhead red   | Pequeño (solo session ID)                              | Mayor (token completo viaja)                    |

## Error común

**❌ Pensar que:**

> "JWT reemplaza a Spring Security"

**🚨 FALSO**

**JWT:**

- Solo **transporta** la identidad del usuario
- Es un **mecanismo de autenticación**
- Contiene información del usuario

**Spring Security:**

- **Decide** si puedes acceder (autorización)
- **Maneja** roles y permisos
- **Protege** endpoints
- **Controla** el flujo de seguridad

👉 JWT **alimenta** a Spring Security proporcionándole la información del usuario

## Conexión con Authentication

Del JWT extraes:

- Username (claim `sub`)
- Roles (claim personalizado `role` o `roles`)
- Otros datos del usuario

Con esa información creas el objeto `Authentication`:

```java
// Extraer información del JWT
String username = jwtService.extractUsername(token);
List<GrantedAuthority> authorities = jwtService.extractAuthorities(token);

// Crear Authentication
Authentication authentication = new UsernamePasswordAuthenticationToken(
    username,
    null,
    authorities
);

// Guardar en SecurityContext
SecurityContextHolder
    .getContext()
    .setAuthentication(authentication);
```

🔥 **Todo encaja:**

```
JWT
 ↓
Claims (usuario, roles)
 ↓
Authentication (objeto de Spring)
 ↓
SecurityContext (almacenamiento)
 ↓
Spring Security (autorización)
```

## Ejemplo de generación de JWT (simplificado)

```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", userDetails.getAuthorities());

    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hora
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

## Ejemplo de validación de JWT (simplificado)

```java
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
}

private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
}
```

## Resumen

- **JWT** es un token firmado que representa la identidad de un usuario
- Resuelve el problema de HTTP stateless sin necesidad de sesiones en servidor
- Tiene 3 partes: Header, Payload (claims), y Signature
- Los **claims** son datos que viajan dentro del token
- Está **firmado** (no encriptado), por lo que no debes incluir datos sensibles
- Se envía en el header `Authorization: Bearer <token>`
- El **servidor no guarda estado**, solo valida la firma
- **JWT proporciona información** a Spring Security, no lo reemplaza
- Se convierte en un objeto `Authentication` para que Spring Security lo use
