import { Class } from './class.type';
declare const global: Record<string, any>;
export const JSONSerializableClasses = 'JSONSerializableClasses';

export interface JSONSerializableOptions {
	className?: string;
}

export const JSONSerializable = (options?: JSONSerializableOptions) => {
	return <T extends Class>(constructor: T) => {
		const className = (options && options.className) ? options.className : constructor.name;
		if (!global[JSONSerializableClasses]) {
			global[JSONSerializableClasses] = new Map<string, Class>();
		}
		global[JSONSerializableClasses].set(className, constructor);
		return class extends constructor {
			__className: string = className;
		};
	};
};