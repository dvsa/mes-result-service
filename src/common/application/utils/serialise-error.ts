export const serialiseError = (error: unknown) => {
  return (error instanceof Error)
    ? JSON.stringify(error, Object.getOwnPropertyNames(error))
    : JSON.stringify(error);
};
