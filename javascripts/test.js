/**

The MIT License (MIT)  
Copyright (c) 2014 DeNA Co., Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**/

// Copyright 2014 DeNA Co., Ltd. All Rights Reserved.

/**
 * @fileoverview A test application that uses XMLHttpRequest Level 2 and the
 * Indexed Database API.
 */

/** @namespace */
var test = {};

/**
 * Represents whether to enable debugging features.
 * @define {boolean}
 */
test.DEBUG = true;

/**
 * Throws an error if the specified condition is false.
 * @param {boolean} condition
 */
test.assert = function(condition) {
  /// <param type="boolean" name="condition"/>
  if (test.DEBUG && !condition) {
    throw new Error('assertion failed');
  }
};

/**
 * Converts a string variable and returns a floating-point number.
 * @param {*} value
 * @return {number}
 */
test.parseFloat = function(value) {
  /// <param name="value"/>
  /// <returns type="number"/>
  if (test.DEBUG) {
    var type = typeof value;
    test.assert(type == 'number' || type == 'string');
  }
  return (/** @type {number} */ (value)) * 1;
};

/**
 * Converts a number to a string.
 * @param {*} value
 * @return {string}
 */
test.parseString = function(value) {
  /// <param name="value"/>
  /// <returns type="string"/>
  if (test.DEBUG) {
    test.assert(typeof value == 'number');
  }
  return (/** @type {string} */ (value)) + '';
};

/**
 * A class that encapsulates an HTMLElement object.
 * @param {string} id
 * @param {test.HTMLElement.EventListener} listener
 * @implements {EventListener}
 * @constructor
 */
test.HTMLElement = function(id, listener) {
  /// <param type="string" name="id"/>
  /// <param type="test.HTMLElement.EventListener" name="listener"/> 
  this.id = id;
  this.listener_ = listener;
};

/**
 * An inner class used by the test.HTMLElement class to store the context of an
 * event listener.
 * @param {boolean} once
 * @constructor
 */
test.HTMLElement.EventContext = function(once) {
  this.once = once;
};

/**
 * Whether a test.HTMLElement object should remove an event listener after
 * calling it.
 * @type {boolean}
 * @private
 */
test.HTMLElement.EventContext.prototype.once = false;

/**
 * An interface used for listening events from a test.HTMLElement object.
 * @interface
 */
test.HTMLElement.EventListener = function() {};

/**
 * Called when this object receives an event from its hosting browser.
 * @param {test.HTMLElement} element
 * @param {string} type
 * @param {Event} event
 */
test.HTMLElement.EventListener.prototype.handleBrowserEvent =
    function(element, type, event) {
  /// <param type="test.HTMLElement" name="element"/>
  /// <param type="string" name="type"/>
  /// <param type="Event" name="event"/>
};

/**
 * An ID of the HTMLElement object associated with this object.
 * @type {string}
 */
test.HTMLElement.prototype.id = '';

/**
 * An HTMLElement object associated with this object.
 * @type {HTMLElement}
 * @private
 */
test.HTMLElement.prototype.element_ = null;

/**
 * A listener that listens events from this object.
 * @type {test.HTMLElement.EventListener}
 * @private
 */
test.HTMLElement.prototype.listener_ = null;

/**
 * A mapping table that enumerates events being listened by this object.
 * @type {Object.<string,test.HTMLElement.EventContext>}
 * @private
 */
test.HTMLElement.prototype.events_ = null;

/**
 * Retrieves the HTMLElement object attached to this object.
 * @return {HTMLElement}
 * @protected
 */
test.HTMLElement.prototype.get = function() {
  /// <returns type="HTMLElement"/>
  if (!this.element_) {
    this.element_ = document.getElementById(this.id);
  }
  return this.element_;
};

/**
 * Starts listening the specified event. This method attaches this object to the
 * specified event only if it has not.
 * @param {string} type
 * @param {boolean} once
 * @const
 */
test.HTMLElement.prototype.listen = function(type, once) {
  /// <param type="string" name="type"/>
  /// <param type="boolean" name="once"/>
  test.assert(this.listener_ != null);
  if (!this.events_) {
    this.events_ = {};
  }
  if (!this.events_[type]) {
    this.events_[type] = new test.HTMLElement.EventContext(once);
    this.get().addEventListener(type, this, false);
  }
};

