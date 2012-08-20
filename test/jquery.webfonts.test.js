/* global pluralRuleParser, QUnit, jQuery */
(function($) {
"use strict";

// Convert a font-family string to an array. This is needed
// because browsers change the string by adding or removing spaces,
// so the string cannot be compared in a uniform way.
function fontFamilyList( fontFamilyString ) {
	var fontIndex,
		fontList = fontFamilyString.split( /, */ ); // Create a list

	// Remove the quotes from font names
	for ( fontIndex = 0; fontIndex < fontList.length; ++fontIndex ) {
		fontList[fontIndex] = fontList[fontIndex].replace( /^["']/, '' ).replace( /["']$/, '' );
	}

	return fontList;
}

test("Webfonts loading and application test", function(assert) {
	// Initialize document to language "my" to make webfonts work
	var localFont = "Garamond",
		$qunitFixture = $( "<body>" ),
		$webfontsElement = $( "<div id='webfonts-fixture'>" )
		.attr( "lang", "my" )
		.webfonts({
			repository: {
				fonts: {
					TharLon: {
						eot: "TharLon/TharLon.eot",
						ttf: "TharLon/TharLon.ttf",
						woff: "TharLon/TharLon.woff",
						license: "OFL 1.1",
						version: "1.0"
					}
				},
				languages: {
					my: [ "TharLon" ]
				}
			}
		})
		.appendTo( $qunitFixture ),
		webfonts = $webfontsElement.data( "webfonts" ),
		fontName = webfonts.fonts[0],
		$spanElement = $( "<span>span content</span>" ).css( "font-family", localFont ),
		$inputElement = $( "<input value='input content' />" ),
		$textareaElement = $( "<textarea>textarea content</textarea>" ),
		fallbackFonts = "Helvetica, Arial, sans-serif",
		expectedFontFamilyValue = "'" + fontName + "', " + fallbackFonts,
		expectedFontFamilyList = fontFamilyList( expectedFontFamilyValue ),
		expectedResetFontFamilyList = fontFamilyList( fallbackFonts );

	$webfontsElement.append( $spanElement, $inputElement, $textareaElement );

	assert.strictEqual( fontName, "TharLon", "Correct font name loaded" );

	// Font application
	webfonts.apply( fontName );
	assert.deepEqual( fontFamilyList( $webfontsElement.css( "font-family" ) ),
		expectedFontFamilyList, "The web font was applied to font-family of the test <div>" );
	assert.deepEqual( fontFamilyList( $spanElement.css( "font-family" ) ),
		[ localFont ], "A web font was not applied to an element with explicit font-family" );
	assert.deepEqual( fontFamilyList( $inputElement.css( "font-family" ) ),
		expectedFontFamilyList, "The web font was applied to font-family of the test <input>" );
	assert.deepEqual( fontFamilyList( $textareaElement.css( "font-family" ) ),
		expectedFontFamilyList, "The web font was applied to font-family of the test <textarea>" );

	// Font resetting
	webfonts.reset();
	assert.deepEqual( fontFamilyList( $webfontsElement.css( "font-family" ) ),
		expectedResetFontFamilyList, "The web font on the test <div> was reset" );
	assert.deepEqual( fontFamilyList( $spanElement.css( "font-family" ) ),
		[ localFont ], "An element with an explicit font-family remained with it after webfonts resetting" );
	assert.deepEqual( fontFamilyList( $inputElement.css( "font-family" ) ),
		expectedResetFontFamilyList, "The web font on the test <input> was reset" );
	assert.deepEqual( fontFamilyList( $textareaElement.css( "font-family" ) ),
		expectedResetFontFamilyList, "The web font on the test <textarea> was reset" );

	$webfontsElement.remove();
});

})(window.jQuery);
