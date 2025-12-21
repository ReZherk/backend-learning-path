# La clase Object en Java

## ¿Qué es?

Object es la clase base de Java, definida en `java.lang.Object`.

Todas las clases en Java heredan directa o indirectamente de Object.

Esto significa que cualquier objeto en Java puede ser tratado como un Object.

## Características principales

- Es la raíz de la jerarquía de clases en Java.
- Permite que cualquier clase sea manipulada de forma genérica.
- Arrays también son objetos y heredan de Object.
- Los tipos primitivos no heredan de Object, pero sus clases envoltorio (wrappers) sí.
- Gracias a Object, cualquier referencia puede apuntar a distintos tipos de objetos.

## Métodos comunes de Object

- `toString()` → devuelve una representación en texto del objeto.
- `equals(Object obj)` → compara si dos objetos son iguales.
- `hashCode()` → devuelve un código hash del objeto.
- `getClass()` → devuelve la clase del objeto en tiempo de ejecución.
- `clone()` → crea una copia del objeto (si la clase lo permite).

## Ejemplo

```java
public class DemoObject {
    public static void main(String[] args) {
        // Un String es un objeto
        Object texto = "Hola mundo";
        System.out.println(texto.toString()); // Hola mundo
        System.out.println(texto.getClass()); // class java.lang.String

        // Un Integer es un objeto
        Object numero = 123;
        System.out.println(numero.toString());  // 123
        System.out.println(numero.getClass());  // class java.lang.Integer

        // Un arreglo también es un objeto
        Object arreglo = new int[]{1, 2, 3};
        System.out.println(arreglo.toString()); // [I@hashcode (representación interna)
        System.out.println(arreglo.getClass()); // class [I  (array de int)

        // Incluso una clase personalizada es un objeto
        Object persona = new Persona("Patrick");
        System.out.println(persona.toString()); // Persona: Patrick
        System.out.println(persona.getClass()); // class Persona
    }
}

// Clase personalizada
class Persona {
    private String nombre;

    public Persona(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public String toString() {
        return "Persona: " + nombre;
    }
}
```
