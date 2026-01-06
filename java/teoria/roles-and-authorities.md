# Roles y Authorities en Spring Security

## Concepto clave

👉 **Spring Security NO trabaja directamente con el concepto de "roles"**

Spring Security trabaja con:

```java
GrantedAuthority
```

Todo lo relacionado con permisos y roles se maneja a través de esta interfaz.

## ¿Qué es una Authority?

Una **Authority** (Autoridad) es un permiso o privilegio que Spring Security puede verificar. Es la unidad básica de autorización en Spring Security.

**Características:**

- Es simplemente un **String** que representa un permiso
- Puede ser cualquier texto que definas
- Spring Security lo usa para determinar qué puede hacer un usuario

**Ejemplos:**

```text
ROLE_ADMIN
ROLE_USER
READ_PATIENT
WRITE_PATIENT
DELETE_PATIENT
MANAGE_USERS
VIEW_REPORTS
```

📌 Todo es texto
📌 Todo es una autoridad
📌 Spring no distingue entre "roles" y "permisos" a nivel técnico

## ¿Qué es un Role?

Un **Role** (Rol) en Spring Security es simplemente:

> Una Authority con el prefijo `ROLE_`

**No es una estructura especial**, es solo una convención de nombrado.

**Ejemplos:**

```text
ROLE_USER
ROLE_ADMIN
ROLE_MODERATOR
ROLE_GUEST
```

**Para Spring Security:**

```
ROLE_ADMIN = Authority con nombre "ROLE_ADMIN"
```

No hay diferencia técnica entre `ROLE_ADMIN` y `READ_PATIENT` - ambos son authorities. La diferencia es solo semántica y de convención.

### Ejemplo de la vida real

Imagina una empresa con diferentes niveles de acceso:

| Persona | Rol       | Permisos (Authorities)                                  |
| ------- | --------- | ------------------------------------------------------- |
| Patrick | ADMIN     | ROLE_ADMIN, READ_PATIENT, WRITE_PATIENT, DELETE_PATIENT |
| Juan    | USER      | ROLE_USER, READ_PATIENT                                 |
| María   | MODERATOR | ROLE_MODERATOR, READ_PATIENT, WRITE_PATIENT             |

👉 El rol **agrupa conceptualmente** varios permisos
👉 Técnicamente, el rol es solo una authority más

## GrantedAuthority

`GrantedAuthority` es la interfaz que Spring Security usa para representar cualquier permiso o rol.

**Interfaz:**

```java
public interface GrantedAuthority extends Serializable {
    String getAuthority();
}
```

**Implementación más común:**

```java
SimpleGrantedAuthority
```

Esta es la implementación estándar que simplemente almacena el nombre del permiso como String.

### Ejemplo de uso

```java
// Crear authorities manualmente
List<GrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority("ROLE_ADMIN"),
    new SimpleGrantedAuthority("READ_PATIENT"),
    new SimpleGrantedAuthority("WRITE_PATIENT")
);
```

📌 Esto es lo que Spring entiende internamente
📌 No entiende enums directamente
📌 No entiende strings sueltos sin envolver en `GrantedAuthority`

## Cómo viajan los roles en JWT

### En el token JWT

```json
{
  "sub": "patrick",
  "roles": ["ADMIN", "USER"]
}
```

O también puedes usar:

```json
{
  "sub": "patrick",
  "authorities": ["ROLE_ADMIN", "READ_PATIENT", "WRITE_PATIENT"]
}
```

### En el Filter al procesar el JWT

```java
// Extraer roles del JWT
List<String> roles = jwtService.extractRoles(token);

// Convertir a GrantedAuthority con prefijo ROLE_
List<GrantedAuthority> authorities = roles.stream()
    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
    .toList();

// Crear Authentication con las authorities
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    null,
    authorities
);
```

📌 **Spring exige el prefijo `ROLE_`** cuando usas métodos como `hasRole()`
📌 Si tu JWT tiene "ADMIN", debes agregar "ROLE\_" manualmente

## hasRole() vs hasAuthority()

Spring Security proporciona dos métodos principales para verificar permisos:

### hasRole("ADMIN")

Busca una authority con el prefijo `ROLE_` automáticamente.

**Spring lo convierte internamente a:**

```
ROLE_ADMIN
```

**Características:**

- ✔ Más cómodo (no escribes "ROLE\_")
- ✔ Solo para roles (authorities con prefijo ROLE\_)
- ✔ Más semántico

**Ejemplo:**

```java
.requestMatchers("/admin/**").hasRole("ADMIN")
```

Internamente busca: `ROLE_ADMIN`

### hasAuthority("ROLE_ADMIN")

Busca exactamente el String que le pases, sin agregar prefijos.

**Características:**

- ✔ Exacto (busca literalmente lo que escribes)
- ✔ Más explícito
- ✔ Más flexible (puedes verificar authorities sin prefijo ROLE\_)

**Ejemplo:**

```java
.requestMatchers("/patients/read").hasAuthority("READ_PATIENT")
```

Busca exactamente: `READ_PATIENT`

