# canvas-javascript-syntaxHighlighter
This is a userscript designed to replace with Canvas LMS "HTML Editor" with an Ace Editor (https://ace.c9.io/) and using JS-Beautify (https://beautifier.io/) to format the code.

#### Table of Contents
- [Changelog](#changelog)
- [Dependencies](#dependencies)
- [How-To Use](#how-to-use)
- [Adjustable Configuration](#adjustable-configuration)

#### Changelog
12/30/2019
- Updated JS-Beautify to v1.10.2

12/19/2019
- Added **fontSize** option to the configurable variables for setting a size of the text in the editor (default: 12px, defined by generic Ace CSS onload)

10/07/2019
- Added support for the new RCE (https://community.canvaslms.com/docs/DOC-17764) scheduled to be released to the production instances on 10/19 (https://community.canvaslms.com/docs/DOC-17761#jive_content_id_Rich_Content_Editor)

06/24/2019
- Wrapped the **switch** detection in a `setInterval` loop executing every .5 seconds for upto 15 seconds to give it the opportunity to load even if it can't initially identify the **switch** anchors

10/03/2018
- Updated detection of the editor for the **Syllabus** page to work with having the **Syllabus** set as the **Course Homepage**

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
3.  
   1. If you're using the "old" RCE, access the "HTML Editor" of an activity edit page
   2. If you're using the "new" RCE, access the "Switch to raw html editor" of an activity edit page
4.  
   1. If you're using the "old" RCE, click the "Enable Syntax Highlighter" anchor right next to the toggle that allowed you to access the HTML Editor
   2. If you're using the "new" RCE, click the toggle that appears next to the "Switch to rich text editor" button

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
