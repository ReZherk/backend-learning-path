# Spring Data JPA - Specification

## ¿Qué es Specification?

**Specification** es una API de Spring Data JPA que permite construir consultas dinámicas usando la **Criteria API** de JPA. Proporciona una forma programática y type-safe de crear condiciones WHERE complejas sin escribir SQL o JPQL directamente.

**Definición técnica:**

`Specification<T>` es una interfaz funcional que encapsula un `Predicate` (condición) que puede ser aplicado a una consulta JPA mediante la Criteria API.

**Casos de uso:**

- Filtros opcionales en búsquedas
- Consultas dinámicas donde los criterios cambian en tiempo de ejecución
- APIs con múltiples parámetros de búsqueda opcionales
- Evitar la explosión de métodos `findBy...` en el Repository

**Ventajas:**

- ✔ Consultas dinámicas sin SQL/JPQL
- ✔ Type-safe (errores en compilación)
- ✔ Composable (combinación de filtros)
- ✔ Reutilizable
- ✔ Testeable

**Concepto clave:**

```
Specification = WHERE dinámico en Java
```

## Criteria API

La **Criteria API** es la API estándar de JPA para construir consultas programáticamente. Specification es una abstracción de Spring sobre esta API.

**Componentes principales:**

- **CriteriaBuilder** - Factory para crear predicados y expresiones
- **CriteriaQuery** - Representa la consulta completa
- **Root** - Representa la entidad raíz (FROM)
- **Predicate** - Representa una condición WHERE

## Entidad de ejemplo

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Boolean active;

    private Integer age;

    @Column(name = "email")
    private String email;
}
```

**Tabla equivalente:**

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    active BOOLEAN,
    age INTEGER,
    email VARCHAR(255)
);
```

## Repository con Specification

Para usar Specification, el repository debe extender `JpaSpecificationExecutor<T>`:

```java
public interface UserRepository
        extends JpaRepository<User, Long>,
                JpaSpecificationExecutor<User> {
}
```

**Métodos proporcionados por JpaSpecificationExecutor:**

```java
Optional<T> findOne(Specification<T> spec);
List<T> findAll(Specification<T> spec);
Page<T> findAll(Specification<T> spec, Pageable pageable);
List<T> findAll(Specification<T> spec, Sort sort);
long count(Specification<T> spec);
boolean exists(Specification<T> spec);
```

**Importante:**

Sin `JpaSpecificationExecutor`, no se puede usar Specification en ese repository.

## Anatomía de una Specification

### Interfaz funcional

```java
@FunctionalInterface
public interface Specification<T> {
    Predicate toPredicate(
        Root<T> root,
        CriteriaQuery<?> query,
        CriteriaBuilder criteriaBuilder
    );
}
```

### Parámetros explicados

**1. Root<T> root**

Representa la entidad raíz de la consulta (la tabla en SQL).

**Uso:**

```java
root.get("name")          // Acceder a columna name
root.get("address").get("city")  // Navegar relaciones
```

**Equivalente SQL:**

```sql
FROM users
```

**2. CriteriaQuery<?> query**

Representa la consulta completa (SELECT).

**Uso:**

```java
query.distinct(true)      // SELECT DISTINCT
query.orderBy(...)        // ORDER BY
query.groupBy(...)        // GROUP BY
```

Raramente se usa directamente en Specifications simples.

**3. CriteriaBuilder criteriaBuilder (cb)**

Factory para crear predicados, expresiones y funciones.

**Uso:**

```java
cb.equal(root.get("active"), true)           // WHERE active = true
cb.like(root.get("name"), "%John%")          // WHERE name LIKE '%John%'
cb.greaterThan(root.get("age"), 18)          // WHERE age > 18
cb.and(predicate1, predicate2)               // Combinar condiciones
```

**Es el componente más usado en Specifications.**

### Retorno: Predicate

Un `Predicate` representa una condición booleana (parte del WHERE).

**Ejemplos:**

```java
Predicate p1 = cb.equal(root.get("active"), true);
Predicate p2 = cb.greaterThan(root.get("age"), 18);
Predicate combined = cb.and(p1, p2);  // active = true AND age > 18
```

## Clase de Specifications

Es una buena práctica crear una clase con métodos estáticos que retornen Specifications.

