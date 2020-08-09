import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, first, switchMap, filter, map } from 'rxjs/internal/operators';
import { UNAUTHORIZED } from 'http-status-codes';
import { SKIP_TOKEN_REFRESH } from './auth.skip.token.refresh';

const getReqWithCredentials = (request: HttpRequest<any>): HttpRequest<any> => {
  const clonedWithCredentials = request.clone({
    withCredentials: true,
  });
  return clonedWithCredentials;
};

const getReqWithBearerToken = (request: HttpRequest<any>, bearerToken: string): HttpRequest<any> => {
  const clonedWithBearer = request.clone({
    headers: request.headers.set('Authorization', 'Bearer ' + bearerToken),
  });
  return clonedWithBearer;
};

const getReqWithCredentialsAndBearerToken = (request: HttpRequest<any>, bearerToken: string): HttpRequest<any> => {
  return getReqWithCredentials(getReqWithBearerToken(request, bearerToken));
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService) { }

  /**
   * Clone request with credentials and access token
   * Retry request with refreshed token
   * @param request
   * @param next
   */
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.headers.get(SKIP_TOKEN_REFRESH)) {
      return this.authService.getAccessToken$().pipe(
        first(),
        switchMap(accessToken => {
          const requestWithCredentialsAndBearer = (accessToken) ?
            getReqWithCredentialsAndBearerToken(request, accessToken.jwtToken) :
            getReqWithCredentials(request);
          return next.handle(requestWithCredentialsAndBearer).pipe(
            catchError(error => {
              if (this.isAuthError(error)) {
                return this.authService.getAccessToken$(true).pipe(
                  filter(refreshedAccessToken => refreshedAccessToken !== null),
                  map(refreshedAccessToken => refreshedAccessToken.jwtToken),
                  first(),
                  switchMap(bearerToken => next.handle(getReqWithCredentialsAndBearerToken(request, bearerToken))),
                );
              } else {
                return throwError(error);
              }
            }),
          );
        }),
      ) as Observable<HttpEvent<any>>;
    } else {
      return next.handle(getReqWithCredentials(request));
    }
  }

  /**
   * @param error
   */
  private isAuthError(error: any): boolean {
    return (error instanceof HttpErrorResponse && error.status === UNAUTHORIZED);
  }
}
