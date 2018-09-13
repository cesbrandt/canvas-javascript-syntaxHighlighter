// ==UserScript==
// @name          Canvas Syntax Highlighter
// @description   "Replaces" the "HTML Editor" with the Ace Syntax Highlighter (https://ace.c9.io/)
// @include       /^https?:\/\/[^\.]*\.([^\.]*\.)?instructure\.com\/.*$/
// @exclude       /^https?:\/\/[^\.]*\.quiz-lti-iad-prod.instructure\.com\/.*$/
// @version       1.2
// @updateURL     https://raw.githubusercontent.com/cesbrandt/canvas-javascript-syntaxHighlighter/master/canvasSyntaxHighlighter.user.js
// ==/UserScript==

/**
 * Config
 */
var editorLinksText = ['HTML Editor', 'Rich Content Editor'];   // These are the text of the Canvas editor links immediately above the editors. Replace only if your Canvas does not display in English.
var toggleState = ['Disable', 'Enable'];                        // These are the prefixes to the toggle anchor. Update them for your personal langauge configuration preference.
var toggleName = 'Syntax Highlighter';                          // This is the text for the toggle. Update it for your personal language preference.
var opts = {
	"indent_char": "\t",        // What character should be used to indent with (\t - tab; \s - space)
	"indent_size": "1",         // How many times should that indentation character be used per level
	"wrap_line_length": "80",   // At what character count should the line wrap to a new line? Note: This
                                //    is soft value and should it occur in the middle of a string of characters
                                //    the wrap will occur at the next word-break

////////////////////////////////////
////////////////////////////////////
//                                //
//  DO NOT EDIT BELOW THIS POINT  //
//                                //
////////////////////////////////////
////////////////////////////////////

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

/**
 * Don't run in frames
 */
if(window.top !== window.self) {
	return;
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

var SH = extend(function() {
	SH.cookieName = server + '_Canvas_syntaxHighlighter';
	SH.cookie = getCookie(SH.cookieName);
	SH.rceEditor = '.ic-RichContentEditor > .mce-tinymce:first-of-type';
	SH.htmlEditor = '.ic-RichContentEditor > textarea:first-of-type';
	SH.enabled = SH.cookie !== '' ? JSON.parse(SH.cookie) : false;

	return SH.init();
}, {
	init: function() {
		// Load Ace Editor
		$.getScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.3.3/ace.js', function(data, status, xhr) {
			$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.7.5/beautify.min.js', function(data, status, xhr) {
				$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.7.5/beautify-html.min.js', function(data, status, xhr) {
					$.getScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.7.5/beautify-css.min.js', function(data, status, xhr) {
						$('head').append($('<style />').text('#' + SH.cookieName + ' { width: 100%; height: 280px; } #syntaxHighlighterToggle { display: inline !important; }'));
						if(SH.enabled && $(SH.rceEditor).is(':hidden')) {
							SH.initAce();
						}
					});
				});
			});
		});

		// Update Ace Editor on View Switch
		var switchClass;
		switch(subview) {
			case 'assignments':
			case 'discussion_topics':
				switchClass = subviewID == 'syllabus' ? 'toggle_views_link' : 'rte_switch_views_link';
				break;
			case 'pages':
				switchClass = 'switch_views';
				break;
			case 'quizzes':
				switchClass = 'toggle_description_views_link';
				break;
		}
		$('.' + switchClass).each(function() {
			if(new RegExp(editorLinksText[0]).test($(this).text())) {
				$(this).on('click', function() {
					if(SH.enabled) {
						SH.initAce();
					}
				});
			} else if(new RegExp(editorLinksText[1]).test($(this).text())) {
				$(this).on('click', function() {
					if(SH.enabled) {
						SH.endAce();
					}
				});
			}
		});

		// Add to Editor Toggle Bar
		$('.' + switchClass).last().after(' | ', $('<a />').attr({id: 'syntaxHighlighterToggle'}).css({cursor: 'pointer'}).html((SH.enabled ? toggleState[0] : toggleState[1]) + ' ' + toggleName).click(function(e) {
			e.preventDefault();
			SH.enabled = SH.enabled ? false : true;
			setCookie(SH.cookieName, SH.enabled);
			$(this).html((SH.enabled ? toggleState[0] : toggleState[1]) + ' ' + toggleName);
			if(SH.enabled && $(SH.rceEditor).is(':hidden')) {
				SH.initAce();
			} else {
				SH.endAce();
			}
		}));
		return;
	},
	initAce: function() {
		setTimeout(function() {
			// Build Ace Editor
			$('.ic-RichContentEditor').append($('<pre />').attr({'id': SH.cookieName}));

			// Auto-Indent
			$(SH.htmlEditor).addClass('hide');
			var source = $(SH.htmlEditor).val();
			$('#' + SH.cookieName).text(html_beautify(source, opts));

			// Initialize Ace Editor
			var editor = ace.edit(SH.cookieName, {
				mode: 'ace/mode/html',
				selectionStyle: 'text',
				theme: 'ace/theme/sqlserver'
			});

			// Update HTML Editor
			$('#' + SH.cookieName).on('focusout', function() {
				$(SH.htmlEditor).val(editor.getValue().replace(/^\s+</gm, '<').replace(/(\n|\r)([^\S\n\r]{4}|\t)+/gm, ' ')).trigger('change');
			});

			// Set focus on Ace Editor
			editor.focus();
		}, 100);
	},
	endAce: function() {
		$('#' + SH.cookieName).remove();
		$(SH.htmlEditor).removeClass('hide');
	}
});

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

(function() {
	if($.inArray(view, ['login', 'api']) === -1 && (($.inArray(view, ['courses', 'users']) > -1 && subview != 'files') || (view == 'accounts' && subview != 'settings'))) {
		SH();
	}
})();
