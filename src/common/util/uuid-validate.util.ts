export const isUUIDValid = (did: string): boolean => {
  const uuidRegex = /urn:uuid:[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}/;
  return uuidRegex.test(did);
};
