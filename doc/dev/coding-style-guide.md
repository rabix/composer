# Coding Style Guide

## Base
Thoroughly read https://angular.io/docs/ts/latest/guide/style-guide.html  
Apply those principles, unless there was a discussion or style entry that overrides it.  

For example, the guide suggests inlining the `@Input` and `@Output` decorators, but we might have [1] multiple decorators on an attribute, and [2] a standard for access modifier usage since we sometimes even need to modify a `ComponentRef` directly. Those things combined counteract the original intention of the suggestion in the guide.

**As the guide updates, no new pull requests should contain code that violates it.  
Old code should be updated at our earliest convenience.**
	
## Names

### General
1. Use PascalCase for type names.
2. Do not use "I" as a prefix for interface names.
3. Use PascalCase for enum values.
4. Use camelCase for function names.
5. Use camelCase for property names and local variables.
6. Do not use "_" as a prefix for private properties.
7. Use whole words in names when possible.
8. Do not put variable's type into its name (`userObservable: Observable`)

### Angular-Specific
1. Classes representing NG structures should have corresponding suffixes.
	Eg. *Component* for components (eg. *MainComponent*)
	Applies for *Components*, *Directives*, *Pipes*, *Services*.

### Files and Directories
1. Make all file and directory names kebab-cased.
2. Directories that contain files of the same semantics should be named in plurals (eg. "models", "assets").

### Types
1. Do not export types/functions unless you need to share it across multiple components.
2. Do not use the `<any>` type if there is a way to avoid it. Use interfaces and generics.

### `null` and `undefined`
1. Use `undefined` to imply *non-existence* and *emptyness* (which comes from knowledge), and `null` for *possible existence regarding which we do not know anything*. **As a rule of thumb**, use `undefined`, do not use `null`.

### Line Wrapping
1. 80 characters soft limit, 120 characters hard limit.

### Variables
1. Use `const`. If necessary to change the variable's underlying reference, use `let`. Do not use `var`.

### Functions
1. Use arrow functions over anonymous function expressions.
2. Avoid passing function references as arguments.
3. Only surround arrow function parameters when  
	For example, `(x) => x + x` is wrong but the following are correct:  
	- `x => x + x`  
	- `(x,y) => x + y`  
	- `<T>(x: T, y: T) => x === y`  

### Imports
1. Put file imports at the top of the file. Put ES6-style imports first, `require()` constructs afterwards.


## Class Design
1. Use access modifiers.
2. Access modifiers may be skipped for class constructors and Angular's interfaces.
3. Use `private` by default. Use `protected` and `public` only when outside access makes a best design.
4. Put each decorator on a separate line.
