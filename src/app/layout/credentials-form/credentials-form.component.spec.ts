import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {CredentialsFormComponent} from "./credentials-form.component";
import {noop} from "rxjs/util/noop";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import {ConnectionState, CredentialsEntry} from "../../services/storage/user-preferences-types";

describe("Layout", () => {
    describe("CredentialsForm", () => {
        let component: CredentialsFormComponent;
        let fixture: ComponentFixture<CredentialsFormComponent>;
        let userPrefsStub: Partial<UserPreferencesService>;

        let UserPreferencesMock = {
            getCredentials: () => Observable.of([]),
            patchCredentials: noop
        };


        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [FormsModule, ReactiveFormsModule],
                declarations: [CredentialsFormComponent],
                providers: [{provide: UserPreferencesService, useValue: UserPreferencesMock}]
            }).compileComponents();
        }));


        beforeEach(() => {
            fixture       = TestBed.createComponent(CredentialsFormComponent);
            component     = fixture.componentInstance;
            userPrefsStub = fixture.debugElement.injector.get(UserPreferencesService);

            fixture.detectChanges();
        });

        //
        it("should create", () => {
            expect(component).toBeTruthy("Component could not be instantiated");
        });

        it("should be initialized with a suggested value if no credentials were preset", () => {
            component.credentials = [];
            fixture.detectChanges();
            const pairs = component.form.get("pairs") as FormArray;
            expect(pairs.length).toEqual(1, "There was supposed to be one default entry in case no entries are stored");

            const {url, token} = (pairs.at(0) as FormGroup).getRawValue();

            expect(url).toEqual("https://igor.sbgenomics.com");
            expect(token).toEqual("");
        });

        it("should cover tokens by default", () => {
            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: new FormControl("url1"), token: new FormControl("token1")}),
                new FormGroup({url: new FormControl("url2"), token: new FormControl("token2")}),
            ]));
            fixture.detectChanges();

            const tokenFields  = fixture.debugElement.queryAll(By.css("[data-test='token-field']"));
            const nonPasswords = tokenFields.map(f => f.nativeElement).filter(f => f.type !== "password");
            expect(nonPasswords.length).toBe(0);
        });

        it("should uncover individual tokens on click of a designated button", () => {
            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: new FormControl("url1"), token: new FormControl("token1")}),
                new FormGroup({url: new FormControl("url2"), token: new FormControl("token2")}),
            ]));
            fixture.detectChanges();


            const [c1, c2] = fixture.debugElement.queryAll(By.css("[data-test='credentials-entry']"));

            const c1Toggle = c1.query(By.css("[data-test='token-cover-toggle']"));
            const c2Toggle = c2.query(By.css("[data-test='token-cover-toggle']"));

            const c1Token = c1.query(By.css("[data-test='token-field']"));
            const c2Token = c2.query(By.css("[data-test='token-field']"));

            expect(c1Token.nativeElement.type).toBe("password");
            expect(c2Token.nativeElement.type).toBe("password");

            c1Toggle.triggerEventHandler("click", {});
            fixture.detectChanges();

            expect(c1Token.nativeElement.type).toBe("text");
            expect(c2Token.nativeElement.type).toBe("password");

            c2Toggle.triggerEventHandler("click", {});
            fixture.detectChanges();

            expect(c1Token.nativeElement.type).toBe("text");
            expect(c2Token.nativeElement.type).toBe("text");

            c1Toggle.triggerEventHandler("click", {});
            fixture.detectChanges();

            expect(c1Token.nativeElement.type).toBe("password");
            expect(c2Token.nativeElement.type).toBe("text");

            c2Toggle.triggerEventHandler("click", {});
            fixture.detectChanges();

            expect(c1Token.nativeElement.type).toBe("password");
            expect(c2Token.nativeElement.type).toBe("password");
        });

        it("#addEntry should insert new rows", () => {
            const pairs          = component.form.get("pairs") as FormArray;
            const startingLength = pairs.length;
            component.addEntry();
            fixture.detectChanges();

            expect((component.form.get("pairs") as FormArray).length).toEqual(startingLength + 1);
        });

        it("should delete rows", () => {
            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: new FormControl("url1"), token: new FormControl("token1")}),
                new FormGroup({url: new FormControl("url2"), token: new FormControl("token2")}),
                new FormGroup({url: new FormControl("url3"), token: new FormControl("token2")}),
                new FormGroup({url: new FormControl("url4"), token: new FormControl("token2")}),
            ]));
            fixture.detectChanges();

            let entries: DebugElement[];
            let leftoverUrls: string[];

            component.removeIndex(1);
            fixture.detectChanges();

            entries      = fixture.debugElement.queryAll(By.css("[data-test='credentials-entry']"));
            leftoverUrls = component.form.getRawValue().pairs.map(p => p.url);
            expect(entries.length).toBe(3);
            expect(leftoverUrls.toString()).toEqual("url1,url3,url4");

            entries[1].query(By.css("[data-test='delete-handle']")).triggerEventHandler("click", {});
            fixture.detectChanges();

            entries      = fixture.debugElement.queryAll(By.css("[data-test='credentials-entry']"));
            leftoverUrls = component.form.getRawValue().pairs.map(p => p.url);
            expect(entries.length).toBe(2);
            expect(leftoverUrls.toString()).toEqual("url1,url4");
        });

        it("#applyValues should emit unique values when called", () => {

            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: new FormControl("https://igor.sbgenomics.com"), token: new FormControl("token1")}),
                new FormGroup({url: new FormControl("https://cgc.sbgenomics.com"), token: new FormControl("token2")}),
                new FormGroup({url: new FormControl("https://cgc.sbgenomics.com"), token: new FormControl("token2")}),
            ]));
            fixture.detectChanges();

            let submittedValues: CredentialsEntry[] = [];
            let submissionCount                     = 0;

            component.onSubmit.subscribe(values => {
                submittedValues = values;
                submissionCount++;
            });

            component.applyValues();

            expect(Array.isArray(submittedValues)).toBe(true);
            expect(submissionCount).toBe(1);
            expect(submittedValues.length).toBe(2);

            const [igor, cgc] = submittedValues;

            expect(igor.profile).toBe("default");
            expect(cgc.profile).toBe("cgc");

            expect(igor.status).toBe(ConnectionState.Connecting);
            expect(cgc.status).toBe(ConnectionState.Connecting);
        });

        it("#expandPlatformUrl should expand a platform name into a full url on a form control", () => {
            const igorControl = new FormControl("igor");
            component.expandPlatformUrl(igorControl);
            expect(igorControl.value).toEqual("https://igor.sbgenomics.com");

            const realUrl = new FormControl("http://dockstore.org");
            component.expandPlatformUrl(realUrl);
            expect(realUrl.value).toEqual("http://dockstore.org");
        });

        it("should call #expandPlatformUrl on url input blur", () => {
            const control = new FormControl("cgc");
            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: control, token: new FormControl("")})
            ]));
            fixture.detectChanges();

            const expansionSpy = spyOn(component, "expandPlatformUrl");

            const input = fixture.debugElement.query(By.css("[data-test='url-field']"));
            input.triggerEventHandler("blur", {});
            fixture.detectChanges();

            expect(expansionSpy.calls.count()).toBe(1);
            expect(expansionSpy.calls.first().args[0]).toBe(control);
        });

        it("should update credentials if a new input comes in", () => {

            component.credentials = [
                {url: "https://cgc.sbgenomics.com", token: ""},
                {url: "https://cwl-vayu.sbgenomics.com", token: ""}
            ];

            component.ngOnChanges({});
            fixture.detectChanges();

            const entries = fixture.debugElement.queryAll(By.css("[data-test='credentials-entry']"));
            expect(entries.length).toBe(2);
        });

        it("should not submit values if form is invalid", () => {
            component.form.setControl("pairs", new FormArray([
                new FormGroup({url: new FormControl("https://igor.randomsite.com"), token: new FormControl("")}),
            ]));

            fixture.detectChanges();

            const form     = fixture.debugElement.query(By.css("[data-test='form']"));
            const applySpy = spyOn(component, "applyValues");
            form.triggerEventHandler("submit", new Event("submit"));
            expect(applySpy.calls.count()).toBe(0);
        });
    });

});
