# Mono y Flux - Project Reactor

## ¿Qué es Project Reactor?

**Project Reactor** es una librería de programación reactiva para la JVM que implementa la especificación **Reactive Streams**. Es la base sobre la que se construye Spring WebFlux y proporciona los tipos fundamentales para trabajar con flujos de datos asíncronos y no bloqueantes.

**Características principales:**

- Implementa la especificación Reactive Streams
- Proporciona backpressure (control de flujo)
- No bloqueante y asíncrono
- Basado en eventos
- Eficiente en el uso de recursos

**Tipos principales:**

- `Mono<T>` - Publisher de 0 o 1 elemento
- `Flux<T>` - Publisher de 0 a N elementos

**Relación con WebFlux:**

```
Spring WebFlux
    ↓
Project Reactor (Mono/Flux)
    ↓
Reactive Streams (especificación)
    ↓
Event Loop (Netty por defecto)
```

## ¿Qué es un Publisher?

En la especificación Reactive Streams, un **Publisher** es un proveedor de una secuencia potencialmente ilimitada de elementos, proporcionándolos de acuerdo con la demanda recibida de sus Subscribers.

**Características de un Publisher:**

- **Publica datos** cuando están disponibles
- **No bloquea** - Emite datos de forma asíncrona
- **Soporta backpressure** - El subscriber controla el ritmo de emisión
- **Lazy** - No hace nada hasta que alguien se suscribe

📌 Tanto `Mono` como `Flux` son implementaciones de `Publisher`.

**Interfaz básica:**

```java
public interface Publisher<T> {
    void subscribe(Subscriber<? super T> subscriber);
}
```

## Mono<T>

### ¿Qué es Mono?

`Mono<T>` es un Publisher especializado que emite **como máximo un elemento** o un error.

**Semántica:**

- **0 elementos** - Vacío (empty)
- **1 elemento** - Valor exitoso
- **Error** - Señal de error

**Casos de uso comunes:**

- Buscar un registro por ID (puede existir o no)
- Resultado de una operación HTTP que retorna un objeto
- Login/autenticación (retorna usuario o falla)
- Operaciones de guardado/actualización
- Cualquier operación que retorna un único resultado

### Creación de Mono

#### Mono con valor

```java
Mono<String> mono = Mono.just("Hola");
```

**Significado:**

> "Tengo un valor disponible. Cuando alguien se suscriba, se lo entregaré."

#### Mono vacío

```java
Mono<String> empty = Mono.empty();
```

**Uso:** Cuando una operación no encuentra resultados pero no es un error.

#### Mono con error

```java
Mono<String> error = Mono.error(new RuntimeException("Error"));
```

**Uso:** Para señalar que algo salió mal.

#### Mono desde Supplier

```java
Mono<String> mono = Mono.fromSupplier(() -> {
    // Lógica que se ejecuta cuando hay suscripción
    return "Valor calculado";
});
```

**Ventaja:** La lógica se ejecuta solo cuando alguien se suscribe (lazy).

#### Mono desde Callable

```java
Mono<String> mono = Mono.fromCallable(() -> {
    // Puede lanzar excepciones
    return someBlockingOperation();
});
```

### Ejemplo con WebClient

```java
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/api/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

**Importante:**

- **NO retorna el usuario directamente**
- Retorna una **promesa reactiva** (`Mono<UserDto>`)
- La petición HTTP no se ejecuta hasta que hay suscripción
- Es composable con otros Mono/Flux

### Uso en Controllers

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public Mono<UserDto> getUser(@PathVariable Long id) {
        // Spring WebFlux se suscribe automáticamente
        return userService.getUserById(id);
    }
}
```

**Spring WebFlux:**

- Se suscribe automáticamente al Mono
- Espera la emisión del valor
- Serializa el resultado a JSON
- Envía la respuesta HTTP

## Flux<T>

### ¿Qué es Flux?

`Flux<T>` es un Publisher que emite **0 a N elementos**, seguido opcionalmente de una señal de completado o error.

**Semántica:**

- **0 elementos** - Vacío (empty)
- **1+ elementos** - Stream de valores
- **Completado** - Señal de que no habrá más elementos
- **Error** - Señal de error

