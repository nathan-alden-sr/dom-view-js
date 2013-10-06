// DOMView.js 2.0.2

// Created by Nathan Alden, Sr.
// http://projects.nathanalden.com

// Licensed under the Open Software License 2.1
// http://opensource.org/licenses/osl-2.1.php

(function ($, undefined) {
	var reservedPropertyNames = ["selector", "init"];

	function wrapJQueryEventHandler(view, childSelector, eventName, propertyValue) {
		childSelector.on(eventName, function () {
			var args = $.makeArray(arguments);

			// Add the view object to the beginning of the args array
			args.splice(0, 0, view);

			propertyValue.apply(this, args);
		});
	}

	function wrapCustomFunction(view, childSelector, property, propertyValue) {
		var wrapper = function () {
			// Retrieve the property's value
			var result = propertyValue.call(childSelector, view);

			// Create a new wrapper function that caches the result and overwrite the old wrapper function
			childSelector[property] = function () {
				return result;
			};

			return result;
		};

		// Assign the wrapper function to the view property
		childSelector[property] = wrapper;
		
		// Return a function that can be used to initialize the cached result
		return function() {
			childSelector[property](view);
		};
	}

	function wrap(view, parentSelector, object, functions) {
		if (object === undefined || object === null) {
			return undefined;
		}

		// Treat the object as a selector object only if it has a selector property
		if (!object.hasOwnProperty("selector")) {
			return object;
		}

		var childSelector;
		
		if (parentSelector) {
			childSelector = parentSelector.find(object.selector);
		} else {
			view = childSelector = $(object.selector);
		}

		if (object.hasOwnProperty("init") && object.init !== undefined && object.init !== null) {
			if (typeof object.init !== "function") {
				throw "init property must have a function value";
			}

			object.init.call(childSelector);
		}

		for (var property in object) {
			// Skip reserved properties
			if (reservedPropertyNames.indexOf(property) > -1) {
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
					// The property is a jQuery event handler with an extra context argument as the first argument

					var eventName = property.substring(1);

					wrapJQueryEventHandler(view, childSelector, eventName, propertyValue);
				} else {
					// The property is a function whose return value is used as the property value

					functions.push(wrapCustomFunction(view, childSelector, property, propertyValue));
				}
			} else if (propertyValueIsObject) {
				childSelector[property] = wrap(view, childSelector, propertyValue, functions);
			} else {
				// Copy, without modification, property values whose data types are unknown

				childSelector[property] = propertyValue;
			}
		}

		return childSelector;
	}

	window.DomView = function (object) {
		var functions = [];
		var view = wrap(undefined, undefined, object, functions);
		
		for (var i = 0; i < functions.length; i++) {
			functions[i](view);
		}
		
		return view;
	};
})(jQuery);