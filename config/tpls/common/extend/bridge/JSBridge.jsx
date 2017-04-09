(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define("library", [], factory);
	else if (typeof exports === 'object')
		exports["library"] = factory();
	else
		root["library"] = factory();
})(this, function () {
	return /******/ (function (modules) { // webpackBootstrap
		/******/ 	// The module cache
		/******/
		var installedModules = {};

		/******/ 	// The require function
		/******/
		function __webpack_require__(moduleId) {

			/******/ 		// Check if module is in cache
			/******/
			if (installedModules[moduleId])
			/******/      return installedModules[moduleId].exports;

			/******/ 		// Create a new module (and put it into the cache)
			/******/
			var module = installedModules[moduleId] = {
				/******/      exports: {},
				/******/      id: moduleId,
				/******/      loaded: false
				/******/
			};

			/******/ 		// Execute the module function
			/******/
			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

			/******/ 		// Flag the module as loaded
			/******/
			module.loaded = true;

			/******/ 		// Return the exports of the module
			/******/
			return module.exports;
			/******/
		}


		/******/ 	// expose the modules object (__webpack_modules__)
		/******/
		__webpack_require__.m = modules;

		/******/ 	// expose the module cache
		/******/
		__webpack_require__.c = installedModules;

		/******/ 	// __webpack_public_path__
		/******/
		__webpack_require__.p = "";

		/******/ 	// Load entry module and return exports
		/******/
		return __webpack_require__(0);
		/******/
	})
	/************************************************************************/
	/******/([
		/* 0 */
		/***/ function (module, exports) {

			'use strict';

			var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
				return typeof obj;
			} : function (obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
			};

			;
			(function () {
				if (window.jsonRPC) {
					return;
				}

				var bridgeReadyEventTriggered = false;

				var jsonRPCData = 'rpcdata';
				var jsonRPCCall = 'rpccall';
				var CustomProtocolScheme = 'jsonrpc';
				var jsonRPCTag = 'jsonrpc';
				var jsonRPCResultTag = 'result';
				var jsonRPCErrorTag = 'error';
				var jsonRPCIdTag = 'id';
				var jsonRPCVer = '2.0';

				var _current_id = 1;

				var _callbacks = {};

				var jsonRPC = {};

				var nativeReady = false;

				function isAndroid() {
					var __userAgent = navigator.userAgent;
					// AOS
					var __isAOS = !!__userAgent.match(/Android/i);
					return __isAOS;
				}

				function CommandQueue() {
					this.backQueue = [];
					this.queue = [];
				}

				CommandQueue.prototype.dequeue = function () {
					if (this.queue.length <= 0 && this.backQueue.length > 0) {
						this.queue = this.backQueue.reverse();
						this.backQueue = [];
					}
					return this.queue.pop();
				};

				CommandQueue.prototype.enqueue = function (item) {
					if (this.length === 0) {
						this.queue.push(item);
					} else {
						this.backQueue.push(item);
					}
				};

				Object.defineProperty(CommandQueue.prototype, "length", {
					get: function get() {
						return this.queue.length + this.backQueue.length;
					}
				});

				// js->native core
				var commandQueue = new CommandQueue();

				function nativeExec() {
					if (commandQueue.length > 0) {
						nativeReady = false;
						window.location = CustomProtocolScheme + '://' + jsonRPCCall + '/' + _current_id;
						return true;
					} else {
						return false;
					}
				}

				function dispatchCallToNative(request, success_cb, error_cb) {
					var requestAndroid = {
						_invoke_name: request.method
					};
					if (jsonRPCIdTag in request && typeof success_cb !== 'undefined') {
						_callbacks[request.id] = {
							success_cb: success_cb,
							error_cb: error_cb
						};
						requestAndroid._callback_id = request.id;
					}

					if (isAndroid() && window.JavaExecutor) {
						window.JavaExecutor.onTransact(JSON.stringify(requestAndroid), JSON.stringify(request.params));
					} else {
						commandQueue.enqueue(request);
						if (nativeReady) {
							nativeExec();
						}
					}
				}

				function doClose() {
					delete window.jsonRPC;
					delete window.jsbridge;
					delete window.YixinJSBridge;
				}

				// jsonRPC
				jsonRPC.call = function (method, params, success_cb, error_cb) {

					var request = {
						jsonrpc: jsonRPCVer,
						method: method,
						params: typeof params === 'string' ? JSON.parse(params) : params,
						id: _current_id++
					};

					dispatchCallToNative(request, success_cb, error_cb);
				};

				//native -> js
				jsonRPC.dispatchCallToJS = function (request) {
					var requestObj = request;
					var response = {};
					response.id = requestObj.id;
					response.jsonrpc = requestObj.jsonrpc;
					var methodName = requestObj.method;
					var params = requestObj.params;
					var func = window[methodName];
					if (func) {
						var response_params;
						if (params) {
							response_params = func(params);
						} else {
							response_params = func();
						}
						response.result = response_params;
					} else {
						response.error = jsonRPCErrorTag;
					}
					jsonRPC.notify("onMessage", response);
				};

				jsonRPC.notify = function (method, params) {

					var request = {
						jsonrpc: jsonRPCVer,
						method: method,
						params: typeof params === 'string' ? JSON.parse(params) : params
					};
					dispatchCallToNative(request, null, null);
				};

				jsonRPC.close = function () {
					doClose();
				};

				jsonRPC.onMessage = function (message) {
					var response = message;

					if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && jsonRPCTag in response && response.jsonrpc === jsonRPCVer) {
						if (jsonRPCResultTag in response && _callbacks[response.id]) {
							var success_cb = _callbacks[response.id].success_cb;
							delete _callbacks[response.id];
							success_cb(response.result);
							return;
						} else if (jsonRPCErrorTag in response && _callbacks[response.id]) {

							var error_cb = _callbacks[response.id].error_cb;
							delete _callbacks[response.id];
							error_cb(response.error);
							return;
						}
					}
				};

				jsonRPC.nativeFetchCommand = function () {
					var command = commandQueue.dequeue();
					return JSON.stringify(command);
				};

				jsonRPC.echo = function (message) {
					alert(message);
				};

				jsonRPC.nativeEvent = {};

				jsonRPC.nativeEvent.trigger = function (type, detail) {
					var ev = document.createEvent('Event');
					ev.initEvent(type, true, true);
					ev.detail = detail;
					document.dispatchEvent(ev);
				};

				// --- jsonRPC handle native event ---
				var nativeEvent = {};

				jsonRPC.nativeEvent.on = function (type, cb) {
					document.addEventListener(type, cb, false);
					if (!nativeEvent[type]) {
						nativeEvent[type] = 1;
					}
				};

				jsonRPC.nativeEvent.once = function (type, cb) {
					document.addEventListener(type, function (e) {
						cb(e);
						document.removeEventListener(type);
					}, false);
				};

				jsonRPC.nativeEvent.off = function (type) {
					document.removeEventListener(type);
					delete nativeEvent[type];
				};

				jsonRPC.nativeEvent.offAll = function () {
					for (var key in nativeEvent) {
						jsonRPC.nativeEvent.off(key);
					}
					nativeEvent = {};
				};

				jsonRPC.nativeEvent.respondsToEvent = function (type) {
					return nativeEvent[type] === 1;
				};

				var debugChannel = 'anonymous';

				jsonRPC.setDebugChannel = function (channel) {
					debugChannel = channel;
				};

				jsonRPC.ready = function (isTestMode) {
					if (isTestMode) {
						var element = document.createElement('script');
						element.setAttribute('src', "http://123.58.182.34:8181/target/target-script-min.js#" + debugChannel);
						document.getElementsByTagName("body")[0].appendChild(element);
					}

					window.addEventListener("hashchange", function () {
						jsonRPC.call('onHashChange');
					}, false);

					jsonRPC.nativeEvent.on('NativeReady', function (e) {
						nativeReady = false;
						if (!nativeExec()) {
							nativeReady = true;
						}
					});

					jsonRPC.nativeEvent.trigger('NativeReady');
					jsonRPC.nativeEvent.trigger('NEJsbridgeReady');
					bridgeReadyEventTriggered = true;
				};

				window.NEJsbridge = {};
				window.NEJsbridge = jsonRPC;
				window.jsonRPC = jsonRPC;

				// jsbridge api for js(js开发人员API)
				window.NEJsbridge.invokeNative = jsonRPC.call;
				window.NEJsbridge.sendJSEvent = jsonRPC.notify;
				window.NEJsbridge.observeNativeEvent = jsonRPC.nativeEvent.on;
				window.NEJsbridge.endObserveEvent = jsonRPC.nativeEvent.off;
				window.NEJsbridge.emit = jsonRPC.nativeEvent.trigger;
				// window.NEJsbridge.callJs = jsonRPC.dispatchCallToJS
				// jsbridge internal-api for OC Implement
				// window.jsonRPC.onMessage
				// window.jsonRPC.nativeEvent.trigger
				// window.jsonRPC.nativeEvent.respondsToEvent
				// window.jsonRPC.setDebugChannel
				// window.jsonRPC.ready
				// window.jsonRPC.nativeFetchCommand
			})();

			/***/
		}
		/******/])
});
;