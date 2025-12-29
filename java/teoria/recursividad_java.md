**_Que es la recursidad?_**

La recursividad es una tecnica en donde un metodo se llama asi mismo para resolver un problema,dividiendolo en subproblemas mas pequenos hasta llegar a un caso base que detienen la ejecucion.

EJEMPLO:

public static int factorial(int n) {
if (n == 0) return 1; // caso base
return n \* factorial(n - 1); // caso recursivo
}

public static int fibonacci(int n) {
if (n == 0) return 0; // caso base
if (n == 1) return 1; // caso base
return fibonacci(n - 1) + fibonacci(n - 2); // caso recursivo
}
