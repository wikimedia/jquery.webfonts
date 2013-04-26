/* global QUnit, jQuery */
( function( $ ) {
	'use strict';

	// Convert a font-family string to an array. This is needed
	// because browsers change the string by adding or removing spaces,
	// so the string cannot be compared in a uniform way.
	function fontFamilyList( fontFamilyString ) {
		var fontIndex,
			fontList = fontFamilyString.split( /, */ ); // Create a list

		// Remove the quotes from font names
		for (fontIndex = 0; fontIndex < fontList.length; ++fontIndex) {
			fontList[fontIndex] = fontList[fontIndex].replace( /^["']/, '' ).replace( /["']$/, '' );
		}

		return fontList;
	}

	test(
		'Webfonts loading and application test',
		function( assert ) {
			var localFont = 'Garamond',
				fallbackFonts = 'Helvetica, Arial, sans-serif',
				expectedResetFontFamilyList = fontFamilyList( fallbackFonts ),
				$qunitFixture = $( '<body>' ),
				// Assign lang to 'my' to make webfonts work
				$webfontsElement = $( '<div id=\'webfonts-fixture\' lang=\'my\'>' ),
				defaultFonts = $webfontsElement.css( 'font-family' );

			// Different browsers have different default fonts.
			// Firefox assigns the default fonts from the preferences and
			// Chrome doesn't assign anything.
			if ( defaultFonts !== '' ) {
				expectedResetFontFamilyList =
					fontFamilyList( defaultFonts ).concat( expectedResetFontFamilyList );
			}

			$webfontsElement.webfonts( {
				repository: {
					fonts: {
						TharLon: {
							eot: 'TharLon/TharLon.eot',
							ttf: 'TharLon/TharLon.ttf',
							woff: 'TharLon/TharLon.woff',
							license: 'OFL 1.1',
							version: '1.0'
						}
					},
					languages: {
						my: [ 'TharLon' ]
					}
				}
			} ).appendTo( $qunitFixture );

			var webfonts = $webfontsElement.data( 'webfonts' ),
				fontName = webfonts.fonts[0],
				expectedFontFamilyValue = '\'' + fontName + '\', ' + fallbackFonts,
				expectedFontFamilyList = fontFamilyList( expectedFontFamilyValue ),
				$spanElement = $( '<span>span content</span>' ).css( 'font-family', localFont ),
				$inputElement = $( '<input value=\'input content\' />' ),
				$textareaElement = $( '<textarea>textarea content</textarea>' ),
				$buttonElement = $( '<button>button label</button>' );

			$webfontsElement.append(
				$spanElement,
				$inputElement,
				$textareaElement,
				$buttonElement
			);

			assert.strictEqual( fontName, 'TharLon', 'Correct font name loaded' );

			// Font application
			webfonts.apply( fontName );
			assert.deepEqual( fontFamilyList( $webfontsElement.css( 'font-family' ) ),
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
			assert.deepEqual( fontFamilyList( $webfontsElement.css( 'font-family' ) ),
				expectedResetFontFamilyList, 'The web font on the test <div> was reset' );
			assert.deepEqual( fontFamilyList( $spanElement.css( 'font-family' ) ),
				[ localFont ],
				'An element with an explicit font-family remained with it after webfonts resetting' );
			assert.deepEqual( fontFamilyList( $inputElement.css( 'font-family' ) ),
				expectedResetFontFamilyList, 'The web font on the test <input> was reset' );
			assert.deepEqual( fontFamilyList( $textareaElement.css( 'font-family' ) ),
				expectedResetFontFamilyList,
				'The web font on the test <textarea> was reset' );
			assert.deepEqual( fontFamilyList( $buttonElement.css( 'font-family' ) ),
				expectedResetFontFamilyList,
				'The web font on the test <button> was reset' );

			$webfontsElement.remove();
		}
	);
} )( window.jQuery );
