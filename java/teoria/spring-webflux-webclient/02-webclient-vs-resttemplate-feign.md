# WebClient vs RestTemplate vs Feign

## Comunicación entre microservicios

En arquitecturas de microservicios, los servicios frecuentemente necesitan:

- Llamar a otros servicios (comunicación síncrona)
- Obtener o enviar datos
- Esperar respuestas
- Manejar errores de red

Spring ofrece **tres clientes HTTP principales** para esto:

1. **RestTemplate** - Cliente tradicional bloqueante
2. **Feign Client** - Cliente declarativo bloqueante
3. **WebClient** - Cliente reactivo no bloqueante

La elección correcta depende de la arquitectura, escala y modelo de programación de tu aplicación.

## RestTemplate (modelo tradicional bloqueante)

### ¿Qué es RestTemplate?

`RestTemplate` es el cliente HTTP tradicional de Spring, introducido en Spring 3.0. Proporciona una API síncrona y bloqueante para realizar peticiones HTTP.

**Estado actual:** Deprecated desde Spring 5 (en modo mantenimiento).

### Características

- **Bloqueante** - El hilo espera hasta recibir la respuesta completa
- **Síncrono** - Retorna el resultado directamente
- **Imperativo** - Estilo de programación tradicional
- **1 hilo por petición** - Modelo de threading tradicional
- **API simple** - Fácil de entender para principiantes

### Ejemplo de uso

```java
@Service
public class UserService {

    private final RestTemplate restTemplate;

    public UserService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public UserDto getUserById(Long userId) {
        String url = "http://users-service/api/users/{id}";

        // Petición bloqueante - el hilo espera aquí
        UserDto user = restTemplate.getForObject(url, UserDto.class, userId);

        return user; // Retorna directamente el objeto
    }

    public UserDto createUser(UserDto newUser) {
        String url = "http://users-service/api/users";

        return restTemplate.postForObject(url, newUser, UserDto.class);
    }

    public void deleteUser(Long userId) {
        String url = "http://users-service/api/users/{id}";

        restTemplate.delete(url, userId);
    }
}
```

### Ventajas

- ✔ Fácil de entender y usar
- ✔ Código secuencial simple
- ✔ No requiere aprender programación reactiva
- ✔ Ampliamente documentado (muchos recursos online)

### Desventajas

- ❌ **Bloqueante** - Desperdicia recursos del hilo
- ❌ **Deprecated** - No recibirá nuevas funcionalidades
- ❌ **Mala escalabilidad** - Limitado por el pool de hilos
- ❌ **No compatible con WebFlux** - No funciona bien en aplicaciones reactivas
- ❌ **Alto consumo de memoria** - Un hilo por petición

### Modelo de ejecución

```
Request → Hilo asignado → HTTP call → Espera bloqueada → Response → Hilo liberado
```

**Problema:** Si tienes 200 hilos y 200 peticiones lentas, la petición 201 debe esperar.

### Analogía

> Llamas por teléfono a un amigo y te quedas con el teléfono en la oreja esperando hasta que conteste. No puedes hacer nada más mientras esperas.

### ¿Cuándo usar RestTemplate?

**Usa RestTemplate solo si:**

- Mantienes una aplicación legacy de Spring MVC
- Muy baja concurrencia (< 50 peticiones simultáneas)
- No planeas migrar a WebFlux
- El equipo no está familiarizado con programación reactiva

**Recomendación:** Migrar a WebClient cuando sea posible.

## Feign Client (modelo declarativo bloqueante)

### ¿Qué es Feign Client?

**Feign** es una librería declarativa de Netflix (parte de Spring Cloud) que permite definir clientes HTTP como interfaces. El código de implementación se genera automáticamente.

### Características

- **Declarativo** - Defines interfaces, no implementaciones
- **Bloqueante** - Usa RestTemplate o HttpClient internamente
- **Limpio** - Código muy legible
- **Integración con Spring Cloud** - Funciona bien con Eureka, Ribbon, etc.
- **Anotaciones de Spring MVC** - Usa las mismas anotaciones que los controllers

### Ejemplo de uso

