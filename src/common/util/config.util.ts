import { ConfigDataType } from '../constant/config-data.enum';

export const getConfigData = (key: ConfigDataType): string => {
  const data = process.env[key];

  if (!data) {
    throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
  }

  return data;
};
