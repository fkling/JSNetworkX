/*! 
* Copyright (c) 2011 Tom Ellis (http://www.webmuse.co.uk)
* Linear and Radial Gradient cssHook for jQuery
* Limitations:
  - Works with jQuery 1.4.3 and higher
  - Works in Firefox 3.6+, Safari 5.1+, Chrome 13+, Opera 11.10+, IE9+ 
  - Radial Gradients DO NOT work in Opera yet (Doesn't make sense I Know!)
  - Only works for background and background image CSS properties
* Licensed under the MIT License (LICENSE.txt).
*/
(function($) {

	var div = document.createElement( "div" ),
		divStyle = div.style,
		rLinear = /^(.*?)linear-gradient(.*?)$/i,
		rRadial = /^(.*?)radial-gradient(.*?)$/i,
		rLinearSettings = /^(.*?)(:?linear-gradient)(\()(.*)(\))(.*?)$/i,		
		rRadialSettings = /^(.*?)(:?radial-gradient)(\()(.*?)(\))(.*?)$/i,
		rSupportLinearW3C = /(^|\s)linear-gradient/,	
		rSupportLinearMoz = /(^|\s)-moz-linear-gradient/,	
		rSupportLinearWebkit = /(^|\s)-webkit-linear-gradient/,	
		rSupportLinearOpera = /(^|\s)-o-linear-gradient/,	
		rSupportRadialW3C = /(^|\s)radial-gradient/,	
		rSupportRadialMoz = /(^|\s)-moz-radial-gradient/,	
		rSupportRadialWebkit = /(^|\s)-webkit-radial-gradient/,	
		rSupportRadialOpera = /(^|\s)-o-radial-gradient/,				  
		rWhitespace = /\s/,
		rWhiteGlobal = /\s/g,
		cssProps = "background backgroundImage", //listStyleImage not supported yet
		cssLinear = "background-image: -moz-linear-gradient(red, blue);background-image: -webkit-linear-gradient(red, blue);background-image: -o-linear-gradient(red, blue);background-image: linear-gradient(red, blue);",
		cssRadial = "background-image: -moz-radial-gradient(circle, orange, red);background-image: -webkit-radial-gradient(circle, orange, red);background-image: -o-radial-gradient(circle,red, blue);background-image: radial-gradient(circle, orange, red);",
		cssPropsArray = cssProps.split( rWhitespace );
		divStyle.cssText = cssLinear,
		linearSettings = function ( value ) {
			var parts = rLinearSettings.exec( value );
			value = value.replace( new RegExp(parts[2], 'g') , $.support.linearGradient );
			return value;
		},
		radialSettings = function ( value ) {
			var parts = rRadialSettings.exec( value );			
			value = value.replace( new RegExp(parts[2], 'g') , $.support.radialGradient );
			return value;
		};

		$.support.linearGradient =
			rSupportLinearW3C.test( divStyle.backgroundImage ) ? "linear-gradient" :
			(rSupportLinearMoz.test( divStyle.backgroundImage ) ? "-moz-linear-gradient" :
			(rSupportLinearWebkit.test( divStyle.backgroundImage ) ? "-webkit-linear-gradient" :
			(rSupportLinearOpera.test( divStyle.backgroundImage ) ? "-o-linear-gradient" :
			false)));

		divStyle.cssText = cssRadial;
		
		$.support.radialGradient =
			rSupportRadialW3C.test( divStyle.backgroundImage ) ? "radial-gradient" :
			(rSupportRadialMoz.test( divStyle.backgroundImage ) ? "-moz-radial-gradient" :
			(rSupportRadialWebkit.test( divStyle.backgroundImage ) ? "-webkit-radial-gradient" :
			(rSupportRadialOpera.test( divStyle.backgroundImage ) ? "-o-radial-gradient" :
			false)));
			
	    if ( $.support.linearGradient && $.support.linearGradient !== "linear-gradient" ) {

			$.each( cssPropsArray, function( i, prop ) {

				$.cssHooks[ prop ] = {

					set: function( elem, value ) {
												
						if( rLinear.test( value ) ){
							elem.style[ prop ] = linearSettings( value );
						} else if ( rRadial.test( value ) ) {
							elem.style[ prop ] = radialSettings( value );
						} else {
							elem.style[ prop ] = value;
						}
					}
				};
				
			});

	    }
	
		div = divStyle = null; 
})(jQuery);
