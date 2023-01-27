export const isConstructor = (type: any) => {
  try {
    new type();
  } catch (err) {
    if ((err as Error).message.indexOf('is not a constructor') >= 0) {
      return false;
    }
  }
  return true;
};
