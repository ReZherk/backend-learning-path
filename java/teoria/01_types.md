# Primitivos, Objetos y el operador instanceof en Java

## ¿Qué es la clase Object?

La clase Object es la superclase que todas las demás clases en Java heredan, esta es la raíz. Las clases conocidas como:

- String
- Integer
- ArrayList
- etc.

Todas estas heredan de la clase Object, esto le permite compartir métodos en común, como:

- `toString()`
- `equals()`
- `hashCode()`
- `getClass()`
- etc.

-

## ¿Qué significa que son primitivos?

Es que estos no tienen métodos y no heredan de ninguna otra clase (como Object).

En Java los tipos de datos primitivos son:

- `int`
- `double`
- `boolean`
- `char`

## ¿Qué son los objetos?

Son las instancias de una clase, estos al ser referencias a clases pueden tener atributos y métodos.

Los más comunes son:

- String
- Integer
- Object[]

Sus principales características es que heredan de la clase base Object y sus métodos permiten manipular sus valores.

### Nota

Cada tipo primitivo en Java tiene una clase objeto equivalente (llamada **wrapper class**):

- `int` → `Integer`
- `double` → `Double`
- `boolean` → `Boolean`
- `char` → `Character`

Esto existe porque las colecciones del Java Collections Framework (como List, Map, Set) y las estructuras genéricas en general solo pueden trabajar con objetos, no con tipos primitivos.

## Uso de instanceof

El operador `instanceof` devuelve `true` o `false` y se utiliza para verificar en tiempo de ejecución el tipo real de un objeto.

Esto es útil porque, aunque una variable pueda estar declarada como Object, el objeto que contiene puede ser de diferentes clases.

### Ejemplo

```java
Object[] a = { 1, "xd", new Object[]{ "otro", "array" } };

for (Object elemA : a) {
    if (elemA instanceof Object[]) {
        System.out.println("Es un array dentro del array");
    } else if (elemA instanceof String) {
        System.out.println("Es un String: " + elemA);
    } else if (elemA instanceof Integer) {
        System.out.println("Es un Integer: " + elemA);
    }
}
```

**Salida:**

```
Es un Integer: 1
Es un String: xd
Es un array dentro del array
```
