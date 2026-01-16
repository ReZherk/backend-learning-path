# WebClient en Spring WebFlux

## ¿Qué es WebClient?

**WebClient** es el cliente HTTP reactivo de Spring WebFlux. Es la forma moderna y no bloqueante de consumir servicios HTTP en aplicaciones reactivas de Spring.

**Usos principales:**

- Consumir APIs REST externas
- Comunicación entre microservicios
- Operaciones HTTP no bloqueantes (GET, POST, PUT, DELETE, etc.)
- Integración con flujos reactivos de Project Reactor

**Módulo:**

```
spring-webflux
```

**Características:**

- ✔ No bloqueante (asíncrono)
- ✔ Basado en Project Reactor (Mono y Flux)
- ✔ Funcional y fluido
- ✔ Soporta backpressure
- ✔ Mejor escalabilidad que clientes bloqueantes

## ¿Por qué Spring creó WebClient?

Antes de WebClient, Spring usaba principalmente clientes HTTP bloqueantes:

- **RestTemplate** → Bloqueante, basado en Servlet API
- **Feign Client** → Bloqueante por defecto

### Problema de los clientes bloqueantes

**Modelo tradicional (bloqueante):**

```
Request → Hilo asignado → Espera respuesta → Hilo liberado
```

**Problemas:**

- Cada petición HTTP ocupa **un hilo completo**
- El hilo se queda **esperando** la respuesta (I/O blocking)
- Con muchas peticiones concurrentes → **se agotan los hilos del pool**
- Escalabilidad limitada (típicamente ~200 hilos máximo)

**Ejemplo:**

Si tienes 200 hilos disponibles y todas las peticiones están esperando respuestas de APIs lentas, las peticiones 201+ quedan en cola esperando que se libere un hilo.

### Solución: WebClient (no bloqueante)

**Modelo reactivo (no bloqueante):**

```
Request → Event Loop → Suscripción → Notificación cuando completa
```

**Ventajas:**

- ✔ Los hilos **no esperan**
- ✔ Un hilo puede manejar **miles de peticiones**
- ✔ Mejor uso de recursos
- ✔ Mayor escalabilidad
- ✔ Ideal para microservicios con alta concurrencia

👉 WebClient nace para aprovechar la **programación reactiva** y resolver los problemas de escalabilidad.

## Programación bloqueante vs no bloqueante

### Programación bloqueante

Cuando haces una petición HTTP:

- El hilo se **bloquea** esperando la respuesta
- No puede procesar nada más durante ese tiempo
- El hilo está "ocupado" pero realmente está **esperando**

**Analogía:**

> Llamas por teléfono a alguien y te quedas esperando con el teléfono en la oreja hasta que contesten. No puedes hacer nada más mientras esperas.

**Código bloqueante:**

```java
// RestTemplate (bloqueante)
UserDto user = restTemplate.getForObject("http://users-service/api/users/1", UserDto.class);
// El hilo se bloquea aquí esperando la respuesta
System.out.println(user.getName());
```

### Programación no bloqueante (reactiva)

Cuando haces una petición HTTP:

- El hilo **no espera** la respuesta
- Puede seguir procesando otras tareas
- Cuando llega la respuesta → se ejecuta un callback (reacción)

**Analogía:**

> Envías un WhatsApp y sigues con tu vida. Cuando la persona responde, recibes una notificación y reaccionas leyendo el mensaje. No perdiste tiempo esperando.

**Código no bloqueante:**

```java
// WebClient (no bloqueante)
Mono<UserDto> userMono = webClient.get()
    .uri("/api/users/1")
    .retrieve()
    .bodyToMono(UserDto.class);

// El hilo NO se bloquea aquí
// Cuando la respuesta llegue, se ejecutará el callback
userMono.subscribe(user -> System.out.println(user.getName()));
```

## WebClient en Spring WebFlux

Spring WebFlux es un framework reactivo completo que incluye:

- **Event Loop** - Modelo de hilos no bloqueante
- **Project Reactor** - Librería de programación reactiva (Mono, Flux)
- **Programación funcional** - Estilo declarativo de manejo de flujos

**WebClient** es el cliente HTTP oficial para este ecosistema reactivo.

**Stack tecnológico:**

```
WebClient
    ↓
Project Reactor (Mono/Flux)
    ↓
Netty (servidor reactivo por defecto)
    ↓
Event Loop (modelo de hilos)
```