**Casos de uso comunes:**

- Listar registros de una base de datos
- Stream de eventos en tiempo real
- WebSockets
- Server-Sent Events (SSE)
- Procesar archivos línea por línea
- Cualquier operación que retorna múltiples resultados

### Creación de Flux

#### Flux con valores

```java
Flux<Integer> flux = Flux.just(1, 2, 3, 4, 5);
```

**Significado:**

> "Tengo varios valores. Los emitiré uno por uno cuando alguien se suscriba."

#### Flux desde array

```java
String[] array = {"A", "B", "C"};
Flux<String> flux = Flux.fromArray(array);
```

#### Flux desde lista

```java
List<String> list = Arrays.asList("A", "B", "C");
Flux<String> flux = Flux.fromIterable(list);
```

#### Flux vacío

```java
Flux<String> empty = Flux.empty();
```

#### Flux con error

```java
Flux<String> error = Flux.error(new RuntimeException("Error"));
```

#### Flux con rango

```java
Flux<Integer> range = Flux.range(1, 10); // 1, 2, 3, ..., 10
```

#### Flux infinito con intervalo

```java
Flux<Long> interval = Flux.interval(Duration.ofSeconds(1)); // 0, 1, 2, 3...
```

**Uso:** Eventos periódicos, polling, heartbeats.

### Ejemplo con WebClient

```java
public Flux<UserDto> getAllUsers() {
    return webClient.get()
        .uri("/api/users")
        .retrieve()
        .bodyToFlux(UserDto.class);
}
```

**Comportamiento:**

- Retorna un stream de usuarios
- Los emite conforme llegan del servidor
- No espera a tener todos para empezar a emitir

### Uso en Controllers

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public Flux<UserDto> getAllUsers() {
        // Spring WebFlux se suscribe automáticamente
        return userService.getAllUsers();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<UserDto> streamUsers() {
        // Server-Sent Events - envía usuarios conforme llegan
        return userService.getAllUsers();
    }
}
```

## Mono vs Flux

### Diferencias clave

| Aspecto        | Mono<T>       | Flux<T>                              |
| -------------- | ------------- | ------------------------------------ |
| **Elementos**  | 0 o 1         | 0 a N                                |
| **Uso típico** | Objeto único  | Lista/Stream                         |
| **Ejemplo**    | getUserById() | getAllUsers()                        |
| **Conversión** | `flux.next()` | `mono.flux()`                        |
| **Colección**  | N/A           | `flux.collectList()` → Mono<List<T>> |

### Cuándo usar cada uno

| Situación                          | Usa  |
| ---------------------------------- | ---- |
| Buscar un registro por ID          | Mono |
| Listar todos los registros         | Flux |
| Operación que retorna objeto único | Mono |
| Stream de eventos                  | Flux |
| Respuesta HTTP de objeto único     | Mono |
| Respuesta HTTP de array            | Flux |
| Resultado opcional                 | Mono |
| Stream continuo (WebSocket, SSE)   | Flux |

### Conversión entre Mono y Flux

#### De Flux a Mono

```java
Flux<String> flux = Flux.just("A", "B", "C");

// Tomar solo el primer elemento
Mono<String> mono = flux.next(); // "A"

// Convertir todo el Flux a una Lista en un Mono
Mono<List<String>> listMono = flux.collectList(); // ["A", "B", "C"]
```

#### De Mono a Flux

```java
Mono<String> mono = Mono.just("A");

