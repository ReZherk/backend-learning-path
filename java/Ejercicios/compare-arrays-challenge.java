
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

    /**
     * Compara dos arrays de Object recursivamente, incluyendo arrays anidados.
     * 
     * @param arrayA Primer array a comparar
     * @param arrayB Segundo array a comparar
     * @return true si los arrays son iguales, false en caso contrario
     */
    public static boolean compareArrays(Object[] arrayA, Object[] arrayB) {

        // 1. Verificar si los arrays tienen el mismo tamaño
        if (arrayA.length != arrayB.length) {
            return false;
        }

        // 2. Recorrer cada elemento
        for (int i = 0; i < arrayA.length; i++) {

            // 3. Caso: Ambos elementos son arrays (recursión)
            if (arrayA[i] instanceof Object[] && arrayB[i] instanceof Object[]) {
                if (!compareArrays((Object[]) arrayA[i], (Object[]) arrayB[i])) {
                    return false;
                }
            }
            // 4. Caso: Elementos simples o diferentes tipos
            else {
                // Manejar valores null
                if (arrayA[i] == null && arrayB[i] == null) {
                    continue;
                }
                if (arrayA[i] == null || arrayB[i] == null) {
                    return false;
                }

                // Comparar valores usando equals()
                if (!arrayA[i].equals(arrayB[i])) {
                    return false;
                }
            }
        }

        // 5. Si pasó todas las validaciones, son iguales
        return true;
    }

    public static void main(String[] args) {

        // Definición de arrays de prueba
        Object[] arrA = { 1, 2, 3, new Object[] {}, 4, new Object[] { 5, 5, new Object[] { 7, 8 } } };
        Object[] arrB = { 1, 2, 3, new Object[] {}, 4, new Object[] { 5, 5, new Object[] { 7, 8 } } };
        Object[] arrC = { 1, 2, 3, new Object[] {}, 4, new Object[] { 5, 5, new Object[] { 7, 99 } } };
        Object[] arrD = { new Object[] {}, 1, 2, 3 };
        Object[] arrE = { 0, 1, 2, 3 };

        // Pruebas
        System.out.println(compareArrays(arrA, arrB)); // true
        System.out.println(compareArrays(arrA, arrC)); // false
        System.out.println(compareArrays(arrC, arrD)); // false
        System.out.println(compareArrays(arrD, arrE)); // false
    }
}