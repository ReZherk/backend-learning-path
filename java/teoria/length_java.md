# Tamaño en Arrays, Colecciones y Strings en Java

## 1. Concepto general

En Java, el "tamaño" de una estructura depende de su tipo:

- En **arrays**, se usa la propiedad `length`.
- En **colecciones** (ej. `ArrayList`, `HashSet`), se usa el método `size()`.
- En **Strings**, se usa el método `length()`.

👉 Es importante distinguir entre **propiedad** y **método**:

- `length` → propiedad de arrays.
- `length()` → método de `String`.
- `size()` → método de colecciones.

## 2. Tamaño de un array

Los arrays en Java tienen la propiedad `length`, que indica cuántos elementos contiene.

El tamaño se define al momento de la creación y no puede cambiar.

**Ejemplo:**

```java
int[] numeros = {1, 2, 3};
System.out.println(numeros.length); // 3

Object[] elementos = {1, "Hola", true};
System.out.println(elementos.length); // 3
```

📌 **Importante:**

- `length` **NO es un método**.
- No lleva paréntesis ❌ `length()`.

## 3. Validar tamaño antes de comparar arrays

Buena práctica: comprobar primero que los arrays tengan el mismo tamaño antes de comparar sus elementos.

**Ejemplo:**

```java
if (a.length != b.length) {
    System.out.println("Los arrays tienen distinto tamaño");
} else {
    System.out.println("Los arrays tienen el mismo tamaño");
}
```

## 4. Tamaño en colecciones

En colecciones como `ArrayList`, se usa el método `size()`:

```java
import java.util.ArrayList;

ArrayList<String> lista = new ArrayList<>();
lista.add("A");
lista.add("B");

System.out.println(lista.size()); // 2
```

## 5. Tamaño en Strings

En cadenas de texto (`String`), se usa el método `length()`:

```java
String texto = "Hola";
System.out.println(texto.length()); // 4
```

## 6. Resumen comparativo

| Tipo      | Cómo obtener tamaño | Ejemplo          |
| --------- | ------------------- | ---------------- |
| Array     | Propiedad `length`  | `arr.length`     |
| String    | Método `length()`   | `texto.length()` |
| Colección | Método `size()`     | `lista.size()`   |
