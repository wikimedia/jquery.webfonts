/**
 * jQuery Webfonts.
 *
 * Copyright (C) 2012 Santhosh Thottingal
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

( function( $, window, document, undefined ) {
	'use strict';

	var WebFonts = function( element, options ) {
		// Load defaults
		this.options = $.extend( {}, $.fn.webfonts.defaults, options );
		this.$element = $( element );
		this.repository = $.extend( WebFonts.repository, this.options.repository );
		this.fonts = [];
		this.originalFontFamily = this.$element.css( 'font-family' );
		this.language = this.$element.attr( 'lang' ) || $( 'html' ).attr( 'lang' );
		this.init();
	};

	WebFonts.repository = {
		base: 'fonts', // Relative or absolute path to the font repository.
		languages: {}, // languages to font mappings
		fonts: {}, // Font name to font configuration mapping

		// Utility methods to work on the repository.
		defaultFont: function( language ) {
			var defaultFont = null;
			if ( this.languages[language] ) {
				defaultFont = this.languages[language][0];
			}
			return defaultFont;
		},

		get: function( fontFamily ) {
			return this.fonts[fontFamily];
		}
	};

	WebFonts.prototype = {
		constructor: WebFonts,

		getFont: function( language ) {
			if ( this.options.fontSelector ) {
				return this.options.fontSelector( this.repository, language || this.language );
			} else {
				return this.repository.defaultFont( language );
			}
		},

		/**
		 * Initialize.
		 */
		init: function() {
			var fontFamily;
			if ( this.language ) {
				fontFamily = this.getFont( this.language );
				this.apply( fontFamily );
			}
			this.parse();
		},

		refresh: function() {
			this.reset();
			this.init();
		},

		/**
		 * Apply a font for the element.
		 *
		 * @param fontFamily String: font family name
		 * @param $element
		 */
		apply: function( fontFamily, $element ) {
			var fontStack = this.options.fontStack.slice( 0 );

			$element = $element || this.$element;

			// Loading an empty string is pointless.
			// Putting an empty string into a font-family list doesn't work with
			// jQuery.css().
			if ( fontFamily ) {
				this.load( fontFamily );
				fontStack.unshift( fontFamily );
			}

			if ( !fontFamily || fontFamily === this.originalFontFamily ) {
				// We are resetting the font to original font.
				fontStack = [];
				// This will cause removing inline fontFamily style.
			}

			// Set the font of this element if it's not excluded
			if ( !$element.is( this.options.exclude ) ) {
				$element.css( 'font-family', fontStack.join() );
			}

			// Set the font of this element's children if they are not excluded.
			// font-family of <input>, <textarea> and <button> must be changed explicitly.
			$element.find( 'textarea, input, button' )
				.not( this.options.exclude )
				.css( 'font-family', fontStack.join() );
		},

		/**
		 * Load a given fontFamily if not loaded already
		 *
		 * @param fontFamily String font family name
		 */
		load: function( fontFamily ) {
			if ( $.inArray( fontFamily, this.fonts ) >= 0 ) {
				return true;
			}
			var styleString = this.getCSS( fontFamily, 'normal' );
			if ( styleString ) {
				injectCSS( styleString );
			} else {
				// Font not found
				return false;
			}
			this.fonts.push( fontFamily );
			return true;
		},

		/**
		 * Parse the element for custom font-family styles and for nodes with
		 * different language than element
		 */
		parse: function() {
			var webfonts = this;

			webfonts.$element.find( '*[lang], [style], [class]' ).each( function( i, element ) {
				var fontFamilyStyle, fontFamily,
					$element = $( element );

				fontFamilyStyle = $element.css( 'fontFamily' );

				if ( fontFamilyStyle ) {
					fontFamily = fontFamilyStyle.split( ',' )[0];

					// Remove the ' and " characters if any.
					fontFamily = $.trim( fontFamily.replace( /["']/g, '' ) );

					if ( webfonts.load( fontFamily ) ) {
						// Font family overrides the lang attribute,
						// but was it the fontfamily allocated for the current
						// language?
						if ( fontFamily === webfonts.getFont( element.lang ) ) {
							return true;
						}
					}
				}

				if ( element.lang && element.lang !== webfonts.$element.attr( 'lang' ) ) {
					fontFamily = webfonts.getFont( element.lang );
					webfonts.apply( fontFamily, $( element ) );
				}
			} );
		},

		/**
		 * List all fonts for the given language
		 *
		 * @param language mixed: [optional] language code. If undefined all
		 *            fonts will be listed
		 * @return Array font names array
		 */
		list: function( language ) {
			var fontName,
				fontNames = [];

			if ( language ) {
				fontNames = this.repository.languages[language] || [];
			} else {
				for ( fontName in this.repository.fonts ) {
					if ( this.repository.fonts.hasOwnProperty( fontName ) ) {
						fontNames.push( fontName );
					}
				}
			}

			return fontNames;
		},

		/**
		 * List all languages supported by the repository
		 *
		 * @return Array language codes
		 */
		languages: function() {
			var language,
				languages = [];

			for ( language in this.repository.languages ) {
				if ( this.repository.languages.hasOwnProperty( language ) ) {
					languages.push( language );
				}
			}
			return languages;
		},

		/**
		 * Set the font repository
		 *
		 * @param {Object} repository The font repository.
		 */
		setRepository: function( repository ) {
			this.repository = $.extend( WebFonts.repository, repository );
		},

		/**
		 * Reset the font-family style.
		 */
		reset: function() {
			this.apply( this.originalFontFamily );
		},

		/**
		 * unbind the plugin
		 */
		unbind: function() {
			this.$element.data( 'webfonts', null );
		},

		/**
		 * Construct the CSS required for the font-family, inject it to the head
		 * of the body so that it gets loaded.
		 *
		 * @param fontFamily The font-family name
		 * @param variant The font variant, eg: bold, italic etc. Default is
		 *            normal.
		 */
		getCSS: function( fontFamily, variant ) {
			var webfonts, fontconfig, base, version, versionSuffix, styleString, userAgent, fontStyle, fontFormats;

			webfonts = this;
			variant = variant || 'normal';
			fontconfig = this.repository.get( fontFamily );
			if ( variant !== 'normal' ) {
				if ( fontconfig.variants !== undefined && fontconfig.variants[variant] ) {
					fontconfig = this.repository.get( fontconfig.variants[variant] );
				}
			}
			if ( !fontconfig ) {
				return false;
			}

			base = this.repository.base;
			version = fontconfig.version;
			versionSuffix = '?version=' + version + '&20120101';
			styleString = '@font-face { font-family: \'' + fontFamily + '\';\n';
			userAgent = window.navigator.userAgent;
			fontStyle = fontconfig.fontstyle || 'normal';
			fontFormats = [];

			if ( fontconfig.eot ) {
				styleString += '\tsrc: url(\'' + base + fontconfig.eot + versionSuffix + '\');\n';
			}
			styleString += '\tsrc: ';
			// If the font is present locally, use it.
			if ( userAgent.match( /Android 2\.3/ ) === null ) {
				// Android 2.3.x does not respect local() syntax.
				// http://code.google.com/p/android/issues/detail?id=10609
				styleString += 'local(\'' + fontFamily + '\'),';
			}
			if ( fontconfig.woff ) {
				fontFormats.push( '\t\turl(\'' + base + fontconfig.woff + versionSuffix
						+ '\') format(\'woff\')' );
			}
			if ( fontconfig.svg ) {
				fontFormats.push( '\t\turl(\'' + base + fontconfig.svg + versionSuffix + '#'
						+ fontFamily + '\') format(\'svg\')' );
			}
			if ( fontconfig.ttf ) {
				fontFormats.push( '\t\turl(\'' + base + fontconfig.ttf + versionSuffix
						+ '\') format(\'truetype\')' );
			}
			styleString += fontFormats.join() + ';\n';
			if ( fontconfig.fontweight ) {
				styleString += '\tfont-weight:' + fontconfig.fontweight + ';';
			}
			styleString += '\tfont-style:' + fontStyle + ';';

			if ( fontconfig.fontweight !== undefined ) {
				styleString += '\tfont-weight:' + fontconfig.fontweight + ';';
			}
			if ( fontconfig.fontstyle !== undefined ) {
				styleString += '\tfont-style:' + fontconfig.fontstyle + ';';
			} else {
				styleString += '\tfont-style: normal;';
			}

			styleString += '}';

			if ( fontconfig.variants !== undefined ) {
				$.each( fontconfig.variants, function ( variant, variantFontFamily ) {
					styleString += webfonts.getCSS( fontFamily, variant );
				} );
			}

			return styleString;
		}
	};

	$.fn.webfonts = function( option ) {
		return this.each( function() {
			var $this, data, options;
			$this = $( this );
			data = $this.data( 'webfonts' );
			options = typeof option === 'object' && option;
			if ( !data ) {
				$this.data( 'webfonts', ( data = new WebFonts( this, options ) ) );
			}
			if ( typeof option === 'string' ) {
				data[option]();
			}
		} );
	};

	$.fn.webfonts.defaults = {
		repository: WebFonts.repository, // Default font repository
		fontStack: [ 'Helvetica', 'Arial', 'sans-serif' ], // Default font fallback
		exclude: '' // jQuery selectors to exclude
	};

	$.fn.webfonts.Constructor = WebFonts;

	// Private methods for the WebFonts prototype
	// =================================

	/**
	 * Create a new style tag and add it to the DOM.
	 *
	 * @param css String: CSS text
	 * @return HTMLStyleElement
	 */
	function injectCSS( css ) {
		var s = document.createElement( 'style' );
		s.type = 'text/css';
		s.rel = 'stylesheet';
		// Insert into document before setting cssText
		document.getElementsByTagName( 'head' )[0].appendChild( s );
		if ( s.styleSheet ) {
			s.styleSheet.cssText = css;
			// IE
		} else {
			// Safari sometimes borks on null
			s.appendChild( document.createTextNode( String( css ) ) );
		}
		return s;
	}

} )( jQuery, window, document );
