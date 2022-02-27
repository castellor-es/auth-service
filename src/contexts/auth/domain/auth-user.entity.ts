import { AggregateRoot } from '../../../shared/domain/aggregateroot.interface';
import { AuthUsername } from './value-object/auth-username';
import { AuthPassword } from './value-object/auth-password';
import { AuthEmail } from './value-object/auth-email';
import { AuthUuid } from './value-object/auth-uuid';

export class AuthUser extends AggregateRoot{

    private constructor(public readonly uuid: AuthUuid,
                        public readonly username: AuthUsername,
                        public readonly password: AuthPassword,
                        public readonly email: AuthEmail) {
        super();
    }

    static fromPrimitives(payload: {uuid: string, username: string, password: string, email: string}) {
        return new AuthUser(
            new AuthUuid(payload.uuid),
            new AuthUsername(payload.username),
            new AuthPassword(payload.password),
            new AuthEmail(payload.email)
        );
    }

    toPrimitives() {
        return {
            uuid: this.uuid.value,
            username: this.username.value,
            password: this.password.value,
            email: this.password.value
        }
    }
}