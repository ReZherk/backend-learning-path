export function ConsoleLogResponse(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function (
      this: Record<string, unknown>,
      ...args: unknown[]
    ): Promise<unknown> {
      const now = Date.now();

      console.log(`➡️ Ejecutando método: ${String(propertyKey)}`);
      console.log('📥 Argumentos:', args);

      if ('texto' in this) {
        console.log('📌 texto antes:', this['texto']);
        this['texto'] = 'modificado desde decorador';
        console.log('📌 texto después:', this['texto']);
      }

      try {
        const result: unknown = originalMethod.call(this, ...args);

        if (result instanceof Promise) {
          const resolved: unknown = await result;
          console.log('✅ Response:', resolved);
          console.log(`⏱ Tiempo: ${Date.now() - now}ms`);
          return resolved;
        }

        console.log('✅ Response:', result);
        console.log(`⏱ Tiempo: ${Date.now() - now}ms`);
        return result;
      } catch (error: unknown) {
        console.error('❌ Error:', error);
        console.log(`⏱ Tiempo (error): ${Date.now() - now}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}
