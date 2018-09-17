# canvas-javascript-syntaxHighlighter
This is a userscript designed to replace with Canvas LMS "HTML Editor" with an Ace Editor (https://ace.c9.io/).

#### Table of Contents
- [Changelog](#changelog)
- [Dependencies](#dependencies)
- [How-To Use](#how-to-use)
- [Adjustable Configuration](#adjustable-configuration)

#### Changelog
09/17/2018
- Added **width** and **height** options to the configurable variables
- Added code to remove the `#editor_tabs` element when the editor is active to prevent odd behaviour when trying to use it to insert content

09/13/2018
- Replaced most @excludes with logic within the script to test the location
- Added `/accounts/:id/settings` to the "do not run on" list due to the syntax highlighter not being able to properly load on the global announcements

09/12/2018
- Added basic logic to prevent exeuction in frames
- Combined the STYLE appends into a single one

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
- **editorWidth**: Adjusts the width of the editor (**Default**: 100%)
- **editorHeight**: Adjusts the height of the editor (**Default**: 280px)
- **opts.indent_char**: Defines the character to be used for indenting lines
- **opts.indent_size**: Defines how many times the **opts.indent_char** should be used per each indentation level
- **opts.wrap_line_length**: Defines at what character count a line should soft wrap to a new line
