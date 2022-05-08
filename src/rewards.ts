import axios from 'axios';
import { DateTime } from 'luxon';
import { parse } from 'papaparse';

interface Reward {
  date: string;
  total: number;
  eth: number;
}

export class Rewards {
  private address: string;

  private zone = 'America/Sao_Paulo';

  constructor(address: string) {
    this.address = address;
  }

  private async getRewards(): Promise<Reward[]> {
    const url = `https://api.flexpool.io/v2/miner/export/rewards.csv?coin=eth&address=${this.address}`;
    const { data: rewards } = await axios.get(url);
    const { data } = parse(rewards.replace('Date', 'date').replace('Value ETH', 'eth'), {
      delimiter: ',',
      header: true,
    });
    return data as Reward[];
  }

  private async getTickerPrice(coin = 'ETH') {
    const { data } = await axios.get(`https://www.mercadobitcoin.net/api/${coin}/ticker/`);
    return Number(data.ticker.last);
  }

  private async calculateRewards(rewards: Reward[]) {
    const ethPrice = await this.getTickerPrice();

    return rewards.reduce((acc, cur) => {
      const date = new Date(cur.date);
      const month = DateTime.fromJSDate(date, { zone: this.zone }).setLocale('pt-br').toFormat('MMMM/yyyy');
      if (month === 'Invalid DateTime') {
        return acc;
      }
      return {
        ...acc,
        [month]: {
          total: Number(acc[month]?.total || 0) + Number(cur.eth),
          totalBrl: (Number(acc[month]?.total || 0) + Number(cur.eth)) * ethPrice,
          blocks: [
            ...(acc[month]?.blocks || []),
            {
              date: DateTime.fromJSDate(date, { zone: this.zone }).setLocale('pt-br').toFormat('dd/MM/yyyy'),
              eth: Number(cur.eth),
              brl: Number(cur.eth * ethPrice),
            },
          ],
          days: acc[month]?.blocks?.length + 1 || [],
        },
      };
    }, {} as any);
  }

  async execute() {
    const rewards = await this.getRewards();
    return this.calculateRewards(rewards);
  }
}
