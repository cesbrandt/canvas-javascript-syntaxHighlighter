// ==UserScript==
// @name          Canvas Syntax Highlighter
// @description   "Replaces" the "HTML Editor" with the Ace Syntax Highlighter (https://ace.c9.io/)
// @include       /^https?:\/\/[^\.]*\.([^\.]*\.)?instructure\.com\/.*$/
// @exclude       /^https?:\/\/[^\.]*\.quiz-lti-iad-prod.instructure\.com\/.*$/
// @version       3.2
// @updateURL     https://raw.githubusercontent.com/cesbrandt/canvas-javascript-syntaxHighlighter/master/canvasSyntaxHighlighter.user.js
// ==/UserScript==

/**
 * Config
 */
var editorLinksText = {   // These are the text of the Canvas editor links immediately above the editors. Replace only if your Canvas does not display in English.
	rce: 'Click or shift-click for the html editor.',
	html: 'Switch to the rich text editor',
	pretty: 'Raw HTML Editor',
	raw: 'Pretty HTML Editor'
};
var fontSize = '';                         // This determines the size of the text in the editor, will default to 12px
var toggleState = ['Disable', 'Enable'];   // These are the prefixes to the toggle anchor. Update them for your personal langauge configuration preference.
var toggleName = 'Syntax Highlighter';     // This is the text for the toggle. Update it for your personal language preference.
var editorWidth = '';                      // If left blank, will default to 100%
var editorHeight = '';                     // If left blank, will default to 280px
var opts = {
	"indent_char": "\t",               // What character should be used to indent with (\t - tab; \s - space)
	"indent_size": "1",                // How many times should that indentation character be used per level
	"wrap_line_length": "80",          // At what character count should the line wrap to a new line? Note: This
	                                   //    is soft value and should it occur in the middle of a string of characters
	                                   //    the wrap will occur at the next word-break
	"max_preserve_newlines": "0",
	"preserve_newlines": true,
	"keep_array_indentation": false,
	"break_chained_methods": false,
	"indent_scripts": "normal",
	"brace_style": "collapse",
	"space_before_conditional": true,
	"unescape_strings": false,
	"jslint_happy": false,
	"end_with_newline": false,
	"indent_inner_html": true,
	"comma_first": false,
	"e4x": false
};

////////////////////////////////////
////////////////////////////////////
//                                //
//  DO NOT EDIT BELOW THIS POINT  //
//                                //
////////////////////////////////////
////////////////////////////////////

/**
 * Don't run in frames
 */
if(window.top !== window.self) {
	throw new Error(toggleName + ' will not load in frames.');
}

/**
 * Variable setup
 */
var url = window.location.href;
var server = url.match(/(?=[a-z0-9]*\.)[a-z0-9]*/)[0];

var leveledURL = url.split('/');
var view = url.match(/\.com\/?$/) ? 'dashboard' : leveledURL[3];
view = view.match(/^\?/) ? 'dashboard' : view;
var viewID = (view !== 'dashboard' && typeof leveledURL[4] !== 'undefined') ? leveledURL[4] : null;
var subview = (viewID !== null && typeof leveledURL[5] !== 'undefined') ? leveledURL[5].split('#')[0] : null;
var subviewID = (subview !== null && typeof leveledURL[6] !== 'undefined') ? leveledURL[6].split('#')[0] : null;
var terview = (viewID !== null && typeof leveledURL[7] !== 'undefined') ? leveledURL[7].split('#')[0] : null;

/*************
 * Functions *
 *************/

/**
 * @name          Trigger Event
 * @description   Triggers a specified event listener
 * @return
 */
let triggerEvent = (eventName, element) => {
	var event = document.createEvent('HTMLEvents');
	event.initEvent(eventName, false, true);
	element.dispatchEvent(event);
	return;
};

/**
 * @name              Function Extender
 * @description       Extends a function into subfunctions
 * @return function   Extended function
 */
let extend = (func, props) => {
	for(var prop in props) {
		if(props.hasOwnProperty(prop)) {
			func[prop] = props[prop];
		}
	}
	return func;
}

/**
 * @name            Load Scripts
 * @description     Loads a script file to a page
 * @return
 */
