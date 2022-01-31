import axios from "axios";
import { DateTime } from "luxon";
import { parse } from "papaparse";

export class Rewards {
  private address: string;

  constructor(address: string) {
    this.address = address ?? "0x8c5fa2057c41e77af5fac16448ae539abac6cd0e";
  }
  private async getRewards() {
    const { data: rewards } = await axios.get(
      `https://api.flexpool.io/v2/miner/export/rewards.csv?coin=eth&address=${this.address}`
    );
    const { data } = parse(rewards.replace("Date", "date").replace("Value ETH", "eth"), {
      delimiter: ",",
      header: true,
    });
    return data;
  }

  private async getTickerPrice(coin = "ETH") {
    const { data } = await axios.get(`https://www.mercadobitcoin.net/api/${coin}/ticker/`);
    return Number(data.ticker.last);
  }
  private async calculateRewards(rewards = [] as any[]) {
    const ethPrice = await this.getTickerPrice();

    return rewards.reduce((acc, cur) => {
      const date = new Date(cur.date);
      const month = DateTime.fromJSDate(date).setLocale("pt-br").toFormat("MMMM/yyyy");
      if (month === "Invalid DateTime") {
        return acc;
      }
      return {
        ...acc,
        [month]: {
          total: {
            eth: Number(acc[month]?.total.eth || 0) + Number(cur.eth),
            brl: (Number(acc[month]?.total.brl || 0) + Number(cur.eth)) * ethPrice,
          },
          blocks: [
            ...(acc[month]?.blocks || []),
            {
              date: DateTime.fromJSDate(date, { zone: "America/Sao_Paulo" }).setLocale("pt-br").toFormat("dd/MM/yyyy"),
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
    const rewardsByMonth = await this.calculateRewards(rewards);
    return rewardsByMonth;
  }
}