```java
@FeignClient(name = "users-service", url = "http://users-service:8082")
public interface UserFeignClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long userId);

    @PostMapping("/api/users")
    UserDto createUser(@RequestBody UserDto user);

    @PutMapping("/api/users/{id}")
    UserDto updateUser(@PathVariable("id") Long userId, @RequestBody UserDto user);

    @DeleteMapping("/api/users/{id}")
    void deleteUser(@PathVariable("id") Long userId);
}
```

**Uso en servicio:**

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserFeignClient userClient;

    public void authenticate(String username, String password) {
        // Llamada bloqueante pero con código muy limpio
        UserDto user = userClient.getUserById(123L);

        // Lógica de autenticación...
    }
}
```

### Configuración

```java
@Configuration
public class FeignConfig {

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            template.header("User-Agent", "MyApp/1.0");
            // Agregar headers, autenticación, etc.
        };
    }
}
```

### Ventajas

- ✔ **Código muy limpio** - Interfaces declarativas
- ✔ **Fácil de mantener** - Cambios centralizados
- ✔ **Integración con Spring Cloud** - Service discovery, load balancing
- ✔ **Menos código boilerplate** - No repetir configuración HTTP
- ✔ **Fácil de mockear** - En tests unitarios

### Desventajas

- ❌ **Bloqueante** - No aprovecha modelo reactivo
- ❌ **No compatible con WebFlux** nativamente
- ❌ **Un hilo por petición** - Mismo problema que RestTemplate
- ❌ **Escalabilidad limitada** - Para alta concurrencia
- ❌ **Curva de aprendizaje** - Configuración puede ser compleja

### Modelo de ejecución

```
Interface call → Proxy dinámico → RestTemplate/HttpClient → Petición bloqueante → Response
```

Internamente sigue usando clientes bloqueantes.

### Analogía

> Le pides a una secretaria que haga la llamada telefónica por ti. Ella te entrega el resultado cuando termina. Tú sigues esperando mientras tanto.

### ¿Cuándo usar Feign Client?

**Usa Feign si:**

- Arquitectura de microservicios Spring Cloud tradicional
- Prefieres código declarativo y limpio
- Usas Spring MVC (no WebFlux)
- Necesitas integración con Eureka, Ribbon
- Concurrencia moderada

**No uses Feign si:**

- Estás usando WebFlux
- Necesitas alta escalabilidad
- Quieres aprovechar programación reactiva

## WebClient (modelo reactivo no bloqueante)

Para información detallada sobre WebClient, ver: [WebClient en Spring WebFlux](./webclient_spring_webflux.md)

### ¿Qué es WebClient?

**WebClient** es el cliente HTTP reactivo de Spring WebFlux. Es la evolución moderna de RestTemplate, diseñado para aplicaciones reactivas no bloqueantes.

### Características

- **Reactivo** - Basado en Project Reactor
- **No bloqueante** - No espera respuestas
- **Event Loop** - Modelo de hilos eficiente
- **Funcional** - API fluida y composable
- **Muy escalable** - Miles de peticiones concurrentes
- **Compatible con WebFlux** - Cliente oficial del stack reactivo

### Ejemplo de uso

```java
@Component
public class UserServiceClient {

    private final WebClient webClient;

    public UserServiceClient(WebClient.Builder builder) {
        this.webClient = builder
            .baseUrl("http://users-service:8082")
            .build();
    }

    public Mono<UserDto> getUserById(Long userId) {
        return webClient.get()
            .uri("/api/users/{id}", userId)
            .retrieve()
            .bodyToMono(UserDto.class);
    }

    public Mono<UserDto> createUser(UserDto newUser) {
        return webClient.post()
            .uri("/api/users")
            .bodyValue(newUser)
            .retrieve()
            .bodyToMono(UserDto.class);
    }

    public Flux<UserDto> getAllUsers() {
        return webClient.get()
            .uri("/api/users")
            .retrieve()
            .bodyToFlux(UserDto.class);
    }