let loadScripts = (urls, callback) => {
	var promises = [];
	switch(typeof urls) {
		case 'string':
			urls = [urls];
			break;
		case 'object':
			if(Array.isArray(urls)) {
				break;
			}
			return;
		default:
			return;
	}
	urls.forEach((url, i) => {
		promises[i] = new Promise((resolve, reject) => {
			var body = document.body || document.querySelector('body') || document.getElementsByTagName('body')[0];
			var script = document.createElement('script');
			script.addEventListener('load', resolve);
			script.addEventListener('error', reject);
			script.async = true;
			script.src = url;
			body.appendChild(script);
		});
	});
	Promise.all(promises).then(callback);
};

/**
 * @name            Get Cookie
 * @description     Lookup a cookie by name
 * @return string   Value of cookie
 */
let getCookie = (name) => {
	name += '=';
	var cookies = decodeURIComponent(document.cookie).split(';');
	for(var i = 0; i < cookies.length; i++) {
		while(cookies[i].charAt(0) == ' ') {
			cookies[i] = cookies[i].substring(1);
		}
		if(cookies[i].indexOf(name) == 0) {
			return cookies[i].substring(name.length, cookies[i].length);
		}
	}
	return '';
}

/**
 * @name            Set Cookie
 * @description     Set a cookie by name
 * @return undefined
 */
let setCookie = (name, value, expire) => {
	var expires = '';
	if(!isNaN(expire)) {
		var expireDate = new Date();
		expireDate.setTime(expireDate.getTime() + (expire * 24 * 60 * 60 * 1000));
		expires = '; expires='+ expireDate.toUTCString();
	}
	document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/;';
	return;
}

/**
 * Syntax Highlighter "class"
 */
