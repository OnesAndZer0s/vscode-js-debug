import { Fragment, FunctionComponent, h, render } from "preact";
import { useState } from "preact/hooks";
import Cdp from "../../../cdp/api";
import "./elements.css";

enum NodeType {
  /** node is an element. */
  ELEMENT_NODE= 1,
  ATTRIBUTE_NODE= 2,
  /** node is a Text node. */
  TEXT_NODE= 3,
  /** node is a CDATASection node. */
  CDATA_SECTION_NODE= 4,
  ENTITY_REFERENCE_NODE= 5,
  ENTITY_NODE=6,
  /** node is a ProcessingInstruction node. */
  PROCESSING_INSTRUCTION_NODE= 7,
  /** node is a Comment node. */
  COMMENT_NODE= 8,
  /** node is a document. */
  DOCUMENT_NODE= 9,
  /** node is a doctype. */
  DOCUMENT_TYPE_NODE= 10,
  /** node is a DocumentFragment node. */
  DOCUMENT_FRAGMENT_NODE= 11,
  NOTATION_NODE= 12
};

enum DocumentPosition {
  /** Set when node and other are not in the same tree. */
  DOCUMENT_POSITION_DISCONNECTED= 0x01,
  /** Set when other is preceding node. */
  DOCUMENT_POSITION_PRECEDING= 0x02,
  /** Set when other is following node. */
  DOCUMENT_POSITION_FOLLOWING= 0x04,
  /** Set when other is an ancestor of node. */
  DOCUMENT_POSITION_CONTAINS= 0x08,
  /** Set when other is a descendant of node. */
  DOCUMENT_POSITION_CONTAINED_BY= 0x10,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC= 0x20,
}

