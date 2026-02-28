//con este ejemplo pudimos ver como se ejecutan segun el tiempo y las jeraquias de estos mismo

console.log("Inicio de programa"); //1

setTimeout(() => {
  console.log("Primer Timeout");
}, 3000); //5

setTimeout(() => {
  console.log("Segundo Timeout");
}, 0); //3
//x
setTimeout(() => {
  console.log("Tercer Timeout");
}, 0); //4

console.log("Fin de programa"); //2
