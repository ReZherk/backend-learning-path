# JPA - @Entity, @Table y Constraints

## El problema inicial

Supongamos que queremos modelar un sistema de categorías para una tienda con los siguientes requisitos:

- **Categorías principales** (sin padre)
- **Subcategorías** (con padre)
- **Orden de visualización** controlado
- **Sin duplicación** de datos importantes
- **Consultas rápidas** y eficientes

**Desafíos técnicos:**

- Evitar órdenes de visualización duplicados dentro del mismo nivel
- Garantizar slugs únicos para URLs amigables
- Optimizar consultas frecuentes (búsqueda por slug, listar por padre, filtrar activos)
- Mantener integridad referencial

## De POJO a Entidad JPA

### POJO básico (sin persistencia)

Inicialmente tenemos una clase Java simple:

```java
public class Category {
    private Long id;
    private String name;
    private String slug;
    private Long parentId;
    private Integer displayOrder;
    private Boolean isActive;

    // Getters, setters, constructores...
}
```

**Problema:** Esta clase solo existe en memoria Java. No se persiste en base de datos.

### Convertir a Entidad JPA

Para que JPA gestione la persistencia, agregamos `@Entity`:

```java
@Entity
public class Category {
    private Long id;
    private String name;
    private String slug;
    private Long parentId;
    private Integer displayOrder;
    private Boolean isActive;
}
```

**Ahora:** Cada instancia de `Category` representa una fila en la base de datos.

## @Entity

### ¿Qué es @Entity?

`@Entity` es una anotación de JPA que marca una clase Java como una entidad persistente. Indica a JPA/Hibernate que esta clase debe ser mapeada a una tabla en la base de datos.

**Características:**

- Cada instancia = una fila en la tabla
- Requiere un constructor sin argumentos (puede ser privado)
- Requiere un campo anotado con `@Id`
- Puede tener ciclo de vida gestionado (persist, merge, remove)

**Ejemplo básico:**

```java
@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
```

**Sin `@Entity`:**

- La clase es un POJO normal
- No se puede usar con EntityManager
- No se mapea a base de datos

### Nombre de la entidad

Por defecto, el nombre de la entidad es el nombre de la clase. Puedes cambiarlo:

```java
@Entity(name = "ProductCategory")
public class Category {
    // ...
}
```

**Uso:** En JPQL queries

```java
// Con name = "ProductCategory"
entityManager.createQuery("SELECT c FROM ProductCategory c", Category.class);
```

## @Table

### ¿Qué es @Table?

`@Table` especifica detalles de la tabla de base de datos a la que se mapea la entidad.

**Sin `@Table`:**

Hibernate genera el nombre de la tabla basándose en el nombre de la clase, lo cual puede resultar en nombres inconsistentes:

```java
@Entity
public class Category { }
// Podría crear tabla: category, Category, categories (depende de configuración)
```

**Con `@Table`:**

```java
@Entity
@Table(name = "categories")
public class Category { }
// Siempre crea tabla: categories
```

### Atributos de @Table

```java
@Table(
    name = "categories",                    // Nombre de la tabla
    schema = "store",                       // Schema de BD
    catalog = "my_catalog",                 // Catálogo
    uniqueConstraints = { ... },            // Restricciones de unicidad
    indexes = { ... }                       // Índices
)
```

**Atributos principales:**

| Atributo            | Descripción               | Ejemplo               |
| ------------------- | ------------------------- | --------------------- |
| `name`              | Nombre de la tabla        | `"categories"`        |
| `schema`            | Schema de base de datos   | `"store"`             |
| `catalog`           | Catálogo de base de datos | `"my_catalog"`        |
| `uniqueConstraints` | Constraints de unicidad   | Ver sección siguiente |
| `indexes`           | Índices de performance    | Ver sección siguiente |

### Nombres de tabla

```java
// Tabla simple
@Table(name = "categories")

// Tabla con schema
@Table(name = "categories", schema = "store")
// SQL: store.categories

// Tabla con nombre reservado (escapado)
@Table(name = "`order`")
// SQL: `order` (evita conflicto con palabra reservada)
```

## uniqueConstraints - Restricciones de Unicidad

### El problema

Considera este escenario:

```
Categoría: Ropa Hombre | displayOrder: 1 | parentId: NULL
Categoría: Ropa Mujer  | displayOrder: 1 | parentId: NULL  ❌ Problema
```

**Problemas:**

- El frontend no sabe qué categoría mostrar primero
- Inconsistencia en el orden de visualización
- Posibles bugs al ordenar elementos

