# OncePerRequestFilter en Spring

## ¿Qué es OncePerRequestFilter?

OncePerRequestFilter es una clase abstracta de Spring que garantiza que un filtro se ejecute una sola vez por cada petición HTTP, evitando ejecuciones duplicadas en redirecciones, forwards o cadenas internas.

### Esta se implementa así

```java
public class SimpleLoggingFilter extends OncePerRequestFilter
```

**Eso significa:**

```
SimpleLoggingFilter
    ↓
OncePerRequestFilter
    ↓
GenericFilterBean
    ↓
Filter (javax.servlet)
```

### Jerarquía explicada

- **Filter (javax.servlet)** → Interfaz base de Java EE que intercepta peticiones y respuestas HTTP.
- **GenericFilterBean** → Clase abstracta de Spring que implementa Filter y se integra con el contenedor Spring.
- **OncePerRequestFilter** → Extiende GenericFilterBean y asegura que el filtro se ejecute solo una vez por request.
- **SimpleLoggingFilter** → Tu clase concreta que hereda de OncePerRequestFilter y añade lógica personalizada.

## ¿Por qué no implementamos Filter directamente?

La interfaz original es:

```java
public interface Filter {
    void doFilter(
        ServletRequest request,
        ServletResponse response,
        FilterChain chain
    );
}
```

**Problemas:**

- Se puede ejecutar varias veces
- No es HTTP-friendly
- Mucho código repetido

**Spring crea:**

OncePerRequestFilter

**Que:**

- ✔ Asegura una sola ejecución por request
- ✔ Convierte a HttpServletRequest
- ✔ Maneja internamente duplicaciones

**Nota:** `HttpServletRequest` es una interfaz de Java que representa la petición HTTP enviada por un cliente al servidor. Permite acceder a datos como método, URL, parámetros, headers, cookies y sesión.

## Template Method Pattern

Como se había dicho, el OncePerRequestFilter usa el patrón Template Method Pattern, el cual ya controla el flujo y te da el método para que tú lo sobrescribas.

**Flujo:**

```
Request llega
    ↓
Spring ejecuta doFilter()
    ↓
OncePerRequestFilter hace validaciones internas
    ↓
Spring llama a doFilterInternal()
```

El cual tú ya modificaste al heredarlo.

## Explicando los parámetros uno por uno

Estos son los parámetros del método `doFilterInternal()` (o `doFilter()`):

### 1. HttpServletRequest request

**Representa:**

La petición HTTP entrante

**Puedes obtener:**

```java
request.getRequestURI();
request.getHeader("Authorization");
request.getMethod();
```

📌 Es TODO el request

### 2. HttpServletResponse response

**Representa:**

La respuesta que vas a devolver

**Puedes:**

```java
response.setStatus(401);
response.getWriter().write("Unauthorized");
```

📌 Si decides cortar el flujo, lo haces aquí

### 3. FilterChain filterChain

**Representa:**

"Lo que sigue después de mí"

**Si llamas:**

```java
filterChain.doFilter(request, response);
```

👉 El request continúa

**Si NO llamas:**

❌ El request muere ahí

## Ejemplo final

```java
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
        throws ServletException, IOException {

    System.out.println("Request URI: " + request.getRequestURI()); // se ejecuta

    filterChain.doFilter(request, response); // se ejecuta, salvo que haya error antes
}
```

### Sobre el throws

El `throws ServletException, IOException` en la firma del método es como una precaución: le avisa al compilador y al servidor que "este método podría lanzar estos errores". No significa que siempre se lancen, solo que pueden ocurrir.

Lo que está dentro de las llaves `{ ... }` es el cuerpo del método. Ese código siempre se ejecutará cuando el método sea llamado, a menos que ocurra una excepción en medio.
