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
2. Do not use “I” as a prefix for interface names.

	> **Why?** *Interfaces* in typescript have a very different semantics and pragmatics than those in other languages (C# for example, that's where the “I” prefix convention comes from), just like  the `const` keyword. Because of this, carrying over naming conventions from other languages (the “I” prefix or the “Interface” suffix) bring misinformation and false assumptions about the code that implements them.
3. Use PascalCase for enum values.
4. Use camelCase for function names.
5. Use camelCase for property names and local variables.
6. Do not use “_” as a prefix for private properties.

	> **Why?** Typescript gives us access modifiers and the available tooling does the job of revealing the methods and attributes that should be used (or not).
7. Use whole words in names when possible.

	> **Why?** Name shortening (`cstrcp`, `strCnt`...) is a leftover from an era when programming was done in the basic shell text editor and typing was actually taking the significant amount of time. That is not the case anymore with modern tooling, and clarity is rarely a good sacrifice for saving a few characters. Using commonly recognized short names is fine and there is no need to make a name 30 characters long just for completeness. Use common sense.
8. Do not put variable's type into its name (`userObservable: Observable`)

### Angular-Specific
1. Classes representing NG structures should have corresponding suffixes.
	Eg. *Component* for components (eg. *MainComponent*)
	Applies for *Components*, *Directives*, *Pipes*, *Services*.
		
	> **Why?** It's easier to find files and scan their names visually. There will be multiple types of classes with the same basic name, and a suffix to differentiate them (eg. WorkspaceComponent, WorkspaceService)	

### Files and Directories
1. Make all file and directory names kebab-cased.
2. Directories that contain files of the same semantics should be named in plurals (eg. "models", "assets").

### Types
1. Do not export types/functions unless you need to share it across multiple components.
2. Do not use the `<any>` type if there is a way to avoid it. Use interfaces and generics.

### `null` and `undefined`
1. Use `undefined`, do not use `null` *(rule of thumb, not hard constraint)*

 > **Why?** Semantics of a `null` from other programming languages translates to `undefined` in Javascript, since `null` is something that *is defined and available* and semantically closer to a boolean `false` than to `undefined`.   
> Therefore, to imply *non-existence* and *emptyness* (of which the knowledge exists) use `undefined`.  
> Use `null` for the *unknown status of existence*.

### Line Wrapping
1. 80 characters soft limit, 120 characters hard limit.

### Variables
1. Use `const`. If necessary to change the variable's underlying reference, use `let`. Do not use `var`.

 > **Why?**   
> - It allows JS runtime optimizations.  
> - It's is a cognitive offload when reading code, since you don't have to keep an eye out for changes and potential issues that could arise.  
> - It encourages immutable data structures.

### Functions
1. Use arrow functions over anonymous function expressions.   
 
 > **Why?**  Shorter and cleaner syntax, context (`this`) inheritance.  
 
2. Avoid passing function references as arguments.

 > **Why?** If passed by reference, the function will execute in the global context, and not the one the function needs.  

3. Only surround arrow function parameters when it has multiple parameters or they need the type hint.  
	For example, `(x) => x + x` is wrong but the following are correct:  
	- `x => x + x`  
	- `(x, y) => x + y`  
	- `(x: FileModel) => x.content`  
	- `<T>(x: T, y: T) => x === y`  

### Imports
1. Put file imports at the top of the file. Put ES6-style imports first, `require()` constructs afterwards.


## Class Design
1. Use access modifiers.  

 > **Why?** Although they technicaly do not matter when the code gets compiled, they provide great help during development and carry a great deal of information/documentation about the code itself.  

2. Access modifiers may be skipped for class constructors and Angular's interfaces.
3. Use `private` by default. Use `protected` and `public` only when outside access makes a best design.

 > **Why?** Take the access modifer semantics as saying:     
 
 > - Private: “This is implementation-specific internal code. Don't use this, it might change behavior or get removed.”  
 > - Protected: “This is an internal thing to this structure, but you can use it if you know what you are doing.”  
 > - Public: “*This is what I, the author of this code, expose to you for usage, and am obliged to maintain it as such until the end of time*”.

4. Put each decorator on a separate line.
	> **Why?** Consistency and readability. The public Angular2 style guide suggest to inline it, but we have an expanded use case with access modifiers and multiple decorators, so a line like `@assignable("next") @HostListener("click", ["$event.target"]) public clicks: Observable<MouseEvent>;`
	doesn't really make a readability flagship.  
	> **Exception**: Decorators for constructor arguments *can* be in the same line as the decoratee. In that case, have each constructor argument in a separate line.