interface AuthorizationCodeData {
  client_id: string;
  redirect_uri: string;
}

const authorizationCodes: Record<string, AuthorizationCodeData> = {};

export const storeAuthorizationCode = (
  code: string,
  data: AuthorizationCodeData
): void => {
  authorizationCodes[code] = data;
};

export const validateAuthorizationCode = (code: string): boolean => {
  if (authorizationCodes[code]) {
    delete authorizationCodes[code];
    return true;
  }
  return false;
};

// export const removeAuthorizationCode = (code: string): void => {
//   delete authorizationCodes[code];
// };
