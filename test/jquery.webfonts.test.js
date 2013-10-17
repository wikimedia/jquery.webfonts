( function( $ ) {
	'use strict';

	// Convert a font-family string to an array. This is needed
	// because browsers change the string by adding or removing spaces,
	// so the string cannot be compared in a uniform way.
	function fontFamilyList( fontFamilyString ) {
		var fontIndex,
			fontList = fontFamilyString.split( /, */ ); // Create a list

		// Remove the quotes from font names
		for ( fontIndex = 0; fontIndex < fontList.length; ++fontIndex ) {
			fontList[fontIndex] = fontList[fontIndex]
				.replace( /^["']/, '' )
				.replace( /["']$/, '' );
		}

		return fontList;
	}

	QUnit.test(
		'Webfonts loading and application test',
		function( assert ) {
			var webfonts,
				expectedFontFace, myanmarFontName, expectedFontFamilyValue, expectedFontFamilyList,
				$spanElement, $inputElement, $textareaElement, $buttonElement,
				$langElements,
				localFont = 'Garamond',
				fallbackFonts = 'Helvetica, Arial, sans-serif',
				$qunitFixture = $( '#qunit-fixture' ),
				// Assign lang to 'my' to make webfonts work
				$myanmarElement = $( '<div>' ).prop( {
					id: 'webfonts-my-fixture',
					lang: 'MY', // language tag should be case insensitive.
					dir: 'ltr'
				} ),
				$hebrewElement = $( '<span>' )
					.prop( {
						id: 'webfonts-he-fixture',
						lang: 'he',
						dir: 'rtl'
					} )
					.text( 'שלום' );

			$spanElement = $( '<span>span content</span>' ).css( 'font-family', localFont );
			$inputElement = $( '<input value=\'input content\' />' );
			$textareaElement = $( '<textarea>textarea content</textarea>' );
			$buttonElement = $( '<button>button label</button>' );

			$myanmarElement.append(
				$hebrewElement,
				$spanElement,
				$inputElement,
				$textareaElement,
				$buttonElement
			);

			$langElements = $( '[lang]' );
			$myanmarElement.webfonts( {
				repository: {
					fonts: {
						TharLon: {
							eot: 'TharLon/TharLon.eot',
							ttf: 'TharLon/TharLon.ttf',
							woff: 'TharLon/TharLon.woff',
							license: 'OFL 1.1',
							version: '1.0'
						},
						Alef: {
							eot: 'Alef/Alef.eot',
							ttf: 'Alef/Alef.ttf',
							woff: 'Alef/Alef.woff',
							license: 'OFL 1.1',
							version: '1.0'
						}
					},
					languages: {
						my: [ 'TharLon' ],
						he: [ 'Alef' ]
					}
				}
			} ).appendTo( $qunitFixture );

			webfonts = $myanmarElement.data( 'webfonts' );
			assert.strictEqual( typeof( webfonts ), 'object',
				'Myanmar webfonts object was created' );

			myanmarFontName = webfonts.fonts[0];
			expectedFontFamilyValue = '\'' + myanmarFontName + '\', ' + fallbackFonts;
			expectedFontFamilyList = fontFamilyList( expectedFontFamilyValue );

			assert.strictEqual( myanmarFontName, 'TharLon', 'Correct font name loaded' );

			// Font application
			webfonts.apply( myanmarFontName );
			assert.deepEqual( fontFamilyList( $myanmarElement.css( 'font-family' ) ),
				expectedFontFamilyList,
				'The web font was applied to font-family of the test <div>' );
			assert.deepEqual( fontFamilyList( $spanElement.css( 'font-family' ) ),
				[ localFont ],
				'A web font was not applied to an element with explicit font-family' );
			assert.deepEqual( fontFamilyList( $inputElement.css( 'font-family' ) ),
				expectedFontFamilyList,
				'The web font was applied to font-family of the test <input>' );
			assert.deepEqual( fontFamilyList( $textareaElement.css( 'font-family' ) ),
				expectedFontFamilyList,
				'The web font was applied to font-family of the test <textarea>' );
			assert.deepEqual( fontFamilyList( $buttonElement.css( 'font-family' ) ),
				expectedFontFamilyList,
				'The web font was applied to font-family of the test <button>' );

			// Font resetting
			webfonts.reset();
			assert.strictEqual( $myanmarElement.css( 'font-family' ), '',
				'The web font on the test <div> was reset' );
			assert.deepEqual( fontFamilyList( $spanElement.css( 'font-family' ) ),
				[ localFont ],
				'An element with an explicit font-family remained with it after webfonts resetting' );
			assert.strictEqual( $inputElement.css( 'font-family' ), '',
				'The web font on the test <input> was reset' );
			assert.deepEqual( $textareaElement.css( 'font-family' ), '',
				'The web font on the test <textarea> was reset' );
			assert.deepEqual( $buttonElement.css( 'font-family' ), '',
				'The web font on the test <button> was reset' );

			/*jshint quotmark:double */
			expectedFontFace = "@font-face { font-family: 'TharLon';\n" +
				"\tsrc: url('fontsTharLon/TharLon.eot?version=1.0&20120101');\n" +
				"\tsrc: local('TharLon')," +
				"\t\turl('fontsTharLon/TharLon.woff?version=1.0&20120101') format('woff')," +
				"\t\turl('fontsTharLon/TharLon.ttf?version=1.0&20120101') format('truetype');\n" +
				"\tfont-style: normal;}\n" +
				"@font-face { font-family: 'Alef';\n" +
				"\tsrc: url('fontsAlef/Alef.eot?version=1.0&20120101');\n" +
				"\tsrc: local('Alef')," +
				"\t\turl('fontsAlef/Alef.woff?version=1.0&20120101') format('woff')," +
				"\t\turl('fontsAlef/Alef.ttf?version=1.0&20120101') format('truetype');\n" +
				"\tfont-style: normal;}\n";

			/*jshint quotmark:single */
			assert.strictEqual( $( 'head' ).find( 'style' ).text(), expectedFontFace,
				'font-face string created correctly' );

			$myanmarElement.remove();
		}
	);

	QUnit.test(
		'Webfonts on mixed language html',
		function( assert ) {
			var testHTML = '<div lang="hi" id="#parent" ><p>Hindi text</p>'
				+ '<div><textarea lang="ml"></textarea></div>'
				+ '<div><textarea lang="en"></textarea></div>'
				+ '</div>',
				fallbackFonts = 'Helvetica, Arial, sans-serif',
				webfontOptions = {
					repository: {
						languages: {
							hi: [ 'HindiFont' ],
							ml: [ 'MalayalamFont' ]
						}
					}
				},
				$qunitFixture = $( '#qunit-fixture' );
			$qunitFixture.append( $( testHTML ) )
				.webfonts( webfontOptions );
			assert.strictEqual(
				$qunitFixture.find( '[lang=hi]' ).css( 'font-family' ).replace( / /g, '' ),
				// we are removing whitespaces because FF uses comma and chrome uses comma
				// with space for fontfamily string items
				( 'HindiFont, ' + fallbackFonts).replace( / /g, '' ),
				'Hindi gets Hindi font'
			);

			// From where monospace comes? Browsers do weird stuff.
			assert.strictEqual( $qunitFixture.find( '[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'HindiFont, ' + fallbackFonts ).replace( / /g, '' ),
				'English text area gets inherited fonts since parent language does not have monospace defined'
			);
			assert.strictEqual( $qunitFixture.find( '[lang=ml]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'MalayalamFont, ' + fallbackFonts ).replace( / /g, '' ),
				'Malayalam textarea gets Malayalam font'
			);

			testHTML = '<div lang="pt" id="#parent"><p>Hindi text</p>' +
				'<div><textarea lang="ml"></textarea></div>' +
				'<div><textarea lang="en"></textarea></div>' +
				'</div>';
			$qunitFixture.empty().append( $( testHTML ) ).webfonts( 'refresh' );
			assert.strictEqual( $qunitFixture.find( '[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				'monospace',
				'English text area gets monospace since parent language has monospace defined'
			);

			testHTML = '<div lang="en" id="#parent" ><p>English text</p>' +
				'<div><textarea lang="hi"></textarea></div>' +
				'<div><textarea lang="en"></textarea></div>' +
				'</div>';
			$qunitFixture.empty().append( $( testHTML ) ).webfonts( 'refresh' );
			assert.strictEqual( $qunitFixture.find( '[lang=hi]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'HindiFont, ' + fallbackFonts ).replace( / /g, '' ),
				'Hindi textarea gets Hindi font'
			);
			assert.strictEqual( $qunitFixture.find( 'div[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				'sans-serif',
				'English div font is fallbackFonts'
			);
			assert.strictEqual( $qunitFixture.find( 'textarea[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				'monospace',
				'English text area get monospace font'
			);

			testHTML = '<div lang="hi" id="#parent" ><p>Hindi text</p>' +
				'<div lang="ml"></div>' +
				'<div lang="en"></div>' +
				'</div>';
			$qunitFixture.empty().append( $( testHTML ) ).webfonts( 'refresh' );
			assert.strictEqual( $qunitFixture.find( '[lang=hi]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'HindiFont, ' + fallbackFonts ).replace( / /g, '' ),
				'Hindi div gets Hindi font'
			);
			assert.strictEqual( $qunitFixture.find( '[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'HindiFont, ' + fallbackFonts ).replace( / /g, '' ),
				'English div font is inherited'
			);
			assert.strictEqual( $qunitFixture.find( '[lang=ml]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'MalayalamFont, ' + fallbackFonts ).replace( / /g, '' ),
				'Malayalam div gets Malayalam font'
			);

			testHTML = '<div style="font-family: serif;"><p>Hindi text</p>' +
				'<div lang="ml"></div>' +
				'<div lang="en"></div>' +
				'<div><textarea lang="en"></textarea></div>' +
				'</div>';
			$qunitFixture.empty().append( $( testHTML ) ).webfonts( 'refresh' );

			assert.strictEqual( $qunitFixture.find( 'div[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				'serif',
				'English div font is inherited'
			);
			assert.strictEqual( $qunitFixture.find( 'textarea[lang=en]' ).css( 'font-family' ).replace( / /g, '' ),
				'monospace',
				'English textarea is monospace'
			);
			assert.strictEqual( $qunitFixture.find( '[lang=ml]' ).css( 'font-family' ).replace( / /g, '' ),
				( 'MalayalamFont, ' + fallbackFonts ).replace( / /g, '' ),
				'Malayalam div gets Malayalam font'
			);

	} );
} )( window.jQuery );
