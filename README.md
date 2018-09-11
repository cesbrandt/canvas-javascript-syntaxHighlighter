# canvas-javascript-syntaxHighlighter
This is a userscript designed to replace with Canvas LMS "HTML Editor" with an Ace Editor (https://ace.c9.io/).

#### Table of Contents
- [Changelog](#changelog)
- [Dependencies](#dependencies)
- [How-To Use](#how-to-use)
- [Adjustable Configuration](#adjustable-configuration)

#### Changelog
09/11/2018
- Initial Load

#### Dependencies
- Userscript Manager
  - [Tampermonkey (Chrome)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
  - [Tampermonkey (Firefox)](https://addons.mozilla.org/en-us/firefox/addon/tampermonkey/)
  - [Greasemonkey (Firefox)](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)

#### How-To Use
1. Load the userscript to your Userscript Manager of choice
2. Enable the userscript
3. Access the "HTML Editor" of an activity edit page
4. Click the "Enable Syntax Highlighter" anchor right next to the toggle that allowed you to access the HTML Editor.

#### Adjustable Configuration
There are a few settings that can be adjusted, located at the top of the script:
- **editorLinksText**: Adjust these values to reflect the text displayed in the Canvas editor toggle anchors in your Canvas' language
- **toggleState**: These are the prefix values for the **Syntax Highlighter** toggle, depending on the enabled state
- **toggleName**: Don't want to call it "Syntax Highlighter?" Don't! Call it "Ace Editor!" Call it "Bob!" Okay, maybe not "Bob," but you get the point.
