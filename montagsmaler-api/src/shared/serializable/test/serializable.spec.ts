import { Dog, Animal, Human, Fish } from './testclasses';
import { ClassRegistry, GlobalClassRegistry, AddClassConfig } from '../class-registry/class-registry';
import { stringToClassInstance } from '../deserialize/deserialize';
import { Class } from '../class-registry/class.type';

describe('serializable', () => {
	let genericAnimal: Animal;
	let testDog: Dog;
	let testHuman: Human;
	let testFish: Fish;
	let registry: ClassRegistry;

	beforeEach(() => {
		genericAnimal = new Animal('Idonthaveaname', false);
		testDog = new Dog('Marla');
		testHuman = new Human('Thomas', 'Nom nom nom...', [testDog]);
		testFish = new Fish('Nemo');
	});

	it('should be defined', () => {
		expect(genericAnimal).toBeDefined();
		expect(testDog).toBeDefined();
		expect(testHuman).toBeDefined();
	});

	it('should have classname as attribute', () => {
		expect(genericAnimal['__className']).toEqual('Animal');
		expect(testDog['__className']).toEqual('Dog');
		expect(testHuman['__className']).toEqual('Human');
	});

	it('should have classes in GlobalRegistry', () => {
		registry = GlobalClassRegistry.getInstance();
		expect(registry.getClass('Animal')).toEqual(Animal);
		expect(registry.getClass('Human')).toEqual(Human);
	});

	it('should deserialize objects and call example methods', () => {
		expect(stringToClassInstance<Animal>(JSON.stringify(genericAnimal))).toEqual(genericAnimal);
		expect(stringToClassInstance<Animal>(JSON.stringify(genericAnimal)) instanceof Animal).toBeTruthy();
		expect(stringToClassInstance<Animal>(JSON.stringify(genericAnimal)).sayYourName()).toEqual(genericAnimal.sayYourName());
		expect(stringToClassInstance<Dog>(JSON.stringify(testDog))).toEqual(testDog);
		expect(stringToClassInstance<Dog>(JSON.stringify(testDog)).sayYourName()).toEqual(testDog.sayYourName());
		expect(stringToClassInstance<Dog>(JSON.stringify(testDog)).doNoise()).toEqual(testDog.doNoise());
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman))).toEqual(testHuman);
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman)) instanceof Human).toBeTruthy();
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman)).sayYourName()).toEqual(testHuman.sayYourName());
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman)).makePetsSayTheirName()).toEqual(testHuman.makePetsSayTheirName());
	});

	it('should deserialize array of objects and call example methods', () => {
		expect(stringToClassInstance<Human[]>(JSON.stringify([testHuman]))[0]).toEqual([testHuman][0]);
		expect(stringToClassInstance<Human[]>(JSON.stringify([testHuman]))[0].sayYourName()).toEqual([testHuman][0].sayYourName());
		expect(stringToClassInstance<Human[]>(JSON.stringify([testHuman]))[0].makePetsSayTheirName()).toEqual([testHuman][0].makePetsSayTheirName());
	});

	it('should not equal since IsCarnivore decorator is applied AFTER JSONSerializable', () => {
		expect(stringToClassInstance<Dog>(JSON.stringify(testDog)) instanceof Dog).toBeFalsy();
		expect(registry.getClass('Dog')).not.toEqual(Dog);
	});

	it('should throw error since fish is has NOT JSONSerializable applied', () => {
		testHuman.addPet(testFish as Animal);
		try {
			const instance = stringToClassInstance<Human>(JSON.stringify(testHuman));
		} catch (err) {
			expect(err.message).toEqual('Could not infer class for instantiation.');
		}
	});

	it('should deserialize object and skip non inferable objects', () => {
		testHuman.addPet(testFish as Animal);
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman), { ignoreErrors: true })).toEqual(testHuman);
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman), { ignoreErrors: true }).sayYourName()).toEqual(testHuman.sayYourName());
		expect(stringToClassInstance<Human>(JSON.stringify(testHuman), { ignoreErrors: true }).pets[1].name).toEqual(testHuman.pets[1].name); //does normal JSON.parse for object properties
		try {
			stringToClassInstance<Human>(JSON.stringify(testHuman), { ignoreErrors: true }).makePetsSayTheirName(); //can not infer type so no method
		} catch (err) {
			expect(err.message).toEqual('pet.sayYourName is not a function');
		}
	});

	it('should throw error', () => {
		try {
			stringToClassInstance<Human>(null);
		} catch (err) {
			expect(err.message).toEqual('Input is not an object.');
		}
	});

	it('should return null', () => {
		expect(stringToClassInstance<Human>(null, { ignoreErrors: true })).toBeNull();
	});

	it('should throw error (bad config)', () => {
		try {
			stringToClassInstance<Animal>(JSON.stringify(genericAnimal), { useClass: Animal });
		} catch (err) {
			expect(err.message).toEqual('Invalid config. Can not apply costum class recursively. Set performDeep to false.');
		}
	});

	it('should downcast to animal', () => {
		const downcastHuman = stringToClassInstance<Animal>(JSON.stringify(testHuman), { useClass: Animal, performDeep: false });
		expect(downcastHuman instanceof Human).toBeFalsy();
		expect(downcastHuman instanceof Animal).toBeTruthy();
	});

	it('should use costum repository and throw error', () => {
		const costumRegistry: ClassRegistry = {
			addClasses: (...classes: AddClassConfig[]): void => {
				return;
			},
			getClass: (className: string): Class<{}> | undefined => {
				return undefined;
			},
		}

		try {
			stringToClassInstance<Animal>(JSON.stringify(genericAnimal), { costumClassRegistry: costumRegistry });
		} catch (err) {
			expect(err.message).toEqual('Could not find class for instantiation.');
		}
	});


	it('should try to cast anything to animal from costum registry', () => {
		const costumRegistry: ClassRegistry = {
			addClasses: (...classes: AddClassConfig[]): void => {
				return;
			},
			getClass: (className: string): Class<{}> | undefined => {
				return Animal; //always returns animal
			},
		}

		const downcastHuman = stringToClassInstance<Animal>(JSON.stringify(testHuman), { costumClassRegistry: costumRegistry, performDeep: false });
		expect(downcastHuman instanceof Human).toBeFalsy();
		expect(downcastHuman instanceof Animal).toBeTruthy();
	});
});