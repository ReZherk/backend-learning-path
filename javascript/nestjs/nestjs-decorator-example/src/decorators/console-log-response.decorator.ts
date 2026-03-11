export function ConsoleLogResponse() {
  return (
    target: unknown,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const originalMethod: (...args: unknown[]) => Promise<unknown> =
      propertyDescriptor.value as (...args: unknown[]) => Promise<unknown>;

    propertyDescriptor.value = async function (
      ...args: unknown[]
    ): Promise<unknown> {
      const result: unknown = await originalMethod.call(this, ...args);
      console.log('Response:', result);
      return result;
    };

    return propertyDescriptor;
  };
}
