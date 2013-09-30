(function ($, undefined) {
	$(function () {
		function unbindAllEvents() {
			$(".container").children().andSelf().off();
		}
	
		test("undefined root selector object must result in undefined view", function () {
			strictEqual("undefined", typeof DomView(undefined), "Return value must be undefined");
		});
	
		test("null root selector object must result in undefined view", function () {
			ok("undefined" === typeof DomView(null), "Return value must be undefined");
		});

		test("Root selector object without selector property must be returned", function () {
			var object = {};
			var view = DomView(object);
			
			strictEqual(object, view, "Return value must be selector object");
		});
		
		test("Root selector object with string selector property must return the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container"
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(1, container.length, "Return value's length must be 1");
			ok(container[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.hasClass("container"), "Return value's element must have container class");
		});

		test("Root selector object with jQuery object selector property must return the jQuery object", function () {
			var container = DomView({
				selector: $(".container")
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(1, container.length, "Return value's length must be 1");
			ok(container[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.hasClass("container"), "Return value's element must have container class");
		});
		
		test("undefined init property must not throw exception", function () {
			var container = DomView({
				selector: ".container",
				init: undefined
			});
			
			ok(true, "Must not throw exception");
		});
		
		test("null init property must not throw exception", function () {
			var container = DomView({
				selector: ".container",
				init: null
			});
			
			ok(true, "Must not throw exception");
		});

		test("init property with integer value must cause exception", function () {
			throws(function () {
				var container = DomView({
					selector: ".container",
					init: 0
				});
			}, "Must throw exception");
		});
		
		test("init property with floating-point value must cause exception", function () {
			throws(function () {
				var container = DomView({
					selector: ".container",
					init: 3.141592654
				});
			}, "Must throw exception");
		});

		test("init property with string value must cause exception", function () {
			throws(function () {
				var container = DomView({
					selector: ".container",
					init: "foo"
				});
			}, "Must throw exception");
		});
		
		test("init property with array value must cause exception", function () {
			throws(function () {
				var container = DomView({
					selector: ".container",
					init: [1, 2, 3]
				});
			}, "Must throw exception");
		});

		test("init property with object value must cause exception", function () {
			throws(function () {
				var container = DomView({
					selector: ".container",
					init: {}
				});
			}, "Must throw exception");
		});
		
		test("init property with function value must have 'this' set to underlying jQuery object", function () {
			var object;
			var container = DomView({
				selector: ".container",
				init: function () {
					object = this;
				}
			});

			strictEqual(object, container, "Parameter must be underlying jQuery object");
		});
		
		test("Nested property with string value must result in the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container",
				levelOne: ".level-one"
			});
			
			ok(container.levelOne instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(1, container.levelOne.length, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have level-one class");
		});

		test("Nested property with jQuery object value must result in the same jQuery object", function () {
			var levelOne = $(".container .level-one");
			var container = DomView({
				selector: ".container",
				levelOne: levelOne
			});
			
			strictEqual(levelOne, container.levelOne, "Return value must be jQuery object");
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
			strictEqual(1, events.click.length, "Must attach function once");
			
			events.click[0].handler();
			
			strictEqual(true, flag, "Must attach function");
			
			unbindAllEvents();
		});

		test("Return value of nested property whose name does not begin with an underscore and with function value must be added to returned object", function () {
			var container = DomView({
				selector: ".container",
				foo: function () {
					return "bar";
				}
			});
			
			strictEqual("bar", container.foo, "Function's return value must be added");
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
			
			strictEqual(_this, container[0], "'this' must be event target");
			
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
			
			strictEqual(fooContext, container, "Context must be root jQuery object");
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
			
			strictEqual(fooContext, container.oneLevel, "Context must be nested jQuery object");
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
			
			strictEqual(eventHandlerContext, container, "Context must be root jQuery object");
			strictEqual(eventHandlerE.type, "click", "e must be event object");
			
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
			
			strictEqual(eventHandlerContext, container, "Context must be root jQuery object");
			strictEqual(eventHandlerE.type, "click", "e must be event object");
			
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
			
			strictEqual(eventHandlerContext, container.levelOne, "Context must be nested jQuery object");
			strictEqual(eventHandlerE.type, "click", "e must be event object");
			
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
			strictEqual(1, container.levelOne.length, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have container class");
		});

		test("Nested object without selector property must be attached to returned object", function () {
			var object = {};
			var container = DomView({
				selector: ".container",
				levelOne: object
			});
			
			strictEqual(object, container.levelOne, "Nested object must be attached");
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
			
			strictEqual(0, container.foo, "Integer property value must be attached");
			strictEqual(3.141592654, container.bar, "Floating-point property value must be attached");
			strictEqual(true, container.baz, "Boolean property value must be attached");
			strictEqual(array, container.faz, "Array property value must be attached");
		});
	});
})(jQuery);