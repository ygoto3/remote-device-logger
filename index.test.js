// @flow
import { JSDOM } from 'jsdom';
import { WebSocket, Server } from 'mock-socket';

import RDL from './index.js';

describe('RemoteDeviceLogger', () => {
  beforeEach(() => {
    global.window = new JSDOM('<body></body>').window;
    global.document = global.window.document;
    global.navigator = global.window.navigator;
    global.location = { href: 'https://example.com/index.html' };
    global.WebSocket = WebSocket;
  });

  it('default', () => {
    new RDL();
    expect(document.querySelector('p')).toBe(null);
  });

  it('displays a log', () => {
    const logger = new RDL({
      debug: true,
      element: (document.body/*: any*/),
      display: true
    });
    const displayNode = ((document.querySelector('p')/*: any*/)/*: HTMLParagraphElement*/);
    expect(displayNode.style.display).toBe('');

    logger.hide();
    expect(displayNode.style.display).toBe('none');

    logger.show();
    expect(displayNode.style.display).toBe('');

    logger.toggle();
    expect(displayNode.style.display).toBe('none');

    logger.toggle();
    expect(displayNode.style.display).toBe('');

    logger.log('aaa', 'bbb', {});
    expect(displayNode.innerHTML).toBe('aaa bbb [object Object]');
  });

  it('catches an error', () => {
    new RDL({
      debug: true,
      element: (document.body/*: any*/),
    });
    window.onerror('error occurred', 'hoge.js', 123, 456);
    const displayNode = ((document.querySelector('p')/*: any*/)/*: HTMLParagraphElement*/);
    expect(!!~displayNode.innerHTML.indexOf('{"message":"error occurred","fileName":"hoge.js","lineNumber":123,"columnNumber":456,"location":"https://example.com/index.html","userAgent":')).toBeTruthy;
  });
  
  it('send a log to a WebSocket server', () => {
    const actual = new Promise(resolve => {
      const server = new Server('ws://localhost:8888');
      server.on('connection', connection => {
        connection.on('message', message => {
          resolve(message);
        });
      });
  
      const logger = new RDL({
        debug: true,
        webSocketUrl: 'ws://localhost:8888',
      });
      logger.log('to WebSocket!');
    });

    expect(actual).resolves.toBe('to WebSocket!');
  });
});
