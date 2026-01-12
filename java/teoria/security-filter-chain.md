# SecurityFilterChain en Spring Security

## Concepto fundamental

👉 **Spring Security NO es magia**

Spring Security funciona mediante una **cadena ordenada de filtros** que interceptan y procesan cada petición HTTP antes de que llegue a tu aplicación.

**Nombre literal de esta cadena:**

```java
SecurityFilterChain
```

## ¿Qué es SecurityFilterChain?

`SecurityFilterChain` es una interfaz que define una cadena de filtros de seguridad que se aplican a las peticiones HTTP. Es el componente central de Spring Security que determina qué filtros se ejecutan y en qué orden.

**Función principal:**

- Define qué filtros se aplican a qué peticiones
- Establece el orden de ejecución de los filtros
- Configura las reglas de seguridad de la aplicación

## ¿Qué es una Filter Chain?

Una **Filter Chain** (cadena de filtros) es una lista ordenada de filtros que se ejecutan secuencialmente para procesar una petición HTTP.

**Flujo:**

```
Filtro 1 → Filtro 2 → Filtro 3 → ... → Controller
```

**Cada filtro puede:**

- ✔ Continuar al siguiente filtro (`filterChain.doFilter()`)
- ❌ Detener el request y retornar una respuesta (sin llamar a `doFilter()`)
- ⚙️ Modificar el request o response
- 🔒 Validar autenticación o autorización

📌 Si un filtro decide que el request no debe continuar, la cadena se detiene y nunca llega al Controller.

## Flujo completo de una petición

```
1. HTTP Request entra a la aplicación
    ↓
2. SecurityFilterChain intercepta
    ↓
3. Filtros de Authentication (validar identidad)
    ↓
4. Filtros de Authorization (validar permisos)
    ↓
5. Otros filtros de seguridad
    ↓
6. Controller (solo si pasó todas las validaciones)
```

📌 **Si fallas seguridad en cualquier filtro, no llegas al Controller**

## ¿Dónde se define la SecurityFilterChain?

Se define en una clase de configuración de seguridad mediante un método anotado con `@Bean`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Aquí configuras toda la seguridad
        return http.build();
    }
}
```

📌 Aquí se arma toda la configuración de seguridad de tu aplicación
📌 Defines qué filtros usar y en qué orden
📌 Estableces las reglas de autorización

## Filtros importantes de Spring Security

Spring Security tiene muchos filtros predefinidos. Estos son algunos de los más importantes:

| Filtro                                 | Función                             | Cuándo se ejecuta                   |
| -------------------------------------- | ----------------------------------- | ----------------------------------- |
| `SecurityContextHolderFilter`          | Prepara y limpia el SecurityContext | Al inicio y al final                |
| `CsrfFilter`                           | Valida tokens CSRF                  | Si CSRF está habilitado             |
| `UsernamePasswordAuthenticationFilter` | Procesa login tradicional (form)    | Cuando hay POST a `/login`          |
| `BasicAuthenticationFilter`            | Procesa Basic Authentication        | Si hay header Authorization: Basic  |
| `BearerTokenAuthenticationFilter`      | Procesa Bearer tokens (OAuth2)      | Si hay header Authorization: Bearer |
| `AuthorizationFilter`                  | Valida permisos y roles             | Antes del Controller                |
| `ExceptionTranslationFilter`           | Maneja excepciones de seguridad     | Envuelve otros filtros              |
| **`JwtAuthenticationFilter`**          | **Token JWT (tú lo creas)**         | **Customizado**                     |

### Orden típico de filtros

```
SecurityContextHolderFilter
    ↓
CsrfFilter (si está habilitado)
    ↓
JwtAuthenticationFilter (tu filtro custom)
    ↓
UsernamePasswordAuthenticationFilter
    ↓
ExceptionTranslationFilter
    ↓
AuthorizationFilter
    ↓