/**
 * Stops listening the specified event. This method detaches this object from
 * the specified event.
 * Removes an event listener.
 * @param {string} type
 * @const
 */
test.HTMLElement.prototype.unlisten = function(type) {
  /// <param type="string" name="type"/>
  test.assert(this.listener_ != null);
  test.assert(this.events_ != null && this.events_[type] != null);
  this.events_[type] = null;
  this.get().removeEventListener(type, this, false);
};

/** @override */
test.HTMLElement.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  test.assert(this.events_[event.type] != null);
  var type = event.type;
  this.listener_.handleBrowserEvent(this, type, event);
  if (this.events_[type].once) {
    event.target.removeEventListener(type, this, false);
    this.events_[type] = null;
  }
};

/**
 * A class that encapsulates a range input, i.e. an HTMLInputElement object with
 * its type "range".
 * @param {string} id
 * @param {test.HTMLElement.EventListener} listener
 * @extends {test.HTMLElement}
 * @constructor
 */
test.Range = function(id, listener) {
  /// <param type="string" name="id"/>
  /// <param type="test.HTMLElement.EventListener" name="listener"/> 
  test.HTMLElement.call(this, id, listener);
};
test.Range.prototype = Object.create(test.HTMLElement.prototype);

/**
 * Enables this range input or disables it.
 * @param {boolean} enabled
 */
test.Range.prototype.enable = function(enabled) {
  /// <param type="boolean" name="enabled"/>
  this.get().disabled = !enabled;
};

/**
 * Returns the value of this range input in a floating-point number.
 * @return {number}
 */
test.Range.prototype.getValue = function() {
  /// <returns type="number"/>
  return test.parseFloat(this.get().value);
};

/**
 * Sets the specified number to this range input.
 * @param {number} value
 */
test.Range.prototype.setValue = function(value) {
  /// <returns type="number"/>
  this.get().value = test.parseString(value);
};

/**
 * A class that encapsulates an HTMLImageElement object.
 * @param {string} id
 * @param {test.Image.EventListener} listener
 * @implements {test.HTMLElement.EventListener}
 * @extends {test.HTMLElement}
 * @constructor
 */
test.Image = function(id, listener) {
  /// <param type="string" name="id"/>
  /// <param type="test.Image.EventListener" name="listener"/> 
  test.HTMLElement.call(this, id, this);
  this.imageListener_ = listener;
};
test.Image.prototype = Object.create(test.HTMLElement.prototype);

/**
 * A listener that listens events from this image.
 * @type {test.Image.EventListener}
 * @private
 */
test.Image.prototype.imageListener_ = null;

/**
 * The source URI of this object.
 * @type {string}
 * @private
 */
test.Image.prototype.source_ = '';

/**
 * The width of this image.
 * @type {number}
 * @private
 */
test.Image.prototype.width_ = 0;

/**
 * The height of this image.
 * @type {number}
 * @private
 */
test.Image.prototype.height_ = 0;

/**
 * The red multiplier used for composing this image.
 * @type {number}
 * @private
 */
test.Image.prototype.red_ = 1;

/**
 * The green multiplier used for composing this image.
 * @type {number}
 * @private
 */
test.Image.prototype.green_ = 1;

/**
 * The blue multiplier used for composing this image.
 * @type {number}
 * @private
 */
test.Image.prototype.blue_ = 1;

/**
 * The deviation used for applying a Gaussian-Blur filter to this image.
 * @type {number}
 * @private
 */
test.Image.prototype.blur_ = 0;

/**
 * An interface that listens events from a test.Image object.
 * @interface
 */
test.Image.EventListener = function() {};

/**
 * Called when a test.Image object finishes loading an image.
 * @param {test.Image} image
 */
test.Image.EventListener.prototype.handleLoadImage = function(image) {};

/**
 * Loads a composed image.
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} blur
 * @private
 */
