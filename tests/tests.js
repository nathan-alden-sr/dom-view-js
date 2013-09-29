(function ($, undefined) {
	$(function () {
		function unbindAllEvents() {
			$(".container").children().andSelf().off();
		}
	
		test("undefined root selector object must result in undefined view", function () {
			ok(typeof DomView(undefined) === "undefined", "Return value must be undefined");
		});
	
		test("null root selector object must result in undefined view", function () {
			ok(typeof DomView(null) === "undefined", "Return value must be undefined");
		});

		test("Root selector object without selector property must be returned", function () {
			var object = {};
			var view = DomView(object);
			
			ok(view === object, "Return value must be selector object");
		});
		
		test("Root selector object with string selector property must return the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container"
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			ok(container.length === 1, "Return value's length must be 1");
			ok(container[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.hasClass("container"), "Return value's element must have container class");
		});

		test("Root selector object with jQuery object selector property must return the jQuery object", function () {
			var container = DomView({
				selector: $(".container")
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			ok(container.length === 1, "Return value's length must be 1");
			ok(container[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.hasClass("container"), "Return value's element must have container class");
		});
		
		test("Nested property with string value must result in the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container",
				levelOne: ".level-one"
			});
			
			ok(container.levelOne instanceof jQuery, "Return value must be jQuery instance");
			ok(container.levelOne.length === 1, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have level-one class");
		});

		test("Nested property with jQuery object value must result in the same jQuery object", function () {
			var levelOne = $(".container .level-one");
			var container = DomView({
				selector: ".container",
				levelOne: levelOne
			});
			
			ok(container.levelOne === levelOne, "Return value must be jQuery object");
		});

		test("Nested property whose name begins with an underscore and with function value must treat function as jQuery event handler", function () {
			var flag = false;
			var eventHandler = function () { flag = true; };
			var container = DomView({
				selector: ".container",
				_click: eventHandler
			});
			var events = $._data(container[0]).events;
			
			ok(events.click, "Must attach function to click event");
			ok(events.click.length === 1, "Must attach function once");
			
			events.click[0].handler();
			
			ok(flag === true, "Must attach function");
			
			unbindAllEvents();
		});

		test("Return value of nested property whose name does not begin with an underscore and with function value must be added to returned object", function () {
			var container = DomView({
				selector: ".container",
				foo: function () {
					return "bar";
				}
			});
			
			ok(container.foo === "bar", "Function's return value must be added");
		});

		test("'this' value attached jQuery event must be event's target", function () {
			var _this;
			var container = DomView({
				selector: ".container",
				_click: function () {
					_this = this;
				}
			});
			
			container.trigger("click");
			
			ok(_this === container[0], "'this' must be event target");
			
			unbindAllEvents();
		});

		test("For root selector object, nested property whose name does not begin with an underscore and with function value must be supplied with root context", function () {
			var fooContext;
			var container = DomView({
				selector: ".container",
				foo: function (context) {
					fooContext = context;
				}
			});
			
			ok(fooContext === container, "Context must be root jQuery object");
		});

		test("For one-level-deep nested selector object, nested property whose name does not begin with an underscore and with function value must be supplied with nested context", function () {
			var fooContext;
			var container = DomView({
				selector: ".container",
				oneLevel: {
					selector: ".one-level",
					foo: function (context) {
						fooContext = context;
					}
				}
			});
			
			ok(fooContext === container.oneLevel, "Context must be nested jQuery object");
		});
		
		test("For root selector object, attached jQuery function must be invoked with root context as first parameter and jQuery event parameters as subsequent parameters", function () {
			var eventHandlerContext;
			var eventHandlerE;
			var eventHandler = function (context, e) {
				eventHandlerContext = context;
				eventHandlerE = e;
			}
			var container = DomView({
				selector: ".container",
				_click: eventHandler
			});
			
			container.trigger("click");
			
			ok(eventHandlerContext === container, "Context must be root jQuery object");
			ok(eventHandlerE.type === "click", "e must be event object");
			
			unbindAllEvents();
		});

		test("For one-level-deep nested selector object, attached jQuery function must be invoked with root context as first parameter and jQuery event parameters as subsequent parameters", function () {
			var eventHandlerContext;
			var eventHandlerE;
			var eventHandler = function (context, e) {
				eventHandlerContext = context;
				eventHandlerE = e;
			}
			var container = DomView({
				selector: ".container",
				levelOne: {
					selector: ".level-one",
					_click: eventHandler
				}
			});
			
			container.levelOne.trigger("click");
			
			ok(eventHandlerContext === container, "Context must be root jQuery object");
			ok(eventHandlerE.type === "click", "e must be event object");
			
			unbindAllEvents();
		});

		test("For two-level-deep nested selector object, attached jQuery function must be invoked with parent context as first parameter and jQuery event parameters as subsequent parameters", function () {
			var eventHandlerContext;
			var eventHandlerE;
			var eventHandler = function (context, e) {
				eventHandlerContext = context;
				eventHandlerE = e;
			}
			var container = DomView({
				selector: ".container",
				levelOne: {
					selector: ".level-one",
					levelTwo: {
						selector: ".level-two",
						_click: eventHandler
					}
				}
			});
			
			container.levelOne.levelTwo.trigger("click");
			
			ok(eventHandlerContext === container.levelOne, "Context must be nested jQuery object");
			ok(eventHandlerE.type === "click", "e must be event object");
			
			unbindAllEvents();
		});
		
		test("Nested object with selector property must be treated as selector object", function () {
			var container = DomView({
				selector: ".container",
				levelOne: {
					selector: ".level-one"
				}
			});
			
			ok(container.levelOne instanceof jQuery, "Return value must be jQuery instance");
			ok(container.levelOne.length === 1, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have container class");
		});

		test("Nested object without selector property must be attached to returned object", function () {
			var object = {};
			var container = DomView({
				selector: ".container",
				levelOne: object
			});
			
			ok(container.levelOne === object, "Nested object must be attached");
		});

		test("Nested property values of non-function, non-string, non-object types must be attached to returned object", function () {
			var array = [];
			var container = DomView({
				selector: ".container",
				foo: 0,
				bar: 3.141592654,
				baz: true,
				faz: array
			});
			
			ok(container.foo === 0, "Integer property value must be attached");
			ok(container.bar === 3.141592654, "Floating-point property value must be attached");
			ok(container.baz === true, "Boolean property value must be attached");
			ok(container.faz === array, "Array property value must be attached");
		});
	});
})(jQuery);