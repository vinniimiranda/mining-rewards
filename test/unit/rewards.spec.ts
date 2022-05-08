import { DateTime } from "luxon";
import { Rewards } from "../../src/rewards";

describe('Rewards', () => {
  it('should be defined', () => {
    const sut = new Rewards('');
    expect(sut).toBeDefined();
  })

  it('should be able to get rewards.', async () => {
    const sut = new Rewards('0x8c5fa2057c41e77af5fac16448ae539abac6cd0e');
    const rewards = await sut.execute();
    expect(rewards).toBeDefined();
    const date =DateTime.local().setLocale('pt-br').toFormat('MMMM/yyyy')
    expect(rewards[date]).toHaveProperty('total');
    expect(rewards[date]).toHaveProperty('totalBrl');
    expect(rewards[date]).toHaveProperty('blocks');
  })

  it('should not be able to get rewards.', async () => {
    const sut = new Rewards('');
    await expect(sut.execute()).rejects.toThrowError('Request failed with status code 400');
  })

})
