# Problema: Comparar Arrays Anidados

## Temas necesarios para resolver este problema

Antes de intentar resolver este problema, asegúrate de entender los siguientes conceptos:

1. **[Arrays en Java](../teoria/02_arrays.md)** - Entender qué es un array y cómo funciona `Object[]`
2. **[Comparación en Java](../teoria/comparison_java.md)** - Cómo comparar correctamente objetos y arrays
3. **[Tamaño de estructuras](../teoria/length_java.md)** - Uso de la propiedad `length` en arrays
4. **[instanceof y Casting](../teoria/instanceof-and-casting-java.md)** - Detectar tipos y hacer conversiones seguras
5. **[Recursividad](../teoria/recursividad_java.md)** - Técnica fundamental para procesar arrays anidados

## Descripción del problema

📌 Implementa el método `compareArrays` para determinar si dos arrays son iguales, considerando arrays anidados y respetando el orden de los elementos.

### Casos de prueba

```java
arrA = [1, 2, 3, [], 4, [5, 5, [7, 8]]]
arrB = [1, 2, 3, [], 4, [5, 5, [7, 8]]]
arrC = [1, 2, 3, [], 4, [5, 5, [7, 99]]]
arrD = [[], 1, 2, 3]
arrE = [0, 1, 2, 3]

compareArrays(arrA, arrB) → true
compareArrays(arrA, arrC) → false
compareArrays(arrC, arrD) → false
compareArrays(arrD, arrE) → false
```

## Código inicial

```java
import java.io.*;
import java.util.*;

/*
  Write a method named "compareArrays" to determine if two arrays are equal
  (they have same elements in same position)

  Testing:

  arrA = [1, 2, 3, [], 4, [5, 5, [7, 8]]]
  arrB = [1, 2, 3, [], 4, [5, 5, [7, 8]]]
  arrC = [1, 2, 3, [], 4, [5, 5, [7, 99]]]
  arrD = [[], 1, 2, 3]

  System.out.println(compareArrays(arrA, arrB)); // expected true
  System.out.println(compareArrays(arrA, arrC)); // expected false
  System.out.println(compareArrays(arrC, arrD)); // expected false
  System.out.println(compareArrays(arrD, arrE)); // expected false
*/

class Solution {

  // 👉 Tu misión: implementar aquí la función correctamente
  public static boolean compareArrays(Object[] arrayA, Object[] arrayB) {
      // TODO: Escribe la lógica
      // - Verificar tamaños
      // - Recorrer cada elemento
      // - Detectar si son arrays o no
      // - Recursividad si es necesario
      return false; // <-- Cambia esto
  }

  public static void main(String[] args) {

    Object[] arrA = {1, 2, 3, new Object[] {}, 4, new Object[] {5, 5, new Object[] {7, 8}}};
    Object[] arrB = {1, 2, 3, new Object[] {}, 4, new Object[] {5, 5, new Object[] {7, 8}}};
    Object[] arrC = {1, 2, 3, new Object[] {}, 4, new Object[] {5, 5, new Object[] {7, 99}}};
    Object[] arrD = {new Object[] {}, 1, 2, 3};
    Object[] arrE = {0, 1, 2, 3};

    System.out.println(compareArrays(arrA, arrB)); // true
    System.out.println(compareArrays(arrA, arrC)); // false
    System.out.println(compareArrays(arrC, arrD)); // false
    System.out.println(compareArrays(arrD, arrE)); // false
  }
}
```

## Pistas para la solución

1. **Primero verifica los tamaños**: Si los arrays tienen diferente `length`, no pueden ser iguales.
2. **Recorre elemento por elemento**: Usa un bucle para comparar cada posición.
3. **Detecta arrays anidados**: Usa `instanceof Object[]` para saber si un elemento es un array.
4. **Aplica recursividad**: Si ambos elementos son arrays, llama a `compareArrays` recursivamente.
5. **Compara valores simples**: Si no son arrays, usa `equals()` para comparar.
