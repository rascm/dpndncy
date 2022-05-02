;(function(namespace, func) {
	if(typeof module !== 'undefined' && module.exports)
		module.exports = func();
	else if(typeof define === 'function' && define.amd)
		define(func);
	else
		this[namespace] = func();
})('dpndncy', function() {
	var target = document.getElementsByTagName('head')[0];

	// Create collection
	var Create = function() {
		if(!(this instanceof Create))
			throw new Error('dpndncy must be constructed via new.');
	
		var files = [];
		var failed = [];
		var success = [];
		var executed = false;
		var urlParams = '';

		// get file if exists
		var getFile = function(url) {
			var returnValue = false;

			for(var i = 0; i < files.length; i++) {
				if(files[i].url === url) {
					returnValue = {
						index : i,
						file : files[i]
					};
					break;
				}
			}
			return returnValue;
		};

		// Add file
		var addFile = function(url, options) {
			if(!getFile(url)) {
				files.push({
					url : url,
					type : options.type || 'script',
					crossOrigin : options.crossOrigin || false,
					none : options.nonce || false,
					integrity : options.integrity || false,
					media : options.media || false
				});
			};
			return;
		};

		// Create script loader
		var createLoader = function(onFinish) {
			if(executed)
				return;

			var current = 0;
			executed = true;

			var loadScript = function(currentIndex) {
				if(currentIndex > files.length - 1) {
					if(typeof onFinish === 'function') {
						onFinish({
							success : {
								count : success.length,
								files : [].concat(success)
							},
							failed : {
								count : failed.length,
								files : [].concat(failed)
							},
							
						});
					}
					files.length = 0;
					failed.length = 0;
					success.length = 0;
					return;
				} else if(files.length > 0) {
					var currentFile = files[currentIndex];
					var type = currentFile.type;
					var elem = document.createElement((type === 'script' || type === 'module' ? 'SCRIPT' : 'LINK'));

					if(urlParams !== '') {
						var qidx = currentFile.url.indexOf('?');
						if(qidx !== -1) {
							var searchParams = currentFile.url.substring(qidx + 1, currentFile.url.length);
							var path = currentFile.url.substring(0, qidx);
							currentFile.url = path + '?' + searchParams + '&' + urlParams;
						} else {
							currentFile.url = currentFile.url + '?' + urlParams;
						}
					}
					// js
					if(type === 'module' || type === 'script') {
						elem.src = currentFile.url;
						if(type === 'module') {
							elem.type = 'module';
						} else {
							elem.type = 'text/javascript';
						}
					} else {
						elem.rel = 'stylesheet';
						elem.type = 'text/css';
						elem.href = currentFile.url;
						if(currentFile.media)
							elem.media = currentFile.media;
					}

					if(currentFile.integrity)
						elem.integrity = currentFile.integrity;

					if(currentFile.crossOrigin)
						elem.crossOrigin = currentFile.crossOrigin;

					if(currentFile.nonce)
						elem.nonce = currentFile.nonce;

					// Load or error
					if('onload' in elem && 'onerror' in elem) {
						elem.onload = elem.onerror = function(e) {
							if(e && e.type) {
								if(e.type === 'error') {
									failed.push(currentFile.url);
								} else {
									success.push(currentFile.url);
								}
							}
							current++;
							elem.onload = elem.onerror = null;
							elem = null;
							loadScript(current);
						};
					}
					target.appendChild(elem);
				}
			};
			loadScript(current);
			return;
		};

		this.setUrlParams = function(params) {
			urlParams = params;
		};

		// Public
		this.addScript = function(url, options) {
			options = options || {};
			return addFile(url, {
				type : 'script',
				integrity : options.integrity || false,
				nonce : options.nonce || false,
				crossOrigin : options.crossOrigin || false
			});
		};

		this.addModule = function(url, options) {
			options = options || {};
			return addFile(url, {
				type : 'module',
				integrity : options.integrity || false,
				nonce : options.nonce || false,
				crossOrigin : options.crossOrigin || false
			});
		};

		this.addStyle = function(url, options) {
			options = options || {};
			return addFile(url, {
				type : 'style',
				integrity : options.integrity || false,
				nonce : options.nonce || false,
				crossOrigin : options.crossOrigin || false,
				media : options.media || false
			});
		};

		this.ready = function(onFinish) {
			if(!executed)
				return createLoader(onFinish);
		};

		this.run = function(url, module) {
			if(!executed)
				createLoader(function(r) {
					var s = document.createElement('script');
					if(module)
						s.type = 'module';
					s.src = url;
					target.appendChild(s);
					s = null;
				});
		};
	};
	return Create;
})