Controller
```

## ¿Dónde va el JwtAuthenticationFilter?

👉 **ANTES** de que Spring intente autorizar el request.

El `JwtAuthenticationFilter` debe insertarse **antes** del `UsernamePasswordAuthenticationFilter` para que:

1. Extraiga y valide el JWT
2. Cree el objeto `Authentication`
3. Lo guarde en `SecurityContext`
4. Los filtros de autorización puedan usarlo

**Código:**

```java
http.addFilterBefore(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

📌 **Si no va antes:**

- ❌ Spring no conoce al usuario cuando ejecuta filtros de autorización
- ❌ Authorization falla porque no hay Authentication en el contexto
- ❌ Todos los requests retornan 401 Unauthorized

## Ejemplo completo de configuración

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF (no necesario en APIs REST stateless)
            .csrf(csrf -> csrf.disable())

            // Configurar gestión de sesiones como STATELESS (sin sesiones)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configurar reglas de autorización
            .authorizeHttpRequests(auth -> auth
                // Permitir acceso público a endpoints de autenticación
                .requestMatchers("/auth/**", "/public/**").permitAll()

                // Solo usuarios con ROLE_ADMIN
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Usuarios con ROLE_USER o ROLE_ADMIN
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")

                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )

            // Agregar JWT filter ANTES del filtro de autenticación estándar
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
```

### Desglose de la configuración

**1. CSRF Disabled**

```java
.csrf(csrf -> csrf.disable())
```

- CSRF (Cross-Site Request Forgery) es un ataque donde un sitio malicioso envía requests en nombre del usuario
- En APIs REST stateless con JWT no es necesario porque no usamos cookies de sesión
- Si usaras cookies, deberías mantener CSRF habilitado

**2. Session Management STATELESS**

```java
.sessionManagement(session ->
    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
)
```

- Le dice a Spring que NO cree ni use sesiones HTTP
- Cada request es independiente
- Perfecto para arquitecturas con JWT

**3. Authorization Rules**

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .anyRequest().authenticated()
)
```

- Define qué endpoints requieren autenticación/autorización
- Se evalúan en orden (primera coincidencia gana)
- `permitAll()` permite acceso sin autenticación
- `authenticated()` requiere estar autenticado
- `hasRole()` requiere un rol específico

**4. Add JWT Filter**

```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

- Inserta tu filtro JWT en la posición correcta
- DEBE ir antes de los filtros de autorización

## Flujo request por request

Veamos qué sucede con cada petición HTTP:

```
1. Llega HTTP Request
    ↓
2. Entra a SecurityFilterChain
    ↓
3. SecurityContextHolderFilter prepara el contexto
    ↓
4. JwtAuthenticationFilter (tu filtro)
   - Extrae token del header Authorization
   - Valida el JWT
   - Crea objeto Authentication
   - Guarda en SecurityContext
    ↓
5. ExceptionTranslationFilter (envuelve los siguientes)
    ↓
6. AuthorizationFilter
   - Verifica roles/permisos del Authentication
   - Compara con reglas definidas en authorizeHttpRequests
    ↓
7. Controller se ejecuta (si todo pasó)
    ↓
8. SecurityContextHolderFilter limpia el contexto
```

## ¿Qué pasa si el JWT es inválido?

**En el JwtAuthenticationFilter:**

```java
if (token == null || !jwtService.isValid(token)) {
    // NO crear Authentication
    // NO llamar a SecurityContextHolder.setAuthentication()
    filterChain.doFilter(request, response); // Continuar sin autenticar
    return;
}
```

**Resultado:**

1. No se crea objeto `Authentication`
2. Spring ve al usuario como **anónimo**
3. `AuthorizationFilter` verifica permisos
4. Como el endpoint requiere autenticación pero el usuario es anónimo
5. Spring lanza `AccessDeniedException`
6. `ExceptionTranslationFilter` la captura
7. Retorna **401 Unauthorized** o **403 Forbidden**
8. **El Controller nunca se ejecuta**

## Errores comunes

### Error 1: Agregar el filtro después

```java
// ❌ MAL - El filtro va después
http.addFilterAfter(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

**Problema:**

- Spring ya intentó autenticar/autorizar sin el JWT
- El SecurityContext estará vacío cuando se necesite
- Authorization fallará antes de que tu filtro se ejecute

**✔ Correcto:**

```java
http.addFilterBefore(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

### Error 2: No registrar el filtro como Bean

```java
// ❌ MAL - El filtro no es un Bean
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http.addFilterBefore(
            new JwtAuthenticationFilter(), // Instancia directa
            UsernamePasswordAuthenticationFilter.class
        );
        return http.build();
    }
}
```

**Problema:**

- Spring no puede inyectar dependencias en el filtro
- No hay control del ciclo de vida
- Puede causar errores si el filtro necesita otros Beans

**✔ Correcto:**

```java
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // Inyectado

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http.addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );
        return http.build();
    }
}
```

### Error 3: No continuar la cadena en el filtro

```java
// ❌ MAL - No llama a doFilter
@Override
protected void doFilterInternal(...) {
    if (isValidJwt(token)) {
        Authentication auth = createAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    // Falta: filterChain.doFilter(request, response);
}
```

**Problema:**

- La cadena de filtros se detiene
- Nunca llega al Controller
- El request queda colgado

**✔ Correcto:**

```java
@Override
protected void doFilterInternal(...) {
    if (isValidJwt(token)) {
        Authentication auth = createAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    filterChain.doFilter(request, response); // SIEMPRE continuar
}
```

### Error 4: Olvidar configurar SessionCreationPolicy

```java
// ❌ MAL - Falta configurar sesión como STATELESS
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

**Problema:**

- Spring puede intentar crear sesiones HTTP
- Contradice la arquitectura stateless de JWT
- Puede causar comportamientos inesperados

**✔ Correcto:**

```java
http
    .sessionManagement(session ->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    )
```

## Depuración: Ver qué filtros se ejecutan

Para ver la cadena completa de filtros en logs:

```yaml
# application.yml
logging:
  level:
    org.springframework.security: DEBUG
```

Verás algo como:

```
Security filter chain: [
  SecurityContextHolderFilter
  CsrfFilter
  JwtAuthenticationFilter
  UsernamePasswordAuthenticationFilter
  ExceptionTranslationFilter
  AuthorizationFilter
]
```

## Resumen

- **SecurityFilterChain** es una cadena ordenada de filtros que procesan las peticiones HTTP
- Cada filtro puede continuar, detener, o modificar el request/response
- El **orden importa** - los filtros se ejecutan secuencialmente
- **JwtAuthenticationFilter** debe ir **antes** de los filtros de autorización
- Se configura mediante el Bean `securityFilterChain()` usando `HttpSecurity`
- Si la autenticación/autorización falla, el Controller nunca se ejecuta
- APIs REST con JWT típicamente usan: CSRF disabled, SessionCreationPolicy.STATELESS
- Los filtros transforman el JWT en un objeto `Authentication` que Spring usa para autorización
- **Siempre** llama a `filterChain.doFilter()` al final de tu filtro custom
