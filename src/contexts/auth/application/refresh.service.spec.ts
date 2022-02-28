import { AuthToken } from '../domain/auth-token.entity';
import { ITokenRepository } from '../domain/token.repository';
import { AuthTokenId } from '../domain/value-object/auth-token-id';
import { AuthTokenStatus, TokenStatus } from '../domain/value-object/auth-token-status';
import { AuthUserUuid } from '../domain/value-object/auth-user-uuid';
import { FakeTokenRepository } from '../infrastructure/fake-token.repository';
import { Refresh } from './refresh.service';

describe('Refresh', () => {
    let refresh: Refresh;
    let tokenRepository: ITokenRepository;

    const validToken = 'ABCDF1';
    const invalidToken = 'ABCDF2';
    const usedToken = 'ABCDF3';
    const expiredToken = 'ABCDF4';
    const nonExistingToken = 'ABCDF5';

    beforeEach(async () => {
        const user1 = new AuthUserUuid('270ac36c-9890-11ec-a08d-00155d2b6976');
        const user2 = new AuthUserUuid('71ad1ba4-9890-11ec-985b-00155d2b6976');
        const tokens = [
            AuthToken.create(new AuthTokenId(validToken), user1),
            AuthToken.create(new AuthTokenId(invalidToken), user1).invalidate(),
            AuthToken.create(new AuthTokenId(usedToken), user1).use(),
            AuthToken.create(new AuthTokenId(expiredToken), user1).expire(),
            AuthToken.create(new AuthTokenId('ABCDE3'), user2),
            AuthToken.create(new AuthTokenId('ABCDE4'), user2),
        ];
        tokenRepository = new FakeTokenRepository(tokens);
        refresh = new Refresh(tokenRepository);
    });
    it('should return success valid token', async () => {
        await expect(refresh.execute(validToken)).resolves.toHaveProperty('result', true);
        await expect(tokenRepository.find(new AuthTokenId(validToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.USED));
    });
    it('should return failure on invalid token and invalidate valid tokens', async () => {
        await expect(refresh.execute(invalidToken)).resolves.toHaveProperty('result', false);
        await expect(tokenRepository.find(new AuthTokenId(validToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.INVALID));
        await expect(tokenRepository.find(new AuthTokenId(usedToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.USED));
        await expect(tokenRepository.find(new AuthTokenId(expiredToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.EXPIRED));
    });
    it('should return failure on used token and invalidate valid tokens', async () => {
        await expect(refresh.execute(usedToken)).resolves.toHaveProperty('result', false);
        await expect(tokenRepository.find(new AuthTokenId(validToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.INVALID));
        await expect(tokenRepository.find(new AuthTokenId(usedToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.USED));
        await expect(tokenRepository.find(new AuthTokenId(expiredToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.EXPIRED));
    });
    it('should return failure on non existing token and let valid tokens', async () => {
        await expect(refresh.execute(nonExistingToken)).resolves.toHaveProperty('result', false);
        await expect(tokenRepository.find(new AuthTokenId(validToken))).resolves.toHaveProperty('status', new AuthTokenStatus(TokenStatus.VALID));
    });
});