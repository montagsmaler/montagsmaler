import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Observable, from } from 'rxjs';
import { switchMap, catchError, retry, tap, first } from 'rxjs/internal/operators';
import { UNAUTHORIZED } from 'http-status-codes';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    let event: Observable<HttpEvent<any>>;
    if (accessToken) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + accessToken.jwtToken),
      });
      event = next.handle(cloned);
    } else {
      event = next.handle(req);
    }

    return event.pipe(
      catchError((err, caught) => {
        if (err instanceof HttpErrorResponse && err.status === UNAUTHORIZED) {
          return from(this.authService.refreshAccessToken()).pipe(
            switchMap(() => caught),
            retry(2),
            tap(() => this.router.navigateByUrl('/welcome')),
          );
        } else {
          return caught;
        }
      }),
    );
  }
}