let SH = extend(() => {
	SH.cookieName = server + '_Canvas_syntaxHighlighter';
	SH.cookie = getCookie(SH.cookieName);
	SH.editorContainer = '.canvas-rce__skins--root.rce-wrapper';
	SH.rceEditor = document.querySelector(SH.editorContainer + ' .tox-tinymce');
	SH.prettyEditor = SH.editorContainer + ' .CodeMirror';
	SH.prettyEditorToggle = SH.editorContainer + ' > [data-testid="RCEStatusBar"] [data-btn-id="rce-editormessage-btn"]';
	SH.htmlEditor = document.querySelector(SH.editorContainer + ' textarea');
	SH.htmlEditorToggle = document.querySelector(SH.editorContainer + ' > [data-testid="RCEStatusBar"] > [role="toolbar"] [title="' + editorLinksText.rce + '"]');
	SH.enabled = SH.cookie !== '' ? JSON.parse(SH.cookie) : false;

	return SH.init();
}, {
	init: () => {
		console.log('SH: Initiating');

		// Load Ace Editor
		loadScripts([
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js',
			'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-html.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-css.min.js'
		], () => {
			var head = document.head || document.querySelector('head') || document.getElementsByTagName('head')[0];
			var css = document.createElement('style');
			css.innerHTML = '#' + SH.cookieName + ' { width: ' + (typeof editorWidth !== 'undefined' && editorWidth !== '' ? editorWidth : '100%') + '; height: ' + (typeof editorHeight !== 'undefined' && editorHeight !== '' ? editorHeight : '280px') + '; z-index: 100;' + (fontSize !== '' ? ' font-size: ' + fontSize + ';' : '') + ' } #syntaxHighlighterToggle { display: inline !important; }';
			head.appendChild(css);
			if(SH.enabled && SH.rceEditor.style.display == 'none' && document.querySelector(SH.prettyEditorToggle).innerText != editorLinksText.pretty) {
				SH.initAce();
			}

			return SH.loadToggle();
		});
	},
	loadToggle: () => {
		var toggleEditor = () => {
			if(document.contains(document.querySelector('#' + SH.toggleID))) {
				document.querySelector('#' + SH.toggleID).parentNode.parentNode.remove();
			}
			SH.endAce();

			if(SH.rceEditor.style.display != 'none') {
				var toggle = document.createElement('div');
				toggle.classList.add('ic-Form-control');
				toggle.style.cssText = "display: inline-block; margin: 0; vertical-align: middle;";
				toggle.innerHTML = '<label class="ic-Super-toggle--ui-switch" for="' + SH.toggleID + '"><span class="screenreader-only">' + (SH.enabled ? toggleState[0] : toggleState[1]) + ' ' + toggleName + '</span><input type="checkbox" id="' + SH.toggleID + '" class="ic-Super-toggle__input"' + (SH.enabled ? ' checked="checked"' : '') + ' /><div class="ic-Super-toggle__container" aria-hidden="true" data-checked="' + SH.toggleID + ': true" data-unchecked="' + SH.toggleID + ': false"><div class="ic-Super-toggle__switch"></div></div></label>';
				toggle.querySelector('#' + SH.toggleID).addEventListener('change', (ele) => {
					SH.enabled = SH.enabled ? false : true;
					setCookie(SH.cookieName, SH.enabled);
					if(SH.enabled) {
						ele.currentTarget.parentNode.querySelector('.screenreader-only').innerText = toggleState[0] + ' ' + toggleName;
						SH.initAce();
					} else {
						ele.currentTarget.parentNode.querySelector('.screenreader-only').innerText = toggleState[1] + ' ' + toggleName;
						SH.endAce();
					}
				});

				SH.htmlEditorToggle.parentNode.insertBefore(toggle, SH.htmlEditorToggle);
				if(SH.enabled) {
					SH.initAce();
				}
			}

			var wait = setInterval(() => {
				if(document.contains(document.querySelector(SH.prettyEditorToggle))) {
					clearInterval(wait);

					document.querySelector(SH.prettyEditorToggle).addEventListener('click', () => {
						if(SH.enabled && document.querySelector(SH.prettyEditorToggle).innerText != editorLinksText.raw) {
							SH.endAce();
							SH.initAce();
						}
					});
				}
			}, 250);
		};
		SH.toggleID = toggleName.replace(/\s/g, '') + 'Toggle';
		SH.htmlEditorToggle.addEventListener('click', toggleEditor);

		return;
	},
	initAce: () => {
		console.log('SH: Loading Ace');

		setTimeout(() => {
			// Build Ace Editor
			(new Promise((resolve, reject) => {
				var pre = document.createElement('pre');
				pre.setAttribute('id', SH.cookieName);
				SH.htmlEditor.parentNode.insertBefore(pre, SH.htmlEditor.nextSibling);

				return resolve();
			})).then(() => {
				// Hide the HTML Editor
				SH.htmlEditor.classList.add('hide');

				// Initialize Ace Editor
				var editor = ace.edit(SH.cookieName, {
					mode: 'ace/mode/html',
					selectionStyle: 'text',
					theme: 'ace/theme/sqlserver'
				});

				// Auto-Indent
				var source = SH.htmlEditor.value;
				editor.setValue(html_beautify(source, opts), -1);

				// Update HTML Editor
				document.querySelector('#' + SH.cookieName).addEventListener('focusout', () => {
					SH.htmlEditor.value = editor.getValue().replace(/^\s+</gm, '<').replace(/(\n|\r)([^\S\n\r]{4}|\t)+/gm, ' ');
					triggerEvent('change', SH.htmlEditor);
				});

				// Set focus on Ace Editor
				editor.focus();
			});
		}, 100);
	},
	endAce: () => {
		console.log('SH: Unloading Ace');

		if(document.contains(document.querySelector('#' + SH.cookieName))) {
			document.querySelector('#' + SH.cookieName).remove();
		}
		SH.htmlEditor.classList.remove('hide');
	}
});

window.onload = () => {
	if(!['login', 'api'].includes(view) && ((['courses', 'users'].includes(view) && subview != 'files') || (view == 'accounts' && subview != 'settings'))) {
		/**
		 * Wait for editor to load
		 */
		var i = 0;
		var wait = setInterval(() => {
			if(typeof tinyMCE !== "undefined" && tinyMCE.editors.length > 0) {
				SH();
				clearInterval(wait);
			}
			if(i++ >= 30) {
				clearInterval(wait);
			}
		}, 500);
	}
};
