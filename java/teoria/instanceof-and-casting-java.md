# instanceof y Casting en Java

## ¿Qué es instanceof?

Instanceof es como un operador al ponerlo después de un objeto y después de este poner el tipo que presuntamente debe ser, mediante esta acción podemos saber si lo que está en ese objeto es lo que se cree.

**Pregunta que lo resume:**
¿Este objeto ES de este tipo?

**Ejemplo:**

```java
Object x = "Hola";

x instanceof String   // true
x instanceof Integer  // false
x instanceof Object   // true
```

## ¿Qué es casting?

Casting es la acción de indicar explícitamente al compilador que un objeto o valor debe ser tratado como si perteneciera a otro tipo compatible dentro de la jerarquía.

## Los tipos de conversiones

### 1. Conversión entre tipos primitivos

Permite cambiar un valor de un tipo primitivo a otro (ej: de `double` a `int`). En estos casos, puede haber pérdida de información como los decimales.

**Ejemplo:**

```java
double d = 9.7;
int i = (int) d; // Casting explícito: pierde decimales
```

### 2. Upcasting (implícito)

Es la conversión automática de una subclase a su superclase. Java lo hace de forma implícita porque siempre es seguro: toda subclase es compatible con su clase padre.

**Ejemplo:**

```java
Dog dog = new Dog();
Animal animal = dog; // Upcasting automático
```

### 3. Downcasting (explícito)

Es la conversión de una superclase a una subclase específica. Debe hacerse de forma explícita porque puede fallar si el objeto no es realmente del tipo al que se intenta convertir. Necesario para acceder a métodos/atributos específicos de la subclase.

**Ejemplo:**

```java
Animal animal = new Cat();
Cat cat = (Cat) animal; // Downcasting explícito
cat.purr();
```

**Nota:** Es recomendable usar el casting acompañado de un `instanceof`.

**Ejemplo:**

```java
if (animal instanceof Cat) {
    Cat cat = (Cat) animal; // Seguro
    cat.purr();
}
```

## Uso real de Upcasting y Downcasting

### Upcasting

Se usa para generalizar objetos y tratarlos bajo una interfaz común.

**Ejemplo:** en un sistema de pagos, guardar distintos métodos (`CreditCardPayment`, `PaypalPayment`) en una lista de `Payment`.

```java
class Payment {
    void process() { System.out.println("Procesando pago genérico"); }
}

class CreditCardPayment extends Payment {
    void process() { System.out.println("Procesando pago con tarjeta"); }
}

class PaypalPayment extends Payment {
    void process() { System.out.println("Procesando pago con PayPal"); }
}

public class Main {
    public static void main(String[] args) {
        Payment[] payments = {
            new CreditCardPayment(),
            new PaypalPayment()
        };

        for (Payment p : payments) {
            p.process(); // Se ejecuta la versión correcta según el objeto real
        }
    }
}
```

### Downcasting

Se usa cuando necesitas acceder a métodos específicos de la subclase.

**Ejemplo:** convertir un `Payment` en `CreditCardPayment` para validar el número de tarjeta.

```java
class CreditCardPayment extends Payment {
    void validateCard() { System.out.println("Validando tarjeta..."); }
}

public class Main {
    public static void main(String[] args) {
        Payment payment = new CreditCardPayment(); // Upcasting implícito

        if (payment instanceof CreditCardPayment) {
            CreditCardPayment cc = (CreditCardPayment) payment; // Downcasting explícito
            cc.validateCard(); // Salida: "Validando tarjeta..."
        }
    }
}
```
