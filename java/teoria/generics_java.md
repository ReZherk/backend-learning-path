# Generics en Java

## ¿Qué son?

Los Generics son una característica de Java que permite definir clases, interfaces y métodos con tipos de datos como parámetros. Se escriben entre los símbolos `<>` y sirven para que las colecciones y otras estructuras trabajen con tipos específicos de objetos.

## ¿Quién puede usarlos?

- **Interfaces:** Ejemplo `List<E>`
- **Clases:** Ejemplo `class Caja<T>`
- **Métodos:** Ejemplo `public <T> void imprimir(T dato)`

## Alcances

- **Seguridad de tipos en compilación:** el compilador detecta errores si se usan tipos incorrectos.
- **Reutilización de código:** una sola clase genérica puede trabajar con múltiples tipos.
- **Claridad y legibilidad:** el código es más fácil de leer y mantener.
- **Polimorfismo flexible:** permite que estructuras funcionen con distintos tipos de objetos.

## Limitaciones

- No funcionan con tipos primitivos directamente (se deben usar wrappers como Integer, Double, Boolean, Character).
- **Type Erasure:** en tiempo de ejecución se borra la información de los generics, por lo que no se puede diferenciar entre `List<String>` y `List<Integer>`.
- No se pueden crear instancias de tipos genéricos directamente (`new T()` no es válido).
- No se pueden usar arrays de tipos genéricos (`new T[10]` no es válido).

## Ejemplos

### Clase genérica

```java
// Clase genérica Caja que puede guardar cualquier tipo
class Caja<T> {
    private T contenido;

    public void setContenido(T valor) {
        contenido = valor;
    }

    public T getContenido() {
        return contenido;
    }
}

public class Main {
    public static void main(String[] args) {
        // Caja de Strings
        Caja<String> cajaTexto = new Caja<>();
        cajaTexto.setContenido("Hola Generics");
        System.out.println(cajaTexto.getContenido()); // Hola Generics

        // Caja de Integer
        Caja<Integer> cajaNumero = new Caja<>();
        cajaNumero.setContenido(123);
        System.out.println(cajaNumero.getContenido()); // 123
    }
}
```

### Lista genérica

```java
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // Lista de Strings
        List<String> nombres = new ArrayList<>();
        nombres.add("Patrick");
        nombres.add("Alexander");
        System.out.println(nombres.get(0)); // Patrick

        // Lista de Integer
        List<Integer> numeros = new ArrayList<>();
        numeros.add(10);
        numeros.add(20);
        System.out.println(numeros.get(1)); // 20
    }
}
```