```java
public final class UserSpecification {

    private UserSpecification() {
        // Constructor privado - clase de utilidad
    }

    public static Specification<User> isActive(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) {
                return cb.conjunction(); // WHERE TRUE (no filtra)
            }
            return cb.equal(root.get("active"), active);
        };
    }

    public static Specification<User> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(
                cb.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    public static Specification<User> ageGreaterThanOrEqual(Integer minAge) {
        return (root, query, cb) -> {
            if (minAge == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("age"), minAge);
        };
    }

    public static Specification<User> ageBetween(Integer minAge, Integer maxAge) {
        return (root, query, cb) -> {
            if (minAge == null && maxAge == null) {
                return cb.conjunction();
            }
            if (minAge != null && maxAge != null) {
                return cb.between(root.get("age"), minAge, maxAge);
            }
            if (minAge != null) {
                return cb.greaterThanOrEqualTo(root.get("age"), minAge);
            }
            return cb.lessThanOrEqualTo(root.get("age"), maxAge);
        };
    }

    public static Specification<User> emailEndsWith(String domain) {
        return (root, query, cb) -> {
            if (domain == null || domain.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(root.get("email"), "%" + domain);
        };
    }

    public static Specification<User> hasAnyName(List<String> names) {
        return (root, query, cb) -> {
            if (names == null || names.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("name").in(names);
        };
    }
}
```

### Explicación de cb.conjunction()

```java
if (active == null) {
    return cb.conjunction(); // WHERE TRUE
}
```

**¿Qué es `conjunction()`?**

Retorna un predicado que siempre es verdadero (`WHERE 1=1` o `WHERE TRUE`).

**¿Por qué usarlo?**

Cuando un filtro es opcional y el valor es `null`, no queremos filtrar por ese campo. Al retornar `conjunction()`, el filtro no afecta el resultado.

**Alternativa:**

```java
return cb.disjunction(); // WHERE FALSE (excluye todo)
```

Rara vez se usa, excepto para construir ORs dinámicos.

## Composición de Specifications

Las Specifications se pueden combinar usando operadores lógicos.

### Operadores de composición

```java
// AND
Specification<User> spec1 = UserSpecification.isActive(true);
Specification<User> spec2 = UserSpecification.ageGreaterThanOrEqual(18);
Specification<User> combined = spec1.and(spec2);

// OR
Specification<User> combined = spec1.or(spec2);

// NOT
Specification<User> notActive = Specification.not(UserSpecification.isActive(true));

// WHERE inicial (punto de partida)
Specification<User> spec = Specification.where(null); // Neutral
spec = spec.and(UserSpecification.isActive(true));
spec = spec.and(UserSpecification.nameContains("John"));
```

### SQL equivalente

```java
Specification<User> spec = Specification.where(null)
    .and(UserSpecification.isActive(true))
    .and(UserSpecification.nameContains("John"))
    .and(UserSpecification.ageGreaterThanOrEqual(18));
```

**SQL generado:**

```sql
SELECT * FROM users
WHERE active = true
  AND LOWER(name) LIKE '%john%'
  AND age >= 18;
```

## Service con Specifications

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> findUsers(
            Boolean active,
            String name,
            Integer minAge,
            Integer maxAge) {

        Specification<User> spec = Specification.where(null);

        // Composición dinámica de filtros
        spec = spec.and(UserSpecification.isActive(active));
        spec = spec.and(UserSpecification.nameContains(name));
        spec = spec.and(UserSpecification.ageBetween(minAge, maxAge));

        return userRepository.findAll(spec);
    }

    public Page<User> findUsersWithPagination(
            Boolean active,
            String name,
            Integer minAge,
            Pageable pageable) {

        Specification<User> spec = Specification.where(null)
            .and(UserSpecification.isActive(active))
            .and(UserSpecification.nameContains(name))
            .and(UserSpecification.ageGreaterThanOrEqual(minAge));

        return userRepository.findAll(spec, pageable);
    }

    public long countActiveUsers() {
        return userRepository.count(UserSpecification.isActive(true));
    }

    public boolean existsUserByEmail(String email) {
        Specification<User> spec = (root, query, cb) ->
            cb.equal(root.get("email"), email);

        return userRepository.exists(spec);
    }
}
```

## Controller

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> getUsers(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge) {

        return userService.findUsers(active, name, minAge, maxAge);
    }

    @GetMapping("/paginated")
    public Page<User> getUsersPaginated(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minAge,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {

        return userService.findUsersWithPagination(active, name, minAge, pageable);
    }
}
```