test.Image.prototype.compose_ = function(red, green, blue, blur) {
  /// <param type="numebr" name="red"/>
  /// <param type="numebr" name="green"/>
  /// <param type="numebr" name="blue"/>
  /// <param type="numebr" name="deviation"/>
  var svgText =
    '<svg ' +
        'xmlns="http://www.w3.org/2000/svg" ' +
        'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
        'width="' + this.width_ + '" ' +
        'height="' + this.height_ + '">' +
    '<defs>' +
      '<filter id="a">' +
        '<feColorMatrix type="matrix" values="' +
            red + ' 0 0 0 0 ' +
            '0 ' + green + ' 0 0 0 ' +
            '0 0 ' + blue + ' 0 0 ' +
            '0 0 0 1 0"/>' +
        '<feGaussianBlur stdDeviation="' + blur + '"/>' +
      '</filter>' +
    '</defs>' +
    '<image ' +
        'x="0" ' +
        'y="0" ' +
        'width="' + this.width_ + '" ' +
        'height="' + this.height_ + '" ' +
        'xlink:href="' + this.source_ + '" ' +
        'filter="url(#a)"/>' +
  '</svg>';
  this.listen('load', true);
  this.get().src = 'data:image/svg+xml;base64,' + window.btoa(svgText);
  return true;
};

/** @override */
test.Image.prototype.handleBrowserEvent = function(element, type, event) {
  /// <param type="test.HTMLElement" name="element"/>
  /// <param type="string" name="type"/>
  /// <param type="Event" name="event"/>
  test.assert(type == 'load');
  this.width_ = event.target.width;
  this.height_ = event.target.height;
  this.imageListener_.handleLoadImage(this);
};

/**
 * Loads the specified image data to this element.
 * @param {string} source
 * @const
 */
test.Image.prototype.setSource = function(source) {
  /// <param type="ArrayBuffer" name="data"/>
  this.source_ = source;
  this.get().src = this.source_;
  this.listen('load', true);
};

/**
 * Changes the red multiplier.
 * @param {number} red
 * @return {boolean}
 * @const
 */
test.Image.prototype.setRed = function(red) {
  /// <param type="numebr" name="red"/>
  if (this.red_ == red) {
    return false;
  }
  this.red_ = red;
  return this.compose_(this.red_, this.green_, this.blue_, this.blur_);
};

/**
 * Changes the green multiplier.
 * @param {number} green
 * @return {boolean}
 * @const
 */
test.Image.prototype.setGreen = function(green) {
  /// <param type="numebr" name="green"/>
  if (this.green_ == green) {
    return false;
  }
  this.green_ = green;
  return this.compose_(this.red_, this.green_, this.blue_, this.blur_);
};

/**
 * Changes the blue multiplier.
 * @param {number} blue
 * @return {boolean}
 * @const
 */
test.Image.prototype.setBlue = function(blue) {
  /// <param type="numebr" name="blue"/>
  if (this.blue_ == blue) {
    return false;
  }
  this.blue_ = blue;
  return this.compose_(this.red_, this.green_, this.blue_, this.blur_);
};

/**
 * Applies a blur filter to this image.
 * @param {number} blur
 * @return {boolean}
 * @const
 */
test.Image.prototype.setBlur = function(blur) {
  /// <param type="numebr" name="blue"/>
  if (this.blur_ == blur) {
    return false;
  }
  this.blur_ = blur;
  return this.compose_(this.red_, this.green_, this.blue_, this.blur_);
};

/**
 * A class that encapsulates an HTMLCanvasElement object.
 * @param {string} id
 * @extends {test.HTMLElement}
 * @constructor
 */
test.Canvas = function(id) {
  /// <param type="string" name="id"/>
  test.HTMLElement.call(this, id, null);
};
test.Canvas.prototype = Object.create(test.HTMLElement.prototype);

/**
 * @type {CanvasRenderingContext2D}
 * @private
 */
test.Canvas.prototype.context_ = null;

/**
 * @type {number}
 * @private
 */
test.Canvas.prototype.width_ = 0;

/**
 * @type {number}
 * @private
 */
test.Canvas.prototype.height_ = 0;

/**
 * Draws the specified image to this canvas.
 * @param {test.Image} image
 * @param {number} x
 * @param {number} y
 * @const
 */
test.Canvas.prototype.drawImage = function(image, x, y) {
  /// <param type="test.Image" name="image"/>
  /// <param type="number" name="x"/>
  /// <param type="number" name="y"/>
  /// <var type="HTMLCanvasElement" name="canvas"/>
  var canvas = /** @type {HTMLCanvasElement} */ (this.get());
  if (!this.context_) {
    this.context_ =
        /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    this.width_ = canvas.width;
    this.height_ = canvas.height;
  } else {
    this.context_.clearRect(0, 0, this.width_, this.height_);
  }
  this.context_.drawImage(/** @type {HTMLImageElement} */ (image.get()), x, y);
};