**Necesitamos:** Dentro del mismo nivel (mismo `parentId`), el `displayOrder` debe ser único.

### ¿Qué es uniqueConstraints?

`uniqueConstraints` define restricciones de unicidad a nivel de base de datos que involucran una o más columnas.

**Sintaxis:**

```java
@Table(
    name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_category_parent_display_order",
            columnNames = { "parent_id", "display_order" }
        )
    }
)
```

**SQL generado:**

```sql
ALTER TABLE categories
ADD CONSTRAINT uq_category_parent_display_order
UNIQUE (parent_id, display_order);
```

### Comportamiento

**Datos válidos:**

```
parentId = NULL, displayOrder = 1  ✅
parentId = NULL, displayOrder = 2  ✅
parentId = 5,    displayOrder = 1  ✅
parentId = 5,    displayOrder = 2  ✅
```

**Datos inválidos:**

```
parentId = NULL, displayOrder = 1  ✅
parentId = NULL, displayOrder = 1  ❌ Duplicado - Constraint violation
```

```
parentId = 5,    displayOrder = 1  ✅
parentId = 5,    displayOrder = 1  ❌ Duplicado - Constraint violation
```

### Múltiples uniqueConstraints

```java
@Table(
    name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_category_parent_display_order",
            columnNames = { "parent_id", "display_order" }
        ),
        @UniqueConstraint(
            name = "uq_category_slug",
            columnNames = { "slug" }
        )
    }
)
```

**Efecto:**

- `(parent_id, display_order)` debe ser único
- `slug` debe ser único globalmente

### uniqueConstraint vs @Column(unique = true)

#### @Column(unique = true)

```java
@Column(unique = true)
private String slug;
```

**Limitaciones:**

- Solo para una columna
- Nombre de constraint generado automáticamente (no controlable)
- Menos flexible

#### uniqueConstraints

```java
@UniqueConstraint(
    name = "uq_category_slug",
    columnNames = { "slug" }
)
```

**Ventajas:**

- Nombre de constraint controlable
- Soporta múltiples columnas
- Más explícito y mantenible

**Recomendación:** Usa `uniqueConstraints` para consistencia, especialmente en constraints compuestos.

## indexes - Índices para Performance

### El problema de performance

**Consultas frecuentes:**

```sql
-- Búsqueda por slug
SELECT * FROM categories WHERE slug = 'ropa-hombre';

-- Listar subcategorías
SELECT * FROM categories WHERE parent_id = 5;

-- Filtrar activos
SELECT * FROM categories WHERE is_active = true;
```

**Sin índices:**

- Full table scan en cada consulta
- Performance degradada con crecimiento de datos
- Tiempos de respuesta lentos

### ¿Qué es un índice?

Un **índice** es una estructura de datos en la base de datos que mejora la velocidad de las operaciones de búsqueda a costa de espacio adicional y overhead en escrituras.

**Analogía:**

Como el índice de un libro - permite encontrar información rápidamente sin leer todo el libro.

### Definición de índices en JPA

```java
@Table(
    name = "categories",
    indexes = {
        @Index(
            name = "idx_category_slug",
            columnList = "slug",
            unique = true
        ),
        @Index(
            name = "idx_category_parent_id",
            columnList = "parent_id"
        ),
        @Index(
            name = "idx_category_active",
            columnList = "is_active"
        )
    }
)
```

### Atributos de @Index

| Atributo     | Descripción         | Ejemplo                                 |
| ------------ | ------------------- | --------------------------------------- |
| `name`       | Nombre del índice   | `"idx_category_slug"`                   |
| `columnList` | Columnas del índice | `"slug"` o `"parent_id, display_order"` |
| `unique`     | Si es índice único  | `true` o `false`                        |

### Tipos de índices

#### Índice único (unique = true)

```java
@Index(
    name = "idx_category_slug",
    columnList = "slug",
    unique = true
)
```

**SQL generado:**

```sql
CREATE UNIQUE INDEX idx_category_slug ON categories(slug);
```

**Efecto:**

- Mejora performance en búsquedas por `slug`
- Garantiza que `slug` no se repita (similar a uniqueConstraint)
- Rechaza inserts/updates que violen unicidad

**Datos válidos:**

```
slug = "ropa-hombre"  ✅
slug = "ropa-mujer"   ✅
```

**Datos inválidos:**

```
slug = "ropa-hombre"  ✅
slug = "ropa-hombre"  ❌ Duplicate key violation
```

#### Índice no único (unique = false, default)

