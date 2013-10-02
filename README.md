# DOMView.js

Table of contents:
* [Version history](#version-history)
* [Introduction](#tired-of-flat-unstructured-jquery)
* [Getting started](#getting-started-with-domviewjs)
* [Alternatives](#alternatives)
* [Criticism](#criticism)
 
## Version history

#### 2.0.0

* Released 2013-10-01
* Replaced flawed context design with deferred function evaluation design
* View properties derived from selector properties with function values must now be invoked as functions
* Context parameters replaced with view parameters; parameter now represents entire view instead of parent context

#### 1.x (deprecated)

* Released 2013-09-27

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
		
		$button.click(function () {
		});
		
		$form.submit(function () {
		});
	});
})(jQuery);
```

Here's the markup that the above JavaScript represents:

```html
<html>
	<body>
		<div class="container">
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
		_click: function () {
		}
	},
	label: "label",
	name: ".name",
	form: {
		selector: "form",
		_submit: function () {
		},
		age: ".age",
		radio: "input[type='radio']"
	}
});
```

The view object is organized of jQuery objects in exactly the structure we specify. For example, to clear the value of the age text box, we can write ```view.form.age.val("");```.

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

// Raw jQuery:
$(".container");
```

This object instructs ```DomView``` to select elements matching the ```.container``` selector.

### Initialization callback

A selector object may define an ```init``` property with a function value. This function will be called just after the underlying jQuery object is created. Inside the function, ```this``` will be the underlying jQuery object:

```javascript
DomView({
	selector: ".container",
	init: function () {
		console.log(this); // Outputs the jQuery object for .container
		
		this.on("click", "*", function () {
		});
	}
});
```

Note that ```init``` is called as soon as it is encountered by DOMView.js. It is not provided with a fully-processed view object. The intent of the ```init``` function is simply to process the parent jQuery object in some way.

### Nested jQuery objects

Next, we'll add our button as a property inside the root selector object:

```javascript
DomView({
	selector: ".container",
	button: "input[type='button']"
});

// Raw jQuery:
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

// Raw jQuery:
var $container = $(".container");
var $button = $container.find("input[type='button']");
var $label = $container.find("label");
var $name = $container.find(".name");
var $form = $container.find("form");
var $age = $form.find(".age");
var $radio = $form.find("input[type='radio']");
```

Note how each property's value is a string selector. String property values are treated as jQuery selectors. These selectors are passed to the ```find``` function of the parent jQuery object. Other selector objects, custom objects and functions may be used as values (see below).

The ```DomView``` function returns a normal jQuery object constructed with the ```.container``` selector. To each jQuery object, DomView adds properties that store jQuery objects created from selector properties (see the age example above). Other values besides jQuery selectors may also be used (see below).

### What about events?

We often call jQuery's event handler functions to hook up event handlers. Let's hook up a ```click``` event handler to our button element:

```javascript
DomView({
	selector: ".container",
	button: {
		selector: "input[type='button']",
		_click: function () {
		}
	}
});
```

Note that the button property no longer has a string selector value; instead, we created a second selector object that also contains a click event handler. To hook up an event handler using any jQuery event handler function, simply prepend an ```_``` to the name of the event handler function.

Our jQuery event handlers aren't attached to their objects when the ```DomView``` function comes across them; instead, the attaching is deferred until after the entire root selector object graph has been processed. This allows the fully-processed view object to be provided to the event handler function as the first parameter.

DOMView.js doesn't hook up our event handler function directly; instead, it wraps it in an internal function. This internal function calls our function and passes the fully-processed view object as the first parameter and any arguments from the internal function call as the remaining parameters. Here's a more complex example:

```javascript
DomView({
	selector: ".container",
	_click: function (view, e) {
		console.log(this); // Outputs the HTML element for .container (normal jQuery functionality for event handlers)
		console.log(view); // Outputs the fully-processed view object (the same object returned by the DomView function
	},
	button: {
		selector: "input[type='button']",
		_click: function (view, e) {
			console.log(this); // Outputs the HTML element for input[type='button']
			console.log(view); // Outputs the fully-processed view object
		}
	},
	form: {
		selector: "form",
		age: {
			selector: ".age",
			_click: function (view, e) {
				console.log(this); // Outputs the HTML element for .age
				console.log(view); // Outputs the fully-processed view object
			}
		}
	}
});
```

### Using custom functions for property values

Sometimes it is desirable to use a *custom function* that provide's a property's value:

```javascript
var view = DomView({
	selector: ".container",
	button: function (view) {
		console.log(this); // Outputs the jQuery object for .container
		
		return "Hello, world!"
	}
});

console.log(view.button()); // Outputs "Hello, world!"
```

