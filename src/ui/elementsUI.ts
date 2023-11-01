/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { Container } from 'inversify';
import * as vscode from 'vscode';
import { Elements } from '../adapter/elements/elements';
import { Commands, CustomViews, DebugType } from '../common/contributionUtils';
import { DebugSessionTracker } from './debugSessionTracker';

class ElementsProvider {

  // private _onDidChangeTreeData = new EventEmitter<XHRBreakpoint | undefined>();
  // readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  // private _debugSessionTracker: DebugSessionTracker;

  // xhrBreakpoints: XHRBreakpoint[];
  private panel?: vscode.WebviewPanel;
  session?: vscode.DebugSession;

  constructor (
    private readonly context: vscode.ExtensionContext,
    private readonly tracker: DebugSessionTracker,
    private readonly services: Container,
  ) {
    // this.xhrBreakpoints = [];

    // this._debugSessionTracker = debugSessionTracker;
    // debugSessionTracker.onSessionAdded( session => {
    //   if ( !DebugSessionTracker.isConcreteSession( session ) ) {
    //     return;
    //   }

    //   session.customRequest( 'enableXHRBreakpoints', {
    //     ids: this.xhrBreakpoints.filter( b => b.checkboxState ).map( b => b.id ),
    //   } );
    // } );
  }

  showBrowserElements ( mute: boolean = false ) {
    // if there is currently no debugging session, do nothing
    if ( !this.tracker.getConcreteSessions().some( s => [ DebugType.Chrome, DebugType.Edge ].includes( s.type as DebugType ) ) ) {
      if ( !mute ) vscode.window.showInformationMessage( 'No debugging session active.' );
      return;
    }

    if ( this.panel ) {
      this.panel.reveal( vscode.ViewColumn.Two );
    } else {
      this.createWebviewView();
    }
  }

  private async createWebviewView () {
    console.log( this.context.extensionUri );

    this.panel = vscode.window.createWebviewPanel(
      CustomViews.BrowserElements,
      'Elements',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath( this.context.extensionUri, 'resources', 'scripts', 'elements' )
        ]
      },
    );


    // this.panel.iconPath = {path:"$(code)";

    // this.panel.onDidDispose( () => {
    //   this.panel = undefined;
    // } );

    this.panel.webview.html = await this.services.get( Elements ).GetHtmlForWebview();
    // TODO remove this bc i just wanted to see :)
    var temp = await this.services.get( Elements ).GetDOM();

    console.log( temp );
    this.panel.webview.postMessage( { command: "init", value: temp } )
  }

  sessionAdded ( session: vscode.DebugSession ) {
    // if ( !this.panel ) {
    //   return;
    // }

    if ( session.type as DebugType in [ DebugType.Chrome, DebugType.Edge ] ) {
      this.session = session;

      // TODO: make a config for this
      this.showBrowserElements( true );
    } else {
      // this.panel.dispose();
    }
  }

  sessionRemoved ( session: vscode.DebugSession ) {
    if ( this.panel && session === this.session ) {
      this.panel.dispose();
      this.panel = undefined;
      this.session = undefined;
    }
  }


  // getTreeItem ( item: XHRBreakpoint ): vscode.TreeItem {
  //   return item;
  // }

  // async getChildren ( item?: XHRBreakpoint ): Promise<XHRBreakpoint[]> {
  //   if ( !item ) return this.xhrBreakpoints.sort( XHRBreakpoint.compare );
  //   return [];
  // }

  // async getParent (): Promise<XHRBreakpoint | undefined> {
  //   return undefined;
  // }

  // addBreakpoints ( breakpoints: XHRBreakpoint[] ) {
  //   // filter out duplicates
  //   breakpoints = breakpoints.filter( b => !this.xhrBreakpoints.map( e => e.id ).includes( b.id ) );
  //   const match = breakpoints.map( b => b.match );
  //   for ( const breakpoint of breakpoints ) this.xhrBreakpoints.push( breakpoint );
  //   for ( const session of this._debugSessionTracker.getConcreteSessions() )
  //     session.customRequest( 'enableXHRBreakpoints', { ids: match } );
  //   this._onDidChangeTreeData.fire( undefined );
  // }

  // removeBreakpoints ( breakpoints: XHRBreakpoint[] ) {
  //   const breakpointIds = breakpoints.map( b => b.id );

  //   this.xhrBreakpoints = this.xhrBreakpoints.filter( b => !breakpointIds.includes( b.id ) );

  //   for ( const session of this._debugSessionTracker.getConcreteSessions() )
  //     session.customRequest( 'disableXHRBreakpoints', { ids: breakpointIds } );
  //   this._onDidChangeTreeData.fire( undefined );
  // }
}

