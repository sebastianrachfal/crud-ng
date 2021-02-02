import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Campaign } from '../models/Campaign';
import { CampaignFormComponent } from './campaign-form/campaign-form.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {
  campaigns?: Campaign[] = [];
  balance: number = 5000;

  constructor(public dialog: MatDialog) {
    //? Default data set for ease of use
    this.campaigns?.push(
      new Campaign(
        1,
        'My first campaign',
        ['First', 'Important', 'Ongoing'],
        123,
        454,
        true,
        123,
        'New York City'
      ),
      new Campaign(
        2,
        'My second campaign',
        ['Second', 'Partnership', 'Nike', 'Clothing'],
        123,
        454,
        true,
        123,
        'New York City'
      ),
      new Campaign(
        3,
        'My third campaign',
        ['Food'],
        123,
        454,
        true,
        123,
        'Phoenix'
      )
    );
  }

  //? Tracker for campaign updates
  trackCampaign(index: number, campaign: Campaign) {
    return campaign ? campaign.id : undefined;
  }

  //? Handlers for adding, removing and editing campaigns
  createCampaign() {
    this.dialog
      .open(CampaignFormComponent, {
        maxWidth: '650px',
        data: {
          balance: this.balance,
          id: 0,
          name: '',
          keywords: [],
          bidAmount: undefined,
          fund: undefined,
          status: true,
          radius: 0,
          town: '',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!!result) {
          this.balance -= result.fund;
          this.campaigns?.push(
            new Campaign(
              this.getNextID(),
              result.name,
              result.keywords,
              result.bidAmount,
              result.fund,
              result.status,
              result.radius,
              result.town
            )
          );
        }
      });
  }
  editCampaign(event: MouseEvent, index: number) {
    if (this.campaigns)
      for (let campaign of this.campaigns) {
        if (campaign.id == index) {
          this.dialog
            .open(CampaignFormComponent, {
              maxWidth: '650px',
              data: {
                balance: this.balance,
                ...campaign,
              },
            })
            .afterClosed()
            .subscribe((result) => {
              if (!!result) {
                this.balance += campaign.fund - result.fund;
                campaign.update(result);
              }
            });
        }
      }
    event.stopPropagation();
  }
  deleteCampaign(event: MouseEvent, index: number) {
    event.stopPropagation();
    if (this.campaigns)
      for (let i = 0; i < this.campaigns.length; i++) {
        if (this.campaigns[i].id == index) {
          this.balance += this.campaigns[i].fund;
          this.campaigns.splice(i, 1);
          break;
        }
      }
  }

  //? Generates a new id for a campaign(max_id+1)
  getNextID(): number {
    let curMax: number = -1;
    if (this.campaigns)
      for (let campaign of this.campaigns)
        if (campaign.id > curMax) curMax = campaign.id;
    return curMax + 1;
  }
}
