/* eslint-disable @typescript-eslint/no-empty-function */
import { Class } from './class.type';

export interface AddClassConfig {
	name: string;
	class: Class<{}>;
}

export interface ClassRegistry {
	addClasses(...classes: AddClassConfig[]): void;
	getClass(className: string): Class<{}> | undefined;
}

class BasicClassRegistry implements ClassRegistry {
	private readonly registry = new Map<string, Class<{}>>();

	addClasses(...classes: AddClassConfig[]): void {
		for (const classConfig of classes) {
			this.registry.set(classConfig.name, classConfig.class);
		}
	}

	getClass(className: string): Class<{}> | undefined {
		return this.registry.get(className);
	}
}

export class GlobalClassRegistry implements ClassRegistry {
	protected static instance: GlobalClassRegistry;
	protected registry: ClassRegistry = new BasicClassRegistry();

	protected constructor() { }

	public static getInstance(): GlobalClassRegistry {
		if (!this.instance) {
			this.instance = new GlobalClassRegistry();
		}
		return this.instance;
	}

	public setCostumClassRegistry(costumClassRegistry: ClassRegistry) {
		this.registry = costumClassRegistry;
	}

	public addClasses(...classes: AddClassConfig[]): void {
		this.registry.addClasses(...classes);
	}

	public getClass(className: string): Class<{}> | undefined {
		return this.registry.getClass(className);
	}
}