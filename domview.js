// DOMView.js 1.1.1

// Created by Nathan Alden, Sr.
// http://projects.nathanalden.com

// Licensed under the Open Software License 2.1
// http://opensource.org/licenses/osl-2.1.php

(function ($, undefined) {
	function wrap(parentSelector, object) {
		if (object === undefined || object === null) {
			return undefined;
		}
	
		// Treat the object as a selector object only if it has a selector property
		if (!object.hasOwnProperty("selector")) {
			return object;
		}

		var childSelector = parentSelector ? parentSelector.find(object.selector) : $(object.selector);
		
		for (var property in object) {
			// Skip the selector property
			if (property === "selector") {
				continue;
			}
			
			// Don't allow overwriting of existing properties
			if (childSelector.hasOwnProperty(property)) {
				throw "Property '" + property + "' already exists";
			}

			var propertyValue = object[property];
			
			if (propertyValue === undefined || propertyValue === null) {
				childSelector[property] = propertyValue;
				continue;
			}

			var propertyValueIsString = typeof propertyValue === "string";
			var propertyValueIsJQueryObject = propertyValue instanceof jQuery;
			var propertyValueIsFunction = typeof propertyValue === "function";
			var propertyValueIsObject = typeof propertyValue === "object";
			
			if (propertyValueIsString) {
				// The property value is a child selector

				childSelector[property] = childSelector.find(propertyValue);
			} else if (propertyValueIsJQueryObject) {
				// The property is a jQuery object or an object, both of which must be copied without modification

				childSelector[property] = propertyValue;
			} else if (propertyValueIsFunction) {
				if (property[0] === "_") {
					// The property is a jQuery event function with an extra context argument as the first argument

					var eventName = property.substring(1);
					var closurePropertyValue = propertyValue;

					childSelector.on(eventName, function () {
						var args = $.makeArray(arguments);

						// Add the context object to the beginning of the args array
						args.splice(0, 0, parentSelector || childSelector);

						closurePropertyValue.apply(this, args);
					});
				} else {
					// The property is a function whose return value is used as the property value

					childSelector[property] = propertyValue.call(childSelector, childSelector);
				}
			} else if (propertyValueIsObject) {
				childSelector[property] = wrap(childSelector, propertyValue);
			} else {
				// Copy, without modification, property values whose data types are unknown

				childSelector[property] = propertyValue;
			}
		}

		return childSelector;
	}

	window.DomView = function (object) {
		return wrap(undefined, object);
	};
})(jQuery);