import { HttpRequest } from '@angular/common/http';
import { IAccessToken } from '../models';

export const getReqWithCredentials = (request: HttpRequest<any>): HttpRequest<any> => {
  const clonedWithCredentials = request.clone({
    withCredentials: true,
  });
  return clonedWithCredentials;
};

export const getReqWithBearerToken = (request: HttpRequest<any>, bearerToken: string): HttpRequest<any> => {
  const clonedWithBearer = request.clone({
    headers: request.headers.set('Authorization', 'Bearer ' + bearerToken),
  });
  return clonedWithBearer;
};

export const getReqWithCredentialsAndBearerToken = (request: HttpRequest<any>, bearerToken: string): HttpRequest<any> => {
  return getReqWithCredentials(getReqWithBearerToken(request, bearerToken));
};

export const getReqFromAccessToken = (request: HttpRequest<any>, accessToken: IAccessToken): HttpRequest<any> => {
  return (accessToken) ?
    getReqWithCredentialsAndBearerToken(request, accessToken.jwtToken) :
    getReqWithCredentials(request);
};
