import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankService } from '../../services/bank.service';
import { CraftService } from '../../services/craft.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly bank = inject(BankService);
  protected readonly craft = inject(CraftService);
}
