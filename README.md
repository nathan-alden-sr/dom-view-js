# DOMView.js

## Tired of flat, unstructured jQuery?

Effective use of jQuery requires that we cache jQuery objects in variables when possible, like this:

```javascript
(function ($) {
	$(function () {
		var $container = $(".container");
		var $button = $container.find("input[type='button']");
		var $label = $container.find("label");
		var $name = $container.find(".name");
		var $form = $container.find("form");
		var $age = $form.find(".age");
		var $radio = $form.find("input[type='radio']");
		
		$button.click(function (e) {
		});
		
		$form.submit(function (e) {
		});
	});
})(jQuery);
```

Here's the markup that the above JavaScript represents:

```html
<html>
	<body>
		<div class=".container">
			<input type="button">
			<label></label>
			<span class="name"></span>
			<form>
				<input type="text" class="age">
				<input type="radio">
				<input type="radio">
			</form>
		</div>
	</body>
</html>
```

jQuery encourages this kind of non-hierarchical approach. Unfortunately, reading the JavaScript does not communicate the hierarchical structure of our HTML. We are forced to swap back and forth between markup and JavaScript to remind ourselves of the DOM structure.

What if there were a way to easily represent our jQuery objects in a hierarchical way that closely matches our DOM? In other words:

### We need a view of the DOM.

## Hierarchical jQuery with DOMView.js

Here's the above JavaScript re-written to use DOMView.js, instead:

```javascript
var view = DomView({
	selector: ".container",
	button: {
		selector: "button",
		_click: function (context, e) {
		}
	},
	label: "label",
	name: ".name",
	form: {
		selector: "form",
		_submit: function (context, e) {
		},
		age: ".age",
		radio: "input[type='radio']"
	}
});
```

The resultant view object is organized of jQuery objects in exactly the structure we specify. For example, to clear the value of the age text box, we can write ```view.form.age.val("");```.

```view.form.age``` is a jQuery object just as if we had declared it as ```$(".container").find("form").find(".age")```, only now, the *hierarchical relationships between our jQuery objects are preserved*, creating more readable, more maintainable code.

## Getting started with DOMView.js

### Dependencies

DOMView.js depends only on jQuery 1.x or 2.x and its use of jQuery's features are very limited.

### Selector objects

The ```DomView``` function takes a single parameter of an object type. We'll call these objects *selector objects*. Selector objects are objects that declare a ```selector``` property.

```javascript
DomView({
	selector: ".container"
});

// Equivalent code:
$(".container");
```

This object instructs ```DomView``` to select elements matching the ```.container``` selector.

### Nested jQuery objects

Next, we'll add our button as a property inside the root selector object:

```javascript
DomView({
	selector: ".container",
	button: "input[type='button']"
});

// Equivalent code:
var $container = $(".container");
var $button = $container.find("input[type='button']");
```

Let's add the remaining properties:

```javascript
DomView({
	selector: ".container",
	button: "input[type='button']",
	label: "label",
	name: ".name",
	form: {
		selector: "form",
		age: ".age",
		radio: "input[type='radio']"
	}
});

// Equivalent code:
var $container = $(".container");
var $button = $container.find("input[type='button']");
var $label = $container.find("label");
var $name = $container.find(".name");
var $form = $container.find("form");
var $age = $form.find(".age");
var $radio = $form.find("input[type='radio']");
```

Note how each property's value is a string selector. String property values are treated as jQuery selectors. These selectors are passed to the ```find``` function of the parent jQuery object. Other selector objects and functions may be used as values (see below).

The ```DomView``` function returns a normal jQuery object constructed with the ```.container``` selector. To each jQuery object, DomView adds properties that store jQuery objects created from selector properties (see the age example above). Other values besides jQuery selectors may also be used (see below).

### What about events?

We often call jQuery's event handler functions to hook up event handlers. Let's hook up a ```click``` event handler to our button element:

```javascript
DomView({
	selector: ".container",
	button: {
		selector: "input[type='button']",
		_click: function (context, e) {
		}
	}
});
```

Note that the button property no longer has a string selector value; instead, we created a second selector object that also contains a click event handler. To hook up an event handler using any jQuery event handler function, simply prepend an ```_``` to the name of the event handler function.

DOMView.js doesn't hook up our event handler function directly; instead, it wraps it in an internal function. This internal function calls our function and passes the parent selector object as the first parameter and any arguments from the internal function call as the remaining parameters. For the root selector object, the context is the root object itself. Here's an example demonstrating what context represents:

```javascript
DomView({
	selector: ".container",
	_click: function (context, e) {
		console.log(this); // Outputs the HTML element for .container (normal jQuery functionality)
		console.log(context); // Outputs the jQuery object for .container
	},
	button: {
		selector: "input[type='button']",
		_click: function (context, e) {
			console.log(this); // Outputs the HTML element for input[type='button']
			console.log(context); // Outputs the jQuery object for .container
		}
	},
	form: {
		selector: "form",
		age: {
			selector: ".age",
			_click: function (context, e) {
				console.log(this); // Outputs the HTML element for .age
				console.log(context); // Outputs the jQuery object for form
			}
		}
	}
});
```

The ```context``` parameter is useful for accessing sibling jQuery objects. If you need to access other objects in the hierarchy, use the captured ```DomView``` function return value:

```javascript
var view = DomView({
	selector: ".container",
	button: "input[type='button']",
	form: {
		selector: "form",
		age: {
			selector: ".age",
			_click: function (context, e) {
				console.log(view.button); // Outputs the jQuery object for input[type='button']
			}
		}
	}
});
```

### Using functions for property values

Sometimes it is desirable to add a property that isn't a jQuery object. To do this, specify a function instead of a string selector:

```javascript
var view = DomView({
	selector: ".container",
	button: function (context) {
		return "Hello, world!"
	}
});

console.log(view.button); // Outputs "Hello, world!"
```

Functions may return data of any type, from instances of jQuery plugins to jQuery objects to simple data types.

Note how DOMView.js provides these functions with a context. The rules for ```context```'s value are the same as above; however, there is one important distinction. Because these functions are invoked during the building of the object returned by the ```DomView``` function, any properties declared *after* the function's property will not yet be available. For example:

```javascript
DomView({
	selector: ".container",
	labelText: function (context) {
		return context.label.text(); // Throws an exception because the label property has not yet been processed
	},
	label: "label"
});
```

Make sure the selector object's properties are declared in the appropriate order.

### Non-selector object property values

Sometimes we may want to create a property with a custom object value. Simply omit the ```selector``` property:

```javascript
DomView({
	selector: ".container",
	fn: {
		helloWorld: function () {
			return "Hello, world!";
		}
	},
	button: {
		selector: "input[type='button']",
		_click: function (context) {
			alert(context.fn.helloWorld());
		}
	}
});
```

## That's it!

If you have any questions, suggestions or bug reports, please file an issue. I'll try and respond promptly.

Thanks for using DOMView.js!
