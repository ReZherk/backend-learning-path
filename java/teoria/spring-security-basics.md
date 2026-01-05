# Spring Security - Fundamentos

## El problema antes de Spring Security

Imagina una API sin seguridad:

```java
@GetMapping("/patients")
public List<Patient> getPatients() {
    return patientService.findAll();
}
```

**Problemas:**

- ❌ Cualquiera puede acceder al endpoint
- ❌ No hay control de acceso
- ❌ No sabes quién está haciendo la petición
- ❌ No puedes distinguir entre diferentes tipos de usuarios

👉 Esto **no es aceptable** en sistemas reales donde manejas información sensible.

## ¿Qué es Spring Security?

Spring Security es un framework completo de autenticación y control de acceso para aplicaciones Java. Proporciona protección contra ataques comunes y facilita la implementación de seguridad robusta en aplicaciones Spring.

**Spring Security existe para:**

- ✔ Saber **quién eres** (Authentication)
- ✔ Saber **qué puedes hacer** (Authorization)
- ✔ Proteger endpoints y recursos
- ✔ Integrarse con HTTP y Filters

📌 NO es solo login
📌 Es un **framework de seguridad completo**

## Authentication vs Authorization

### Authentication (¿Quién eres?)

**Authentication** es el proceso de **verificar la identidad** de un usuario.

**Ejemplos:**

- Usuario + contraseña
- Token JWT
- OAuth2
- Certificados digitales

**Resultado:**

👉 "Sí, eres Patrick y lo puedo comprobar"

### Authorization (¿Qué puedes hacer?)

**Authorization** es el proceso de **verificar permisos** y determinar qué acciones puede realizar un usuario autenticado.

**Ejemplos:**

- ROLE_ADMIN puede eliminar usuarios
- ROLE_USER solo puede leer
- Permisos específicos por recurso

**Resultado:**

👉 "Puedes acceder a este recurso específico"

### Diferencia clara

| Concepto       | Pregunta           | Ejemplo                    |
| -------------- | ------------------ | -------------------------- |
| Authentication | ¿Quién eres?       | Login con credenciales     |
| Authorization  | ¿Qué puedes hacer? | Verificar roles y permisos |

### Ejemplo de la vida real

**Aeropuerto:**

- **Mostrar DNI** → Authentication (verificas tu identidad)
- **Acceder a zona VIP** → Authorization (verificas si tienes permiso)

📌 No todos los autenticados están autorizados para todo.

## Dónde actúa Spring Security

Spring Security trabaja **antes del Controller** mediante el uso de **Filters**.

**Flujo:**

```
HTTP Request
    ↓
Spring Security Filters
    ↓
Authentication
    ↓
Authorization
    ↓
Controller (si pasó las validaciones)
```

👉 Si fallas en seguridad, **nunca llegas al Controller**

**Nota:**
El Controller NO debe validar seguridad. Spring Security ya lo hizo antes.

## SecurityContext

El `SecurityContext` es un contenedor que almacena la información de seguridad del usuario autenticado durante el procesamiento de una petición HTTP.

**Contiene:**

- Usuario autenticado (`Authentication`)
- Roles y permisos
- Estado de autenticación
- Detalles adicionales del usuario

📌 Vive **solo durante el request actual**
📌 Se limpia automáticamente al finalizar la petición

## SecurityContextHolder

`SecurityContextHolder` es una clase que proporciona acceso al `SecurityContext` actual.

**Función:**

> Guarda y proporciona acceso al `SecurityContext` del request en proceso

**Uso común:**

```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String username = auth.getName();
```

📌 Es como una "memoria temporal" que mantiene la información del usuario durante el request.

## Flujo completo de autenticación

```
1. Request entra a la aplicación
    ↓
2. Spring Security Filter intercepta
    ↓
3. Extrae y valida credenciales/token
    ↓
4. Crea objeto Authentication
    ↓
5. Guarda en SecurityContext
    ↓
6. SecurityContextHolder almacena el contexto
    ↓
7. Controller accede a usuario autenticado si es necesario
    ↓
8. Al terminar request, se limpia el contexto
```

👉 El Controller **NO valida nada de seguridad**, solo confía en que Spring Security ya lo hizo.

## ¿Cómo sabe Spring si estás autenticado?

Spring Security verifica el estado de autenticación:

```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();

if (auth != null && auth.isAuthenticated()) {
    // Usuario válido y autenticado
} else {
    // Acceso denegado
}
```

**Estados posibles:**

- `authentication.isAuthenticated() == true` → Usuario válido ✔
- `authentication.isAuthenticated() == false` → Acceso denegado ❌

## Error común

**❌ NO hagas esto en un Controller:**

```java
@GetMapping("/patients")
public List<Patient> getPatients(String token) {
    if (tokenValido(token)) {
        return patientService.findAll();
    }
    throw new UnauthorizedException();
}
```

**¿Por qué está mal?**

- Duplica lógica de seguridad
- Rompe la arquitectura de separación de responsabilidades
- Spring Security ya debe haberlo validado antes

**✔ Correcto:**

```java
@GetMapping("/patients")
public List<Patient> getPatients() {
    // Spring Security ya validó antes de llegar aquí
    return patientService.findAll();
}
```

## Configuración básica de Spring Security

Ejemplo simple sin JWT aún:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

**Esto significa:**

> "Si no estás autenticado, no puedes acceder a ningún endpoint"

## Resumen

- **Spring Security** es un framework completo de seguridad, no solo login
- **Authentication** verifica quién eres (identidad)
- **Authorization** verifica qué puedes hacer (permisos)
- Funciona mediante **Filters** que interceptan antes del Controller
- **SecurityContext** almacena la información del usuario autenticado
- **SecurityContextHolder** proporciona acceso al contexto actual
- El **Controller NO debe validar seguridad**, Spring Security ya lo hizo
- JWT se integra en este flujo como mecanismo de autenticación
