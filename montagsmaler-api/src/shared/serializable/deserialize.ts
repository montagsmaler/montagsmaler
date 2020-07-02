import { Class } from './class.type';
declare const global: Record<string, any>;

interface ToClassInstanceOptions {
	classForInstance?: Class,
	performDeep?: boolean;
}

const objectToClassInstancePrimitive = <T>(object: Record<string, any>, classForInstance?: Class): T => {
	const objClassName = (object as any).__className;
	if ((!objClassName && !classForInstance) || !global['JSONSerializableClasses']) throw new Error('Could not infer class for instantiation.');
	const className = classForInstance || objClassName;
	const classToInstantiate = global['JSONSerializableClasses'].get(className);
	if (!classToInstantiate) throw new Error('Could not infer class for instantiation.');
	const newInstance = Object.create(classToInstantiate.prototype) as T;
	Object.assign(newInstance, object)
	return newInstance;
};

const objectToClassInstanceRecursive = <T>(object: Record<string, any>, classForInstance?: Class): T => {
	for (const key in object) {
		if (typeof object[key] === 'object' && object[key] !== null) {
			object[key] = objectToClassInstanceRecursive(object[key], classForInstance);
		}
	}
	if (!Array.isArray(object)) {
		object = objectToClassInstancePrimitive(object, classForInstance);
	}
	return object as T;
};

export const objectToClassInstance = <T>(object: Record<string, any>, options?: ToClassInstanceOptions): T => {
	let perFormDeep = true;
	let classForInstance: Class;
	if (options) {
		perFormDeep = !(options.performDeep === false);
		classForInstance = options.classForInstance;
	}
	if (!object) throw new Error('Object is falsy.');
	if (perFormDeep) {
		return objectToClassInstanceRecursive<T>(object, classForInstance);
	} else {
		return objectToClassInstancePrimitive<T>(object, classForInstance);
	}
};

export const stringToClassInstance = <T>(stringifiedObject: string, classForInstance?: ToClassInstanceOptions): T => {
	return objectToClassInstance<T>(JSON.parse(stringifiedObject), classForInstance);
};