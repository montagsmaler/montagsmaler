import { Class } from './class.type';
import { JSONSerializableClasses } from './serializable.decorator';
declare const global: Record<string, any>;

interface ObjectToClassInstanceOptions {
	classForInstance?: Class | string,
	performDeep?: boolean;
	skipErrors?: boolean;
}

const objectToClassInstancePrimitive = <T>(object: Record<string, any>, classToInstantiate: Class): T => {
	const newInstance = Object.create(classToInstantiate.prototype) as T;
	Object.assign(newInstance, object)
	return newInstance;
};

const objectToClassInstanceRecursive = (object: Record<string, any>, skipErrors) => {
	for (const key in object) {
		if (typeof object[key] === 'object' && object[key] !== null) {
			object[key] = objectToClassInstanceRecursive(object[key], skipErrors);
		}
	}
	if (!Array.isArray(object)) {
		try {
			const className = object.__className;
			if (!className) throw new Error('Could not infer class for instantiation.');
			const classToInstantiate = global[JSONSerializableClasses].get(className);
			if (!classToInstantiate) throw new Error('Could not find class for instantiation.');
			return objectToClassInstancePrimitive(object, classToInstantiate);
		} catch (err) {
			if (skipErrors) {
				return object;
			} else {
				throw err;
			}
		}
	} else {
		return object;
	}
};

export const objectToClassInstance = <T>(object: Record<string, any>, options?: ObjectToClassInstanceOptions): T => {
	let perFormDeep = true;
	let classForInstance: Class | string;
	let skipErrors = false;
	if (options) {
		perFormDeep = !(options.performDeep === false);
		classForInstance = options.classForInstance;
		skipErrors = (options.skipErrors === true);
	}
	if (!object || typeof object !== 'object') throw new Error('Input is not an object.');
	if (!global[JSONSerializableClasses]) throw new Error('No global serializable classes defined.');
	if (perFormDeep) {
		if (classForInstance) throw new Error('Can not apply costum class recursively. Set performDeep to false.');
		return objectToClassInstanceRecursive(object, skipErrors) as T;
	} else {
		try {
			const className = classForInstance || object.__className;
			if (!className) throw new Error('Could not infer class for instantiation.');
			const classToInstantiate = (typeof className === 'string') ? global[JSONSerializableClasses].get(className) : className;
			if (!classToInstantiate) throw new Error('Could not find class for instantiation.');
			return objectToClassInstancePrimitive<T>(object, classToInstantiate);
		} catch (err) {
			if (skipErrors) {
				return object as T;
			} else {
				throw err;
			}
		}
	}
};

export const stringToClassInstance = <T>(stringifiedObject: string, classForInstance?: ObjectToClassInstanceOptions): T => {
	return objectToClassInstance<T>(JSON.parse(stringifiedObject), classForInstance);
};