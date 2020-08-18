import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';

export const plainToClassAndValidate = async <T, V>(cls: ClassType<T>, obj: V): Promise<T> => {
  const classInstance = plainToClass<T, V>(cls, obj);
  const errors = await validate(classInstance);
  if (errors.length > 0) {
    throw errors;
  }
  return classInstance;
};
