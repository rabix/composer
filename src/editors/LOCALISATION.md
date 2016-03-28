# Rabix Editors Localisation

## l10n Files

Localisation relies on the l10n files found in `frontend/l10n`. There are two files for the Rabix editors, `frontend/l10n/cgc/editors/editors.l10n` and `frontend/l10n/sbg/editors/editors.l10n`. Obviously, one is for CGC and the other for SBG. Files should be added with new environments. Right now, the two files are literally 99.56% identical, and differ only in the content of the variables.

These files are loaded dynamically by Camellia based on the environment. For the editors, `app-edit.html` does this through the localisation block:

```html
{% block localisation %}
    <script type="application/l20n" src="{{ STATIC_URL }}l10n/{{ localisation }}/editors/editors.l10n?bust={{ bust }}"></script>
{% endblock localisation %}
```

These files follow a simple syntax, you can learn more about how to write them [from the official documentation](http://l20n.org/learn/).

## angular wrapper

The angular filter `loc` serves as a wrapper around the `document.l10n.getSync` method. 

Let's say our `l10n` file looks like this:

```
<idOfLocalisedItem[$number] {
	one: "一"
	two: "二"
	three: "三"
}>
```



It can be used inside html/templates:

```html
<p>{{ :: 'idOfLocalisedItem' | loc:{number: 'two' }}</p>

```
>Don't forget the double colon `::` for single binding. These values are static and should not be watched!

or in angular code using the `$filter` service:

```js
angular.module('app').controller('Ctrl', ['$filter', function($filter) {

	var localised = $filter('loc')('idOfLocalisedItem', {number: 'two'});
	
}]);	
```

