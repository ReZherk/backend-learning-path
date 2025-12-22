# ¿Qué es un array en Java?

Un array en Java es una estructura de datos que almacena un conjunto de elementos del mismo tipo en posiciones consecutivas de memoria, accesibles mediante índices, con un tamaño fijo definido al momento de su creación.

## Ejemplo

```java
int[] numeros = {1, 2, 3};

System.out.println(numeros[0]); // 1
System.out.println(numeros[1]); // 2
System.out.println(numeros[2]); // 3
```

## ¿Qué es Object[]?

Un `Object[]` es un array en Java cuyo tipo declarado es Object.

Esto significa que puede almacenar referencias a cualquier objeto, ya que todas las clases en Java heredan de Object.

Aunque los elementos dentro del array puedan ser de diferentes clases (String, Integer, Boolean, etc.), todos cumplen la definición de array porque comparten el mismo tipo base: Object.

### Ejemplo

```java
Object[] elementos = {1, "Hola", true};

for (Object e : elementos) {
    System.out.println(e + " -> " + e.getClass().getSimpleName());
}
```

**Salida:**

```
1 -> Integer
Hola -> String
true -> Boolean
```

## ¿Cómo comparo los arrays de Object?

[Comparación en Java](./comparison_java.md)

## ¿Cómo medir el tamano de un arrays?

[saber tamano en java](./length_java.md)
