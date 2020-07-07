import { Class } from '../class-registry/class.type';
import { GlobalClassRegistry, ClassRegistry } from '../class-registry/class-registry';

export interface JSONSerializableOptions {
	costumClassName?: string;
	costumClassRegistry?: ClassRegistry,
}

/**
 * Decorator
 * Returns extended constructor which sets the class-name (default: constructor-name) as an object property and adds the constructor function to a class registry
 * @param options 
 */
export const JSONSerializable = (options?: JSONSerializableOptions) => {
	return <T extends Class<{}>>(constructor: T): T => {
		const className: string = (options && options.costumClassName) ? options.costumClassName : constructor.name;
		const classRegistry: ClassRegistry = (options && options.costumClassRegistry) ? options.costumClassRegistry : GlobalClassRegistry.getInstance();
		const wrapper = {};
		wrapper[constructor.name] = class extends constructor {
			__className: string = className;
		};
		// I don't know how to keep the name of the constructor function (read only value) without doing this absolute terribleness (object wrapper) or using eval (evil)
		classRegistry.addClasses({ name: className, class: wrapper[constructor.name] });
		return wrapper[constructor.name];
	};
};