    public Mono<Void> deleteUser(Long userId) {
        return webClient.delete()
            .uri("/api/users/{id}", userId)
            .retrieve()
            .bodyToMono(Void.class);
    }
}
```

### Ventajas

- ✔ **No bloqueante** - Mejor uso de recursos
- ✔ **Muy escalable** - Miles de peticiones con pocos hilos
- ✔ **Composable** - Fácil encadenar operaciones
- ✔ **Cliente oficial de WebFlux** - Recomendado por Spring
- ✔ **Manejo de backpressure** - Control de flujo de datos
- ✔ **API moderna** - Funcional y fluida

### Desventajas

- ❌ **Curva de aprendizaje** - Requiere entender programación reactiva
- ❌ **Más complejo** - No tan intuitivo como código imperativo
- ❌ **Debugging más difícil** - Stack traces reactivos complejos
- ❌ **Cambio de mentalidad** - Del estilo imperativo al declarativo

### Modelo de ejecución

```
Request → Mono/Flux → Suscripción → Event Loop → Callback cuando completa
```

**Ventaja:** Los hilos nunca esperan, pueden procesar miles de operaciones.

### Analogía

> Envías un WhatsApp y sigues con tu vida. Cuando te responden, recibes una notificación y reaccionas. No perdiste tiempo esperando.

### ¿Cuándo usar WebClient?

**Usa WebClient si:**

- Aplicación Spring WebFlux
- Arquitectura de microservicios moderna
- Alta concurrencia (> 1000 peticiones simultáneas)
- Quieres aprovechar programación reactiva
- Sistema que requiere alta escalabilidad

**Recomendación:** WebClient es la opción predeterminada para nuevos proyectos.

## Comparación completa

### Tabla comparativa

| Característica         | RestTemplate        | Feign Client        | WebClient   |
| ---------------------- | ------------------- | ------------------- | ----------- |
| **Modelo**             | Bloqueante          | Bloqueante          | Reactivo    |
| **Estilo de código**   | Imperativo          | Declarativo         | Funcional   |
| **Tipo de retorno**    | Objeto directamente | Objeto directamente | Mono/Flux   |
| **Threads**            | 1 por petición      | 1 por petición      | Event Loop  |
| **Escalabilidad**      | Baja-Media          | Baja-Media          | Alta        |
| **Compatible WebFlux** | ❌                  | ❌                  | ✅          |
| **Estado**             | Deprecated          | Activo              | Recomendado |
| **Curva aprendizaje**  | Baja                | Media               | Alta        |
| **Código boilerplate** | Alto                | Bajo                | Medio       |
| **Debugging**          | Fácil               | Fácil               | Difícil     |
| **Backpressure**       | ❌                  | ❌                  | ✅          |
| **Composición**        | Difícil             | Difícil             | Fácil       |

### Rendimiento comparativo

**Escenario: 1000 peticiones concurrentes**

| Cliente      | Hilos necesarios | Memoria | Tiempo respuesta |
| ------------ | ---------------- | ------- | ---------------- |
| RestTemplate | ~1000            | Alto    | Variable         |
| Feign        | ~1000            | Alto    | Variable         |
| WebClient    | ~20              | Bajo    | Consistente      |

## Error común: Mezclar modelos

### Problema: Bloquear WebClient

```java
// ❌ MAL - Rompe el modelo reactivo
public UserDto getUserById(Long userId) {
    Mono<UserDto> userMono = webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);

    // block() convierte reactivo en bloqueante
    return userMono.block(); // ❌ Pierde todas las ventajas
}
```

**Problemas:**

- Bloquea el hilo (elimina ventaja reactiva)
- Puede causar deadlocks en WebFlux
- Consume más recursos que RestTemplate
- Peor rendimiento que código bloqueante nativo

### Solución: Mantener el flujo reactivo

```java
// ✔ CORRECTO - Mantiene modelo reactivo
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

**Beneficios:**

- No bloquea hilos
- Composable con otras operaciones
- Aprovecha event loop
- Escalable

## Cambio de mentalidad: Imperativo vs Reactivo

### Pensamiento imperativo (RestTemplate/Feign)

**Mentalidad:**

> "Dame el usuario AHORA y espero hasta que llegue"

**Código:**

```java
UserDto user = getUserById(1L);
String name = user.getName();
System.out.println(name);
```

**Flujo:**

```
Llamar → Esperar → Obtener → Usar
```

### Pensamiento reactivo (WebClient)

**Mentalidad:**

