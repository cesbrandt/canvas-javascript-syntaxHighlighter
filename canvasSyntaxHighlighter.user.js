// ==UserScript==
// @name          Canvas Syntax Highlighter
// @description   "Replaces" the "HTML Editor" with the Ace Syntax Highlighter (https://ace.c9.io/)
// @include       /^https?:\/\/[^\.]*\.([^\.]*\.)?instructure\.com\/.*$/
// @exclude       /^https?:\/\/[^\.]*\.quiz-lti-iad-prod.instructure\.com\/.*$/
// @version       3.1
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @updateURL     https://raw.githubusercontent.com/cesbrandt/canvas-javascript-syntaxHighlighter/master/canvasSyntaxHighlighter.user.js
// ==/UserScript==

/**
 * Config
 */
var editorLinksText = {   // These are the text of the Canvas editor links immediately above the editors. Replace only if your Canvas does not display in English.
	old: ['HTML Editor', 'Rich Content Editor'],
	new: ['Switch to raw html editor', 'Switch to rich text editor']
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

/**
 * Syntax Highlighter "class"
 */
var SH = extend(function() {
	SH.cookieName = server + '_Canvas_syntaxHighlighter';
	SH.cookie = getCookie(SH.cookieName);
	SH.editorContainer = '.canvas-rce__skins--root.rce-wrapper';
	SH.rceEditor = $(SH.editorContainer + ' .tox-tinymce').first();
	SH.htmlEditor = $(SH.editorContainer + ' textarea').first();
	SH.htmlEditorToggle = $(SH.editorContainer + ' > [data-testid="RCEStatusBar"] > [role="toolbar"] [title="' + editorLinksText.new[0] + '"]');
	SH.enabled = SH.cookie !== '' ? JSON.parse(SH.cookie) : false;

	return SH.init();
}, {
	init: function() {
		console.log('SH: Initiating');

		// Load Ace Editor
		$.getScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js', function(data, status, xhr) {
			$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.13.4/beautify.min.js', function(data, status, xhr) {
				$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.13.4/beautify-html.min.js', function(data, status, xhr) {
					$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.13.4/beautify-css.min.js', function(data, status, xhr) {
						$('head').append($('<style />').text('#' + SH.cookieName + ' { width: ' + (typeof editorWidth !== 'undefined' && editorWidth !== '' ? editorWidth : '100%') + '; height: ' + (typeof editorHeight !== 'undefined' && editorHeight !== '' ? editorHeight : '280px') + '; z-index: 100;' + (fontSize !== '' ? ' font-size: ' + fontSize + ';' : '') + ' } #syntaxHighlighterToggle { display: inline !important; }'));
						if(SH.enabled && SH.rceEditor.is(':hidden')) {
							SH.initAce();
						}
					});
				});
			});
		});

		return SH.loadToggle();
	},
	loadToggle: function() {
		var toggleEditor = function() {
			$('#' + SH.toggleID).parent().parent().remove();
			SH.endAce();

			console.log(SH.rceEditor, SH.rceEditor.css('display'));
			if(SH.rceEditor.css('display') != 'none') {
				var toggle = $('<div />').addClass('ic-Form-control').css({display: 'inline-block', margin: 0, verticalAlign: 'middle'}).html('<label class="ic-Super-toggle--ui-switch" for="' + SH.toggleID + '"><span class="screenreader-only">' + (SH.enabled ? toggleState[0] : toggleState[1]) + ' ' + toggleName + '</span><input type="checkbox" id="' + SH.toggleID + '" class="ic-Super-toggle__input"' + (SH.enabled ? ' checked="checked"' : '') + '><div class="ic-Super-toggle__container" aria-hidden="true" data-checked="' + SH.toggleID + ': true" data-unchecked="' + SH.toggleID + ': false"><div class="ic-Super-toggle__switch"></div></div></label>');
				toggle.find('#' + SH.toggleID).on('change', function() {
					SH.enabled = SH.enabled ? false : true;
					setCookie(SH.cookieName, SH.enabled);
					if(SH.enabled) {
						$(this).parent().find('.screenreader-only').text(toggleState[0] + ' ' + toggleName);
						SH.initAce();
					} else {
						$(this).parent().find('.screenreader-only').text(toggleState[1] + ' ' + toggleName);
						SH.endAce();
					}
				});

				SH.htmlEditorToggle.before(toggle);
				if(SH.enabled) {
					SH.initAce();
				}
			}
		};
		SH.toggleID = toggleName.replace(/\s/g, '') + 'Toggle';
		console.log(SH.htmlEditorToggle);
		SH.htmlEditorToggle.on('click', toggleEditor);
		return;
	},
	initAce: function() {
		console.log('SH: Loading Ace');

		setTimeout(function() {
			// Build Ace Editor
			SH.htmlEditor.after($('<pre />').attr({'id': SH.cookieName}));

			// Auto-Indent
			SH.htmlEditor.addClass('hide');
			var source = SH.htmlEditor.val();
			$('#' + SH.cookieName).text(html_beautify(source, opts));

			// Initialize Ace Editor
			var editor = ace.edit(SH.cookieName, {
				mode: 'ace/mode/html',
				selectionStyle: 'text',
				theme: 'ace/theme/sqlserver'
			});

			// Update HTML Editor
			$('#' + SH.cookieName).on('focusout', function() {
				SH.htmlEditor.val(editor.getValue().replace(/^\s+</gm, '<').replace(/(\n|\r)([^\S\n\r]{4}|\t)+/gm, ' ')).trigger('change');
			});

			// Set focus on Ace Editor
			editor.focus();
		}, 100);
	},
	endAce: function() {
		$('#' + SH.cookieName).remove();
		SH.htmlEditor.removeClass('hide');
	}
});

/*************
 * Functions *
 *************/

/**
 * @name              Function Extender
 * @description       Extends a function into subfunctions
 * @return function   Extended function
 */
function extend(func, props) {
	for(var prop in props) {
		if(props.hasOwnProperty(prop)) {
			func[prop] = props[prop];
		}
	}
	return func;
}

/**
 * @name            Get Cookie
 * @description     Lookup a cookie by name
 * @return string   Value of cookie
 */
function getCookie(name) {
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
function setCookie(name, value, expire) {
	var expires = '';
	if(!isNaN(expire)) {
		var expireDate = new Date();
		expireDate.setTime(expireDate.getTime() + (expire * 24 * 60 * 60 * 1000));
		expires = '; expires='+ expireDate.toUTCString();
	}
	document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/;';
	return;
}

window.onload = function() {
	// Patch for jQuery detection, seems page-loaded is sometimes blocked in userscripts
	this.$ = this.jQuery = jQuery.noConflict(true);

	if($.inArray(view, ['login', 'api']) === -1 && (($.inArray(view, ['courses', 'users']) > -1 && subview != 'files') || (view == 'accounts' && subview != 'settings'))) {
		/**
		 * Wait for editor to load
		 */
		var i = 0;
		var wait = setInterval(function() {
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
