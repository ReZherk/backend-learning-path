import { AppController } from 'src/app.controller';

export function ConsoleLogResponse() {
  return (
    target: unknown,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const originalMethod: (...args: unknown[]) => Promise<unknown> =
      propertyDescriptor.value as (...args: unknown[]) => Promise<unknown>;

    propertyDescriptor.value = async function (
      this: AppController,
      ...args: unknown[]
    ): Promise<unknown> {
      console.log('Accediendo al controlador:', this);

      if (args) {
        console.log(this.texto);
      }

      console.log(
        'Aqui veremos lo  que hay dentro del  metodo  original',
        originalMethod,
      );

      console.log(
        'Aqui veremos cuantos argumentos les llega:',
        args.length,
        'y que hay dentro:',
        args,
      );

      const result: unknown = await originalMethod.call(this, ...args);

      console.log('Response:', result);

      return result;
    };

    return propertyDescriptor;
  };
}
