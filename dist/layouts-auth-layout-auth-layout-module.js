(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["layouts-auth-layout-auth-layout-module"],{

/***/ "./node_modules/raw-loader/index.js!./src/app/auth/forgot/forgot.component.html":
/*!*****************************************************************************!*\
  !*** ./node_modules/raw-loader!./src/app/auth/forgot/forgot.component.html ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"main-content\">\n  <div class=\"container-fluid\">\n  <form class=\"example-form\" [formGroup]=\"forgotForm\" (ngSubmit)=\"forgot(forgotForm.value)\">\n    <mat-card class=\"example-card\">\n     <mat-card-header>\n       <mat-card-title>Forgot Password</mat-card-title>\n     </mat-card-header>\n     <mat-card-content>\n         <div class=\"form-group\">\n           <mat-form-field class=\"example-full-width\">\n           <input matInput placeholder=\"Email ID\" formControlName=\"email\" name=\"email\">\n           <mat-error class=\"error--handing\"\n              *ngIf=\"forgotForm.controls['email'].hasError('required') && (forgotForm.controls['email'].dirty || forgotForm.controls['email'].touched)\">\n              {{ \"Email Id is required.\" }}\n            </mat-error>\n            <mat-error class=\"error--handing\"\n              *ngIf=\"forgotForm.controls['email'].hasError('pattern') && (forgotForm.controls['email'].dirty || forgotForm.controls['email'].touched)\">\n              {{ \"Please Enter valid email Id.\" }}\n            </mat-error>\n           </mat-form-field>\n         </div>\n       <mat-spinner [style.display]=\"showSpinner ? 'block' : 'none'\"></mat-spinner>\n     </mat-card-content>\n     <mat-card-actions>\n       <button mat-raised-button [disabled]=\"!forgotForm.valid\" color=\"primary\">Submit</button>\n     </mat-card-actions>\n     <a class=\"auth-navigate\" [routerLink]=\"['/', 'login']\">Back to login</a>\n   </mat-card>\n  </form>\n</div>\n"

/***/ }),

/***/ "./node_modules/raw-loader/index.js!./src/app/auth/login/login.component.html":
/*!***************************************************************************!*\
  !*** ./node_modules/raw-loader!./src/app/auth/login/login.component.html ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"main-content\">\n  <div class=\"container-fluid\">\n    <form class=\"example-form\" [formGroup]=\"signInForm\" (ngSubmit)=\"login(signInForm.value)\" #loginform=\"ngForm\" >\n    <mat-card class=\"example-card\">\n     <mat-card-header>\n       <mat-card-title>Login</mat-card-title>\n     </mat-card-header>\n     <mat-card-content>\n       <div class=\"form-group\">\n           <mat-form-field class=\"example-full-width mat-headline\">\n           <input matInput placeholder=\"Email ID\" formControlName=\"email\" name=\"email\">\n            <mat-error class=\"error--handing\"\n              *ngIf=\"signInForm.controls['email'].hasError('required') && (signInForm.controls['email'].dirty || signInForm.controls['email'].touched)\">\n              {{ \"Email Id is required.\" }}\n            </mat-error>\n            <mat-error class=\"error--handing\"\n              *ngIf=\"signInForm.controls['email'].hasError('pattern') && (signInForm.controls['email'].dirty || signInForm.controls['email'].touched)\">\n              {{ \"Please Enter valid email Id.\" }}\n            </mat-error>\n           </mat-form-field>\n         </div>\n         <div class=\"form-group\">\n           <mat-form-field class=\"example-full-width mat-headline\">\n             <input matInput placeholder=\"Password\" type=\"password\" formControlName=\"password\" >\n              <mat-error class=\"error--handing\"\n                *ngIf=\"signInForm.controls['password'].hasError('required') && (signInForm.controls['password'].dirty || signInForm.controls['password'].touched)\">\n                {{ \"Password is required\" }}\n              </mat-error>\n           </mat-form-field>\n         </div>\n       <mat-spinner [style.display]=\"showSpinner ? 'block' : 'none'\"></mat-spinner>\n     </mat-card-content>\n     <mat-card-actions>\n       <button mat-raised-button color=\"primary\" [disabled]=\"!signInForm.valid\" >Login</button>\n     </mat-card-actions>\n     <a class=\"auth-navigate\" [routerLink]=\"['/', 'forgot']\"  >Forgot Password?</a>\n   </mat-card>\n  </form>\n</div>\n"

/***/ }),

