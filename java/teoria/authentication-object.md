# Authentication en Spring Security

## Concepto clave

👉 **Spring NO guarda usuarios directamente, guarda objetos `Authentication`.**

Spring **no piensa** en:

- JWT
- Base de datos
- Cookies
- Sesiones HTTP

Spring piensa en:

```java
Authentication
```

Este objeto es la representación abstracta de cualquier usuario autenticado en el sistema, sin importar cómo se autenticó.

## ¿Qué es Authentication?

`Authentication` es una **interfaz** de Spring Security que representa a un usuario autenticado (o en proceso de autenticación) dentro del sistema. Es la abstracción central que Spring usa para gestionar la identidad y permisos de los usuarios.

## Información que contiene Authentication

La interfaz `Authentication` proporciona 4 métodos principales:

| Método              | Significado                             | Ejemplo                                                   |
| ------------------- | --------------------------------------- | --------------------------------------------------------- |
| `getPrincipal()`    | Quién eres (identidad del usuario)      | Username, email, objeto UserDetails                       |
| `getCredentials()`  | Cómo te autenticaste (credenciales)     | Password, token (generalmente null después de autenticar) |
| `getAuthorities()`  | Qué permisos tienes (roles/autoridades) | [ROLE_ADMIN, ROLE_USER]                                   |
| `isAuthenticated()` | ¿Estás autenticado?                     | true o false                                              |

### Ejemplo de la vida real

Imagina una **credencial de empleado**:

- **Nombre en la credencial** → principal
- **Firma o huella** → credentials
- **Áreas de acceso permitidas** → authorities
- **Validez actual** → authenticated

👉 `Authentication` es tu credencial digital dentro de Spring.

## UsernamePasswordAuthenticationToken

`UsernamePasswordAuthenticationToken` es la implementación más común de la interfaz `Authentication`.

Spring la usa para:

- Login tradicional (usuario y contraseña)
- Autenticación con JWT
- Autenticación manual personalizada

**Clase:**

```java
public class UsernamePasswordAuthenticationToken extends AbstractAuthenticationToken
```

## Formas de crear Authentication

### 1. Authentication NO autenticado

Para crear un objeto que representa un intento de autenticación **pendiente de validar**:

```java
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    password
);
```

**Características:**

- `isAuthenticated()` → **false**
- Aún no está validado
- Se usa típicamente antes de verificar credenciales

### 2. Authentication autenticado

Para crear un objeto que representa un usuario **ya validado**:

```java
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    null,  // credentials se ponen null por seguridad
    authorities  // Lista de roles/permisos
);
```

**Características:**

- `isAuthenticated()` → **true**
- Las authorities son obligatorias
- credentials debe ser null por seguridad
- Listo para guardarse en SecurityContext

📌 **La presencia de authorities marca la diferencia entre autenticado y no autenticado.**

## ¿Cómo sabe Spring que estás autenticado?

Spring verifica si existe un objeto `Authentication` válido dentro del `SecurityContext`.

**Condiciones para estar autenticado:**

1. Existe un `Authentication` en el `SecurityContext`
2. `authentication.isAuthenticated()` retorna `true`
3. Las authorities no están vacías

## Guardando el usuario en el SecurityContext

Una vez que validas las credenciales (en un Filter, no en el Controller), debes guardar el `Authentication` en el contexto:

```java
// 1. Crear el objeto Authentication (ya autenticado)
Authentication authentication = new UsernamePasswordAuthenticationToken(
    userDetails,    // Usuario con información completa
    null,           // Sin credenciales por seguridad
    userDetails.getAuthorities()  // Roles y permisos
);

// 2. Guardarlo en el SecurityContext
SecurityContextHolder
    .getContext()
    .setAuthentication(authentication);
```

📌 **A partir de este momento:**

- ✔ Spring confía en que el usuario está autenticado
- ✔ El Controller no necesita validar nada
- ✔ Los mecanismos de autorización funcionan automáticamente

## ¿Quién crea este objeto normalmente?

En aplicaciones reales, el objeto `Authentication` lo crea:

- **AuthenticationManager** → En login tradicional
- **JwtAuthenticationFilter** → En autenticación con JWT
- **Filtros personalizados** → En mecanismos custom

📌 **NUNCA el Controller** - La autenticación debe ocurrir en la capa de filtros.

## Ejemplo real en un JWT Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtService.isValid(token)) {
            String username = jwtService.extractUsername(token);
            List<GrantedAuthority> authorities = jwtService.extractAuthorities(token);

            // Crear Authentication autenticado
            Authentication auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                authorities
            );

            // Guardarlo en el contexto
            SecurityContextHolder
                .getContext()
                .setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

👉 Esto ocurre **en un Filter**, antes de que el request llegue al Controller.

## Uso en el Controller

El Controller recibe automáticamente el usuario autenticado sin necesidad de validar:

```java
@RestController
@RequestMapping("/api")
public class ProfileController {

    @GetMapping("/profile")
    public String getProfile(Authentication authentication) {
        // Spring inyecta el Authentication automáticamente
        return "Usuario: " + authentication.getName();
    }

    // Alternativa usando anotación
    @GetMapping("/me")
    public String getCurrentUser(@AuthenticationPrincipal UserDetails user) {
        return "Usuario: " + user.getUsername();
    }
}
```

📌 Spring inyecta el usuario automáticamente
📌 El Controller solo confía en que ya está autenticado

## Errores comunes

### Error 1: Establecer Authentication como null

```java
// ❌ MAL - Esto rompe la sesión actual
SecurityContextHolder.getContext().setAuthentication(null);
```

**Problema:**

- Cortas la autenticación del request actual
- Spring te ve como usuario anónimo
- Puede causar errores 401 inesperados

### Error 2: Crear Authentication sin authorities

```java
// ❌ MAL - Falta authorities
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    null
);
```

**Problema:**

- `isAuthenticated()` retornará false
- Spring no lo considerará autenticado
- Necesitas pasar authorities aunque sea una lista vacía

### Error 3: Autenticar en el Controller

```java
// ❌ MAL - La autenticación NO va en el Controller
@PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    Authentication auth = new UsernamePasswordAuthenticationToken(...);
    SecurityContextHolder.getContext().setAuthentication(auth);
    return "OK";
}
```

**Problema:**

- Rompe la arquitectura de Spring Security
- La autenticación debe estar en Filters
- El Controller no debe manejar seguridad

## Flujo completo

```
1. Request con JWT llega
    ↓
2. JwtFilter intercepta
    ↓
3. Extrae y valida JWT
    ↓
4. Crea Authentication (autenticado)
    ↓
5. Guarda en SecurityContext
    ↓
6. Spring considera al usuario logueado
    ↓
7. Authorization puede funcionar
    ↓
8. Controller recibe el usuario automáticamente
```

## Resumen

- `Authentication` es la interfaz central de Spring Security para representar usuarios
- Contiene: principal (quién), credentials (cómo), authorities (permisos), authenticated (estado)
- `UsernamePasswordAuthenticationToken` es la implementación más usada
- Se crea con authorities para marcarlo como autenticado
- Se guarda en `SecurityContextHolder.getContext()`
- Los Filters crean y guardan el Authentication, NO los Controllers
- Una vez guardado, Spring confía automáticamente en el usuario
- Los Controllers reciben el usuario inyectado automáticamente
