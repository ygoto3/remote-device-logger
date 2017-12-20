// @flow

/*::
export type RemoteDeviceLoggerParams = {
  debug?: boolean;
  stdout?: boolean;
  element?: HTMLElement;
  webSocketUrl?: string;
  display?: boolean;
};
*/

/**
 * Create a logger
 * @example
 * const logger = new RemoteDeviceLogger();
 * logger.log('Log A', 'Log B');
 */
export default class RemoteDeviceLogger {
  /*::
  _logPool: string[];
  _stdout: boolean;
  _element: HTMLElement;
  _connection: WebSocket;
  */

  /**
   * @param {Object} params
   * @param {boolean} [params.debug=true] debug
   * @param {boolean} [params.stdout=true] stdout
   * @param {HTMLElement} [params.element] element 
   * @param {string} [params.webSocketUrl] webSocketUrl
   * @param {boolean} [params.display] display
   */
  constructor({
    debug = true,
    stdout = true,
    element,
    webSocketUrl,
    display,
  }/*: RemoteDeviceLoggerParams*/ = {}) {
    /**
     * The condition if print a log message to the standard output
     * @private
     * @type {boolean}
     */
    this._stdout = stdout;
    if (debug) {
      /**
       * The pool area to store log messages
       * @private
       * @type {Array}
       */
      this._logPool = [];
      this._catchAllErrors();
      if (typeof WebSocket === 'function' && webSocketUrl) {
        this._connectWebSocket(webSocketUrl);
      }
      if (element) {
        this._createElement(element, display);
      }
    }
  }

  /**
   * Connect to a WebSocket server where you want to send a log
   * @private
   * @param {string} url The URL of a WebSocket server 
   */
  _connectWebSocket(url/*: string*/) {
    const connection = new WebSocket(url);
  
    connection.onopen = () => {
      const mes = 'WebSocket opened';
      this.print(mes);
      if (!this._logPool) return;
      this.sendLog(this._logPool);
      this.sendLog([mes]);
      this._logPool.unshift(mes);  
      this.writeToElement(this._logPool);
    };

    connection.onerror = () => {
      this.log('WebSocket error');
    };
    
    connection.onmessage = e => {
      this.log('WebSocket message:', e.data);
    };

    connection.onclose = () => {
      this.log('WebSocket closed');
    };

    window.addEventListener('beforeunload', () => {
      connection.onclose = () => {};
      connection.close();
    });

    /**
     * The WebSocket connection
     * @private
     * @type {Object}
     */
    this._connection = connection;
  }

  /**
   * Create an element node to contain logs for display
   * @private
   * @param {HTMLElement} parentElement The parent element of the log node 
   * @param {boolean} display The initial state of the logs' appearance 
   */
  _createElement(parentElement/*: HTMLElement*/, display/*: boolean*/ = true) {
    const element = document.createElement('p');
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '50%';
    element.style.height = '100%';
    element.style.backgroundColor = 'rgba(0,0,0,.8)';
    element.style.color = 'white';
    element.style.wordWrap = 'break-word';
    element.style.padding = '1em';
    element.style.lineHeight = '1.4em';
    element.style.margin = '0';

    /**
     * The log container element
     * @private
     * @type {HTMLElement}
     */
    this._element = element;

    if (!display) this.hide();
    this.writeToElement(this._logPool);
    parentElement.appendChild(element);
  }

  /**
   * Add an event lister to window to catch all errors happening on the browser
   * @private
   */
  _catchAllErrors() {
    if (typeof window === 'undefined') return;
    window.onerror = (message, fileName, lineNumber, columnNumber) => {
      var errorInfo = {
        message,
        fileName,
        lineNumber,
        columnNumber,
        location: location.href,
        userAgent: navigator.userAgent
      };
      this.log(JSON.stringify(errorInfo));
    };
  }

  /**
   * Log messages
   * @param {...any} messages Log messages
   */
  log(...messages/*: any[]*/) {
    this.print(...messages);
    if (!this._logPool) return;

    const mes = messages.join(' ');
    this._logPool.unshift(mes);  

    this.writeToElement(this._logPool);
    this.sendLog([mes]);
  }

  /**
   * Print messages
   * @param {...any} messages Messages to print
   */
  print(...messages/*: any[]*/) {
    if (!this._stdout) return;
    // eslint-disable-next-line no-console
    console.log(...messages);
  }

  /**
   * Send log messages
   * @param {string[]} messages Messages to send
   */
  sendLog(messages/*: string[]*/) {
    if (!this._connection || this._connection.readyState !== WebSocket.OPEN) {
      return;
    }
    this._connection.send(messages.join(' '));
  }

  /**
   * Write log messages to the log container element
   * @param {string[]} messages Messages to write
   */
  writeToElement(messages/*: string[]*/) {
    if (!this._element) return;
    this._element.innerHTML = messages.join('<br />');
  }

  /**
   * Toggle the log container element
   */
  toggle() {
    if (!this._element) return;
    if (this._element.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Show the log container element
   */
  show() {
    if (!this._element) return;
    this._element.style.display = '';
    this._element.style.visibility = '';
  }

  /**
   * Hide the log container element
   */
  hide() {
    if (!this._element) return;
    this._element.style.display = 'none';
    this._element.style.visibility = 'hidden';
  }
}
