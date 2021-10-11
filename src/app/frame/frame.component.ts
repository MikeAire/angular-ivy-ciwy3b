import { Component, OnInit, ViewChild } from '@angular/core';

import { FrameService } from '../../lib/services/frame.service';

@Component({
  selector: 'app-component-iframe',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss'],
})
export class FrameComponent implements OnInit {
  // these need putting into config somewhere, I don't like that we have to
  // define these somewhere and also do the re-writing config, could that be combined?

  @ViewChild('mainframe', { static: false }) mainframe: HTMLIFrameElement;

  constructor(private iframeService: FrameService) {}

  ngOnInit(): void {
    console.log('ngOnInit Called');
    this.iframeService.registerFrame(this.mainframe);
  }

  frameError(frame: HTMLIFrameElement): void {
    if (frame != null) {
      console.log(
        `frame erred while loading - ${frame.contentWindow.location.href}`
      );
      // here we need to modify the url and update our current route location
      // to reflect this as we've at least moved the frame location but loaded
      // doesn't fire if it errors
      this.iframeService.frameLoaded(frame);
    }
  }

  frameLoaded(frame: HTMLIFrameElement): void {
    this.iframeService.frameLoaded(frame);
  }
}
