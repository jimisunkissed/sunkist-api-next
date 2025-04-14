export const decodeToken = (token: string): any => {
  try {
    const [, payloadBase64] = token.split('.');
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString();

    return JSON.parse(decodedPayload);
  } catch (error) {
    throw error;
  }
};
