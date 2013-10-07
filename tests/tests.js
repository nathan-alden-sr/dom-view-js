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
			
			strictEqual(view, object, "Return value must be selector object");
		});
		
		test("Root selector object with string selector property must return the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container"
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(container.length, 1, "Return value's length must be 1");
			ok(container[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.hasClass("container"), "Return value's element must have container class");
		});

		test("Root selector object with jQuery object selector property must return the jQuery object", function () {
			var container = DomView({
				selector: $(".container")
			});
			
			ok(container instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(container.length, 1, "Return value's length must be 1");
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
		
		test("init property with function value must have 'this' set to view object", function () {
			var view;
			var container = DomView({
				selector: ".container",
				init: function () {
					view = this;
				}
			});

			strictEqual(view, container, "'this' must be set to view object");
		});

		test("Nested property with string value must result in the appropriate jQuery object", function () {
			var container = DomView({
				selector: ".container",
				levelOne: ".level-one"
			});
			
			ok(container.levelOne instanceof jQuery, "Return value must be jQuery instance");
			strictEqual(container.levelOne.length, 1, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have level-one class");
		});

		test("Nested property with jQuery object value must result in the same jQuery object", function () {
			var levelOne = $(".container .level-one");
			var container = DomView({
				selector: ".container",
				levelOne: levelOne
			});
			
			strictEqual(container.levelOne, levelOne, "Return value must be jQuery object");
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
			strictEqual(events.click.length, 1, "Must attach function once");
			
			events.click[0].handler();
			
			strictEqual(flag, true, "Must attach function");
			
			unbindAllEvents();
		});

		test("Return value of nested property whose name does not begin with an underscore and with function value must be added to returned object", function () {
			var container = DomView({
				selector: ".container",
				foo: function () {
					return "bar";
				}
			});
			
			ok(typeof container.foo === "function", "Property must be function");
			strictEqual(container.foo(), "bar", "Function must return value");
		});

		test("Return value of nested property whose name does not begin with an underscore and with function value must only be evaluated once", function () {
			var count = 0;
			var container = DomView({
				selector: ".container",
				foo: function () {
					count++;
				}
			});
			
			container.foo();
			container.foo();
			
			strictEqual(count, 1, "Function must only be evaluated once");
		});

		test("'this' value of nested property whose name does not begin with an underscore and with function value must be its parent jQuery object", function () {
			var _this;
			var container = DomView({
				selector: ".container",
				levelOne: {
					selector: ".level-one",
					foo: function () {
						_this = this;
					}
				}
			});
			
			strictEqual(_this, container.levelOne, "'this' must be parent jQuery object");
		});
		
		test("'this' value for attached jQuery event must be event's target", function () {
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

		test("Nested property whose name does not begin with an underscore and with function value must be supplied with view object", function () {
			var _view;
			var container = DomView({
				selector: ".container",
				foo: function (view) {
					_view = view;
				}
			});
			
			strictEqual(_view, container, "View object parameter must be same as return value");
		});

		test("Attached jQuery function must be invoked with view object as first parameter and jQuery event parameters as subsequent parameters", function () {
			var _view;
			var _e;
			var container = DomView({
				selector: ".container",
				_click: function (view, e) {
					_view = view;
					_e = e;
				}
			});
			
			container.trigger("click");
			
			strictEqual(_view, container, "View object parameter must be same as return value");
			strictEqual(_e.type, "click", "e must be event object");
			
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
			strictEqual(container.levelOne.length, 1, "Return value's length must be 1");
			ok(container.levelOne[0] instanceof HTMLDivElement, "Return value's element must be HTMLDivElement");
			ok(container.levelOne.hasClass("level-one"), "Return value's element must have container class");
		});

		test("Nested object without selector property must be attached to returned object", function () {
			var object = {};
			var container = DomView({
				selector: ".container",
				levelOne: object
			});
			
			strictEqual(container.levelOne, object, "Nested object must be attached");
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
			
			strictEqual(container.foo, 0, "Integer property value must be attached");
			strictEqual(container.bar, 3.141592654, "Floating-point property value must be attached");
			strictEqual(container.baz, true, "Boolean property value must be attached");
			strictEqual(container.faz, array, "Array property value must be attached");
		});
		
		test("Custom functions must be provided with view when called by other custom functions", function () {
			var _bar;
			var view = DomView({
				selector: ".container",
				foo: function (view) {
					_bar = view.bar();
				},
				bar: function (view) {
					return view;
				}
			});
			
			strictEqual(_bar, view, "View must be provided to second custom function");
		});
		
		test("Selector objects whose init function returns false should cause the selector object to not be added to its parent", function () {
			var view = DomView({
				selector: ".container",
				init: function () {
					return false;
				}
			});
			
			strictEqual(view, undefined, "View must be undefined");
			
			view = DomView({
				selector: ".container",
				levelOne: {
					selector: ".level-one",
					init: function () {
						return false;
					}
				}
			});
			
			strictEqual(view.levelOne, undefined, "Nested object must be undefined");
		});

		test("Selector objects whose init function returns nothing should cause the selector object to be added to its parent", function () {
			var view = DomView({
				selector: ".container",
				init: function () {
				}
			});
			
			notStrictEqual(view, undefined, "View must not be undefined");
		});
	});
})(jQuery);