/**
 * A class that loads data.
 * @param {test.Loader.EventListener} listener
 * @implements {test.Loader.Cache.Listener}
 * @implements {EventListener}
 * @constructor
 */
test.Loader = function(listener) {
  /// <param type="test.Loader.EventListener" name="listener"/> 
  this.listener_ = listener;
};

/**
 * An event listener that listens events from this loader.
 * @type {test.Loader.EventListener}
 * @private
 */
test.Loader.prototype.listener_ = null;

/**
 * An interface to access a cache storage.
 * @type {test.Loader.Cache}
 * @private
 */
test.Loader.prototype.cache_ = null;

/**
 * The URL being loaded by this loader.
 * @type {string}
 * @private
 */
test.Loader.prototype.url_ = '';

/**
 * Whether this loader has initialized a cache.
 * @type {boolean}
 * @private
 */
test.Loader.initialized_ = false;

/**
 * The global interface to access a cache storage.
 * @type {test.Loader.Cache}
 * @private
 */
test.Loader.database_ = null;

/**
 * An interface that listens events from a test.Loader object.
 * @interface
 */
test.Loader.EventListener = function() {};

/**
 * Called when a test.Loader object finishes loading the specified data.
 * @param {string} url
 * @param {string} text
 */
test.Loader.EventListener.prototype.handleLoadData = function(url, text) {};

/**
 * An interface that enumerates methods to access a cache storage used by
 * test.Loader objects.
 * @interface
 */
test.Loader.Cache = function() {};

/**
 * Returns whether this cache is ready to get data.
 * @return {boolean}
 */
test.Loader.Cache.prototype.isReady = function() {};

/**
 * Opens a cache.
 * @param {test.Loader.Cache.Listener} listener
 * @return {boolean}
 */
test.Loader.Cache.prototype.open = function(listener) {};

/**
 * Writes a key-value pair.
 * @param {test.Loader.Cache.Listener} listener
 * @param {string} key
 * @param {string} value
 */
test.Loader.Cache.prototype.put = function(listener, key, value) {};

/**
 * Reads a key-value pair.
 * @param {test.Loader.Cache.Listener} listener
 * @param {string} key
 */
test.Loader.Cache.prototype.get = function(listener, key) {};

/**
 * @interface
 */
test.Loader.Cache.Listener = function() { };

/**
 * Called when a test.Loader object has successfully opened a cache.
 * @param {boolean} status
 */
test.Loader.Cache.Listener.prototype.handleOpen = function(status) {};

/**
 * Called when a test.Loader object has successfully read a key-value pair from
 * a cache.
 * @param {boolean} status
 * @param {string} data
 */
test.Loader.Cache.Listener.prototype.handleGet = function(status, data) {};

/**
 * Called when a test.Loader object has successfully written a key-value pair to
 * a cache.
 * @param {boolean} status
 */
test.Loader.Cache.Listener.prototype.handlePut = function(status) {};

/**
 * A class that implements the test.Loader.Cache interface with the Indexed
 * Database API.
 * @implements {test.Loader.Cache}
 * @constructor
 */
test.Loader.IndexedDatabaseCache = function() {
};

/**
 * The database interface of the IndexedDB API.
 * @type {IDBDatabase}
 * @private
 */
test.Loader.IndexedDatabaseCache.database_ = null;

/**
 * Called when a browser finishes opening a database.
 * @param {Event} event
 * @private
 */
test.Loader.IndexedDatabaseCache.handleOpen_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <var type="IDBRequest" name="request"/>
  var request = /** @type {IDBRequest} */ (event.target);
  test.Loader.IndexedDatabaseCache.database_ =
      /** @type {IDBDatabase} */ (request.result);

  /// <var type="test.Loader.Cache.Listener" name="listener"/>
  var listener = /** @type {test.Loader.Cache.Listener} */ (request.listener);
  listener.handleOpen(request.result != null);

  // Detach the listener to delete the listener and its resources.
  request.listener = null;
};

/**
 * Called when a browser needs to update the specified database.
 * @param {Event} event
 * @private
 */