```java
@Index(
    name = "idx_category_parent_id",
    columnList = "parent_id"
)
```

**SQL generado:**

```sql
CREATE INDEX idx_category_parent_id ON categories(parent_id);
```

**Efecto:**

- Mejora performance en consultas que filtran por `parent_id`
- Permite duplicados (múltiples categorías con el mismo padre)

**Consulta optimizada:**

```sql
SELECT * FROM categories WHERE parent_id = 5;
-- Con índice: busca en estructura de índice (rápido)
-- Sin índice: full table scan (lento)
```

#### Índice compuesto (múltiples columnas)

```java
@Index(
    name = "idx_category_parent_order",
    columnList = "parent_id, display_order"
)
```

**SQL generado:**

```sql
CREATE INDEX idx_category_parent_order ON categories(parent_id, display_order);
```

**Consultas optimizadas:**

```sql
-- Usa el índice (coincide orden de columnas)
SELECT * FROM categories WHERE parent_id = 5 ORDER BY display_order;

-- Usa el índice (primera columna)
SELECT * FROM categories WHERE parent_id = 5;

-- NO usa el índice (segunda columna sola)
SELECT * FROM categories WHERE display_order = 1;
```

**Regla:** El índice compuesto se usa si la consulta incluye la primera columna del índice.

### Índice en columna booleana

```java
@Index(
    name = "idx_category_active",
    columnList = "is_active"
)
```

**Debate:** Índices en columnas booleanas tienen baja cardinalidad (solo 2 valores).

**Útil si:**

- La mayoría de registros tienen un valor (`true` = 95%, `false` = 5%)
- Consultas frecuentes filtran por ese valor minoritario

**Consulta optimizada:**

```sql
-- Si hay pocos inactivos, el índice ayuda
SELECT * FROM categories WHERE is_active = false;
```

**No útil si:**

- Distribución 50/50 de valores
- Full table scan puede ser más eficiente

## Ejemplo completo con todos los conceptos

```java
package com.store.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "categories",
    uniqueConstraints = {
        // Evitar orden duplicado dentro del mismo nivel
        @UniqueConstraint(
            name = "uq_category_parent_display_order",
            columnNames = { "parent_id", "display_order" }
        )
    },
    indexes = {
        // Índice único para slugs (URLs amigables)
        @Index(
            name = "idx_category_slug",
            columnList = "slug",
            unique = true
        ),
        // Índice para búsquedas por padre
        @Index(
            name = "idx_category_parent_id",
            columnList = "parent_id"
        ),
        // Índice para filtrar activos
        @Index(
            name = "idx_category_active",
            columnList = "is_active"
        ),
        // Índice compuesto para ordenar subcategorías
        @Index(
            name = "idx_category_parent_order",
            columnList = "parent_id, display_order"
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### SQL DDL generado

```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    parent_id BIGINT,
    display_order INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id),

    -- Unique constraint
    CONSTRAINT uq_category_parent_display_order
        UNIQUE (parent_id, display_order)
);

-- Índices
CREATE UNIQUE INDEX idx_category_slug ON categories(slug);
CREATE INDEX idx_category_parent_id ON categories(parent_id);
CREATE INDEX idx_category_active ON categories(is_active);
CREATE INDEX idx_category_parent_order ON categories(parent_id, display_order);
```

## Casos de uso reales

### Caso 1: Categorías principales

```java
Category ropa = new Category();
ropa.setName("Ropa");
ropa.setSlug("ropa");
ropa.setParent(null);           // Categoría raíz
ropa.setDisplayOrder(1);
ropa.setIsActive(true);

Category tecnologia = new Category();
tecnologia.setName("Tecnología");
tecnologia.setSlug("tecnologia");
tecnologia.setParent(null);     // Categoría raíz
tecnologia.setDisplayOrder(2);  // Diferente orden ✅
tecnologia.setIsActive(true);
```

**En BD:**

```
id | name       | slug       | parent_id | display_order | is_active
1  | Ropa       | ropa       | NULL      | 1             | true
2  | Tecnología | tecnologia | NULL      | 2             | true
```

### Caso 2: Subcategorías

```java
Category hombre = new Category();
hombre.setName("Hombre");
hombre.setSlug("ropa-hombre");
hombre.setParent(ropa);         // Padre = Ropa
hombre.setDisplayOrder(1);
hombre.setIsActive(true);

