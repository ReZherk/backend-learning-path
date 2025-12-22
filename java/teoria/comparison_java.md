# Comparación en Java

En Java existen diferentes formas de comparar datos dependiendo de si queremos verificar si dos referencias apuntan al mismo objeto en memoria o si queremos comparar el contenido de los objetos. Es importante entender estas diferencias para evitar errores comunes al trabajar con objetos, arrays y colecciones.

## 1. Comparación con `==`

- Compara referencias, no contenido.
- Devuelve `true` solo si ambas variables apuntan al mismo objeto en memoria.

**Ejemplo:**

```java
int[] a1 = {1, 2, 3};
int[] a2 = {1, 2, 3};
System.out.println(a1 == a2); // false
System.out.println(a1 == a1); // true
```

## 2. Método equals()

- En clases como String o Integer, compara contenido.
- En arrays, no está sobrescrito → compara referencias igual que `==`.

**Ejemplo:**

```java
String s1 = "Hola";
String s2 = "Hola";
System.out.println(s1.equals(s2)); // true (contenido)

int[] a1 = {1, 2, 3};
int[] a2 = {1, 2, 3};
System.out.println(a1.equals(a2)); // false (referencias distintas)
```

## 3. Comparar contenido de colecciones y arrays

Para comparar elemento por elemento se usa la clase Arrays:

### Arrays simples:

```java
import java.util.Arrays;

int[] a1 = {1, 2, 3};
int[] a2 = {1, 2, 3};
System.out.println(Arrays.equals(a1, a2)); // true
```

### Arrays multidimensionales:

```java
int[][] m1 = {{1, 2}, {3, 4}};
int[][] m2 = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepEquals(m1, m2)); // true
```

## 4. Nota sobre Object[]

Un `Object[]` puede contener distintos tipos de objetos, incluso otros arrays, porque todos heredan de Object.

Para saber el tipo real de cada elemento se usa `getClass()` o `instanceof`.

**Ejemplo:**

```java
Object[] elementos = {1, "Hola", new String[]{"xd"}};

for (Object e : elementos) {
    System.out.println(e + " -> " + e.getClass().getSimpleName());
}
```

**Salida:**

```
1 -> Integer
Hola -> String
[xd] -> String[]
```

## 5. Resumen comparativo

| Método                | Qué compara                       | Ejemplo resultado                      |
| --------------------- | --------------------------------- | -------------------------------------- |
| `==`                  | Referencias (misma dirección)     | false en arrays distintos              |
| `equals()` (objetos)  | Contenido (si está sobrescrito)   | true en String("Hola")                 |
| `equals()` (arrays)   | Referencias (no sobrescrito)      | false en {1,2,3} vs {1,2,3}            |
| `Arrays.equals()`     | Elemento por elemento (1D)        | true en {1,2,3} vs {1,2,3}             |
| `Arrays.deepEquals()` | Elemento por elemento (multidim.) | true en {{1,2},{3,4}} vs {{1,2},{3,4}} |