// Convertir a Flux
Flux<String> flux = mono.flux(); // Flux con un elemento
```

## Operadores reactivos

Los operadores permiten transformar, combinar y manipular flujos reactivos.

### map - Transformación síncrona

Transforma cada elemento emitido.

```java
Mono<String> mono = Mono.just("patrick");
Mono<String> upperMono = mono.map(name -> name.toUpperCase()); // "PATRICK"
```

```java
Flux<Integer> numbers = Flux.just(1, 2, 3);
Flux<Integer> doubled = numbers.map(n -> n * 2); // 2, 4, 6
```

**Uso:** Transformaciones simples que no requieren operaciones asíncronas.

### flatMap - Transformación asíncrona

Cuando la transformación retorna otro Mono/Flux.

```java
Mono<User> userMono = getUserById(1L);
Mono<Order> orderMono = userMono.flatMap(user ->
    getOrderByUserId(user.getId())
);
```

**Uso:** Encadenar operaciones asíncronas dependientes.

```java
Flux<User> users = Flux.just(user1, user2);
Flux<Order> orders = users.flatMap(user ->
    getOrdersByUserId(user.getId())
); // Aplanar todos los pedidos en un solo Flux
```

### filter - Filtrado

Filtra elementos que cumplen una condición.

```java
Flux<User> users = getAllUsers();
Flux<User> activeUsers = users.filter(user -> user.isActive());
```

### take - Limitar elementos

```java
Flux<Integer> numbers = Flux.range(1, 100);
Flux<Integer> first10 = numbers.take(10); // Solo los primeros 10
```

### skip - Saltar elementos

```java
Flux<Integer> numbers = Flux.range(1, 100);
Flux<Integer> after10 = numbers.skip(10); // Saltea los primeros 10
```

### collectList - Flux a Mono<List>

```java
Flux<User> users = getAllUsers();
Mono<List<User>> userList = users.collectList();
```

**Importante:** Acumula todos los elementos en memoria.

### defaultIfEmpty - Valor por defecto

```java
Mono<User> user = getUserById(999L)
    .defaultIfEmpty(new User("Guest"));
```

### switchIfEmpty - Alternativa reactiva

```java
Mono<User> user = getUserById(999L)
    .switchIfEmpty(createDefaultUser());
```

**Diferencia con defaultIfEmpty:** Ejecuta un Mono alternativo.

### zip - Combinar múltiples publishers

```java
Mono<User> user = getUserById(1L);
Mono<Order> order = getOrderById(100L);

Mono<UserWithOrder> combined = Mono.zip(user, order, (u, o) ->
    new UserWithOrder(u, o)
);
```

### merge - Combinar Flux intercalando

```java
Flux<String> flux1 = Flux.just("A", "B");
Flux<String> flux2 = Flux.just("1", "2");

Flux<String> merged = Flux.merge(flux1, flux2); // A, 1, B, 2 (orden puede variar)
```

### concat - Combinar Flux secuencialmente

```java
Flux<String> flux1 = Flux.just("A", "B");
Flux<String> flux2 = Flux.just("1", "2");

Flux<String> concatenated = Flux.concat(flux1, flux2); // A, B, 1, 2
```

### doOnNext - Efectos secundarios

```java
Flux<User> users = getAllUsers()
    .doOnNext(user -> log.info("Processing user: {}", user.getName()))
    .map(user -> user.getName());
```

**Uso:** Logging, métricas, debugging.

### doOnError - Manejo de errores

```java
Mono<User> user = getUserById(1L)
    .doOnError(error -> log.error("Error fetching user", error));
```

### onErrorResume - Recuperación de errores

```java
Mono<User> user = getUserById(1L)
    .onErrorResume(error -> {
        log.error("Error, using default", error);
        return Mono.just(new User("Default"));
    });
```

### onErrorReturn - Valor de fallback en error

```java
Mono<String> result = riskyOperation()
    .onErrorReturn("Fallback value");
```

### retry - Reintentos

```java
Mono<User> user = getUserById(1L)
    .retry(3); // Reintenta hasta 3 veces en caso de error
```

### timeout - Límite de tiempo

```java
Mono<User> user = getUserById(1L)
    .timeout(Duration.ofSeconds(5))
    .onErrorResume(TimeoutException.class, e -> Mono.just(new User("Timeout")));
```

## Lazy Evaluation - Ejecución perezosa

### Concepto fundamental

📌 **Un Mono o Flux NO se ejecuta hasta que alguien se suscribe.**

```java
// Esto NO ejecuta nada
Mono<String> mono = Mono.just("Hola");

// Esto tampoco
Mono<String> transformed = mono.map(s -> s.toUpperCase());

