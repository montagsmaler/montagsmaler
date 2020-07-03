import { Class } from '../class-registry/class.type';
import { GlobalClassRegistry, ClassRegistry } from '../class-registry/class-registry';

interface ToClassInstanceOptions {
	useClass?: Class | string,
	performDeep?: boolean;
	ignoreErrors?: boolean;
	costumClassRegistry?: ClassRegistry,
}

const objectToClassInstancePrimitive = <T>(object: Record<string, any>, classToInstantiate: Class): T => {
	const newInstance = Object.create(classToInstantiate.prototype) as T;
	Object.assign(newInstance, object);
	return newInstance;
};

const objectToClassInstanceRecursive = (object: Record<string, any>, classRegistry: ClassRegistry, skipErrors: boolean) => {
	for (const key in object) {
		if (typeof object[key] === 'object' && object[key] !== null) {
			object[key] = objectToClassInstanceRecursive(object[key], classRegistry, skipErrors);
		}
	}
	if (!Array.isArray(object)) {
		try {
			const className = object.__className;
			if (!className) throw new Error('Could not infer class for instantiation.');
			const classToInstantiate = classRegistry.getClass(className);
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

export const objectToClassInstance = <T>(object: Record<string, any>, options?: ToClassInstanceOptions): T => {
	let performDeep = true;
	let classForInstance: Class | string;
	let skipErrors = false;
	let classRegistry: ClassRegistry = GlobalClassRegistry.getInstance();
	if (options) {
		performDeep = !(options.performDeep === false);
		classForInstance = options.useClass;
		skipErrors = (options.ignoreErrors === true);
		if (options.costumClassRegistry) {
			classRegistry = options.costumClassRegistry;
		}
	}
	try {
		if (!object || typeof object !== 'object') throw new Error('Input is not an object.');
	} catch (err) {
		if (skipErrors) {
			return object as T;
		} else {
			throw err;
		}
	}
	if (performDeep) {
		if (classForInstance) throw new Error('Invalid config. Can not apply costum class recursively. Set performDeep to false.');
		return objectToClassInstanceRecursive(object, classRegistry, skipErrors) as T;
	} else {
		try {
			const className = classForInstance || object.__className;
			if (!className) throw new Error('Could not infer class for instantiation.');
			const classToInstantiate = (typeof className === 'string') ? classRegistry.getClass(className) : className;
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

export const stringToClassInstance = <T>(stringifiedObject: string, options?: ToClassInstanceOptions): T => {
	return objectToClassInstance<T>(JSON.parse(stringifiedObject), options);
};