Functions may return any data type (including undefined and null). ```this``` is set to the parent jQuery object.

As with jQuery event handlers, custom functions are not evaluated immediately; instead, evaluation is deferred until after the entire root selector object graph has been processed. This allows the fully-processed view object to be provided to the function as the first parameter.

It is important to note that the custom function's return value is not placed directly into the view object. In the above example, ```view.button``` is actually a wrapper function created internally by DOMView.js. The wrapper function ensures that the real function is only evaluated once and its value cached for each subsequent evaluation.

The wrapper function allows for circular references within custom functions:

```javascript
var view = DomView({
	selector: ".container",
	button: {
		selector: "input[type='button']",
		invoke: function (view) {
			view.form.disable();
		},
		disable: function (view) {
			this.prop("disabled", true);
		}
	},
	form: {
		selector: "form",
		disable: function (view) {
			this.addClass("disabled"); 
			view.button.disable();
		}
	}
});
```

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
		_click: function (view) {
			alert(view.fn.helloWorld());
		}
	}
});
```
The object for the ```fn``` property will be copied as-is into the view object.

### Other custom property values

Any property values that don't meet the above criteria are copied as-is into the view object.

```javascript
var view = DomView({
	selector: ".container",
	foo: 1,
	pi: 3.141592654
});

console.log(view.foo); // Outputs 1
console.log(view.pi); // Outputs 3.141592654
```

## Alternatives

### kinghfb's suggestion

Helpful Redditor kinghfb suggested that the nesting technique can be accomplished with raw jQuery:

```javascript
var container = $(".container"),
	form = container.find("form")
		.submit(function () { }),
		age = form.find(".age");
```

This does visually represent the hierarchical nature of the DOM in JavaScript. However, there are a few notable differences:

1. The variables must all be named differently because they are declared in the same scope, whereas with DOMView.js, property names are unique only to their containing object.
2. Inline event handlers must be declared before additional "nested" variables, meaning they won't have access to objects on the same indent level.
3. There is no hierarchical structure in memory, whereas with DOMView.js one can simply write the view object to the console and use the browser's developer tools to inspect the hierarchy.
4. There is no view object to be captured from within jQuery event handlers and custom functions.

For point #4, consider that the following code cannot be written solely using kinghfb's suggestion:

```javascript
DomView({
	selector: ".container",
	form: {
		selector: "form",
		_submit: function (view) {
			view.button.prop("disabled", true);
		}
	},
	button: {
		selector: ".button",
		_click: function (view) {
			view.form[0].submit();
		}
	}
});
```

Written with raw jQuery, here's what we'd have:

```javascript
var container = $(".container"),
	form = container.find("form"),
		button = form.find(".button")
			.click(function () {
				form[0].submit();
			});

container.form.submit(function () {
	container.form.button.prop("disabled", true);
});
```

Using raw jQuery leads to the hierarchy being broken in this case.

JavaScript often requires circular dependencies in order to achieve interesting effects and behavior. DOMView.js allows for these circular dependencies by providing the fully-processed view object as the first parameter to jQuery event handlers and custom functions.

There are many use cases where kinghfb's suggestion is more than enough, but if you need the additional debugging power and circular references, consider DOMView.js.

## Criticism

### DOMView.js is too tightly-coupled to the DOM

Helpful Redditor incurious and others raised concerns about how tightly-coupled DOMView.js is with the DOM. It's true; DOMView.js *is* tightly-coupled to the DOM, but no moreso than raw jQuery. Consider this markup:

```html
<div class="container">
    <table>
        <tbody>
            <tr class="row"><td><td></tr>
            <tr class="row"><td><td></tr>
        </tbody>
    </table>
<div>
```

If we are only interested in the table's rows, but not all the other parent elements, we write this code:

```javascript
DomView({
    selector: ".container",
    rows: ".row"
});
```

The underlying markup can change quite a bit without affecting our selector object. We could decide to abandon the ```table``` element and switch to CSS tables, for example. Because DOMView.js uses jQuery's ```find``` method, it will find all ```row```s within ```container``` no matter how deeply the rows are nested.

Of course, significant changes to markup will most likely impact our JavaScript no matter what frameworks we choose. DOMView.js' coupling to the DOM is the same as raw jQuery; DOMView.js simply makes it easier to represent jQuery hierarchically. It doesn't solve the DOM coupling problem.

## That's it!

If you have any questions, suggestions or bug reports, please file an issue. I'll try and respond promptly.

Thanks for using DOMView.js!