> "CUANDO el usuario llegue, haz algo con él"

**Código:**

```java
Mono<String> nameMono = getUserById(1L)
    .map(user -> user.getName())
    .doOnNext(name -> System.out.println(name));
```

**Flujo:**

```
Definir pipeline → Suscribirse → Reaccionar cuando llegue
```

### Composición reactiva

```java
// Obtener usuario, luego sus pedidos, luego calcular total
public Mono<BigDecimal> getUserOrdersTotal(Long userId) {
    return getUserById(userId)                           // Mono<UserDto>
        .flatMap(user -> getOrdersByUserId(user.getId())) // Mono<List<Order>>
        .map(orders -> calculateTotal(orders))            // Mono<BigDecimal>
        .defaultIfEmpty(BigDecimal.ZERO);                // Fallback si vacío
}
```

**Ventaja:** Todo es no bloqueante, composable y eficiente.

## Escenarios de uso reales

### Escenario 1: Sistema con baja concurrencia

**Contexto:** Aplicación interna con < 50 usuarios simultáneos

**Recomendación:** RestTemplate o Feign

**Razón:** Simplicidad sobre escalabilidad

### Escenario 2: API pública con tráfico moderado

**Contexto:** API REST con 100-500 requests/segundo

**Recomendación:** Feign (si Spring MVC) o WebClient (si WebFlux)

**Razón:** Balance entre simplicidad y rendimiento

### Escenario 3: Sistema de alta concurrencia

**Contexto:** Microservicios con > 1000 requests/segundo

**Recomendación:** WebClient con WebFlux

**Razón:** Escalabilidad y eficiencia de recursos

### Escenario 4: Sistema de streaming/real-time

**Contexto:** Chat, notificaciones push, SSE

**Recomendación:** WebClient con WebFlux

**Razón:** Solo el stack reactivo soporta esto eficientemente

## Migración entre clientes

### De RestTemplate a WebClient

**Antes:**

```java
public UserDto getUser(Long id) {
    return restTemplate.getForObject("/users/{id}", UserDto.class, id);
}
```

**Después:**

```java
public Mono<UserDto> getUser(Long id) {
    return webClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

**Cambios necesarios:**

- Cambiar tipo de retorno a `Mono<T>` o `Flux<T>`
- Actualizar código que llama este método
- Manejar suscripciones correctamente

### De Feign a WebClient

**Antes:**

```java
@FeignClient(name = "users-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    UserDto getUser(@PathVariable Long id);
}
```

**Después:**

```java
@Component
public class UserClient {
    private final WebClient webClient;

    public Mono<UserDto> getUser(Long id) {
        return webClient.get()
            .uri("/api/users/{id}", id)
            .retrieve()
            .bodyToMono(UserDto.class);
    }
}
```

## Resumen y recomendaciones

### Guía rápida de selección

**Proyectos nuevos:**

- **WebFlux** → WebClient (100% recomendado)
- **Spring MVC** → Feign o WebClient

**Proyectos existentes:**

- **Legacy Spring MVC** → Mantener RestTemplate o migrar a Feign
- **Spring MVC moderno** → Feign o comenzar migración a WebClient
- **Ya usando WebFlux** → WebClient exclusivamente

### Puntos clave

- **RestTemplate** está deprecated - solo para legacy
- **Feign** es excelente para Spring MVC con código limpio
- **WebClient** es el futuro - reactivo, escalable, recomendado
- No bloquees WebClient con `.block()` - pierde el propósito
- La programación reactiva requiere cambio de mentalidad
- WebClient escala mucho mejor con alta concurrencia

### Combinaciones válidas

| Stack                     | Cliente HTTP | ¿Válido?          |
| ------------------------- | ------------ | ----------------- |
| Spring MVC + RestTemplate | RestTemplate | ⚠️ Deprecated     |
| Spring MVC + Feign        | Feign        | ✅ Recomendado    |
| Spring MVC + WebClient    | WebClient    | ✅ Posible        |
| WebFlux + RestTemplate    | RestTemplate | ❌ No compatible  |
| WebFlux + Feign           | Feign        | ❌ No recomendado |
| WebFlux + WebClient       | WebClient    | ✅ Recomendado    |
