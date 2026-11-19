const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'] as const;

export const needsOriginCheck = (handlerType: string, request: Request) => {
  const isServerFunction = handlerType === 'serverFn';
  const isStateChangingRequest = !SAFE_METHODS.some((safeMethod) => safeMethod === request.method);
  return isServerFunction || isStateChangingRequest;
};
