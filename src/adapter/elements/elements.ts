/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import { inject, injectable } from 'inversify';
import Cdp from '../../cdp/api';
import { ContextKey } from '../../common/contributionUtils';
import { DisposableList } from '../../common/disposable';
import { FS, FsPromises } from '../../ioc-extras';
import { ManagedContextKey } from '../../ui/managedContextKey';
import { elementsPath, elementsStylePath } from './webview';

@injectable()
export class Elements {
  private readonly currentFileKey = new ManagedContextKey(ContextKey.CurrentFile);
  // private panel?: vscode.WebviewPanel;
  // private session?: vscode.DebugSession
  private readonly disposable = new DisposableList();
  private temp: Cdp.Api | undefined;

  private hasPageLoaded = false;

  // private panel?: vscode.WebviewPanel;
  // private session?: vscode.DebugSession;

  constructor(
    @inject(FS) private readonly fs: FsPromises, // @inject(ExtensionContext) private readonly context: vscode.ExtensionContext, // @inject(DebugSessionTracker) private readonly tracker: DebugSessionTracker,
  ) {
    // this.debugSessionTracker.onSessionEnded( session => {
    //   if ( this.panel && session === this.session ) {
    //     this.panel.dispose();
    //   }
    // } );
    // this.debugSessionTracker.onSessionAdded( session => {
    //   // if ( !this.panel ) {
    //   //   return;
    //   // }
    //   if ( [ DebugType.Chrome, DebugType.Edge ].includes( session.type as DebugType ) ) {
    //     this.session = session;
    //     this.showBrowserElements();
    //   } else {
    //     // this.panel.dispose();
    //   }
    // } );
  }

  // public showBrowserElements () {
  //   // if there is currently no debugging session, do nothing
  //   if ( !this.debugSessionTracker.getConcreteSessions().some( s => [ DebugType.Chrome, DebugType.Edge ].includes( s.type as DebugType ) ) ) {
  //     vscode.window.showInformationMessage( 'No debugging session active.' );
  //     return;
  //   }

  //   if ( this.panel ) {
  //     this.panel.reveal( vscode.ViewColumn.Two );
  //   } else {
  //     this.createWebviewView();
  //   }
  // }

  // private async createWebviewView () {
  //   console.log( this.context.extensionUri );

  //   this.panel = vscode.window.createWebviewPanel(
  //     CustomViews.BrowserElements,
  //     'Elements',
  //     vscode.ViewColumn.Two,
  //     {
  //       enableScripts: true,
  //       retainContextWhenHidden: true,
  //       localResourceRoots: [
  //         vscode.Uri.joinPath( this.context.extensionUri, 'resources', 'scripts', 'elements' )
  //       ]
  //     },
  //   );

  //   this.session = this.debugSessionTracker.getConcreteSessions().find( s => [ DebugType.Chrome, DebugType.Edge ].includes( s.type as DebugType ) )!;

  //   this.panel.iconPath = {
  //     light: vscode.Uri.joinPath( this.context.extensionUri, 'resources', 'light', 'browser-elements.svg' ),
  //     dark: vscode.Uri.joinPath( this.context.extensionUri, 'resources', 'dark', 'browser-elements.svg' ),
  //   };
  //   this.panel.webview.html = await this._getHtmlForWebview( this.panel.webview );
  //   this.panel.onDidDispose( () => {
  //     this.panel = undefined;
  //   } );
  // }

  /**
   * Attaches the CDP API. Should be called for each
   */
  public async attach(cdp: Cdp.Api) {
    this.temp = cdp;

    const val = await cdp.Page.getFrameTree({});
    if (!val) return;
    this.currentFileKey.value = [val.frameTree.frame.url];

    await cdp.DOM.enable({});
    await cdp.Page.enable({});

    const listener = this.disposable.push(
      cdp.Page.on('domContentEventFired', () => {
        this.hasPageLoaded = true;
        this.disposable.disposeObject(listener);
      }),
    );
  }

  /**
   * Should be called before the root debug session ends. It'll fire a DAP
   * message to show a notification if appropriate.
   */
  public dispose() {
    this.disposable.dispose();
  }

  public async GetDOM() {
    if (!this.temp) {
      return;
    }

    if (!this.hasPageLoaded) {
      return;
    }

    return this.temp.DOM.getDocument({});
  }

  public GetSourceDebugUrl() {
    if (!this.temp) {
      return;
    }

    if (!this.hasPageLoaded) {
      return;
    }

    return this.temp.Page.getResourceTree({});
  }

  public async GetHtmlForWebview() {
    // this.temp?.DOM.querySelectorAll( { nodeId: 4 } ).then( console.log );

    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( this.context.extensionUri, 'resources', 'scripts', 'elements', 'test.js' ) );
    // Use a nonce to only allow a specific script to be run.
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>${await this.fs.readFile(elementsStylePath, 'utf-8')}</style>
    </head>
    <body>
      <script>${await this.fs.readFile(elementsPath, 'utf-8')}</script>
    </body>
    </html>`;
  }
}
