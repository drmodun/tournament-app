import { HttpService } from '@nestjs/axios';
import { ChallongeService } from '../challonge.service';

describe('ChallongeService', () => {
  const put = jest.fn();
  const post = jest.fn();
  let service: ChallongeService;

  beforeEach(() => {
    put.mockReset().mockResolvedValue({ data: { data: { id: '9' } } });
    post.mockReset().mockResolvedValue({ data: { access_token: 'token' } });
    service = new ChallongeService({
      axiosRef: { put, post },
    } as unknown as HttpService);
  });

  describe('reopenMatch', () => {
    it("changes the match's state to reopen", async () => {
      await expect(service.reopenMatch('9', '42')).resolves.toEqual({
        id: '9',
      });

      expect(put).toHaveBeenCalledWith(
        'https://api.challonge.com/v2/application/tournaments/42/matches/9/change_state.json',
        { data: { type: 'MatchState', attributes: { state: 'reopen' } } },
        expect.objectContaining({
          headers: expect.objectContaining({ 'Authorization-Type': 'v2' }),
        }),
      );
    });

    it('fetches a new token and tries once more when Challonge refuses', async () => {
      put.mockRejectedValueOnce(new Error('401'));

      await service.reopenMatch('9', '42');

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(2);
    });
  });
});
