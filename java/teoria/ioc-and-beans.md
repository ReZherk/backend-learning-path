# IoC y Beans en Spring

## El problema antes de Spring

Imagina este código **sin Spring**:

```java
public class PatientController {
    private PatientService service = new PatientService();
}
```

**Problemas reales:**

- Estás **acoplado** a `PatientService`
- No puedes cambiar implementación fácilmente
- Difícil de testear
- Tú controlas todo manualmente

👉 **Tu clase tiene demasiado poder y responsabilidad**

## ¿Qué es IoC (Inversión de Control)?

**IoC = Inversion of Control (Inversión de Control)**

Es un principio de diseño donde el control de la creación y gestión de objetos se transfiere del programador al framework.

**Antes:**

> "YO creo mis objetos con `new`"

**Con Spring:**

> "SPRING crea mis objetos por mí"

📌 Tú describes **qué necesitas**, no **cómo se crea**

### Ejemplo de la vida real

Imagina una **constructora**:

- **Tú:** arquitecto
- **Spring:** constructora

Tú dices:

> "Necesito una puerta"

Spring responde:

> "Yo la construyo, instalo y te la entrego lista"

📌 Tú no construyes nada, solo la usas.

👉 Eso es IoC

## ¿Qué es un Bean?

Un **Bean** es un objeto creado, administrado y destruido por Spring.

**Características:**

- No lo creas tú con `new`
- Vive dentro del **Spring Container** (ApplicationContext)
- Spring controla su ciclo de vida completo

## El contenedor de Spring

Spring tiene un contenedor llamado **ApplicationContext** donde:

- Crea Beans
- Los almacena
- Los inyecta donde se necesitan
- Controla su ciclo de vida (creación, uso, destrucción)

## ¿Cómo sabe Spring qué crear?

Con **anotaciones** que marcan las clases como Beans.

**Ejemplo:**

```java
@Component
public class SimpleLoggingFilter {
}
```

Esto le dice a Spring:

> "Oye Spring, crea una instancia de esta clase y adminístrala"

📌 Eso la convierte en un **Bean**

## Tipos de anotaciones para Beans

| Anotación                         | Uso               |
| --------------------------------- | ----------------- |
| `@Component`                      | Bean genérico     |
| `@Service`                        | Lógica de negocio |
| `@Repository`                     | Acceso a datos    |
| `@Controller` / `@RestController` | Controladores web |

**Nota:**
Técnicamente todas funcionan igual, pero semánticamente indican diferentes capas de la aplicación.

## Inyección de Dependencias (DI)

La Inyección de Dependencias (Dependency Injection) es el mecanismo que usa Spring para proporcionar las dependencias que un objeto necesita.

**Ejemplo correcto:**

```java
@Component
public class PatientController {

    private final PatientService service;

    // Constructor injection (recomendado)
    public PatientController(PatientService service) {
        this.service = service;
    }
}
```

✔ No usas `new`
✔ Spring inyecta el Bean automáticamente
✔ Código desacoplado y testeable

## ¿Por qué usar Constructor Injection?

**Ventajas:**

- **Obligatorio:** No puede haber instancia sin la dependencia
- **Inmutable:** Las dependencias son `final`
- **Testeable:** Fácil de mockear en tests
- **Más seguro:** Evita `NullPointerException`

**❌ Evita Field Injection:**

```java
@Autowired
private PatientService service; // No recomendado
```

## Conexión con Filters

Cuando creas un Filter:

```java
@Component
public class SimpleLoggingFilter extends OncePerRequestFilter {
}
```

**Significa:**

✔ Spring crea el Filter como Bean
✔ Spring lo registra automáticamente
✔ Spring lo inserta en la Filter Chain
✔ Spring gestiona su ciclo de vida

👉 Tú solo defines la lógica, Spring hace el resto

## Flujo de creación de Beans

```
Spring Boot inicia
    ↓
Escanea clases (@ComponentScan)
    ↓
Encuentra clases anotadas (@Component, @Service, etc.)
    ↓
Crea Beans
    ↓
Los registra en ApplicationContext
    ↓
Inyecta dependencias donde se necesitan
```

## Ciclo de vida de un Bean

```
1. Instanciación → Spring crea el objeto
2. Inyección de dependencias → Spring inyecta las dependencias
3. Inicialización → Ejecuta métodos @PostConstruct si existen
4. Uso → El Bean está listo para usarse
5. Destrucción → Ejecuta métodos @PreDestroy antes de eliminar
```

📌 Todo este ciclo está controlado por Spring

## Error común

```java
// ❌ MAL - No hagas esto
JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
```

**¿Por qué está mal?**

- Spring no controla este objeto
- No inyecta dependencias automáticamente
- Rompe la arquitectura de IoC
- No se registra en el contenedor

**✔ Correcto:**

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Spring lo crea y gestiona automáticamente
}
```

## Resumen

- **IoC** = Spring controla la creación y gestión de objetos
- **Bean** = objeto administrado por Spring
- **@Component** (y variantes) marca qué clases deben convertirse en Beans
- **No usar `new`** para crear Beans, Spring lo hace por ti
- **Constructor Injection** es la mejor práctica para inyectar dependencias
- Los **Filters** y componentes de **Spring Security** funcionan así
