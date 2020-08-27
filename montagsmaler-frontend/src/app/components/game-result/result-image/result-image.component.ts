import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-result-image',
  templateUrl: './result-image.component.html',
  styleUrls: ['./result-image.component.scss']
})
export class ResultImageComponent implements OnInit {
  @Input() imageUrl: string;
  @Input() score: number;
  @Input() name: string;



  constructor() { }

  ngOnInit() {
  }

}
