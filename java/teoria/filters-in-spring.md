# Filters en Spring

## ¿Qué es un Filter?

Es un portero que revisa el request antes de dejarlo entrar al controlador.

### Ejemplo de la vida real

Imagina un edificio corporativo:

- 🧍 **Persona** → Request
- 🏢 **Edificio** → Aplicación
- 🧑‍💼 **Recepción** → Filter
- 🧑‍💻 **Oficina** → Controller

**Flujo real:**

1. Llegas al edificio
2. Recepción revisa:
   - DNI
   - Credencial
3. Si todo está bien → pasas
4. Si no → no entras

📌 **La recepción no hace tu trabajo**
📌 **Solo valida acceso**

## Flujo real en Spring

```
HTTP Request
    ↓
Filter
    ↓
Controller
    ↓
Service
    ↓
Repository
```

**Nota:**
El controlador no debe validar o cosas relacionadas con el JWT. **La seguridad NO vive en el Controller**.

## ¿Para qué se usan los Filters?

Los Filters se usan para cosas transversales:

- ✔ Autenticación
- ✔ Autorización
- ✔ Logging
- ✔ CORS
- ✔ Validación de tokens
- ✔ Auditoría

**Nota:**
Todo lo que no es negocio.

## Filter vs Interceptor

| Filter                    | Interceptor           |
| ------------------------- | --------------------- |
| Nivel HTTP                | Nivel Spring MVC      |
| Antes del Controller      | Antes del método      |
| Ideal para seguridad      | Ideal para lógica web |
| Usado por Spring Security | No para JWT           |

**Nota:**
Un **Interceptor** en Spring MVC es un componente que se ejecuta antes y después de los métodos del controlador. Se usa para aplicar lógica transversal en la capa web, como auditoría, métricas o modificación de datos.

## ¿Qué es OncePerRequestFilter?

Para profundizar en este tema: [OncePerRequestFilter en Spring](./once-per-request-filter.md)

OncePerRequestFilter es una clase abstracta de Spring que garantiza que un filtro se ejecute una sola vez por cada petición HTTP, evitando ejecuciones duplicadas en redirecciones, forwards o cadenas internas.

**Nota:**
Es la base de cualquier JwtFilter.

## Ejemplo simple de Filter (sin JWT aún)

```java
@Component
public class SimpleLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("Request URI: " + request.getRequestURI());

        // continuar el flujo
        filterChain.doFilter(request, response);
    }
}
```

**Nota:**
Si NO llamas a `filterChain.doFilter(...)` el request muere ahí.

## ¿Qué es FilterChain?

La lista de filtros que faltan ejecutar.

**Ejemplo mental:**

```
Filter 1 → Filter 2 → Filter 3 → Controller
```

Si uno no llama al siguiente, el request no avanza.
