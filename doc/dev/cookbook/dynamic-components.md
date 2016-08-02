# Dynamic Components
By dynamic component, we refer to a component that is not rendered from a parsed template string, but the one that is explicitly created by our code during runtime. 
For example, when we are creating a modal, we will use the `ModalService.show(<OurComponent>);` statement. In this case, `OurComponent` is to be considered a "dynamic" one.

## Creation
...
### Assigning Values

Components can get their data from either an external service, or from its own inputs.

#### Case 1: External Services
```typescript
class MyComponent {
	constructor(private externalService: MyExternalService){
		// Component relies on an injectable service
		this.externalService.fetchData().subscribe(/* handleData* /)
	}
}
```

External dependencies are provided by the Angular's `Injector` service. In order to be able to access that service, we must pass it as an argument during or `MyComponent` creation. 

```typescript
@Component({
	template: "<div #anchor></div>"
})
class BaseComponent {

	@ViewChild("anchor")
	private nestedView: ViewContainerRef;
	
	constructor(private injector: Injector, private resolver: ComponentResolver){
		this.createDynamicComponent(OtherComponent);
	}
	
	public createDynamicComponent(componentType){
		this.resolver.resolve(componentType).then(factory => {
			// We need to pass the injector from the creator component in order to get the
			// full dependency tree.
			// Also, we can give a component a completely different injector tree if that's needed.
			this.view.createComponent(factory, null, this.injector);
		});		
	}
}

```
#### Case 2: Component Inputs and @assignable decorator
Not all components are able to get everything they need from services, nor they should. From the performance standpoint, we should have as many "dumb" components (components which have a state determined solely from their inputs) as we can.

```typescript
@Component({
	selector: "status-view"
	template: `
		Viewing {{ title }}: 
		<div *ngFor="let comment of comments">{{ comment }}</div>
	`
	changeDetection: ChangeDetectionStrategy.OnPush
})
class StatusViewComponent {
	@Input()
	private title: string;
	
	@Input()
	private comments: string[];
}
```

We would usually use this component in a template:

```html
<div>Status:</div>
<status-view [title]="..." [comments]="..."></status-view>
```

We can't pull data for that type of components from an injected service.
In order to do this, we should use the `@assignable` decorator and the `Chap.Component.assign()` helper function.

```typescript
// Part of status-view.component.ts
class StatusViewComponent {
	@assignable()
	public title: string;
	
	@assignable()
	public comments: string[];
}

// Somewhere in component-maker.component.ts
const componentRef = view.createComponent(factory);

// Assign the given component state to the component instance.
Chap.Component.assign({
	title: "Great Expectations",
	comments: ["Good Movie", "Bad Movie"]
}, componentRef.instance);
```

The `@assignable` decorator can also be utilized to set the property value by calling a method on it.
This is useful when, for example, the property is a `Subject` or an `EventEmitter`.

```typescript
class StatusViewComponent {
	@assignable("next")
	public headline: Subject<string>;
	
	constructor(){
		this.headline = new Subject<string>();
	} 
}
```

In this case, calling 

```typescript
// assuming `target` is an instance of ComponentRef
Chap.Component.assign({headline: "In theaters now!"}, target.instance)
``` 
will **not** replace the `headline` attribute with a "In theaters now!" string, but will instead call a "next" method on it - `target.headline.next("In theaters now!");`

> OMGLOL, why the complication? Why not just call `target.instance.myProp = "My Value"` directly?
> 

Yes, you technically can assign properties directly, this is still Javascript. For that matter, you can do anything with an object, add properties, remove them, override methods, change their bound context and so on, I don't want to give ideas.
But, if you add a property that's not enumerated as a class attribute, you end up with hidden stuff that would produce bugs which are ridiculously hard to find.  
The `@assignable()` decorator is a way to explicitly say "This attribute is allowed to be set/overridden by whatever code wants to instantiate the component during runtime".
It enables us to systematically reject direct assignment to component instances during code reviews, and not have to inspect the usage on a case by case basis. 
