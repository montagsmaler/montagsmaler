import { JSONSerializable } from '../../../shared/serializable';
import { ClaimVerfiedCognitoUser } from '../../../api/http/auth/models/aws-token';

@JSONSerializable()
export class Player {
	constructor(public readonly id: string, public readonly name: string) {}

	public static fromCognitoUser(cognitoUser: ClaimVerfiedCognitoUser): Player {
		return new Player(cognitoUser.id, cognitoUser.userName);
	}
}