export function registerElementsUI (
  context: vscode.ExtensionContext,
  tracker: DebugSessionTracker,
  services: Container,
) {
  const provider = new ElementsProvider( context, tracker, services );


  context.subscriptions.push(
    vscode.commands.registerCommand( Commands.OpenBrowserElements, () => provider.showBrowserElements() ),
    tracker.onSessionEnded( e => provider.sessionRemoved( e ) ),
    tracker.onSessionAdded( e => provider.sessionAdded( e ) ),
    // vscode.window.onDidChangeActiveTextEditor( editor => this.updateEditorState( editor ) ),
    // this.tracker.onSessionAdded( () => this.updateEditorState( vscode.window.activeTextEditor ) ),
    // this.tracker.onSessionEnded( () => this.updateEditorState( vscode.window.activeTextEditor ) ),
  );

  // const view = vscode.window.createTreeView( CustomViews.XHRFetchBreakpoints, {
  //   treeDataProvider: provider,
  // } );

  // view.onDidChangeCheckboxState( e => {
  //   for ( const session of debugSessionTracker.getConcreteSessions() )
  //     session.customRequest( `${ e.items[ 0 ][ 1 ] ? 'enable' : 'disable' }XHRBreakpoints`, {
  //       ids: [ e.items[ 0 ][ 0 ].id ],
  //     } );
  // }, debugSessionTracker );
  // context.subscriptions.push( view );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand( Commands.AddXHRBreakpoints, () => {
  //     const inputBox = vscode.window.createInputBox();
  //     inputBox.title = 'Add XHR Breakpoint';
  //     inputBox.placeholder = 'Enter a URL or a pattern to match';
  //     inputBox.onDidAccept( () => {
  //       const match = inputBox.value;
  //       provider.addBreakpoints( [ new XHRBreakpoint( { match }, true ) ] );
  //       inputBox.dispose();
  //     } );
  //     inputBox.show();
  //   } ),
  // );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand( Commands.RemoveAllXHRBreakpoints, () => {
  //     provider.removeBreakpoints( provider.xhrBreakpoints );
  //   } ),
  // );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand( Commands.RemoveXHRBreakpoints, ( treeItem: vscode.TreeItem ) => {
  //     provider.removeBreakpoints( [ treeItem as XHRBreakpoint ] );
  //   } ),
  // );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand( Commands.EditXHRBreakpoint, ( treeItem: vscode.TreeItem ) => {
  //     const inputBox = vscode.window.createInputBox();
  //     inputBox.title = 'Edit XHR Breakpoint';
  //     inputBox.placeholder = 'Enter a URL or a pattern to match';
  //     inputBox.value = ( treeItem as XHRBreakpoint ).match;
  //     inputBox.onDidAccept( () => {
  //       const match = inputBox.value;
  //       provider.removeBreakpoints( [ treeItem as XHRBreakpoint ] );
  //       provider.addBreakpoints( [ new XHRBreakpoint( { match }, treeItem.checkboxState == 1 ) ] );
  //       inputBox.dispose();
  //     } );
  //     inputBox.show();
  //   } ),
  // );
}
