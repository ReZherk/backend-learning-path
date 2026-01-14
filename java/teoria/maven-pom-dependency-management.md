# Maven POM - Gestión de Dependencias

## ¿Qué es un POM?

**POM (Project Object Model)** es el archivo fundamental de configuración de Maven (`pom.xml`) que define la estructura, configuración y dependencias de un proyecto Java.

**Controla:**

- Versiones de librerías (dependencies)
- Versiones de plugins de construcción
- Proceso de compilación
- Configuración de ejecución
- Compatibilidad entre frameworks
- Herencia de configuraciones

**Importante:**

📌 Un proyecto puede compilar correctamente pero fallar en runtime si las versiones de dependencias son incompatibles entre sí, aunque individualmente sean válidas.

## Estructura de proyectos multi-módulo

En arquitecturas de microservicios es común tener un POM padre que gestiona múltiples módulos hijos:

```
reactive-microservices-system   ← POM PADRE (parent)
│
├── microservice-users         ← POM HIJO (child)
├── microservice-auth          ← POM HIJO
├── microservice-gateway       ← POM HIJO
└── microservice-inventory     ← POM HIJO
```

**Relación:**

- El **POM padre** define las reglas y versiones centralizadas
- Los **POM hijos** heredan configuraciones y declaran qué dependencias necesitan

## POM Padre (Parent POM)

El POM padre actúa como centro de control para toda la arquitectura multi-módulo.

### Características

**1. Define el parent de Spring Boot:**

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.4.1</version>
    <relativePath/>
</parent>
```

**Esto proporciona:**

- Versiones predeterminadas de Spring Framework
- Versiones de servidores (Tomcat, Jetty, Undertow)
- Versiones de librerías comunes (Jackson, Hibernate, etc.)
- Configuración de plugins de Maven

**2. Define propiedades globales:**

```xml
<properties>
    <java.version>21</java.version>
    <spring-cloud.version>2024.0.0</spring-cloud.version>
    <springdoc.version>2.6.0</springdoc.version>
</properties>
```

**Esto significa:**

- Todos los módulos usarán la misma versión de Java
- Todos usarán la misma versión de Spring Cloud
- Centraliza el control de versiones

**3. Usa dependencyManagement para versiones centralizadas:**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**4. Usa pluginManagement para configuración de plugins:**

```xml
<pluginManagement>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>3.4.1</version>
        </plugin>
    </plugins>
</pluginManagement>
```

## POM Hijo (Child POM)

Los módulos hijos heredan del padre y solo declaran qué dependencias específicas necesitan.

### Estructura básica

```xml
<project>
    <!-- Hereda del padre -->
    <parent>
        <groupId>com.example</groupId>
        <artifactId>reactive-microservices-system</artifactId>
        <version>1.0.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <!-- Identificación del módulo -->
    <artifactId>microservice-users</artifactId>
    <name>Users Microservice</name>

    <!-- Solo declara CUÁLES dependencias necesita -->
    <!-- NO repite versiones (ya están en el padre) -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
            <!-- Sin versión - la toma del padre -->
        </dependency>

        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
            <!-- Sin versión - la toma del padre -->
        </dependency>
    </dependencies>

    <!-- Activa los plugins (sin repetir configuración) -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- Sin versión - la toma del padre -->
            </plugin>
        </plugins>
    </build>
</project>
```

**Ventajas de heredar:**

- ✔ No repetir versiones en cada módulo
- ✔ Cambios de versión centralizados en un solo lugar
- ✔ Garantiza consistencia entre módulos
- ✔ Reduce código duplicado

## dependencyManagement vs dependencies

Esta es una distinción crucial que causa confusión frecuente.

### dependencyManagement (Declaración de versiones)

**Función:** Define **qué versión usar**, pero **NO activa** la dependencia.

**Ubicación:** Típicamente en el POM padre.

**Ejemplo:**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2024.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
            <version>2.6.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**Significado:**

> "Si algún módulo usa Spring Cloud o Springdoc, usará estas versiones específicas"

**Importante:**

- NO descarga ninguna librería
- Solo reserva la versión
- Los módulos hijos deben declarar explícitamente que la necesitan

### dependencies (Activación de dependencias)

**Función:** **Activa** la dependencia para que Maven la descargue e incluya.

**Ubicación:** En POM padre (dependencias comunes) o POM hijo (dependencias específicas).

**Ejemplo en hijo:**

```xml
<dependencies>
    <!-- Activa la dependencia -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
        <!-- NO especifica versión - la toma de dependencyManagement -->
    </dependency>