## Ejemplos de llamadas

### Con todos los filtros

**Request:**

```
GET /api/users?active=true&name=john&minAge=18&maxAge=65
```

**SQL generado:**

```sql
SELECT * FROM users
WHERE active = true
  AND LOWER(name) LIKE '%john%'
  AND age BETWEEN 18 AND 65;
```

### Sin filtros

**Request:**

```
GET /api/users
```

**SQL generado:**

```sql
SELECT * FROM users;
```

### Solo algunos filtros

**Request:**

```
GET /api/users?active=true&minAge=21
```

**SQL generado:**

```sql
SELECT * FROM users
WHERE active = true
  AND age >= 21;
```

### Con paginación

**Request:**

```
GET /api/users/paginated?active=true&page=0&size=10&sort=name,asc
```

**SQL generado:**

```sql
SELECT * FROM users
WHERE active = true
ORDER BY name ASC
LIMIT 10 OFFSET 0;
```

## Métodos de CriteriaBuilder

Esta es la parte clave para dominar Specification.

### Métodos lógicos

#### conjunction()

Retorna un predicado que siempre es verdadero.

```java
return cb.conjunction(); // WHERE TRUE
```

**SQL:** `WHERE 1=1` o `WHERE TRUE`

**Uso:** Filtros opcionales que no deben aplicarse cuando el valor es null.

#### disjunction()

Retorna un predicado que siempre es falso.

```java
return cb.disjunction(); // WHERE FALSE
```

**SQL:** `WHERE 1=0` o `WHERE FALSE`

**Uso:** Raro, útil para construir ORs dinámicos complejos.

### Comparaciones de igualdad

#### equal()

```java
cb.equal(root.get("active"), true)
cb.equal(root.get("name"), "John")
```

**SQL:** `WHERE active = true`, `WHERE name = 'John'`

#### notEqual()

```java
cb.notEqual(root.get("status"), "DELETED")
```

**SQL:** `WHERE status <> 'DELETED'`

### Comparaciones numéricas y fechas

#### greaterThan()

```java
cb.greaterThan(root.get("age"), 18)
```

**SQL:** `WHERE age > 18`

#### greaterThanOrEqualTo()

```java
cb.greaterThanOrEqualTo(root.get("age"), 18)
```

**SQL:** `WHERE age >= 18`

#### lessThan()

```java
cb.lessThan(root.get("price"), 100.0)
```

**SQL:** `WHERE price < 100.0`

#### lessThanOrEqualTo()

```java
cb.lessThanOrEqualTo(root.get("price"), 100.0)
```

**SQL:** `WHERE price <= 100.0`

#### between()

```java
cb.between(root.get("age"), 18, 65)
```

**SQL:** `WHERE age BETWEEN 18 AND 65`

### Operaciones con Strings

#### like()

```java
cb.like(root.get("name"), "%John%")
```

**SQL:** `WHERE name LIKE '%John%'`

#### notLike()

```java
cb.notLike(root.get("email"), "%spam.com")
```

**SQL:** `WHERE email NOT LIKE '%spam.com'`

#### lower() / upper()

```java
cb.like(
    cb.lower(root.get("name")),
    "%john%"
)
```

**SQL:** `WHERE LOWER(name) LIKE '%john%'`

```java
cb.equal(
    cb.upper(root.get("country")),
    "USA"
)
```

**SQL:** `WHERE UPPER(country) = 'USA'`

### Verificaciones NULL

#### isNull()

```java
cb.isNull(root.get("deletedAt"))
```

**SQL:** `WHERE deleted_at IS NULL`

#### isNotNull()

```java
cb.isNotNull(root.get("email"))
```

**SQL:** `WHERE email IS NOT NULL`

### Operador IN

#### in()

```java
CriteriaBuilder.In<String> inClause = cb.in(root.get("role"));
inClause.value("ADMIN");
inClause.value("MODERATOR");
return inClause;
```

**Forma simplificada:**

```java
root.get("role").in("ADMIN", "MODERATOR")
```

**SQL:** `WHERE role IN ('ADMIN', 'MODERATOR')`

**Con lista:**

```java
List<String> roles = Arrays.asList("ADMIN", "MODERATOR", "USER");
root.get("role").in(roles)
```

### Combinadores lógicos AND / OR

#### and()