Category mujer = new Category();
mujer.setName("Mujer");
mujer.setSlug("ropa-mujer");
mujer.setParent(ropa);          // Padre = Ropa
mujer.setDisplayOrder(2);       // Orden diferente ✅
mujer.setIsActive(true);
```

**En BD:**

```
id | name   | slug        | parent_id | display_order | is_active
3  | Hombre | ropa-hombre | 1         | 1             | true
4  | Mujer  | ropa-mujer  | 1         | 2             | true
```

### Caso 3: Violación de constraint

```java
Category duplicado = new Category();
duplicado.setName("Otro Hombre");
duplicado.setSlug("ropa-hombre-2");
duplicado.setParent(ropa);      // Mismo padre
duplicado.setDisplayOrder(1);   // Mismo orden ❌
duplicado.setIsActive(true);

categoryRepository.save(duplicado);
// Lanza: DataIntegrityViolationException
// Causa: Duplicate entry '1-1' for key 'uq_category_parent_display_order'
```

### Caso 4: Consultas optimizadas

```java
// Búsqueda por slug - Usa idx_category_slug
Category category = categoryRepository.findBySlug("ropa-hombre");

// Listar subcategorías - Usa idx_category_parent_id
List<Category> subcategories = categoryRepository.findByParentId(1L);

// Filtrar activos - Usa idx_category_active
List<Category> active = categoryRepository.findByIsActiveTrue();

// Subcategorías ordenadas - Usa idx_category_parent_order
List<Category> ordered = categoryRepository
    .findByParentIdOrderByDisplayOrderAsc(1L);
```

## Cuándo usar cada característica

### @Entity

**Usar siempre** cuando:

- Necesitas persistir la clase en base de datos
- Quieres que JPA gestione el ciclo de vida

**No usar** para:

- DTOs (Data Transfer Objects)
- Clases de utilidad
- Value Objects que se embeden en entidades

### @Table

**Usar siempre** para:

- Controlar nombre exacto de la tabla
- Definir constraints y índices
- Organización con schemas

**Omitir** solo si:

- Estás prototipando rápidamente
- El nombre por defecto es aceptable

### uniqueConstraints

**Usar cuando:**

- Necesitas unicidad en combinación de columnas
- La lógica de negocio requiere valores únicos
- Quieres prevenir duplicados a nivel de BD

**Ejemplos:**

- `(parent_id, display_order)` - Orden único por nivel
- `(user_id, role_id)` - Un rol por usuario
- `(email)` - Emails únicos
- `(year, month, user_id)` - Un registro por mes por usuario

### indexes

**Usar cuando:**

- Columnas frecuentemente usadas en WHERE
- Columnas usadas en JOIN
- Columnas usadas en ORDER BY
- Necesitas mejorar performance de consultas

**No usar cuando:**

- Tabla muy pequeña (< 1000 filas)
- Columna rara vez consultada
- Columna con alta tasa de escritura y baja de lectura
- Índice degrada más de lo que ayuda

## Errores comunes

### Error 1: Olvidar @Id

```java
// ❌ MAL - Falta @Id
@Entity
public class Category {
    private Long id;
    private String name;
}

// Error: No identifier specified for entity
```

**✔ Correcto:**

```java
@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
```

### Error 2: uniqueConstraint con nombre de atributo en lugar de columna

```java
// ❌ MAL - Usa nombre de atributo Java
@UniqueConstraint(
    columnNames = { "parentId", "displayOrder" }  // Incorrecto
)

// ✔ CORRECTO - Usa nombre de columna BD
@UniqueConstraint(
    columnNames = { "parent_id", "display_order" }  // Correcto
)
```

### Error 3: Índice único vs uniqueConstraint

```java
// Ambos funcionan, pero uniqueConstraint es más semántico

// Opción 1: Índice único
@Index(name = "idx_slug", columnList = "slug", unique = true)

// Opción 2: Constraint único (preferido)
@UniqueConstraint(name = "uq_slug", columnNames = { "slug" })
```

**Recomendación:** Usa `uniqueConstraint` para reglas de negocio, `@Index(unique=true)` solo si el constraint es secundario a la optimización.

### Error 4: Índices redundantes

```java
// ❌ MAL - Índice redundante
@Table(
    indexes = {
        @Index(columnList = "parent_id, display_order"),
        @Index(columnList = "parent_id")  // Redundante
    }
)
```

**Razón:** El índice compuesto `(parent_id, display_order)` ya puede usarse para consultas de solo `parent_id`.

**✔ Correcto:**

```java
@Table(
    indexes = {
        @Index(columnList = "parent_id, display_order")
        // No necesitas índice separado de parent_id
    }
)
```

### Error 5: No nombrar constraints

```java
// ❌ MAL - Sin nombre
@UniqueConstraint(columnNames = { "slug" })

