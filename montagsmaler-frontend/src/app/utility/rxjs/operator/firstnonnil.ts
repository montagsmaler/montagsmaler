import { Observable } from 'rxjs';
import { filterNil } from './filternil';
import { first } from 'rxjs/internal/operators';

/**
 * pipes first non-nil value
 */
export const firstNonNil = () => {
  return <T>(source: Observable<T>) => {
    return source.pipe(
      filterNil<T>(),
      first(),
    );
  };
};

