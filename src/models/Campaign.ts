export interface CampaignValues {
  id?: number;
  name?: string;
  keywords?: string[];
  bidAmount?: number;
  fund?: number;
  status?: boolean;
  radius?: number;
  town?: string;
  balance?: number;
}
export class Campaign implements CampaignValues {
  id: number;
  name: string;
  keywords: string[];
  bidAmount: number;
  fund: number;
  status: boolean;
  radius: number;
  town: string;
  constructor(
    id: number,
    name: string,
    keywords: string[],
    bidAmount: number,
    fund: number,
    status: boolean,
    radius: number,
    town: string = ''
  ) {
    this.id = id;
    this.name = name;
    this.keywords = keywords;
    this.bidAmount = bidAmount;
    this.fund = fund;
    this.status = status;
    this.radius = radius;
    this.town = town;
  }
  update(values: CampaignValues) {
    for (const key in values) {
      this[key as keyof typeof Campaign] = values[key];
    }
  }
}
