import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILoginRequest, IRegisterResult, IRegisterRequest, IVerifyRequest, IVerifyResult, User, ILoginResult, IAccessToken, IIdToken, LoginRequest, RegisterRequest, VerifyRequest } from '../models';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { filter, first, switchMap } from 'rxjs/internal/operators';
import { SKIP_ACCESS_TOKEN } from '../interceptor/auth.utility';

const skipAccessToken = {
  headers: {},
};
skipAccessToken.headers[SKIP_ACCESS_TOKEN] = 'true';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private readonly authRoute: string = '/auth';
  private readonly baseUrlAuth: string = `${this.baseUrl}${this.authRoute}`;
  private readonly loggedInUser$: BehaviorSubject<User | null> = new BehaviorSubject(null);
  private readonly accessToken$: BehaviorSubject<IAccessToken | null> =  new BehaviorSubject(null);
  private readonly newAccessTokenInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
      const tokens = await this.http.post<ILoginResult>(`${this.baseUrlAuth}/login`, await LoginRequest.fromObject(loginRequest), skipAccessToken).toPromise();
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
      return await this.http.post<IRegisterResult>(`${this.baseUrlAuth}/register`, await RegisterRequest.fromObject(registerRequest)).toPromise();
    } catch (err) {
      throw err;
    }
  }

  public async verify(verifyRequest: IVerifyRequest): Promise<IVerifyResult> {
    try {
      return await this.http.post<IVerifyResult>(`${this.baseUrlAuth}/verifyRegister`, await VerifyRequest.fromObject(verifyRequest)).toPromise();
    } catch (err) {
      throw err;
    }
  }

  public async refreshAccessToken(): Promise<void> {
    try {
      this.newAccessTokenInProgress$.next(true);
      const tokens = await this.http.post<ILoginResult>(`${this.baseUrlAuth}/refresh`, {}, skipAccessToken).toPromise();
      this.setLoggedInUser(tokens.idToken);
      this.setAccessToken(tokens.accessToken);
    } catch (err) {
      this.router.navigateByUrl('/welcome');
    } finally {
      this.newAccessTokenInProgress$.next(false);
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

  public getAccessToken$(options?: GetAccessToken$Options): Observable<IAccessToken | null> {
    if (((options && options.refresh) || !this.accessToken$.value) && !this.newAccessTokenInProgress$.value) {
      this.refreshAccessToken();
    }
    return this.newAccessTokenLoadedNotify$().pipe(
      switchMap(() => this.accessToken$.asObservable()),
    );
  }

  private newAccessTokenLoadedNotify$(): Observable<boolean> {
    return this.newAccessTokenInProgress$.asObservable().pipe(
      filter(inProgress => inProgress === false),
      first(),
    );
  }

  public getAccessToken(): IAccessToken | null {
    return this.accessToken$.value;
  }
}

export interface GetAccessToken$Options {
  refresh: boolean;
}