/***/ "./node_modules/raw-loader/index.js!./src/app/auth/reset/reset.component.html":
/*!***************************************************************************!*\
  !*** ./node_modules/raw-loader!./src/app/auth/reset/reset.component.html ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"main-content\">\n  <div class=\"container-fluid\">\n      <form class=\"example-form\" [formGroup]=\"resetform\" (ngSubmit)=\"reset(resetform.value)\" >\n    <mat-card class=\"example-card\">\n     <mat-card-header>\n       <mat-card-title>Reset Password</mat-card-title>\n     </mat-card-header>\n     <mat-card-content>\n\n        <div class=\"form-group\">\n            <mat-form-field class=\"example-full-width\">\n              <input matInput placeholder=\"Email\" readonly disabled formControlName=\"email\" type=\"text\" value=\"{{ emailId }}\">\n            </mat-form-field>\n          </div>\n\n         <div class=\"form-group\">\n           <mat-form-field class=\"example-full-width\">\n             <input matInput placeholder=\"New Password\" formControlName=\"password\" type=\"password\" name=\"password\">\n             <mat-error class=\"error--handing\"\n             *ngIf=\"resetform.controls['password'].hasError('required') && (resetform.controls['password'].dirty || resetform.controls['password'].touched)\">\n             {{ \"Password Id is required.\" }}\n           </mat-error>\n           <mat-error class=\"required\" *ngIf=\"resetform.controls['password'].hasError('pattern') && (resetform.controls['password'].dirty || resetform.controls['password'].touched )\">\n            {{ \"New Password must be minimum 6 charecter long.\" }}\n            </mat-error>\n           </mat-form-field>\n         </div>\n         <div class=\"form-group\">\n           <mat-form-field class=\"example-full-width\">\n             <input matInput placeholder=\"Confirm Password\" formControlName=\"confirmPassword\" type=\"password\" name=\"cofirmpassword\" >\n             <mat-error class=\"error--handing\"\n             *ngIf=\"resetform.controls['confirmPassword'].hasError('required') && (resetform.controls['confirmPassword'].dirty || resetform.controls['confirmPassword'].touched)\">\n             {{ \"Password Id is required.\" }}\n           </mat-error>\n           <mat-error class=\"error--handing\" *ngIf=\"resetform.controls['confirmPassword'].hasError('passwordCompare') && resetform.controls['confirmPassword'].touched\">\n              {{ \"Password does not match.\" }}\n            </mat-error>\n           </mat-form-field>\n         </div>\n       <mat-spinner [style.display]=\"showSpinner ? 'block' : 'none'\"></mat-spinner>\n     </mat-card-content>\n     <mat-card-actions>\n       <button mat-raised-button [disabled]=\"!resetform.valid\" color=\"primary\">Reset Password</button>\n     </mat-card-actions>\n     <a class=\"auth-navigate\" [routerLink]=\"['/', 'login']\">Back to login</a>\n   </mat-card>\n  </form>\n</div>\n"

/***/ }),

/***/ "./src/app/auth/forgot/forgot.component.css":
/*!**************************************************!*\
  !*** ./src/app/auth/forgot/forgot.component.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2F1dGgvZm9yZ290L2ZvcmdvdC5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/auth/forgot/forgot.component.ts":
/*!*************************************************!*\
  !*** ./src/app/auth/forgot/forgot.component.ts ***!
  \*************************************************/
/*! exports provided: ForgotComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ForgotComponent", function() { return ForgotComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var app_api_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/api.service */ "./src/app/api.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ForgotComponent = /** @class */ (function () {
    function ForgotComponent(router, fb, api, snack) {
        this.router = router;
        this.fb = fb;
        this.api = api;
        this.snack = snack;
    }
    ForgotComponent.prototype.ngOnInit = function () {
        if (this.api.isLoggedIn()) {
            this.router.navigate(['/', 'admin', 'dashboard']);
        }
        // inisiate from
        this.forgotForm = this.fb.group({
            email: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)])]
        });
    };
    ForgotComponent.prototype.forgot = function (userData) {
        var _this = this;
        console.log('userData', userData);
        this.api.apiRequest('post', "auth/adminForgotPassword", userData).subscribe(function (result) {
            if (result.status == "success") {
                _this.router.navigate(['/', 'login']);
                _this.snack.open(result.data, 'OK', { duration: 5000 });
            }
            else {
                _this.snack.open(result.data, 'OK', { duration: 5000 });
            }
        }, function (err) {
            _this.snack.open("some things want to wrong. Try agin!", 'OK', { duration: 5000 });
        });
    };
    ForgotComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-forgot',
            template: __webpack_require__(/*! raw-loader!./forgot.component.html */ "./node_modules/raw-loader/index.js!./src/app/auth/forgot/forgot.component.html"),
            styles: [__webpack_require__(/*! ./forgot.component.css */ "./src/app/auth/forgot/forgot.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"], app_api_service__WEBPACK_IMPORTED_MODULE_3__["APIService"], _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"]])
    ], ForgotComponent);
    return ForgotComponent;
}());



/***/ }),