// Esto SÍ ejecuta
transformed.subscribe(value -> System.out.println(value));
```

### ¿Cuándo se ejecuta?

**Spring WebFlux se suscribe automáticamente cuando:**

- Un controller retorna un Mono/Flux
- El framework necesita enviar la respuesta HTTP

**Manualmente con subscribe:**

El método `subscribe()` tiene varias sobrecargas según cuántos callbacks necesites:

```java
Mono<String> mono = Mono.just("Hola");

// 1. Sin parámetros - solo ejecuta, no hace nada con el resultado
mono.subscribe();

// 2. Con 1 parámetro - Consumer<T> onNext
mono.subscribe(
    value -> System.out.println("Valor: " + value)
);

// 3. Con 2 parámetros - Consumer<T> onNext, Consumer<Throwable> onError
mono.subscribe(
    value -> System.out.println("Valor: " + value),
    error -> System.err.println("Error: " + error)
);

// 4. Con 3 parámetros - Consumer<T> onNext, Consumer<Throwable> onError, Runnable onComplete
mono.subscribe(
    value -> System.out.println("Valor: " + value),
    error -> System.err.println("Error: " + error),
    () -> System.out.println("Completado")
);
```

**Parámetros:**

1. **onNext** - Se ejecuta cuando se emite un valor
2. **onError** - Se ejecuta si ocurre un error
3. **onComplete** - Se ejecuta cuando el flujo completa exitosamente (sin más elementos)

### Ejemplo de flujo completo

```java
@GetMapping("/{id}")
public Mono<UserDto> getUser(@PathVariable Long id) {
    // 1. Define el flujo (NO se ejecuta aún)
    return userService.getUserById(id)
        .map(user -> new UserDto(user))
        .doOnNext(dto -> log.info("Returning user: {}", dto.getName()));

    // 2. Spring WebFlux se suscribe
    // 3. Se ejecuta toda la cadena
    // 4. Emite el resultado
    // 5. Spring serializa a JSON y envía respuesta
}
```

## Flujo reactivo visual

### Pipeline básico

```
[ Publisher ] → [ Operador 1 ] → [ Operador 2 ] → [ Subscriber ]
```

### Ejemplo real

```
WebClient.get()
    ↓
bodyToMono(UserDto.class)
    ↓
map(user -> user.getName())
    ↓
flatMap(name -> getOrdersByName(name))
    ↓
Controller (Spring se suscribe)
```

### Flujo de datos

```
1. Subscriber se suscribe al Publisher
    ↓
2. Publisher comienza a producir datos
    ↓
3. Datos pasan por cada operador en orden
    ↓
4. Cada operador transforma/filtra
    ↓
