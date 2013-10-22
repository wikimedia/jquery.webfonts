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
		// List of loaded fonts
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

		/**
		 * Get the default font family for given language.
		 * @param {String} language Language code.
		 * @return {String} Font family name
		 */
		getFont: function( language ) {
			language = ( language || this.language ).toLowerCase();

			if ( this.options.fontSelector ) {
				return this.options.fontSelector( this.repository, language );
			} else {
				return this.repository.defaultFont( language );
			}
		},

		/**
		 * Initialize.
		 */
		init: function() {
			if ( this.language ) {
				this.apply( this.getFont( this.language ) );
			}

			this.parse();
		},

		/**
		 * TODO: document
		 */
		refresh: function() {
			this.reset();
			this.init();
		},

		/**
		 * Apply a font for given elements.
		 *
		 * @param {String} fontFamily Font family name
		 * @param {jQuery} $element One or more jQuery elements
		 */
		apply: function( fontFamily, $element ) {
			var fontStack = this.options.fontStack.slice( 0 );

			$element = $element || this.$element;

			// Loading an empty string is pointless.
			// Putting an empty string into a font-family list doesn't work with
			// jQuery.css().
			if ( fontFamily ) {
				this.load( fontFamily );
				// Avoid duplicates
				if ( $.inArray( fontFamily, fontStack ) < 0 ) {
					fontStack.unshift( fontFamily );
				}
			}

			if ( !fontFamily ) {
				// We are resetting the font to original font.
				fontStack = [];
				// This will cause removing inline fontFamily style.
			}

			// Set the font of this element if it's not excluded
			$element.not( this.options.exclude ).css( 'font-family', fontStack.join() );

			// Set the font of this element's children if they are not excluded.
			// font-family of <input>, <textarea> and <button> must be changed explicitly.
			$element.find( 'textarea, input, button' )
				.not( this.options.exclude )
				.css( 'font-family', fontStack.join() );
		},

		/**
		 * Load given font families if not loaded already. Creates the CSS rules
		 * and appends them to document.
		 *
		 * @param {Array|String} fontFamilies List of font families
		 */
		load: function( fontFamilies ) {
			var css, fontFamily, i,
				fontFaceRule = '';

			// Convert to array if string given (old signature)
			if ( typeof fontFamilies === 'string' ) {
				fontFamilies = [fontFamilies];
			}

			for ( i = 0; i < fontFamilies.length; i++ ) {
				fontFamily = fontFamilies[i];
				if ( $.inArray( fontFamily, this.fonts ) >= 0 ) {
					continue;
				}

				css = this.getCSS( fontFamily, 'normal' );
				if ( css !== false ) {
					fontFaceRule += css;
					this.fonts.push( fontFamily );
				}
			}

			// In case the list contained only fonts that are already loaded
			// or non-existing fonts.
			if ( fontFaceRule !== '' ) {
				injectCSS( fontFaceRule );
			}

			return true;
		},

		/**
		 * Parse the element for custom font-family styles and for nodes with
		 * different language than what the element itself has.
		 */
		parse: function() {
			var append,
				webfonts = this,
				// Fonts can be added indirectly via classes, but also with
				// style attributes. For lang attributes we will use our font
				// if they don't have explicit font already.
				$elements = webfonts.$element.find( '*[lang], [style], [class]' ),
				// List of fonts to load in a batch
				fontQueue = [],
				// List of elements to apply a certain font family in a batch.
				// Object keys are the font family, values are list of plain elements.
				elementQueue = {};

			// Append function that keeps the array as a set (no dupes)
			append = function( array, value ) {
				if ( $.inArray( value, array ) < 0 ) {
					array.push( value );
				}
			};

			$elements.each( function( i, element ) {
				var fontFamilyStyle, fontFamily,
					$element = $( element );

				if ( $element.is( webfonts.options.exclude ) ) {
					return;
				}

				// Note: it depends on the browser whether this returns font names
				// which don't exist. In Chrome it does, while in Opera it doesn't.
				fontFamilyStyle = $element.css( 'fontFamily' );

				// Note: It is unclear whether this can ever be falsy. Maybe also
				// browser specific.
				if ( fontFamilyStyle ) {
					fontFamily = fontFamilyStyle.split( ',' )[0];

					// Remove the ' and " characters if any.
					fontFamily = $.trim( fontFamily.replace( /["']/g, '' ) );

					append( fontQueue, fontFamily );
				}

				// Load and apply fonts for other language tagged elements (batched)
				if ( element.lang && element.lang !== webfonts.language ) {
					// language differs. We may want to apply a different font.
					if ( webfonts.hasExplicitFontStyle ( $element ) ) {
						// respect the explicit font family style. Do not override.
						// This style may be from css, inheritance, or even from
						// browser settings.
						return;
					} else {
						fontFamily = webfonts.getFont( element.lang );
					}

					if ( !fontFamily ) {
						// No font preference for the language.
						// Check if we need to reset for this language.
						// If the font of the parent element, to which webfonts were applied,
						// remained the same, there is no need to reset.
						if ( webfonts.$element.css( 'fontFamily' ) !== webfonts.originalFontFamily ) {
							// The parent font changed.
							// Is there an inheritance?
							// Is the font for this element the same as parent's font?
							if ( fontFamilyStyle === webfonts.$element.css( 'fontFamily' ) ) {
								// Break inheritance of the font from the parent element
								// by applying the original font to this element
								fontFamily = webfonts.originalFontFamily;
							}
						}
					}

					// We do not have fonts for all languages
					if ( fontFamily !== null ) {
						append( fontQueue, fontFamily );
						elementQueue[fontFamily] = elementQueue[fontFamily] || [];
						elementQueue[fontFamily].push( element );
					}
				}
			} );

			// Process in batch the accumulated fonts and elements
			this.load( fontQueue );
			$.each( elementQueue, function( fontFamily, elements ) {
				webfonts.apply( fontFamily, $( elements ) );
			} );
		},

		/**
		 * Find out whether an element has explicit non generic font family style
		 * For the practical purpose we check whether font is same as top element
		 * or having any of generic font family
		 * http://www.w3.org/TR/CSS2/fonts.html#generic-font-families
		 * @param {jQuery} $element
		 * @return {boolean}
		 */
		hasExplicitFontStyle: function ( $element ) {
			var elementFontFamily = $element.css( 'fontFamily' );

			// whether the font is inherited from top element to which plugin applied
			return this.$element.css( 'fontFamily' ) !== elementFontFamily
				// whether the element has generic font family
				&& ( $.inArray( elementFontFamily,
					['monospace', 'serif', 'cursive','fantasy', 'sans-serif'] ) < 0 );
		},

		/**
		 * List all fonts for the given language
		 *
		 * @param {String} [language] Language code. If undefined all fonts will be listed.
		 * @return {Array} List of font family names.
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
		 * @return {Array} List of language codes
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
		 * Unbind the plugin
		 */
		unbind: function() {
			this.$element.data( 'webfonts', null );
		},

		/**
		 * Construct the CSS required for the font-family.
		 *
		 * @param {String} fontFamily The font-family name
		 * @param {String} [variant] The font variant, eg: bold, italic etc. Default is normal.
		 * @return {String} CSS
		 */
		getCSS: function( fontFamily, variant ) {
			var webfonts, base, version, versionSuffix,
				fontFaceRule, userAgent, fontStyle, fontFormats,
				fontconfig = this.repository.get( fontFamily );

			variant = variant || 'normal';

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
			versionSuffix = '?version=' + version;
			fontFaceRule = '@font-face { font-family: \'' + fontFamily + '\';\n';
			userAgent = window.navigator.userAgent;
			fontStyle = fontconfig.fontstyle || 'normal';
			fontFormats = [];

			if ( fontconfig.eot ) {
				fontFaceRule += '\tsrc: url(\'' + base + fontconfig.eot + versionSuffix + '\');\n';
			}
			fontFaceRule += '\tsrc: ';

			// If the font is present locally, use it.
			if ( userAgent.match( /Android 2\.3/ ) === null ) {
				// Android 2.3.x does not respect local() syntax.
				// http://code.google.com/p/android/issues/detail?id=10609
				fontFaceRule += 'local(\'' + fontFamily + '\'),';
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

			fontFaceRule += fontFormats.join() + ';\n';

			if ( fontconfig.fontweight ) {
				fontFaceRule += '\tfont-weight:' + fontconfig.fontweight + ';';
			}

			if ( fontconfig.fontstyle !== undefined ) {
				fontFaceRule += '\tfont-style:' + fontconfig.fontstyle + ';';
			} else {
				fontFaceRule += '\tfont-style: normal;';
			}

			fontFaceRule += '}\n';

			webfonts = this;
			if ( fontconfig.variants !== undefined ) {
				$.each( fontconfig.variants, function ( variant ) {
					fontFaceRule += webfonts.getCSS( fontFamily, variant );
				} );
			}

			return fontFaceRule;
		}
	};

	$.fn.webfonts = function( option ) {
		return this.each( function() {
			var $this = $( this ),
				data = $this.data( 'webfonts' ),
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

	/**
	 * Create a new style tag and add it to the DOM.
	 *
	 * @param {String} css
	 */
	function injectCSS( css ) {
		var s = document.createElement( 'style' );

		// Insert into document before setting cssText
		document.getElementsByTagName( 'head' )[0].appendChild( s );

		if ( s.styleSheet ) {
			s.styleSheet.cssText = css;
			// IE
		} else {
			// Safari sometimes borks on null
			s.appendChild( document.createTextNode( String( css ) ) );
		}
	}
} )( jQuery, window, document );