## Anatomía básica de WebClient

### Ejemplo simple

```java
Mono<UserDto> user = webClient.get()
    .uri("/api/users/1")
    .retrieve()
    .bodyToMono(UserDto.class);
```

### Desglose paso a paso

**1. `get()`** - Define el método HTTP

```java
webClient.get()      // GET request
webClient.post()     // POST request
webClient.put()      // PUT request
webClient.delete()   // DELETE request
```

**2. `uri()`** - Define el endpoint

```java
.uri("/api/users/1")                        // URI estática
.uri("/api/users/{id}", userId)             // URI con path variable
.uri(uriBuilder -> uriBuilder               // URI con query params
    .path("/api/users")
    .queryParam("page", 0)
    .build())
```

**3. `retrieve()`** - Ejecuta la petición HTTP

Método simplificado para obtener solo el cuerpo de la respuesta. Si necesitas acceso al status code, headers, etc., usa `exchange()` en su lugar.

**4. `bodyToMono()`** - Convierte la respuesta

```java
.bodyToMono(UserDto.class)   // Un solo objeto
.bodyToFlux(UserDto.class)   // Stream de objetos
```

**5. Retorna un `Mono<UserDto>`**

⚠️ **MUY IMPORTANTE:**

- **NO devuelve el usuario directamente**
- Devuelve una **promesa reactiva** (Mono)
- La petición HTTP **no se ejecuta** hasta que alguien se suscriba al Mono

## Configuración de WebClient

### Opción 1: Configuración inline

```java
WebClient webClient = WebClient.builder()
    .baseUrl("http://users-service:8082")
    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
    .build();
```

### Opción 2: Inyección como Bean (recomendado)

```java
@Component
public class UserServiceClient {

    private final WebClient webClient;

    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("http://users-service:8082")
            .build();
    }

    public Mono<UserDto> getUserById(Long userId) {
        return webClient.get()
            .uri("/api/users/{id}", userId)
            .retrieve()
            .bodyToMono(UserDto.class);
    }
}
```

### ¿Por qué usar WebClient.Builder inyectado?

**Ventajas:**

- ✔ Spring gestiona el ciclo de vida
- ✔ Permite configuración global centralizada
- ✔ Fácil de mockear en tests
- ✔ Puede incluir configuración común (timeouts, headers, filters)

**Ejemplo de configuración global:**

```java
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
            .defaultHeader(HttpHeaders.USER_AGENT, "MyApp/1.0")
            .filter((request, next) -> {
                // Logging, authentication, etc.
                return next.exchange(request);
            });
    }
}
```

## Entendiendo el método getUserById

```java
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

### ¿Qué hace este método?

**En lenguaje natural:**

> "Define una petición GET al servicio de usuarios para obtener el usuario con este ID. Devuelve una promesa (Mono) que cuando se ejecute, contendrá el UserDto."

### Características importantes

**1. No bloquea**

El método retorna inmediatamente con un `Mono<UserDto>`. No espera la respuesta del servidor.

**2. No devuelve `UserDto` directamente**

Devuelve `Mono<UserDto>`, que es un publisher reactivo.

**3. No ejecuta la petición inmediatamente**

La petición HTTP solo se ejecuta cuando alguien se **suscribe** al Mono:

```java
// Define la petición (NO se ejecuta aún)
Mono<UserDto> userMono = userServiceClient.getUserById(1L);

// Ahora SÍ se ejecuta
userMono.subscribe(user -> {
    System.out.println("Usuario: " + user.getName());
});
```

**4. Es composable**

Puedes encadenar operaciones sin ejecutar nada hasta el final:

```java
return userServiceClient.getUserById(userId)
    .map(user -> user.getName())
    .flatMap(name -> otherService.doSomething(name))
    .filter(result -> result.isValid())
    .defaultIfEmpty(fallbackValue);
```

## ¿Qué NO hace WebClient?

Es crucial entender lo que WebClient **NO** hace:

❌ **No espera la respuesta** - Retorna inmediatamente con un Mono/Flux

❌ **No bloquea el hilo** - Usa event loop no bloqueante

❌ **No ejecuta la petición inmediatamente** - Solo cuando hay suscripción

✔ **Define un flujo reactivo** - Describe qué hacer cuando llegue la respuesta

✔ **La ejecución es lazy** - Ocurre solo cuando alguien se suscribe

### Ejemplo de lo que NO debes hacer

```java
// ❌ MAL - Esto NO funciona
public UserDto getUserById(Long userId) {
    Mono<UserDto> mono = webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);

    return mono; // TIPO INCORRECTO - retorna Mono, no UserDto
}
```

```java
// ❌ MAL - Blocking en código reactivo
public UserDto getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class)
        .block(); // BLOQUEA el hilo - pierde el beneficio reactivo
}
```

```java
// ✔ CORRECTO - Mantiene el flujo reactivo
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

