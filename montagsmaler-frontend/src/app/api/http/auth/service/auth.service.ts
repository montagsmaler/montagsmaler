import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILoginRequest, IRegisterResult, IRegisterRequest, IVerifyRequest, IVerifyResult, User, ILoginResult, IAccessToken, IIdToken } from '../models';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SKIP_TOKEN_REFRESH } from '../interceptor/auth.skip.token.refresh';
import { filter, first, switchMap } from 'rxjs/internal/operators';

const skipRefreshHeader = {
  headers: {},
};
skipRefreshHeader.headers[SKIP_TOKEN_REFRESH] = 'true';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private readonly authRoute: string = '/auth';
  private readonly baseUrlAuth: string = `${this.baseUrl}${this.authRoute}`;
  private readonly loggedInUser$: BehaviorSubject<User | null> = new BehaviorSubject(null);
  private readonly accessToken$: BehaviorSubject<IAccessToken | null> =  new BehaviorSubject(null);
  private readonly refreshTokenInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
  }

  private setLoggedInUser(idToken: IIdToken | null): void {
    const user = (idToken) ? User.fromIdToken(idToken) : null;
    this.loggedInUser$.next(user);
  }

  private setAccessToken(accessToken: IAccessToken | null): void {
    this.accessToken$.next(accessToken);
  }

  public async login(loginRequest: ILoginRequest): Promise<void> {
    try {
      const tokens = await this.http.post<ILoginResult>(`${this.baseUrlAuth}/login`, loginRequest, skipRefreshHeader).toPromise();
      this.setLoggedInUser(tokens.idToken);
      this.setAccessToken(tokens.accessToken);
    } catch (err) {
      throw err;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.http.post(`${this.baseUrlAuth}/logout`, {}).toPromise();
      this.setLoggedInUser(null);
      this.setAccessToken(null);
    } catch (err) {
      throw err;
    }
  }

  public async register(registerRequest: IRegisterRequest): Promise<IRegisterResult> {
    try {
      return await this.http.post<IRegisterResult>(`${this.baseUrlAuth}/register`, registerRequest).toPromise();
    } catch (err) {
      throw err;
    }
  }

  public async verify(verifyRequest: IVerifyRequest): Promise<IVerifyResult> {
    try {
      return await this.http.post<IVerifyResult>(`${this.baseUrlAuth}/verifyRegister`, verifyRequest).toPromise();
    } catch (err) {
      throw err;
    }
  }

  public async refreshAccessToken(): Promise<void> {
    try {
      this.refreshTokenInProgress$.next(true);
      const tokens = await this.http.post<ILoginResult>(`${this.baseUrlAuth}/refresh`, {}, skipRefreshHeader).toPromise();
      this.setLoggedInUser(tokens.idToken);
      this.setAccessToken(tokens.accessToken);
    } catch (err) {
      this.router.navigateByUrl('/welcome');
    } finally {
      this.refreshTokenInProgress$.next(false);
    }
  }

  /**
   * Testroute
   */
  public async getCognitoUser(): Promise<any> {
    try {
      return await this.http.get(`${this.baseUrlAuth}/cognitoUser`).toPromise();
    } catch (err) {
      throw err;
    }
  }

  public getLoggedInUser$(): Observable<User | null> {
    return this.loggedInUser$.asObservable();
  }

  public getLoggedInUser(): User | null {
    return this.loggedInUser$.value;
  }

  public getAccessToken$(refresh?: boolean): Observable<IAccessToken | null> {
    if ((refresh || !this.accessToken$.value) && !this.refreshTokenInProgress$.value) {
      this.refreshAccessToken();
    }
    return this.refreshTokenLoadedNotify$().pipe(
      switchMap(() => this.accessToken$.asObservable()),
    );
  }

  private refreshTokenLoadedNotify$(): Observable<boolean> {
    return this.refreshTokenInProgress$.asObservable().pipe(
      filter(inProgress => inProgress === false),
      first(),
    );
  }

  public getAccessToken(): IAccessToken | null {
    return this.accessToken$.value;
  }
}
