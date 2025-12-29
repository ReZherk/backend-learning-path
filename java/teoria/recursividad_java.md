# ¿Qué es la recursividad?

La recursividad es una técnica en donde un método se llama a sí mismo para resolver un problema, dividiéndolo en subproblemas más pequeños hasta llegar a un caso base que detiene la ejecución.

**Ejemplo:**

```java
public static int factorial(int n) {
    if (n == 0) return 1; // caso base
    return n * factorial(n - 1); // caso recursivo
}

public static int fibonacci(int n) {
    if (n == 0) return 0; // caso base
    if (n == 1) return 1; // caso base
    return fibonacci(n - 1) + fibonacci(n - 2); // caso recursivo
}
```

## Conexión entre recursividad y Object[]

- En Java, un `Object[]` puede contener cualquier tipo de objeto, incluso otros arrays.
- Cuando recorres un `Object[]`, no sabes de antemano si cada elemento es un valor simple (ej. Integer, String) o si es otro `Object[]`.
- La recursividad entra en juego porque, si encuentras otro array dentro, necesitas aplicar el mismo proceso de recorrido a ese array interno.

**Interpretación:**

Es como abrir cajas dentro de cajas: cada vez que encuentras una caja nueva, vuelves a aplicar la misma lógica para ver qué hay dentro.

### Ejemplo

**Caso:**

```java
Object[] arr = {1, new Object[]{2, 3}, 4};
```

**Solución:**

```java
void imprimir(Object[] arr) {
    for (Object elem : arr) {
        if (elem instanceof Object[]) {
            imprimir((Object[]) elem); // Recursión
        } else {
            System.out.println(elem);
        }
    }
}
```

**Salida:**

```
1
2
3
4
```
