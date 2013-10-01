// DOMView.js 2.0.0

// Created by Nathan Alden, Sr.
// http://projects.nathanalden.com

// Licensed under the Open Software License 2.1
// http://opensource.org/licenses/osl-2.1.php

(function ($, undefined) {
	var reservedPropertyNames = ["selector", "init"];

	function deferJQueryEventHandlerAssignment(deferredFunctions, childSelector, eventName, propertyValue) {
		deferredFunctions.push(function (view) {
			childSelector.on(eventName, function () {
				var args = $.makeArray(arguments);

				// Add the view object to the beginning of the args array
				args.splice(0, 0, view);

				propertyValue.apply(this, args);
			});
		});
	}
	
	function deferFunctionResolution(deferredFunctions, childSelector, property, propertyValue) {
		var wrapper = function (view) {
			return propertyValue.call(view, view);
		};

		// Assign the wrapper function to the view property
		childSelector[property] = wrapper;

		deferredFunctions.push(function (view) {
			if (childSelector[property] === wrapper) {
				// Retrieve the view property's value if it has not yet been retrieved
				var result = childSelector[property](view);
				
				// Return the resolved value from another wrapper function
				childSelector[property] = function () {
					return result;
				};
			}
		});
	}

	function wrap(parentSelector, object, deferredFunctions) {
		if (object === undefined || object === null) {
			return undefined;
		}

		// Treat the object as a selector object only if it has a selector property
		if (!object.hasOwnProperty("selector")) {
			return object;
		}

		var childSelector = parentSelector ? parentSelector.find(object.selector) : $(object.selector);

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

					// Defer hooking up the jQuery event handler until after view construction 
					deferJQueryEventHandlerAssignment(deferredFunctions, childSelector, eventName, propertyValue);
				} else {
					// The property is a function whose return value is used as the property value

					// Defer resolving the function until after view construction 
					deferFunctionResolution(deferredFunctions, childSelector, property, propertyValue);
				}
			} else if (propertyValueIsObject) {
				childSelector[property] = wrap(childSelector, propertyValue, deferredFunctions);
			} else {
				// Copy, without modification, property values whose data types are unknown

				childSelector[property] = propertyValue;
			}
		}

		return childSelector;
	}

	window.DomView = function (object) {
		var deferredFunctions = [];
		var view = wrap(undefined, object, deferredFunctions);

		for (var i = 0; i < deferredFunctions.length; i++) {
			deferredFunctions[i](view);
		}

		return view;
	};
})(jQuery);