/***/ "./src/app/auth/login/login.component.css":
/*!************************************************!*\
  !*** ./src/app/auth/login/login.component.css ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".mat-headline {\n    font-size: 20px !important; \n  }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvYXV0aC9sb2dpbi9sb2dpbi5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksMEJBQTBCO0VBQzVCIiwiZmlsZSI6InNyYy9hcHAvYXV0aC9sb2dpbi9sb2dpbi5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLm1hdC1oZWFkbGluZSB7XG4gICAgZm9udC1zaXplOiAyMHB4ICFpbXBvcnRhbnQ7IFxuICB9Il19 */"

/***/ }),

/***/ "./src/app/auth/login/login.component.ts":
/*!***********************************************!*\
  !*** ./src/app/auth/login/login.component.ts ***!
  \***********************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var app_api_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/api.service */ "./src/app/api.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var app_sid_loder_component_sid_loder_component_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! app/sid-loder-component/sid-loder-component.component */ "./src/app/sid-loder-component/sid-loder-component.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var LoginComponent = /** @class */ (function () {
    function LoginComponent(router, fb, api, snack, dialog) {
        this.router = router;
        this.fb = fb;
        this.api = api;
        this.snack = snack;
        this.dialog = dialog;
        this.showSpinner = false;
        this.dialogRef = "";
    }
    LoginComponent.prototype.ngOnInit = function () {
        if (this.api.isLoggedIn()) {
            this.router.navigate(['/', 'admin', 'dashboard']);
        }
        this.signInForm = this.fb.group({
            email: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)])],
            password: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required])]
        });
        localStorage.clear();
        sessionStorage.clear();
    };
    LoginComponent.prototype.login = function (userData) {
        var _this = this;
        this.loader();
        this.api.login(userData).subscribe(function (result) {
            if (result.status == "success") {
                _this.loaderHide();
                _this.router.navigate(['/', 'admin', 'dashboard']);
            }
            else {
                _this.loaderHide();
                _this.loginform.resetForm();
                _this.snack.open("Please check your login credentials and try again. ", 'OK', { duration: 5000 });
            }
        }, function (err) {
            _this.loaderHide();
            _this.loginform.resetForm();
            console.error(err);
        });
    };
    LoginComponent.prototype.loader = function () {
        this.dialogRef = this.dialog.open(app_sid_loder_component_sid_loder_component_component__WEBPACK_IMPORTED_MODULE_5__["SidLoderComponentComponent"], {
            panelClass: 'lock--panel',
            backdropClass: 'lock--backdrop',
            disableClose: true
        });
    };
    LoginComponent.prototype.loaderHide = function () {
        this.dialogRef.close();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"])('loginform', { static: false }),
        __metadata("design:type", Object)
    ], LoginComponent.prototype, "loginform", void 0);
    LoginComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-login',
            template: __webpack_require__(/*! raw-loader!./login.component.html */ "./node_modules/raw-loader/index.js!./src/app/auth/login/login.component.html"),
            styles: [__webpack_require__(/*! ./login.component.css */ "./src/app/auth/login/login.component.css")]
        }),
        __metadata("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"], app_api_service__WEBPACK_IMPORTED_MODULE_3__["APIService"], _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"], _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatDialog"]])
    ], LoginComponent);
    return LoginComponent;
}());



/***/ }),

/***/ "./src/app/auth/reset/reset.component.css":
/*!************************************************!*\
  !*** ./src/app/auth/reset/reset.component.css ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2F1dGgvcmVzZXQvcmVzZXQuY29tcG9uZW50LmNzcyJ9 */"

/***/ }),

/***/ "./src/app/auth/reset/reset.component.ts":
/*!***********************************************!*\
  !*** ./src/app/auth/reset/reset.component.ts ***!
  \***********************************************/