test.Loader.IndexedDatabaseCache.handleUpgrade_ = function(event) {
  /// <param type="Event" name="event"/>
  var request = /** @type {IDBRequest} */ (event.target);
  var database = /** @type {IDBDatabase} */ (request.result);
  if (database.objectStoreNames.contains('Cache')) {
    database.deleteObjectStore('Cache');
  }
  database.createObjectStore('Cache');
};

/**
 * Called when a browser finishes writing a key-value pair.
 * @param {Event} event
 * @private
 */
test.Loader.IndexedDatabaseCache.handlePut_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <var type="IDBRequest" name="request"/>
  var request = /** @type {IDBRequest} */ (event.target);
  /// <var type="test.Loader.Cache.Listener" name="listener"/>
  var listener = /** @type {test.Loader.Cache.Listener} */ (request.listener);
  listener.handlePut(true);

  // Detach the listener to delete the listener and its resources.
  request.listener = null;
};

/**
 * Called when a browser finishes reading a key-value pair.
 * @param {Event} event
 * @private
 */
test.Loader.IndexedDatabaseCache.handleGet_ = function(event) {
  /// <param type="Event" name="event"/>
  /// <var type="IDBRequest" name="request"/>
  var request = /** @type {IDBRequest} */ (event.target);
  /// <var type="test.Loader.Cache.Listener" name="listener"/>
  var listener = /** @type {test.Loader.Cache.Listener} */ (request.listener);
  listener.handleGet(request.result != null,
                     /** @type {string} */ (request.result) || '');

  // Detach the listener to delete the listener and its resources.
  request.listener = null;
};

/**
 * Retrieves the table used by this object.
 * @return {IDBObjectStore}
 * @private
 */
test.Loader.IndexedDatabaseCache.prototype.getObjectStore_ = function() {
  test.assert(!!test.Loader.IndexedDatabaseCache.database_);
  var database = test.Loader.IndexedDatabaseCache.database_;
  var transaction = database.transaction(['Cache'], 'readwrite');
  return transaction.objectStore('Cache');
};

/** @override */
test.Loader.IndexedDatabaseCache.prototype.isReady = function() {
  return test.Loader.IndexedDatabaseCache.database_ != null;
};

/** @override */
test.Loader.IndexedDatabaseCache.prototype.open = function(listener) {
  if (!test.Loader.IndexedDatabaseCache.database_) {
    var request = window.indexedDB.open('Test', 1);
    if (!request) {
      return false;
    }
    request.listener = listener;
    request.onerror = test.Loader.IndexedDatabaseCache.handleOpen_;
    request.onsuccess = test.Loader.IndexedDatabaseCache.handleOpen_;
    request.onupgradeneeded = test.Loader.IndexedDatabaseCache.handleUpgrade_;
  }
  return true;
};

/** @override */
test.Loader.IndexedDatabaseCache.prototype.put =
    function(listener, key, value) {
  var request = this.getObjectStore_().put(value, key);
  request.listener = listener;
  request.onerror = test.Loader.IndexedDatabaseCache.handlePut_;
  request.onsuccess = test.Loader.IndexedDatabaseCache.handlePut_;
};

/** @override */
test.Loader.IndexedDatabaseCache.prototype.get = function(listener, key) {
  var request = this.getObjectStore_().get(key);
  request.listener = listener;
  request.onerror = test.Loader.IndexedDatabaseCache.handleGet_;
  request.onsuccess = test.Loader.IndexedDatabaseCache.handleGet_;
};

/**
 * Retrieves the cache interface.
 * @return {test.Loader.Cache}
 */
test.Loader.getCache_ = function() {
  /// <returns type="test.Loader.Cache"/>
  if (!test.Loader.initialized_) {
    test.Loader.initialized_ = true;
    if (window.indexedDB) {
      test.Loader.database_ = new test.Loader.IndexedDatabaseCache();
    }
  }
  return test.Loader.database_;
};

/**
 * Creates a Data URI from the specified data. (This method cannot use the
 * window.btoa() method because it throws an error when the input data includes
 * non-ASCII characters.)
 * @param {string} contentType
 * @param {ArrayBuffer} buffer
 * @return {string}
 * @private
 */