### Tabla comparativa

| Método                         | Lo que escribes | Spring busca |
| ------------------------------ | --------------- | ------------ |
| `hasRole("ADMIN")`             | ADMIN           | ROLE_ADMIN   |
| `hasAuthority("ROLE_ADMIN")`   | ROLE_ADMIN      | ROLE_ADMIN   |
| `hasAuthority("READ_PATIENT")` | READ_PATIENT    | READ_PATIENT |

### ¿Cuál usar?

- **hasRole()** - Cuando trabajas con roles tradicionales
- **hasAuthority()** - Cuando necesitas permisos granulares sin el prefijo ROLE\_

## Uso en configuración de seguridad

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Solo usuarios con ROLE_ADMIN
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Usuarios con ROLE_USER o ROLE_ADMIN
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")

                // Permisos granulares sin ROLE_
                .requestMatchers("/patients/read").hasAuthority("READ_PATIENT")
                .requestMatchers("/patients/write").hasAuthority("WRITE_PATIENT")

                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

📌 Muy legible
📌 Configuración declarativa
📌 Fácil de mantener

## Uso en controladores con @PreAuthorize

Spring Security permite autorización a nivel de método usando anotaciones.

```java
@RestController
@RequestMapping("/api")
public class AdminController {

    // Solo usuarios con ROLE_ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    // Múltiples roles
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    @DeleteMapping("/admin/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }

    // Authority específica
    @PreAuthorize("hasAuthority('DELETE_PATIENT')")
    @DeleteMapping("/patients/{id}")
    public void deletePatient(@PathVariable Long id) {
        patientService.delete(id);
    }

    // Expresiones complejas
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #id == authentication.principal.id)")
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

**Para habilitar @PreAuthorize:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Esta anotación habilita @PreAuthorize
public class SecurityConfig {
    // ...
}
```

📌 Autorización a nivel método
📌 Muy profesional y granular
📌 Fácil de testear

## Errores comunes

### Error 1: Olvidar el prefijo ROLE\_

```java
// ❌ MAL - Falta el prefijo ROLE_
List<GrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority("ADMIN")
);
```

**Problema:**

Si usas `hasRole("ADMIN")`, Spring busca `ROLE_ADMIN`, no `ADMIN`.

**✔ Correcto:**

```java
List<GrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority("ROLE_ADMIN")
);
```

### Error 2: Usar hasRole con el prefijo ROLE\_

```java
// ❌ MAL - hasRole ya agrega el prefijo
.requestMatchers("/admin/**").hasRole("ROLE_ADMIN")
```

**Problema:**

Spring buscaría `ROLE_ROLE_ADMIN` (doble prefijo).

**✔ Correcto:**

```java
// Opción 1
.requestMatchers("/admin/**").hasRole("ADMIN")

// Opción 2
.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
```

### Error 3: No convertir a GrantedAuthority

```java
// ❌ MAL - Spring no acepta String directamente
Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    null,
    List.of("ROLE_ADMIN")  // Incorrecto
);
```

**✔ Correcto:**

```java
List<GrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority("ROLE_ADMIN")
);

Authentication auth = new UsernamePasswordAuthenticationToken(
    username,
    null,
    authorities
);
```

## Flujo completo: JWT → Authorities → Autorización

```
1. JWT llega al servidor
    ↓
2. Filter extrae roles del JWT (ej: ["ADMIN", "USER"])
    ↓
3. Filter convierte roles a GrantedAuthority
   ["ADMIN"] → [SimpleGrantedAuthority("ROLE_ADMIN")]
    ↓
4. Filter crea Authentication con authorities
    ↓
5. Filter guarda en SecurityContext
    ↓
6. Spring Security verifica authorities en cada endpoint
    ↓
7. hasRole("ADMIN") busca "ROLE_ADMIN" en authorities
    ↓
8. Acceso permitido o denegado
```

## Ejemplo completo de conversión

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

            // Extraer roles del JWT
            List<String> roles = jwtService.extractRoles(token);

            // Convertir a GrantedAuthority
            List<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();

            // Crear Authentication
            Authentication auth = new UsernamePasswordAuthenticationToken(
                username,
                null,
                authorities
            );

            // Guardar en SecurityContext
            SecurityContextHolder
                .getContext()
                .setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

## Resumen

- **Spring Security** trabaja con `GrantedAuthority`, no con "roles" directamente
- Una **Authority** es cualquier permiso representado como String
- Un **Role** es una Authority con prefijo `ROLE_`
- `GrantedAuthority` es la interfaz, `SimpleGrantedAuthority` es la implementación
- En JWT guardas roles como Strings simples ("ADMIN")
- Al procesar JWT, debes convertir a `GrantedAuthority` con prefijo "ROLE\_"
- `hasRole("ADMIN")` busca automáticamente `ROLE_ADMIN`
- `hasAuthority("ROLE_ADMIN")` busca exactamente ese String
- Los roles viajan en el JWT, se convierten a authorities, y se guardan en Authentication
- `@PreAuthorize` permite autorización granular a nivel de método