## Analogía: Restaurante

### Restaurante tradicional (programación bloqueante)

**Modelo:**

- Un mozo por mesa
- El mozo toma el pedido y va a la cocina
- El mozo **espera en la cocina** hasta que el plato esté listo
- Solo cuando tiene el plato, vuelve a la mesa
- Mientras espera, no puede atender otras mesas

**Problema:**

- Si el plato tarda → mozo inutilizado
- Necesitas muchos mozos para atender muchas mesas
- Recursos limitados por número de mozos

### Restaurante reactivo (programación no bloqueante)

**Modelo:**

- Pocos mozos atienden muchas mesas
- El mozo toma el pedido y lo pasa a la cocina
- El mozo **no espera** - sigue atendiendo otras mesas
- Cocina avisa cuando el plato está listo (evento)
- El mozo entrega el plato y sigue

**Ventajas:**

- Los mozos nunca están esperando
- Más eficiente con menos recursos
- Puede escalar mejor con alta demanda

🧠 **WebClient funciona como el restaurante reactivo** - no espera respuestas, reacciona cuando llegan.

## Manejo de errores en WebClient

WebClient permite manejar errores de forma reactiva:

```java
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .onStatus(HttpStatusCode::is4xxClientError, response -> {
            return Mono.error(new UserNotFoundException("User not found: " + userId));
        })
        .onStatus(HttpStatusCode::is5xxServerError, response -> {
            return Mono.error(new ServiceUnavailableException("Service error"));
        })
        .bodyToMono(UserDto.class)
        .timeout(Duration.ofSeconds(5))
        .retry(3)
        .onErrorResume(error -> {
            // Fallback en caso de error
            return Mono.just(new UserDto(/* default values */));
        });
}
```

## Métodos HTTP comunes con WebClient

### GET

```java
Mono<UserDto> user = webClient.get()
    .uri("/api/users/{id}", userId)
    .retrieve()
    .bodyToMono(UserDto.class);
```

### POST

```java
Mono<UserDto> created = webClient.post()
    .uri("/api/users")
    .contentType(MediaType.APPLICATION_JSON)
    .bodyValue(newUser)
    .retrieve()
    .bodyToMono(UserDto.class);
```

### PUT

```java
Mono<UserDto> updated = webClient.put()
    .uri("/api/users/{id}", userId)
    .bodyValue(updatedUser)
    .retrieve()
    .bodyToMono(UserDto.class);
```

### DELETE

```java
Mono<Void> deleted = webClient.delete()
    .uri("/api/users/{id}", userId)
    .retrieve()
    .bodyToMono(Void.class);
```

## Comparación con RestTemplate

| Aspecto       | RestTemplate                          | WebClient                 |
| ------------- | ------------------------------------- | ------------------------- |
| Modelo        | Bloqueante (síncrono)                 | No bloqueante (asíncrono) |
| Hilos         | Uno por petición                      | Event loop (pocos hilos)  |
| Retorno       | Objeto directamente                   | Mono/Flux (promesa)       |
| Escalabilidad | Limitada (~200 requests concurrentes) | Alta (miles de requests)  |
| API           | Síncrona simple                       | Fluida y funcional        |
| Estado        | Mantenimiento (deprecated)            | Activo y recomendado      |
| Uso           | Aplicaciones legacy                   | Aplicaciones reactivas    |

## Resumen

- **WebClient** es el cliente HTTP reactivo de Spring WebFlux
- Reemplaza a **RestTemplate** en aplicaciones reactivas
- Funciona de forma **no bloqueante** - no espera respuestas
- Basado en **Project Reactor** (Mono/Flux)
- Retorna **promesas reactivas**, no objetos directamente
- La petición HTTP **no se ejecuta hasta que hay suscripción**
- Mejor **escalabilidad** que clientes bloqueantes
- Permite **composición** de operaciones reactivas
- Manejo de errores **reactivo** y declarativo
- **No usar `.block()`** en código reactivo - pierde el beneficio