// SQL generado: UK_a1b2c3d4 (nombre auto-generado)
```

**Problema:**

- Difícil de identificar en logs de error
- Cambia entre ejecuciones de schema generation

**✔ Correcto:**

```java
@UniqueConstraint(
    name = "uq_category_slug",
    columnNames = { "slug" }
)
```

### Error 6: Demasiados índices

```java
// ❌ MAL - Índice en cada columna
@Table(
    indexes = {
        @Index(columnList = "id"),           // Ya es PK, no necesita índice
        @Index(columnList = "name"),         // ¿Realmente se consulta?
        @Index(columnList = "description"),  // Texto largo, ineficiente
        @Index(columnList = "created_at"),
        @Index(columnList = "updated_at"),
        @Index(columnList = "is_active")
    }
)
```

**Problemas:**

- Overhead en inserts/updates
- Espacio en disco
- Mantenimiento de índices

**✔ Correcto:**

Solo índices en columnas frecuentemente consultadas:

```java
@Table(
    indexes = {
        @Index(columnList = "slug", unique = true),
        @Index(columnList = "parent_id"),
        @Index(columnList = "is_active")
    }
)
```

## Validación de constraints en Spring

### Manejo de violaciones de constraint

```java
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(CategoryDTO dto) {
        try {
            Category category = new Category();
            category.setName(dto.getName());
            category.setSlug(dto.getSlug());
            category.setParent(dto.getParentId() != null
                ? categoryRepository.findById(dto.getParentId()).orElse(null)
                : null);
            category.setDisplayOrder(dto.getDisplayOrder());
            category.setIsActive(true);

            return categoryRepository.save(category);

        } catch (DataIntegrityViolationException e) {
            // Manejar violación de constraint
            if (e.getMessage().contains("uq_category_parent_display_order")) {
                throw new BusinessException(
                    "Ya existe una categoría con ese orden en este nivel"
                );
            }
            if (e.getMessage().contains("idx_category_slug")) {
                throw new BusinessException(
                    "Ya existe una categoría con ese slug"
                );
            }
            throw e;
        }
    }
}
```

### Validación previa (recomendado)

```java
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(CategoryDTO dto) {
        // Validar unicidad de slug antes de guardar
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new BusinessException("El slug ya está en uso");
        }

        // Validar unicidad de orden dentro del nivel
        if (categoryRepository.existsByParentIdAndDisplayOrder(
                dto.getParentId(), dto.getDisplayOrder())) {
            throw new BusinessException(
                "Ya existe una categoría con ese orden en este nivel"
            );
        }

        // Guardar si pasa validaciones
        Category category = mapToEntity(dto);
        return categoryRepository.save(category);
    }
}
```

## Migración de esquema

Si agregas constraints/indexes a una entidad existente:

### Opción 1: spring.jpa.hibernate.ddl-auto

```yaml
# application.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update # Cuidado en producción
```

**Advertencia:** `update` puede no generar todos los cambios correctamente.

### Opción 2: Flyway/Liquibase (recomendado)

```sql
-- V2__add_category_constraints.sql
ALTER TABLE categories
ADD CONSTRAINT uq_category_parent_display_order
UNIQUE (parent_id, display_order);

CREATE UNIQUE INDEX idx_category_slug ON categories(slug);
CREATE INDEX idx_category_parent_id ON categories(parent_id);
CREATE INDEX idx_category_active ON categories(is_active);
```

## Resumen

| Anotación           | Problema que resuelve         | Cuándo usar                                   |
| ------------------- | ----------------------------- | --------------------------------------------- |
| `@Entity`           | POJO no se persiste           | Siempre para clases que se guardan en BD      |
| `@Table(name)`      | Nombre de tabla inconsistente | Siempre para control explícito                |
| `uniqueConstraints` | Datos duplicados              | Cuando la lógica de negocio requiere unicidad |
| `indexes`           | Consultas lentas              | Columnas frecuentemente consultadas           |

**Puntos clave:**

- **@Entity** convierte POJO en entidad persistente
- **@Table** controla nombre y configuración de tabla
- **uniqueConstraints** previene duplicados a nivel BD
- **indexes** optimiza performance de consultas
- Nombrar constraints e índices para mejor mantenibilidad
- Validar antes de guardar para mejores mensajes de error
- No crear índices innecesarios (overhead en escrituras)