5. Resultado final llega al Subscriber
```

## Errores comunes

### Error 1: Bloquear el flujo reactivo

```java
// ❌ MAL - Bloquea el hilo
public UserDto getUserById(Long userId) {
    Mono<UserDto> userMono = webClient.get()
        .uri("/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);

    return userMono.block(); // PIERDE TODAS LAS VENTAJAS
}
```

**Problemas:**

- Convierte código reactivo en bloqueante
- Desperdicia recursos
- Puede causar deadlocks en WebFlux
- Peor que usar RestTemplate directamente

**✔ Correcto:**

```java
public Mono<UserDto> getUserById(Long userId) {
    return webClient.get()
        .uri("/users/{id}", userId)
        .retrieve()
        .bodyToMono(UserDto.class);
}
```

### Error 2: No retornar el Mono/Flux

```java
// ❌ MAL - No retorna el flujo reactivo
public void saveUser(User user) {
    Mono<User> saved = userRepository.save(user);
    // No se ejecuta porque no hay suscripción
}
```

**✔ Correcto:**

```java
public Mono<User> saveUser(User user) {
    return userRepository.save(user);
}
```

### Error 3: Usar map en lugar de flatMap

```java
// ❌ MAL - Retorna Mono<Mono<Order>>
Mono<Mono<Order>> wrong = userMono.map(user ->
    getOrderById(user.getOrderId())
);

// ✔ CORRECTO - Retorna Mono<Order>
Mono<Order> correct = userMono.flatMap(user ->
    getOrderById(user.getOrderId())
);
```

**Regla:**

- `map` → Para transformaciones síncronas (retornan valor directo)
- `flatMap` → Para transformaciones asíncronas (retornan Mono/Flux)

### Error 4: No manejar el caso vacío

```java
// ❌ MAL - NPE si el Mono está vacío
Mono<String> name = getUserById(999L)
    .map(user -> user.getName()); // NPE si no existe

// ✔ CORRECTO - Maneja caso vacío
Mono<String> name = getUserById(999L)
    .map(user -> user.getName())
    .defaultIfEmpty("Unknown");
```

### Error 5: Suscribirse múltiples veces sin cache

```java
Mono<User> userMono = expensiveOperation();

// ❌ Ejecuta la operación 3 veces
userMono.subscribe(...);
userMono.subscribe(...);
userMono.subscribe(...);

// ✔ CORRECTO - Cache el resultado
Mono<User> cached = expensiveOperation().cache();
cached.subscribe(...);
cached.subscribe(...);
```

## Backpressure

**Backpressure** es el mecanismo por el cual un Subscriber puede señalar al Publisher cuántos elementos está listo para procesar.

### Sin backpressure (problema)

```
Publisher: Envío 1000 elementos/segundo
    ↓
Subscriber: Solo puedo procesar 100/segundo
    ↓
Resultado: Memoria se desborda o se pierden datos
```

### Con backpressure (solución)

```
Subscriber: "Envíame 10 elementos"
    ↓
Publisher: Envía 10
    ↓
Subscriber: Procesa los 10
    ↓
Subscriber: "Dame 10 más"
```

**Project Reactor maneja esto automáticamente.**

## Analogía: Servicio de streaming

### Mono - Una película

```java
Mono<Movie> movie = streamingService.getMovie("Inception");
```

**Comportamiento:**

- Solicitas una película específica
- El servicio la encuentra (o no)
- Te la entrega completa (o error)

### Flux - Playlist de canciones

```java
Flux<Song> playlist = streamingService.getPlaylist("Rock Classics");
```

**Comportamiento:**

- Solicitas una playlist
- Las canciones llegan una por una
- No esperas a que todas se descarguen
- Las reproduces conforme llegan
- Puedes pausar (backpressure)
- Pueden seguir llegando más

🧠 **Diferencia clave:**

- **Mono** = Un resultado completo
- **Flux** = Stream continuo de resultados

## Ejemplo completo integrando conceptos

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final WebClient webClient;
    private final OrderRepository orderRepository;

    public Mono<OrderSummary> getOrderSummary(Long userId) {
        // 1. Obtener usuario (Mono)
        Mono<User> userMono = webClient.get()
            .uri("/users/{id}", userId)
            .retrieve()
            .bodyToMono(User.class);

        // 2. Obtener pedidos del usuario (Flux)
        Flux<Order> ordersFlux = webClient.get()
            .uri("/users/{id}/orders", userId)
            .retrieve()
            .bodyToFlux(Order.class);

        // 3. Calcular total de pedidos (Flux → Mono)
        Mono<BigDecimal> totalMono = ordersFlux
            .map(Order::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Combinar usuario y total en un resumen
        return Mono.zip(userMono, totalMono)
            .map(tuple -> new OrderSummary(
                tuple.getT1().getName(),
                tuple.getT2()
            ))
            .doOnNext(summary -> log.info("Summary: {}", summary))
            .timeout(Duration.ofSeconds(5))
            .onErrorResume(error -> {
                log.error("Error creating summary", error);
                return Mono.just(new OrderSummary("Error", BigDecimal.ZERO));
            });
    }
}
```

## Resumen

- **Project Reactor** es la librería reactiva base de Spring WebFlux
- **Mono<T>** emite 0 o 1 elemento - Para resultados únicos
- **Flux<T>** emite 0 a N elementos - Para streams/listas
- Los Publishers son **lazy** - No se ejecutan hasta la suscripción
- **Operadores** transforman y combinan flujos reactivos
- **map** para transformaciones síncronas, **flatMap** para asíncronas
- **Nunca usar `.block()`** en código reactivo - rompe el modelo
- **Backpressure** controla el flujo de datos automáticamente
- Spring WebFlux se suscribe automáticamente a Mono/Flux retornados
- Mantener el flujo reactivo end-to-end para máxima eficiencia
