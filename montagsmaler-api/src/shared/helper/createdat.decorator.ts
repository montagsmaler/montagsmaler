export const CreatedAt = () => {
	return <T extends { new(...args: any[]): {} }>(constructor: T) => {
		return class extends constructor {
			createdAt = process.hrtime().join('');
		};
	};
};
