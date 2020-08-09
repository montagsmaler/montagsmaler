import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, first, switchMap, map } from 'rxjs/internal/operators';
import { UNAUTHORIZED } from 'http-status-codes';
import { getReqFromAccessToken, getReqWithCredentials, SKIP_ACCESS_TOKEN } from './auth.utility';

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
    if (!request.headers.get(SKIP_ACCESS_TOKEN)) {
      return this.authService.getAccessToken$().pipe(
        first(),
        map(accessToken => getReqFromAccessToken(request, accessToken)),
        switchMap(requestWithCredentialsAndBearer => {
          return next.handle(requestWithCredentialsAndBearer).pipe(
            catchError(error => {
              if (this.isAuthError(error)) {
                return this.authService.getAccessToken$({ refresh: true }).pipe(
                  first(),
                  map(refreshedAccessToken => getReqFromAccessToken(request, refreshedAccessToken)),
                  switchMap(requestWithCredentialsAndNewBearer => next.handle(requestWithCredentialsAndNewBearer)),
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