test.Loader.prototype.createDataURI_ = function(contentType, buffer) {
  /// <param type="string" name="contentType"/> 
  /// <param type="ArrayBuffer" name="buffer"/> 
  /// <returns type="string"/>
  var BASE64 = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
  ];
  var text = 'data:' + contentType + ';base64,';
  var i = 0;
  var data = new Uint8Array(buffer);
  var length = data.length;
  while (length >= 3) {
    var v = data[i] << 16;
    v |= data[i + 1] << 8;
    v |= data[i + 2];
    i += 3;
    length -= 3;
    text += BASE64[(v >> 18) & 63];
    text += BASE64[(v >> 12) & 63];
    text += BASE64[(v >> 6) & 63];
    text += BASE64[v & 63];
  }
  if (length > 0) {
    if (length == 1) {
      var v = data[i] << 16;
      text += BASE64[(v >> 18) & 63];
      text += BASE64[(v >> 12) & 63];
      text += '==';
    } else {
      var v = data[i] << 16;
      v |= data[i + 1] << 8;
      text += BASE64[(v >> 18) & 63];
      text += BASE64[(v >> 12) & 63];
      text += BASE64[(v >> 6) & 63];
      text += '=';
    }
  }
  return text;
};

/**
 * Sends an XMLHttpRequest to a server to get raw data.
 * @param {string} url
 * @private
 */
test.Loader.prototype.sendRequest_ = function(url) {
  /// <param type="string" name="url"/>
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.responseType = 'arraybuffer';
  request.addEventListener('load', this, false);
  request.send();
};

/** @override */
test.Loader.prototype.handleOpen = function(status) {
  /// <param type="boolean" name="status"/>
  if (!status) {
    this.sendRequest_(this.url_);
  } else {
    test.Loader.getCache_().get(this, this.url_);
  }
};

/** @override */
test.Loader.prototype.handleGet = function(status, data) {
  /// <param type="boolean" name="status"/>
  /// <param type="string" name="data"/>
  if (data.length == 0) {
    this.sendRequest_(this.url_);
  } else {
    this.listener_.handleLoadData(this.url_, data);
  }
};

/** @override */
test.Loader.prototype.handlePut = function(status) {
  /// <param type="boolean" name="status"/>
};

/** @override */
test.Loader.prototype.handleEvent = function(event) {
  /// <param type="Event" name="event"/>
  test.assert(event.type == 'load');

  /// <var type="XMLHttpRequest" name="request"/>
  var request = /** @type {XMLHttpRequest} */ (event.target);
  request.removeEventListener(event.type, this, false);

  // Encode the received data to a Data URI and write it to a cache storage.
  if (request.status == 200) {
    var contentType = request.getResponseHeader('Content-Type');
    if (contentType) {
      var buffer = /** @type {ArrayBuffer} */ (request.response);
      var source = this.createDataURI_(contentType, buffer);
      this.listener_.handleLoadData(this.url_, source);
      if (this.cache_) {
        this.cache_.put(this, this.url_, source);
        this.cache_ = null;
      }
    }
  }
};

/**
 * Loads data from the specified URL.
 * @param {string} url
 * @const
 */
test.Loader.prototype.load = function(url) {
  /// <param type="string" name="url"/>
  this.url_ = url;
  this.cache_ = test.Loader.getCache_();
  if (!this.cache_) {
    this.sendRequest_(url);
  } else if (!this.cache_.isReady()) {
    this.cache_.open(this);
  } else {
    this.cache_.get(this, url);
  }
};

/**
 * A class that represents the test application.
 * @param {string} image
 * @param {string} canvas
 * @param {string} red
 * @param {string} green
 * @param {string} blue
 * @param {string} blur
 * @implements {test.HTMLElement.EventListener}
 * @implements {test.Loader.EventListener}
 * @implements {test.Image.EventListener}
 * @constructor
 */
test.Application = function(image, canvas, red, green, blue, blur) {
  /// <param type="string" name="image"/>
  /// <param type="string" name="canvas"/>
  /// <param type="string" name="red"/>
  /// <param type="string" name="green"/>
  /// <param type="string" name="blue"/>
  /// <param type="string" name="blur"/>
  this.image_ = new test.Image(image, this);
  this.canvas_ = new test.Canvas(canvas);
  this.red_ = new test.Range(red, this);
  this.green_ = new test.Range(green, this);
  this.blue_ = new test.Range(blue, this);
  this.blur_ = new test.Range(blur, this);
};

