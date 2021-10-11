import { Injectable, Input } from '@angular/core';
import { NavigationStart, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FrameService {
  lastDispatched: URL = new URL('http://www.example.com');
  frameChangeCallback: Function;
  frame: HTMLIFrameElement;
  mainUrl = 'https://angular-ivy-ciwy3b.stackblitz.io';
  rootUrl = `${this.mainUrl}/`;
  rootReplaceUrl = `${this.mainUrl}/assets`;
  private url?: string;

  @Input() replacedUrl?: string;

  angularNav: boolean;
  legacyNav: boolean;

  get Url(): string {
    return this.url;
  }
  set Url(val: string) {
    console.log(`set url called with legacynav - ${this.legacyNav}`);

    if (!this.legacyNav && this.frame !== undefined && val != this.url) {
      console.log(
        `iFrameService: URL Being Updated From ${this.url} to ${val}`
      );
      this.frame.contentWindow.location.replace(val);
      this.url = val;
    }
  }

  constructor(private router: Router, private titleService: Title) {
    const rootTitle = titleService.getTitle();

    router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
        console.log('NavigationStart Caught in IFrameService', val);
        this.angularNav = true;
      }
      if (val instanceof NavigationEnd) {
        // ok so we might need to navigate to the new route
        console.log(`new route! - ${val.urlAfterRedirects} - Getting Page`);
        this.getPage(val.urlAfterRedirects, '');
        this.angularNav = false;
        titleService.setTitle(`${router.url} - ${rootTitle}`);
      }
    });
  }

  registerFrame(frame: HTMLIFrameElement): void {
    this.frame = frame;
  }

  // this is kind of redundant now and could be inlined as it's so simple
  replaceUrl(url: string): string {
    return url.replace(`${this.rootReplaceUrl}/`, this.rootUrl);
  }

  frameUnloaded(newUrl: URL) {
    if (!this.angularNav) {
      console.log(
        `Frame Unloaded Without AngularNav set... Setting existing legacyNav value of ${this.legacyNav} to true `
      );

      this.legacyNav = true;
    }

    console.log('Frame Unloaded', newUrl);

    const stringUrl = newUrl.toString();
    const newUrlString = stringUrl
      .replace(this.rootUrl, '')
      .replace('.html', '');
    console.log(
      `Frame Unloading, new url - ${newUrl} fragment - ${newUrlString}`
    );

    const typedThisUrl = new URL(this.Url);
    const replacedUrl = this.replaceUrl(stringUrl);

    if (
      newUrl.pathname !== typedThisUrl.pathname ||
      newUrl.search !== typedThisUrl.search
    ) {
      console.log(`newUrl - ${newUrl}, replaced - ${replacedUrl}`);
      this.replacedUrl = replacedUrl;
      if (this.replacedUrl !== 'about:blank') {
        const parsedUrl = new URL(this.replacedUrl);

        const routeFragment = this.replacedUrl
          .replace(this.rootUrl, '')
          .replace('.html', '');

        const queryParams: Record<string, any> = {};
        parsedUrl.searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const finalPath = parsedUrl.pathname.endsWith('.html')
          ? parsedUrl.pathname.substring(0, parsedUrl.pathname.length - 5)
          : parsedUrl.pathname;

        console.log(`Router navigate for ${routeFragment} to ${finalPath}`);

        this.router.navigate([finalPath], {
          queryParams,
          queryParamsHandling: '',
          preserveFragment: true,
          replaceUrl: this.legacyNav,
        });
      }
    }
  }

  frameLoaded(frame: HTMLIFrameElement): void {
    if (frame != null) {
      console.log(
        `frame loaded - ${frame.contentWindow.location.href}, old url - ${this.Url}`
      );
      this.url = frame.contentWindow.location.href;
      this.hookUnloadHandler(frame, (url) => this.frameUnloaded(url));

      //reset
      this.legacyNav = false;
      this.angularNav = false;
    }
  }

  isNullOrWhitespace(input: string): boolean {
    return !input || !input.trim();
  }

  getPage(url: string, queryString: string): void {
    console.log('getPage called', url, queryString);

    if (!url.startsWith('/')) {
      url = `/${url}`;
    }

    // here we want to strip off the host component and redirect to the application
    // within the frame based on the url that was provided in the bar
    let urlWithoutSuffix = new URL(`${this.rootReplaceUrl}${url}`);
    if (
      !urlWithoutSuffix.pathname.endsWith('.html') &&
      urlWithoutSuffix.pathname !== '/'
    ) {
      urlWithoutSuffix.pathname = `${urlWithoutSuffix.pathname}.html`;
    } else if (urlWithoutSuffix.pathname === '/') {
      urlWithoutSuffix = new URL('/');
    }

    if (!this.isNullOrWhitespace(queryString)) {
      urlWithoutSuffix = new URL(`${urlWithoutSuffix.href}?${queryString}`);
    }

    console.log('resolved url to ' + urlWithoutSuffix.toString());

    if (this.Url !== urlWithoutSuffix.toString()) {
      console.log(
        `${
          this.Url
        } is not equal to ${urlWithoutSuffix.toString()} so updating Url property`
      );
      this.Url = urlWithoutSuffix.toString();
    }
  }

  dispatchChange(): void {
    console.log('dispatch change called');
    if (this.frame !== undefined && this.frame.contentWindow !== undefined) {
      var newHref = new URL(this.frame.contentWindow.location.href);

      if (
        newHref.pathname !== this.lastDispatched.pathname ||
        newHref.searchParams.toString() !==
          this.lastDispatched.searchParams.toString()
      ) {
        if (this.lastDispatched.href !== 'http://www.example.com') {
          console.log(
            `newHref - ${newHref} is different from ${this.lastDispatched}, calling callback`
          );
          this.frameChangeCallback(newHref);
        }
        this.lastDispatched = newHref;
      }
    }
  }

  unloadHandler(): void {
    // Timeout needed because the URL changes immediately after
    // the `unload` event is dispatched.
    setTimeout(() => this.dispatchChange(), 0);
  }

  hookUnloadHandler(frame: HTMLIFrameElement, onChange: Function): void {
    this.frame = frame;
    this.frameChangeCallback = onChange;

    frame.contentWindow.removeEventListener('unload', () =>
      this.unloadHandler()
    );
    frame.contentWindow.addEventListener('unload', () => this.unloadHandler());

    console.log('Hooked Unload Handler');
  }
}
