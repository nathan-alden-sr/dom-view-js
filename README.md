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

The ```context``` parameter is useful for accessing sibling jQuery objects. If we need to access other objects in the hierarchy, we can use the captured ```DomView``` function return value:

```javascript
var view = DomView({
	selector: ".container",
	button: "input[type='button']",
	form: {
		selector: "form",
		age: {
			selector: ".age",
			_click: function () {
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
### Other custom property values

Any property values that don't meet the above criteria are copied into the resultant object.

```javascript
DomView({
	selector: ".container",
	foo: 1,
	pi: 3.141592654
});
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
3. There is no hierarchical structure in memory, whereas with DOMView.js one can simply write the resultant object to the console and use the browser's developer tools to inspect the full hierarchy.
4. There is no view object to be captured from within jQuery event handlers.

For point #4, consider that the following code cannot be written solely using kinghfb's suggestion:

```javascript
var container = DomView({
	selector: ".container",
	form: {
		selector: "form",
		_submit: function () {
			container.button.prop("disabled", true);
		}
	},
	button: {
		selector: ".button",
		_click: function (context) {
			context.form[0].submit();
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

form.submit(function () {
	button.prop("disabled", true);
});
```

Note that using raw jQuery leads to the hierarchy being broken in this case.

JavaScript often requires circular dependencies in order to achieve interesting effects and behavior. DOMView.js allows for these circular dependencies by providing two ways of accessing the resultant object: context parameters and capturing the ```DomView``` function's return value.

There are many use cases where kinghfb's suggestion is more than enough, but if you need the additional debugging power and flexibility with the order in which things are declared, consider DOMView.js.

## Criticism

### DOMView.js is too tightly-coupled to the DOM

Helpful Redditor incurious and others raised concerns about how tightly-coupled DOMView.js is with the DOM. It's true; DOMView.js *is* tightly-coupled to the DOM, but no moreso than raw jQuery. Consider this markup:

```html
<div class="container">
    <table>
        <tbody>
            <tr><td><td></tr>
            <tr><td><td></tr>
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

The underlying markup can change quite a bit without affecting our selector object. We could decide to abandon the ```table``` element and switch to CSS tables, for example. Because DOMView.js uses jQuery's find method, it will find all ```row```s within ```container``` no matter how deeply the rows are nested.

Of course, significant changes to markup will most likely impact our JavaScript no matter what frameworks we choose. DOMView.js' coupling to the DOM is the same as raw jQuery; DOMView.js simply makes it easier to represent jQuery hierarchically. It doesn't solve the DOM coupling problem.

## That's it!

If you have any questions, suggestions or bug reports, please file an issue. I'll try and respond promptly.

Thanks for using DOMView.js!