</dependencies>
```

### Tabla comparativa

| Aspecto                | dependencyManagement                | dependencies                         |
| ---------------------- | ----------------------------------- | ------------------------------------ |
| **Función**            | Define versiones                    | Activa dependencias                  |
| **Descarga librerías** | NO                                  | SÍ                                   |
| **Ubicación típica**   | POM padre                           | POM padre y/o hijos                  |
| **Requiere versión**   | SÍ                                  | NO (si está en dependencyManagement) |
| **Herencia**           | Los hijos pueden usar las versiones | Los hijos heredan las dependencias   |

### Flujo completo

```
1. Padre declara en dependencyManagement:
   spring-cloud-dependencies = 2024.0.0
    ↓
2. Hijo declara en dependencies:
   spring-cloud-starter-config (sin versión)
    ↓
3. Maven resuelve:
   - Busca versión en dependencyManagement del padre
   - Encuentra 2024.0.0
   - Descarga spring-cloud-starter-config:2024.0.0
```

## pluginManagement vs plugins

Similar a dependencies, pero para plugins de construcción.

### pluginManagement

**Función:** Define **qué versión y configuración** usar para plugins, pero **NO los ejecuta**.

**Ejemplo:**

```xml
<pluginManagement>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>3.4.1</version>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</pluginManagement>
```

**Significado:**

> "Cuando algún módulo use este plugin, usará esta versión y configuración"

### plugins

**Función:** **Activa** el plugin para que Maven lo ejecute durante el build.

**Ejemplo en hijo:**

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <!-- NO especifica versión ni configuración - las toma de pluginManagement -->
        </plugin>
    </plugins>
</build>
```

## Compatibilidad de versiones

La compatibilidad entre versiones es crítica. No todas las versiones de frameworks son compatibles entre sí.

### Matriz de compatibilidad Spring

| Spring Boot | Spring Cloud | Java |
| ----------- | ------------ | ---- |
| 3.2.x       | 2023.0.x     | 17+  |
| 3.3.x       | 2023.0.x     | 17+  |
| 3.4.x       | 2024.0.x     | 21+  |

**Ejemplo de incompatibilidad:**

| Componente   | Versión real |
| ------------ | ------------ |
| Spring Boot  | 3.3.6        |
| Spring Cloud | 2024.0.0     |

**Problema:**

- Spring Cloud 2024.0.x requiere Spring Boot 3.4.x
- Usar Spring Boot 3.3.6 con Spring Cloud 2024.0.0 causa **runtime compatibility failure**

**¿Qué sucede?**

```
1. Aplicación inicia
    ↓
2. Spring Cloud carga y verifica versiones
    ↓
3. Detecta incompatibilidad con Spring Boot
    ↓
4. Lanza BeanCreationException o NoSuchMethodError
    ↓
5. Aplicación falla al arrancar
```

**Solución:**

Usar combinaciones validadas oficialmente. Consultar:

