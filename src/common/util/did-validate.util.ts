export const isDIDValid = (did: string): boolean => {
  const didRegex = /did:infra:01:PUB_K1_[a-zA-Z\d]{50}/;
  return didRegex.test(did);
};
