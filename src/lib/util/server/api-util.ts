import { NextApiRequest, NextApiResponse } from 'next';

export const onApiSuccess = <T>(req: NextApiRequest, res: NextApiResponse<T>, data: T): void => {
  return res.status(200).json(data);
};

export const onApiError = (req: NextApiRequest, res: NextApiResponse, error: any): void => {
  console.error('ERROR:', error?.message ?? '');
  return res.status(error?.code ?? 500).send(error.message ?? 'An unknown error occurred');
};
export const apiEncodeRequest = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params) return baseUrl;

  const encodedParams: string = Object.keys(params)
    .map((x) => `${encodeURIComponent(x)}=${encodeURIComponent(params[x])}`)
    .join('&');

  return `${baseUrl}?${encodedParams}`;
};

export const apiDecodeArray = <T = any>(param: string | null | undefined): T[] | undefined => {
  if (!param) return undefined;
  try {
    const decoded = decodeURIComponent(param);
    return JSON.parse(decoded) as T[];
  } catch (error) {
    return undefined;
  }
};

export const apiDecodeObject = <T = Record<string, unknown>>(param: string | null | undefined): T | undefined => {
  if (!param) return undefined;
  try {
    const decoded = decodeURIComponent(param);
    return JSON.parse(decoded) as T;
  } catch (error) {
    return undefined;
  }
};

export const apiParseNumber = (param: string | string[] | undefined): number | undefined => {
  if (typeof param === 'string') {
    const parsed = parseInt(param, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};
