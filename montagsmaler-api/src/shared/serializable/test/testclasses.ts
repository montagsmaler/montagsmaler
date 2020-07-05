import { JSONSerializable } from '../decorator/serializable.decorator';
import { Class } from '../index';

export const IsCarnivore = (isCarnivore: boolean) => {
	return <T extends Class>(constructor: T) => {
		return class extends constructor {
			isCarnivore = isCarnivore;
		};
	};
};

@JSONSerializable()
export class Animal {
	constructor(public name: string, public isMammal: boolean) {}

	sayYourName(): string {
		return `Hello my name is ${this.name}!`;
	}

	doNoise(): string {
		return '***';
	};
}

@IsCarnivore(true)
@JSONSerializable()
export class Dog extends Animal {
	constructor(name: string) {
		super(name, true);
	}

	doNoise(): string {
		return 'Woof, woof!';
	}
}

export class Fish {
	constructor(public name: string) {}

	doNoise(): string {
		return 'Blubb, blubb!';
	}

	sayYourName(): string {
		return `Hello my name is ${this.name}!`;
	}
}

@JSONSerializable()
@IsCarnivore(false)
export class Human extends Animal {
	constructor(name: string, private customNoise: string, public pets: Animal[]) {
		super(name, true);
	}

	doNoise(): string {
		return this.customNoise;
	}

	makePetsSayTheirName(): string[] {
		return this.pets.map(pet => pet.sayYourName());
	}

	addPet(pet: Animal) {
		this.pets.push(pet);
	}
}