/*! exports provided: ResetComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ResetComponent", function() { return ResetComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var app_api_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! app/api.service */ "./src/app/api.service.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ResetComponent = /** @class */ (function () {
    function ResetComponent(api, fb, snack, router, activatedRoute) {
        this.api = api;
        this.fb = fb;
        this.snack = snack;
        this.router = router;
        this.activatedRoute = activatedRoute;
        this.userId = "";
        this.emailId = "";
        this.passwordRegex = /^.{6,}$/;
    }
    ResetComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.api.isLoggedIn()) {
            this.router.navigate(['/', 'admin', 'dashboard']);
        }
        this.resetform = this.fb.group({
            email: [''],
            password: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].pattern(this.passwordRegex)])],
            confirmPassword: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([_angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required])],
        }, {
            validator: this.comparePassword // your validation method
        });
        this.activatedRoute.params.subscribe(function (params) {
            _this.userId = params.id;
        });
        this.getEmail();
    };
    // compare password validate
    ResetComponent.prototype.comparePassword = function (control) {
        var password = control.get('password').value;
        var confirmPassword = control.get('confirmPassword').value;
        if (password !== confirmPassword) {
            control.get('confirmPassword').setErrors({ passwordCompare: true });
        }
        else {
            return null;
        }
    };
    ResetComponent.prototype.getEmail = function () {
        var _this = this;
        this.api.apiRequest('post', 'auth/getUserEmail', { userId: this.userId }).subscribe(function (result) {
            if (result.status == "success") {
                _this.emailId = result.data.email;
            }
            else {
                //this.snack.open(result.data.message, 'OK', { duration: 5000 });
            }
        }, function (err) {
            console.error(err);
        });
    };
    ResetComponent.prototype.reset = function (userData) {
        var _this = this;
        userData.userId = this.userId;
        this.api.apiRequest('post', 'auth/adminResetPassword', userData).subscribe(function (result) {
            if (result.status == "success") {
                _this.snack.open("Your password sucessfully reset. Now login with this password!", 'OK', { duration: 5000 });
                if (result.data.userType == "adminUser") {
                    _this.router.navigate(['', 'login']);
                }
            }
            else {
                _this.snack.open(result.data.message, 'OK', { duration: 5000 });
            }
        }, function (err) {
            console.error(err);
        });
    };
    ResetComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-reset',
            template: __webpack_require__(/*! raw-loader!./reset.component.html */ "./node_modules/raw-loader/index.js!./src/app/auth/reset/reset.component.html"),
            styles: [__webpack_require__(/*! ./reset.component.css */ "./src/app/auth/reset/reset.component.css")]
        }),
        __metadata("design:paramtypes", [app_api_service__WEBPACK_IMPORTED_MODULE_3__["APIService"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"], _angular_material__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["ActivatedRoute"]])
    ], ResetComponent);
    return ResetComponent;
}());



/***/ }),

/***/ "./src/app/layouts/auth-layout/auth-layout.module.ts":
/*!***********************************************************!*\
  !*** ./src/app/layouts/auth-layout/auth-layout.module.ts ***!
  \***********************************************************/
/*! exports provided: AuthLayoutModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthLayoutModule", function() { return AuthLayoutModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _auth_layout_routing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth-layout.routing */ "./src/app/layouts/auth-layout/auth-layout.routing.ts");
/* harmony import */ var _auth_login_login_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../auth/login/login.component */ "./src/app/auth/login/login.component.ts");
/* harmony import */ var _auth_forgot_forgot_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../auth/forgot/forgot.component */ "./src/app/auth/forgot/forgot.component.ts");
/* harmony import */ var _auth_reset_reset_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../auth/reset/reset.component */ "./src/app/auth/reset/reset.component.ts");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};









var AuthLayoutModule = /** @class */ (function () {
    function AuthLayoutModule() {
    }
    AuthLayoutModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(_auth_layout_routing__WEBPACK_IMPORTED_MODULE_4__["AuthLayoutRoutes"]),
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatRippleModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatFormFieldModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatInputModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatSelectModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatTooltipModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatCardModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatDialogModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatProgressSpinnerModule"]
            ],
            declarations: [
                _auth_login_login_component__WEBPACK_IMPORTED_MODULE_5__["LoginComponent"],
                _auth_forgot_forgot_component__WEBPACK_IMPORTED_MODULE_6__["ForgotComponent"],
                _auth_reset_reset_component__WEBPACK_IMPORTED_MODULE_7__["ResetComponent"]
            ],
        })
    ], AuthLayoutModule);
    return AuthLayoutModule;
}());



/***/ }),

/***/ "./src/app/layouts/auth-layout/auth-layout.routing.ts":
/*!************************************************************!*\
  !*** ./src/app/layouts/auth-layout/auth-layout.routing.ts ***!
  \************************************************************/
/*! exports provided: AuthLayoutRoutes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthLayoutRoutes", function() { return AuthLayoutRoutes; });
/* harmony import */ var _auth_login_login_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../auth/login/login.component */ "./src/app/auth/login/login.component.ts");
/* harmony import */ var _auth_forgot_forgot_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../auth/forgot/forgot.component */ "./src/app/auth/forgot/forgot.component.ts");
/* harmony import */ var _auth_reset_reset_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../auth/reset/reset.component */ "./src/app/auth/reset/reset.component.ts");



var AuthLayoutRoutes = [
    { path: 'login', component: _auth_login_login_component__WEBPACK_IMPORTED_MODULE_0__["LoginComponent"] },
    { path: 'forgot', component: _auth_forgot_forgot_component__WEBPACK_IMPORTED_MODULE_1__["ForgotComponent"] },
    { path: 'reset/:id', component: _auth_reset_reset_component__WEBPACK_IMPORTED_MODULE_2__["ResetComponent"] },
];


/***/ })

}]);
//# sourceMappingURL=layouts-auth-layout-auth-layout-module.js.map