```java
Predicate p1 = cb.equal(root.get("active"), true);
Predicate p2 = cb.greaterThan(root.get("age"), 18);
return cb.and(p1, p2);
```

**SQL:** `WHERE active = true AND age > 18`

**Variadic:**

```java
cb.and(p1, p2, p3, p4) // AND de múltiples predicados
```

#### or()

```java
Predicate p1 = cb.equal(root.get("role"), "ADMIN");
Predicate p2 = cb.equal(root.get("role"), "MODERATOR");
return cb.or(p1, p2);
```

**SQL:** `WHERE role = 'ADMIN' OR role = 'MODERATOR'`

**Nota:** Normalmente se usa la composición de Specification en lugar de `cb.and()` / `cb.or()`:

```java
// Preferido
spec1.and(spec2)
spec1.or(spec2)

// En lugar de
(root, query, cb) -> cb.and(predicate1, predicate2)
```

### Funciones de agregación

Aunque menos comunes en Specification, CriteriaBuilder también soporta:

```java
cb.count(root)           // COUNT(*)
cb.sum(root.get("price"))       // SUM(price)
cb.avg(root.get("age"))         // AVG(age)
cb.max(root.get("salary"))      // MAX(salary)
cb.min(root.get("salary"))      // MIN(salary)
```

**Uso típico:** En consultas con `query.groupBy()`.

## Specifications complejas

### Relaciones @ManyToOne

```java
@Entity
public class Order {
    @Id
    private Long id;

    @ManyToOne
    private User user;

    private BigDecimal amount;
}
```

**Specification:**

```java
public class OrderSpecification {

    public static Specification<Order> userNameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) {
                return cb.conjunction();
            }
            // Navegar relación user y acceder a su campo name
            return cb.like(
                cb.lower(root.get("user").get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Order> userIsActive(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("user").get("active"), active);
        };
    }
}
```

**SQL generado:**

```sql
SELECT o.* FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE LOWER(u.name) LIKE '%john%'
  AND u.active = true;
```

### Relaciones @OneToMany con EXISTS

```java
@Entity
public class User {
    @Id
    private Long id;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}
```

**Specification para usuarios que tienen pedidos:**

```java
public static Specification<User> hasOrders() {
    return (root, query, cb) -> {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<Order> orderRoot = subquery.from(Order.class);
        subquery.select(cb.count(orderRoot));
        subquery.where(cb.equal(orderRoot.get("user"), root));

        return cb.greaterThan(subquery, 0L);
    };
}
```

**SQL generado:**

```sql
SELECT * FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 0;
```

### OR dinámico

```java
public static Specification<User> searchInMultipleFields(String search) {
    return (root, query, cb) -> {
        if (search == null || search.isBlank()) {
            return cb.conjunction();
        }

        String pattern = "%" + search.toLowerCase() + "%";

        return cb.or(
            cb.like(cb.lower(root.get("name")), pattern),
            cb.like(cb.lower(root.get("email")), pattern),
            cb.like(cb.lower(root.get("phone")), pattern)
        );
    };
}
```

**SQL generado:**

```sql
WHERE LOWER(name) LIKE '%john%'
   OR LOWER(email) LIKE '%john%'
   OR LOWER(phone) LIKE '%john%';
```

## Errores comunes

### Error 1: Acceder a campos con nombres incorrectos

```java
// ❌ MAL - Si el campo se llama "userName" y pones "username"
cb.equal(root.get("username"), "John") // PropertyNotFoundException
```

**Problema:** Los nombres deben coincidir exactamente con los nombres de los atributos de la entidad.

**✔ Correcto:**

```java
// Usar Metamodel para type-safety
cb.equal(root.get(User_.userName), "John")
```

### Error 2: No manejar valores null

```java
// ❌ MAL - NPE si name es null
return cb.like(root.get("name"), "%" + name + "%");
```

**✔ Correcto:**

```java
if (name == null || name.isBlank()) {
    return cb.conjunction();
}
return cb.like(root.get("name"), "%" + name + "%");
```

### Error 3: Usar and() en lugar de Specification.and()

```java
// ❌ Confuso - mezcla niveles de abstracción
Specification<User> spec = (root, query, cb) ->
    cb.and(
        UserSpecification.isActive(true).toPredicate(root, query, cb),
        UserSpecification.nameContains("John").toPredicate(root, query, cb)
    );

// ✔ CORRECTO - Usar composición de Specification
Specification<User> spec = UserSpecification.isActive(true)
    .and(UserSpecification.nameContains("John"));
```

