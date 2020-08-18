import { filter } from 'rxjs/internal/operators';

/**
 * filters nil values
 */
export const filterNil = <T>() => {
  return filter<T>(value => value !== undefined && value !== null);
};