const Element: FunctionComponent<{ node: Cdp.DOM.Node }> = ( { node } ) => {

  function DealWithNodeTypes( node: Cdp.DOM.Node ) {
    switch ( node.nodeType ) {
      // TODO
      // case NodeType.ATTRIBUTE_NODE:
      // TODO
      case NodeType.ELEMENT_NODE:
        var retVal="";
        // TODO: PSEUDO TYPE?
        let pseudoTypeElement = node.pseudoType;
        if ( pseudoTypeElement ) {
          const pseudoIdentifier = node.pseudoIdentifier;
          if ( pseudoIdentifier ) {
            pseudoTypeElement += `(${pseudoIdentifier})`;
          }
          // TODO
          const pseudoElement = (<span class="webkit-html-pseudo-element">{'::' + pseudoTypeElement}</span>);
          retVal+= pseudoElement+"\u200B";
          break;
        }

        const tagName = node.nodeName;
        // if (this.isClosingTag()) {
        //   this.buildTagDOM(titleDOM, tagName, true, true, updateRecord);
        //   break;
        // }

        var tagDom = buildTagDOM(tagName, false, false);

      //   if (this.isExpandable()) {
      //     if (!this.expanded) {
      //       const expandButton = new ElementsComponents.ElementsTreeExpandButton.ElementsTreeExpandButton();
      //       expandButton.data = {
      //         clickHandler: () => this.expand(),
      //       };
      //       titleDOM.appendChild(expandButton);

      //       // This hidden span with … is for blink layout tests.
      //       // The method dumpElementsTree(front_end/legacy_test_runner/elements_test_runner/ElementsTestRunner.js)
      //       // dumps … to identify expandable element.
      //       const hidden = document.createElement('span');
      //       hidden.textContent = '…';
      //       hidden.style.fontSize = '0';
      //       titleDOM.appendChild(hidden);

      //       UI.UIUtils.createTextChild(titleDOM, '\u200B');
      //       this.buildTagDOM(titleDOM, tagName, true, false, updateRecord);
      //     }
      //     break;
      //   }

      //   if (ElementsTreeElement.canShowInlineText(node)) {
      //     const textNodeElement = titleDOM.createChild('span', 'webkit-html-text-node');
      //     const firstChild = node.firstChild;
      //     if (!firstChild) {
      //       throw new Error('ElementsTreeElement._nodeTitleInfo expects node.firstChild to be defined.');
      //     }
      //     const result = this.convertWhitespaceToEntities(firstChild.nodeValue());
      //     textNodeElement.textContent = Platform.StringUtilities.collapseWhitespace(result.text);
      //     UI.UIUtils.highlightRangesWithStyleClass(textNodeElement, result.entityRanges, 'webkit-html-entity-value');
      //     UI.UIUtils.createTextChild(titleDOM, '\u200B');
      //     this.buildTagDOM(titleDOM, tagName, true, false, updateRecord);
      //     if (updateRecord && updateRecord.hasChangedChildren()) {
      //       UI.UIUtils.runCSSAnimationOnce(textNodeElement, 'dom-update-highlight');
      //     }
      //     if (updateRecord && updateRecord.isCharDataModified()) {
      //       UI.UIUtils.runCSSAnimationOnce(textNodeElement, 'dom-update-highlight');
      //     }
      //     break;
      //   }

      //   if (this.treeOutline && this.treeOutline.isXMLMimeType || !ForbiddenClosingTagElements.has(tagName)) {
      //     this.buildTagDOM(titleDOM, tagName, true, false, updateRecord);
      //   }
      //   break;
      // }


      // TODO
      // case NodeType.TEXT_NODE:
      case NodeType.COMMENT_NODE:
        return (<span class="webkit-html-comment">{`<!--${node.nodeValue}-->`}</span>);
      case NodeType.DOCUMENT_TYPE_NODE:
        return (<span class="webkit-html-doctype">
            {`<!DOCTYPE ${node.nodeName}`}
            {node.publicId ? ` PUBLIC "${node.publicId}"` : ""}
            {node.systemId && node.publicId? ` "${node.systemId}"` : ""}
            { !node.publicId && node.systemId ? " SYSTEM" : ""}
            {node.internalSubset ? ` [${node.internalSubset}]` : ""}
            {">"}
          </span>);
      case NodeType.CDATA_SECTION_NODE:
        return (<span class="webkit-html-text-node">{`<![CDATA[${node.nodeValue}]]>`}</span>);
      case NodeType.DOCUMENT_FRAGMENT_NODE:
        // TODO: ESCAPE THE WHITESPACE
        return (<span class="webkit-html-fragment">node.nodeName</span>);
      default:
        // TODO: ESCAPE THE WHITESPACE
        return (<span>{node.nodeName}</span>);
    }
  }

  function buildTagDOM( tagName: string, isClosingTag: boolean, isDistinctTreeElement: boolean) {
  // const node = this.nodeInternal;

  const classes = ['webkit-html-tag'];
  if (isClosingTag && isDistinctTreeElement) {
    classes.push('close');
  }
  const tagElement = (<span class={classes.join(' ')}>
    {"<"}
  </span>);

  const tagNameElement = <span class={isClosingTag ? 'webkit-html-close-tag-name' : 'webkit-html-tag-name'}>
    {(isClosingTag ? '/' : '') + tagName}



    {">"}
    {'\u200B'}
  </span>;

  // if (!isClosingTag) {
  //   if (node.hasAttributes()) {
  //     const attributes = node.attributes();
  //     for (let i = 0; i < attributes.length; ++i) {
  //       const attr = attributes[i];
  //       UI.UIUtils.createTextChild(tagElement, ' ');
  //       this.buildAttributeDOM(tagElement, attr.name, attr.value, updateRecord, false, node);
  //     }
  //   }
  //   if (updateRecord) {
  //     let hasUpdates: boolean = updateRecord.hasRemovedAttributes() || updateRecord.hasRemovedChildren();
  //     hasUpdates = hasUpdates || (!this.expanded && updateRecord.hasChangedChildren());
  //     if (hasUpdates) {
  //       UI.UIUtils.runCSSAnimationOnce(tagNameElement, 'dom-update-highlight');
  //     }
  //   }
  // }

  // UI.UIUtils.createTextChild(parentElement, '\u200B');
  // if (tagElement.textContent) {
  //   UI.ARIAUtils.setLabel(tagElement, tagElement.textContent);
  // }

  return <></>;
}

  return (
    <>
      <li>
        <div>
          {/* <div class="selection fill"></div> */ }
          <div class="gutter-container"></div> {/* this is for arrow to open */ }
          <span class="highlight">
            {DealWithNodeTypes(node)}

          </span>
        </div>
      </li>
      <ol class="children">

      </ol>
    </>
  );
}



const ElementRoot: FunctionComponent<{ root?: Cdp.DOM.Node }> = () => {
  const [ root, setRoot ] = useState<Cdp.DOM.Node>();

  // useEffect(()=>{
  //   // dispatch(actions.fetchAllSites())
  //   setRoot(root);
  //   console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
  //   // rerender

  // },[root])

  window.addEventListener( "message", event => {
    const message = event.data; // The JSON data our extension sent
    switch ( message.command ) {
      case "init":
        setRoot( message.value.root );
        break;
      default:
        break;
    }
  } );


  return (
    <div id="main-content">
      <div id="elements-content" tabIndex={ -1 }>
        <div class="elements-disclosure" tab-index={ -1 }>
          <ol class="elements-tree-outline source-code" tab-index={ -1 }>
            { ( !root || !root.children || root.children.length == 0 ) ? "" : root.children.map( e => <Element node={ e } /> ) }
          </ol>
        </div>
      </div>
    </div>
  );
};

render( <ElementRoot />, document.body );