### Error 4: No retornar un Predicate

```java
// ❌ MAL - No retorna nada
public static Specification<User> isActive(Boolean active) {
    return (root, query, cb) -> {
        cb.equal(root.get("active"), active); // Falta return
    };
}

// ✔ CORRECTO
public static Specification<User> isActive(Boolean active) {
    return (root, query, cb) -> {
        return cb.equal(root.get("active"), active);
    };
}
```

### Error 5: Navegar relaciones sin verificar null

```java
// ❌ MAL - NPE si user no tiene address
root.get("address").get("city")

// ✔ CORRECTO - Usar Join explícito o verificar null
Join<User, Address> addressJoin = root.join("address", JoinType.LEFT);
return cb.equal(addressJoin.get("city"), "Madrid");
```

## JPA Metamodel (Type-Safe)

Para evitar errores con nombres de campos hardcodeados, puedes usar el Metamodel:

### Generación del Metamodel

Agregar dependencia:

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-jpamodelgen</artifactId>
    <scope>provided</scope>
</dependency>
```

### Clase generada automáticamente

```java
@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(User.class)
public abstract class User_ {
    public static volatile SingularAttribute<User, Long> id;
    public static volatile SingularAttribute<User, String> name;
    public static volatile SingularAttribute<User, Boolean> active;
    public static volatile SingularAttribute<User, Integer> age;
}
```

### Uso en Specification

```java
public static Specification<User> nameContains(String name) {
    return (root, query, cb) -> {
        if (name == null || name.isBlank()) {
            return cb.conjunction();
        }
        // Type-safe - error en compilación si el campo no existe
        return cb.like(
            cb.lower(root.get(User_.name)),
            "%" + name.toLowerCase() + "%"
        );
    };
}
```

**Ventaja:** Errores de tipeo se detectan en compilación, no en runtime.

## Testing de Specifications

```java
@DataJpaTest
class UserSpecificationTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.saveAll(Arrays.asList(
            new User(null, "John Doe", true, 25, "john@example.com"),
            new User(null, "Jane Smith", true, 30, "jane@example.com"),
            new User(null, "Bob Wilson", false, 22, "bob@example.com")
        ));
    }

    @Test
    void shouldFilterByActive() {
        // Given
        Specification<User> spec = UserSpecification.isActive(true);

        // When
        List<User> results = userRepository.findAll(spec);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(User::getActive);
    }

    @Test
    void shouldFilterByNameContains() {
        // Given
        Specification<User> spec = UserSpecification.nameContains("john");

        // When
        List<User> results = userRepository.findAll(spec);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualToIgnoringCase("John Doe");
    }

    @Test
    void shouldCombineMultipleFilters() {
        // Given
        Specification<User> spec = Specification.where(null)
            .and(UserSpecification.isActive(true))
            .and(UserSpecification.ageGreaterThanOrEqual(25));

        // When
        List<User> results = userRepository.findAll(spec);

        // Then
        assertThat(results).hasSize(2);
    }
}
```

## Cuándo usar Specification

### ✔ Usa Specification cuando:

- Tienes filtros opcionales múltiples
- Los criterios de búsqueda cambian dinámicamente
- Quieres evitar explosión de métodos en el Repository
- Necesitas consultas complejas reutilizables
- Quieres type-safety con Criteria API

### ❌ No uses Specification cuando:

- Consultas simples y estáticas (`findByEmail`)
- Query methods del Repository son suficientes
- La consulta es muy compleja (considera @Query con JPQL/SQL nativo)
- Performance crítica (SQL nativo puede ser más eficiente)

## Resumen

- **Specification** permite construir consultas dinámicas usando Criteria API
- Es una interfaz funcional que retorna un `Predicate`
- Se compone de tres parámetros: `Root`, `CriteriaQuery`, `CriteriaBuilder`
- **CriteriaBuilder** (cb) es el componente más usado para crear condiciones
- Se pueden **combinar** usando `and()`, `or()`, `not()`
- **`cb.conjunction()`** retorna `WHERE TRUE` (filtro neutral)
- El Repository debe extender **`JpaSpecificationExecutor`**
- Ideal para **filtros opcionales** y **búsquedas dinámicas**
- Usa **Metamodel** para type-safety
- Las Specifications son **reutilizables** y **testeables**
