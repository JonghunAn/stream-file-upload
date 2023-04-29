export const isExpired = (exp: number): boolean => {
  const _timestamp = Date.now();
  return exp < _timestamp;
};

const extractArgs = (fn: string): Array<string> => {
  const argsRawString = fn.slice(fn.toString().search(/\(/) + 1, fn.toString().search(/\)/));
  return argsRawString ? argsRawString.split(',').map(arg => arg.trim()) : [];
};

export const genStoredProcedure = (fn: string, fnName: string): string => {
  const args = extractArgs(fn);
  return `${fnName}(graph, g${args.length ? ', ' : ''}${args.join(', ')})`;
};

export const addPreZeroPadding = (value: Buffer, len: number): Buffer => {
  while (value.length < len) {
    value = Buffer.concat([Buffer.from([0x00]), value]);
  }
  return value;
};