- [Spring Cloud Release Train](https://spring.io/projects/spring-cloud)
- Tabla de compatibilidad en la documentación oficial

### Runtime Compatibility Failure

**Runtime Compatibility Failure** es cuando:

- El código compila correctamente
- Todas las dependencias se descargan sin errores
- Pero al ejecutar, hay conflictos de versiones incompatibles

**Síntomas comunes:**

- `NoSuchMethodError` - método que existía en una versión pero no en otra
- `ClassNotFoundException` - clase movida o eliminada entre versiones
- `BeanCreationException` - Spring no puede crear beans por incompatibilidades
- `LinkageError` - versiones de clases incompatibles cargadas

## Errores comunes

### Error 1: Especificar versiones en módulos hijos

```xml
<!-- ❌ MAL - El hijo especifica versión -->
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
        <version>2024.0.0</version>  <!-- No debería estar aquí -->
    </dependency>
</dependencies>
```

**Problema:**

- Sobrescribe la versión del padre
- Puede causar inconsistencias entre módulos
- Dificulta actualizar versiones centralizadamente

**✔ Correcto:**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
        <!-- Sin versión - la toma del padre -->
    </dependency>
</dependencies>
```

### Error 2: Mezclar versiones incompatibles

```xml
<!-- ❌ MAL - Versiones incompatibles -->
<properties>
    <spring-boot.version>3.3.6</spring-boot.version>
    <spring-cloud.version>2024.0.0</spring-cloud.version>
</properties>
```

**Problema:**

- Spring Cloud 2024.0.x requiere Boot 3.4.x
- Causará errores en runtime

**✔ Correcto:**

```xml
<properties>
    <spring-boot.version>3.4.1</spring-boot.version>
    <spring-cloud.version>2024.0.0</spring-cloud.version>
</properties>
```

### Error 3: Olvidar declarar en dependencyManagement

```xml
<!-- ❌ MAL - Padre no tiene dependencyManagement -->
<dependencies>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
        <version>2.6.0</version>
    </dependency>
</dependencies>
```

**Problema:**

- Cada módulo debe repetir la versión
- No hay control centralizado

**✔ Correcto:**

```xml
<!-- En padre -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
            <version>2.6.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- En hijo -->
<dependencies>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
    </dependency>
</dependencies>
```

### Error 4: No usar properties para versiones

```xml
<!-- ❌ MAL - Versión hardcodeada -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2024.0.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**Problema:**

- Difícil de actualizar
- No se puede referenciar en otros lugares

**✔ Correcto:**

```xml
<properties>
    <spring-cloud.version>2024.0.0</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Reglas de oro para gestión de POM

### Regla 1: Orden de prioridad en versiones

Siempre piensa en este orden al seleccionar versiones:

```
1. Spring Boot (base)
    ↓
2. Spring Cloud (compatible con Boot)
    ↓
3. Librerías externas (compatibles con Boot)
```

### Regla 2: Nunca cambiar versiones sin verificar compatibilidad

Antes de actualizar cualquier versión:

1. Verificar tabla de compatibilidad oficial
2. Revisar release notes y breaking changes
3. Probar en entorno de desarrollo primero
4. Actualizar todo el ecosistema relacionado junto

### Regla 3: Usar combinaciones validadas

No experimentar con combinaciones no documentadas. Usar solo releases oficialmente compatibles.

### Regla 4: Centralizar en el padre

- ✔ Versiones en `<properties>` del padre
- ✔ dependencyManagement en el padre
- ✔ pluginManagement en el padre
- ❌ Versiones en módulos hijos

## Checklist antes de ejecutar

Antes de ejecutar una aplicación multi-módulo:

- [ ] Spring Boot y Spring Cloud son versiones compatibles
- [ ] Librerías externas (Springdoc, etc.) soportan la versión de Boot
- [ ] No hay mezcla de versiones viejas con nuevas incompatibles
- [ ] Todas las versiones están definidas en el padre
- [ ] Los hijos solo declaran dependencias, no versiones
- [ ] Se consultó documentación oficial de compatibilidad

## Cómo revisar un POM

Plantilla mental al revisar cualquier `pom.xml`:

1. **¿Quién es el padre?**

   - ¿Hereda de spring-boot-starter-parent?
   - ¿Hereda de un POM padre custom?

2. **¿Qué versión de Spring Boot usa?**

   - Verificar en `<parent>` o `<properties>`

3. **¿Hay Spring Cloud?**

   - ¿Qué versión?
   - ¿Es compatible con la versión de Boot?

4. **¿Hay librerías externas importantes?**

   - Springdoc, Security, Cloud Contract, etc.
   - ¿Soportan esa versión de Boot?

5. **¿Las versiones están centralizadas?**
   - ¿En properties?
   - ¿En dependencyManagement?
   - ¿O desperdigadas en cada módulo?

## Ejemplo completo de POM padre

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Herencia de Spring Boot -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
        <relativePath/>
    </parent>

    <!-- Identificación del proyecto -->
    <groupId>com.example</groupId>
    <artifactId>microservices-system</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <!-- Módulos hijos -->
    <modules>
        <module>microservice-users</module>
        <module>microservice-auth</module>
        <module>microservice-gateway</module>
    </modules>

    <!-- Propiedades centralizadas -->
    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2024.0.0</spring-cloud.version>
        <springdoc.version>2.6.0</springdoc.version>
    </properties>

    <!-- Gestión de versiones de dependencias -->
    <dependencyManagement>
        <dependencies>
            <!-- Spring Cloud BOM -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Springdoc -->
            <dependency>
                <groupId>org.springdoc</groupId>
                <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
                <version>${springdoc.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- Gestión de plugins -->
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </pluginManagement>
</project>
```

## Ejemplo completo de POM hijo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Herencia del padre -->
    <parent>
        <groupId>com.example</groupId>
        <artifactId>microservices-system</artifactId>
        <version>1.0.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <!-- Identificación del módulo -->
    <artifactId>microservice-users</artifactId>
    <name>Users Microservice</name>

    <!-- Solo declara CUÁLES dependencias necesita -->
    <dependencies>
        <!-- Spring Boot Webflux -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- Spring Cloud Config Client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>

        <!-- Springdoc -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- Activación de plugins -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## Resumen

- **POM** controla todo el ciclo de vida del proyecto, no solo dependencias
- Arquitectura **padre-hijo** permite centralizar configuraciones
- **dependencyManagement** define versiones, **dependencies** las activa
- **pluginManagement** define configuración de plugins, **plugins** los ejecuta
- Los **hijos heredan** del padre y solo declaran qué necesitan
- **Compatibilidad de versiones** es crítica - no todas las combinaciones funcionan
- Usar siempre **combinaciones validadas** oficialmente
- **Runtime failures** ocurren cuando versiones incompatibles se combinan
- **Centralizar versiones** en el padre usando properties
- Seguir el orden: Boot → Cloud → Librerías externas