/**
 * The loader used by this application to load images.
 * @type {test.Loader}
 * @private
 */
test.Application.prototype.loader_ = null;

/**
 * The object that stores a loaded image and composes it.
 * @type {test.Image}
 * @private
 */
test.Application.prototype.image_ = null;

/**
 * The object that draws a loaded image to a <canvas> element.
 * @type {test.Canvas}
 * @private
 */
test.Application.prototype.canvas_ = null;

/**
 * The red multiplier used by this application to compose loaded images.
 * @type {test.Range}
 * @private
 */
test.Application.prototype.red_ = null;

/**
 * The green multiplier used by this application to compose loaded images.
 * @type {test.Range}
 * @private
 */
test.Application.prototype.green_ = null;

/**
 * The blue multiplier used by this application to compose loaded images.
 * @type {test.Range}
 * @private
 */
test.Application.prototype.blue_ = null;

/**
 * The standard deviation used by this application to blur loaded images.
 * @type {test.Range}
 * @private
 */
test.Application.prototype.blur_ = null;

/**
 * The instance of this application.
 * @type {test.Application}
 * @private
 */
test.Application.instance_ = null;

/** @override */
test.Application.prototype.handleLoadData = function(url, text) {
  /// <param type="string" name="url"/>
  /// <param type="string" name="text"/>
  this.image_.setSource(text);
};

/** @override */
test.Application.prototype.handleLoadImage = function(image) {
  /// <param type="test.Image" name="image"/>
  this.canvas_.drawImage(image, 0, 0);

  // Enable the range inputs to allow users to change its colors and to blur it.
  this.red_.enable(true);
  this.green_.enable(true);
  this.blue_.enable(true);
  this.blur_.enable(true);
};

/** @override */
test.Application.prototype.handleBrowserEvent = function(element, type, event) {
  /// <param type="test.HTMLElement" name="element"/>
  /// <param type="string" name="type"/>
  /// <param type="Event" name="event"/>
  test.assert(type == 'change');
  test.assert(this.image_ != null);

  // Calculate a multiplier and applies a color filter and a blur filter to the
  // loaded image.
  var value = element.getValue();
  var result = false;
  if (element.id == 'red') {
    result = this.image_.setRed(value / 255);
  } else if (element.id == 'green') {
    result = this.image_.setGreen(value / 255);
  } else if (element.id == 'blue') {
    result = this.image_.setBlue(value / 255);
  } else if (element.id == 'blur') {
    result = this.image_.setBlur(value);
  }

  // Disables the range inputs to prevent users from changing them while the
  // image is being composed.
  if (result) {
    this.red_.enable(false);
    this.green_.enable(false);
    this.blue_.enable(false);
    this.blur_.enable(false);
  }
};

/**
 * Starts this test application.
 * @param {string} image
 * @param {string} canvas
 * @param {string} red
 * @param {string} green
 * @param {string} blue
 * @param {string} blur
 */
test.Application.start = function(image, canvas, red, green, blue, blur) {
  /// <param type="string" name="image"/>
  /// <param type="string" name="canvas"/>
  /// <param type="string" name="red"/>
  /// <param type="string" name="green"/>
  /// <param type="string" name="blue"/>
  /// <param type="string" name="blur"/>
  if (!test.Application.instance_) {
    test.Application.instance_ =
        new test.Application(image, canvas, red, green, blue, blur);
  }
  var application = test.Application.instance_;

  // Listens change events from the range inputs.
  application.red_.listen('change', false);
  application.green_.listen('change', false);
  application.blue_.listen('change', false);
  application.blur_.listen('change', false);

  // Disable the range inputs until this application finishes loading an image.
  application.red_.enable(false);
  application.green_.enable(false);
  application.blue_.enable(false);
  application.blur_.enable(false);
};

/**
 * Loads the specified image.
 * @param {string} url
 */
test.Application.load = function(url) {
  /// <param type="string" name="url"/>
  var application = test.Application.instance_;
  if (application) {
    // Create a loader and loads the specified image.
    if (!application.loader_) {
      application.loader_ = new test.Loader(application);
    }
    application.loader_.load(url);

    // Reset the values of the range inputs to their initial values.
    application.red_.setValue(255);
    application.green_.setValue(255);
    application.blue_.setValue(255);
    application.blur_.setValue(0);
  }
};
