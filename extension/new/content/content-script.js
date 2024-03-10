'use strict';

// polyfill - navigator.whenDefined
if (typeof navigator.whenDefined !== 'function') {
    Object.defineProperty(navigator, 'whenDefined', {
        configurable: false,
        enumerable: true,
        value: function () {
            let units;

            units = Array.from(arguments);
            if (units.indexOf('document.body') === -1) {
                units.push('document.body');
            }
            const promises = units.map(
                (unit) => {
                    return new Promise((resolve, reject) => {
                        let c, iid;
                        const max = 10000;

                        c = 0;
                        iid = setInterval(() => {
                            let _root, parts;
                            c += 5;
                            if (c > max) {
                                clearInterval(iid);
                                reject(new Error(`"${unit}" unit missing.`));
                            }

                            _root = window;
                            parts = unit.split('.');
                            while (parts.length) {
                                const prop = parts.shift();
                                if (typeof _root[prop] === 'undefined') {
                                    _root = null;
                                    break;
                                } else {
                                    _root = _root[prop];
                                }
                            }

                            if (_root !== null && document.readyState && document.readyState !== 'loading') {
                                clearInterval(iid);
                                resolve();
                            }
                        }, 5);
                    });
                }
            );

            return Promise.all(promises);
        }
    });
}

const defaults = {
    dX: 0,
    dY: 0,
    x: 60,
    y: 60,
    width: 300,
    height: 225,
    selectionColor: '#fefefe',
    overlayBgc: '#000000',
    overlayOpacity: .7,
    sensorSize: 40,
    selectionMinSize: 40 * 3, /* sensorSize * 3 */
    pursuer: {},
    previous: {},
    isFullScreen: false,
    picker: {
        unitHeight: 30,
        indicatorHeight: 16,
        amount: 10,
        width: 100,
        height: (30 * 10) + (16 * 2)
    },
    aspectRatio: 0 /* 4:3 (3/4) */
};

const template = document.createElement('template');
template.innerHTML = `
  <style>
  /* reset */
  div,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,legend,input,textarea,p,article,aside,figcaption,figure,nav,section,mark,audio,video,main{margin:0;padding:0}
  article,aside,figcaption,figure,nav,section,main{display:block}
  fieldset,img{border:0}
  address,caption,cite,em,strong{font-style:normal;font-weight:400}
  ol,ul{list-style:none}
  caption{text-align:left}
  h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:400}
  abbr{border:0;font-variant:normal}
  input,textarea,select{font-family:inherit;font-size:inherit;font-weight:inherit;}
  body{-webkit-text-size-adjust:none}
  select,input,button,textarea{font:100% arial,helvetica,clean,sans-serif}
  del{font-style:normal;text-decoration:none}
  pre{font-family:monospace;line-height:100%}
  mark{background-color:transparent;}

  /* component style */
  a{cursor:pointer;text-decoration:none;}
  a:active{transform:translate(1px,1px);}
  .stuff{text-indent:100%;white-space:nowrap;overflow:hidden;}
  .line-fadeout{position:relative;}
  .line-fadeout:after{position:absolute;content:'';text-align:right;bottom:0;right:0;width:70%;height:var(--foh);background:linear-gradient(to right, var(--fo1), var(--fo2));}
  .aspect-ratio{position:relative;width:100%;--w:4;--h:3;}
  .aspect-ratio:before{content:'';width:100%;padding-top:calc(var(--h) * 100% / var(--w));display:block;}
  .aspect-ratio .content{position:absolute;top:0;left:0;right:0;bottom:0;}
  .overscrolling{-webkit-overflow-scrolling:touch;overflow:hidden;overflow-y:scroll;overscroll-behavior:contain;}
  :host{all:initial;font-family:system-ui,sans-serif;text-size-adjust:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-size:16px;position:fixed;left:0;top:0;width:0;height:0;-webkit-tap-highlight-color:transparent;overflow:hidden;z-index:200000500;transition:opacity 250ms ease;opacity:0;pointer-events:none;}

  .wrap {
    width:100%;
    height:100%;
  
    --pseudo-length: calc(100% / 3);
    --pseudo-position: calc((100% - var(--pseudo-length)) / 2);
    --decorate-width: 4px;
    --decorate-coordinate: calc(var(--decorate-width) * -1);
    --serif-color: rgba(0,0,0,.8);
    --duration: 300ms;

    /* selection */
    --x: ${defaults.x}px;
    --y: ${defaults.y}px;
    --width: ${defaults.width}px;
    --height: ${defaults.height}px;
    --selection-color: ${defaults.selectionColor};

    /* overlay */
    --overlay-bgc: ${defaults.overlayBgc};
    --overlay-opacity: ${defaults.overlayOpacity};
    --overlay-mask: polygon(
      0% 0%,
      0% 100%,
      var(--x) 100%,
      var(--x) calc(var(--y) + var(--height)),
      var(--x) var(--y),
      calc(var(--x) + var(--width)) var(--y),
      calc(var(--x) + var(--width)) calc(var(--y) + var(--height)),
      var(--x) calc(var(--y) + var(--height)),
      var(--x) 100%,
      100% 100%,
      100% 0%,
      0% 0%
    );

    /* picker */
    --icon-check-w: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyNmZmYnIGQ9J005IDE2LjJMNC44IDEybC0xLjQgMS40TDkgMTkgMjEgN2wtMS40LTEuNEw5IDE2LjJ6Jy8+PC9zdmc+) no-repeat .75em 50%/1.2em auto;
    --icon-check-b: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyMxZTE3MTEnIGQ9J005IDE2LjJMNC44IDEybC0xLjQgMS40TDkgMTkgMjEgN2wtMS40LTEuNEw5IDE2LjJ6Jy8+PC9zdmc+) no-repeat .75em 50%/1.2em auto;
    --icon-arrow-up-w: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyNkZWRlZGYnIGQ9J003IDE0bDUtNSA1IDV6Jy8+PC9zdmc+) rgba(0,0,0,.5) no-repeat 50% 50%/16px auto;
    --icon-arrow-up-b: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyMxZTE3MTEnIGQ9J003IDE0bDUtNSA1IDV6Jy8+PC9zdmc+) rgba(255,255,255,.5) no-repeat 50% 50%/16px auto;
    --icon-arrow-down-w: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyNkZWRlZGYnIGQ9J003IDEwbDUgNSA1LTV6Jy8+PC9zdmc+) rgba(0,0,0,.5) no-repeat 50% 50%/16px auto;
    --icon-arrow-down-b: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyMxZTE3MTEnIGQ9J003IDEwbDUgNSA1LTV6Jy8+PC9zdmc+) rgba(255,255,255,.5) no-repeat 50% 50%/16px auto;
  }
  
  .overlay{position:absolute;left:0;top:0;width:100%;height:100%;background-color:var(--overlay-bgc);opacity:var(--overlay-opacity);clip-path:var(--overlay-mask);}
  .selection {
    --sensor-size: ${defaults.sensorSize}px;
    --selection-mask: polygon(0% 0%, var(--sensor-size) 0%, var(--sensor-size) var(--sensor-size), 0% var(--sensor-size), 0% 0%, 0% calc(100% - var(--sensor-size)), var(--sensor-size) calc(100% - var(--sensor-size)), var(--sensor-size) 100%, 0 100%, 0% calc(100% - var(--sensor-size)), 0% 100%, 100% 100%, 100% calc(100% - var(--sensor-size)), calc(100% - var(--sensor-size)) calc(100% - var(--sensor-size)), calc(100% - var(--sensor-size)) 100%, 0% 100%, 0% 0%, 100% 0%, 100% var(--sensor-size), calc(100% - var(--sensor-size)) var(--sensor-size), calc(100% - var(--sensor-size)) 0%, 0% 0%);
  }
  .selection{position:absolute;left:var(--x);top:var(--y);width:var(--width);height:var(--height);border:1px solid var(--selection-color);box-sizing:border-box;background:transparent;z-index:1;box-shadow:inset 1px 1px 0 var(--serif-color),inset -1px -1px 0 var(--serif-color);}
  .selection::before{position:absolute;left:var(--pseudo-position);top:0;content:'';width:var(--pseudo-length);height:100%;box-sizing:border-box;border-left:1px solid var(--selection-color);border-right:1px solid var(--selection-color);pointer-events:none;opacity:.4;box-shadow:inset 1px 0 0 var(--serif-color),inset -1px 0 0 var(--serif-color);}
  .selection::after{position:absolute;top:var(--pseudo-position);left:0;content:'';width:100%;height:var(--pseudo-length);box-sizing:border-box;border-top:1px solid var(--selection-color);border-bottom:1px solid var(--selection-color);pointer-events:none;opacity:.4;box-shadow:inset 0 1px 0 var(--serif-color),inset 0 -1px 0 var(--serif-color);}
  .selection__em{position:absolute;left:var(--decorate-coordinate);top:var(--decorate-coordinate);width:100%;height:100%;display:block;border:var(--decorate-width) solid var(--selection-color);clip-path:var(--selection-mask);}
  .selection__span{position:absolute;bottom:0;right:0;font-size:.99em;line-height:2.33;color:var(--selection-color);text-shadow:1px 1px 0 var(--serif-color);transform:translateY(100%);}
  .selection--dragging{user-select:none;}
  [data-action="dragging"]{user-select:none;}
  
  .aspect-ratio-picker {
    --unit-height: ${defaults.picker.unitHeight}px;
    --indicator-height: ${defaults.picker.indicatorHeight}px;
    --max-height: calc(var(--unit-height) * ${defaults.picker.amount} + var(--indicator-height) * 2);

    --background-color: rgba(255,255,255,.6);
    --text-color: #21180b;
    --text-color-hover: #fff;
    --border-color: rgba(255,255,255,.5);
    --outline-color: rgba(0,0,0,.1);
    --icon-check: var(--icon-check-b);
    --icon-check-hover: var(--icon-check-w);
    --icon-arrow-up: var(--icon-arrow-up-b);
    --icon-arrow-down: var(--icon-arrow-down-b);
  }
  .aspect-ratio-picker{position:absolute;left:var(--x,0px);top:var(--y,0px);width:${defaults.picker.width}px;max-height:var(--max-height);border-radius:.5em;border:1px solid var(--border-color);box-shadow:0 0 0 1px var(--outline-color),0 0 6px rgba(0,0,0,.3);background-color:var(--background-color);backdrop-filter:blur(20px);opacity:0;pointer-events:none;box-sizing:border-box;z-index:1;}
  .aspect-ratio-picker__a{color:var(--text-color);width:100%;height:var(--unit-height);line-height:var(--unit-height);display:block;display:block;text-align:center;box-sizing:border-box;}
  .aspect-ratio-picker__a--end{border-bottom:1px solid var(--border-color);}
  .aspect-ratio-picker__a--checked{background:var(--icon-check);}
  .aspect-ratio-picker::before{position:sticky;left:0;top:0;content:'';width:100%;height:10px;background:var(--icon-arrow-up);z-index:2;display:block;}
  .aspect-ratio-picker::after{position:sticky;left:0;bottom:0;content:'';width:100%;height:10px;background:var(--icon-arrow-down);z-index:2;display:block;}
  .aspect-ratio-picker:focus{outline:0 none;}
  .aspect-ratio-picker:focus-within{opacity:1;pointer-events:auto;transition:opacity 100ms ease;}

  @media (hover: hover) {
    .aspect-ratio-picker__a--checked:hover{background:var(--icon-check-hover);}
    .aspect-ratio-picker__a:hover{color:var(--text-color-hover);background-color:#166ed8;transition:background-color 50ms ease;}
  }

  @media (prefers-color-scheme: dark) {
    .aspect-ratio-picker {
      --background-color: rgba(0,0,0,.6);
      --text-color: #fff;
      --text-color-hover: #fff;
      --border-color: rgba(255,255,255,.2);
      --outline-color: rgba(0,0,0,.5);
      --icon-check: var(--icon-check-w);
      --icon-check-hover: var(--icon-check-w);
      --icon-arrow-up: var(--icon-arrow-up-w);
      --icon-arrow-down: var(--icon-arrow-down-w);
    }
  }

  /* animation */
  .transform .selection{transition:width var(--duration) ease,height var(--duration) ease,left var(--duration) ease,top var(--duration) ease;}
  .transform .overlay{transition:clip-path var(--duration) ease;}

  /* maneuver series */
  .wrap--maneuver{}
  .overlay--maneuver{}
  .selection--maneuver{}
  .aspect-ratio-picker--maneuver{}
  </style>

  <div class="wrap wrap--maneuver">
    <div class="overlay overlay--maneuver"></div>
    <div class="selection selection--maneuver">
      <em class="selection__em stuff">decoration</em>
      <span class="selection__span">98 x 98</span>
    </div>
    <div class="aspect-ratio-picker aspect-ratio-picker--maneuver overscrolling" tabindex="0">
      <a class="aspect-ratio-picker__a aspect-ratio-picker__a--checked aspect-ratio-picker__a--end">free</a>
      <a class="aspect-ratio-picker__a aspect-ratio-picker__a--end" data-width="1" data-height="1">1:1</a>
      <a class="aspect-ratio-picker__a" data-width="16" data-height="9">16:9</a>
      <a class="aspect-ratio-picker__a" data-width="10" data-height="8">10:8</a>
      <a class="aspect-ratio-picker__a" data-width="7" data-height="5">7:5</a>
      <a class="aspect-ratio-picker__a" data-width="4" data-height="3">4:3</a>
      <a class="aspect-ratio-picker__a" data-width="5" data-height="3">5:3</a>
      <a class="aspect-ratio-picker__a aspect-ratio-picker__a--end" data-width="3" data-height="2">3:2</a>
      <a class="aspect-ratio-picker__a" data-width="9" data-height="16">9:16</a>
      <a class="aspect-ratio-picker__a" data-width="8" data-height="10">8:10</a>
      <a class="aspect-ratio-picker__a" data-width="5" data-height="7">5:7</a>
      <a class="aspect-ratio-picker__a" data-width="3" data-height="4">3:4</a>
      <a class="aspect-ratio-picker__a" data-width="3" data-height="5">3:5</a>
      <a class="aspect-ratio-picker__a" data-width="2" data-height="3">2:3</a>
    </div>
    <keyboard-shortcut></keyboard-shortcut>
  </div>
`;

const template4Shortcuts = document.createElement('template');
template4Shortcuts.innerHTML = `
  <style>
  /* reset */
  div,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,legend,input,textarea,p,article,aside,figcaption,figure,nav,section,mark,audio,video,main{margin:0;padding:0}
  article,aside,figcaption,figure,nav,section,main{display:block}
  fieldset,img{border:0}
  address,caption,cite,em,strong{font-style:normal;font-weight:400}
  ol,ul{list-style:none}
  caption{text-align:left}
  h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:400}
  abbr{border:0;font-variant:normal}
  input,textarea,select{font-family:inherit;font-size:inherit;font-weight:inherit;}
  body{-webkit-text-size-adjust:none}
  select,input,button,textarea{font:100% arial,helvetica,clean,sans-serif}
  del{font-style:normal;text-decoration:none}
  pre{font-family:monospace;line-height:100%}

  /* component style */
  a{cursor:pointer;text-decoration:none;}
  a:active{transform:translate(1px,1px);}
  .stuff{text-indent:100%;white-space:nowrap;overflow:hidden;}
  .line-clampin{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-overflow:ellipsis;}
  :host{all:initial;font-family:system-ui,sans-serif;text-size-adjust:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-size:16px;position:fixed;left:0;bottom:0;-webkit-tap-highlight-color:transparent;width:100%;display:block;pointer-events:none;z-index:1;}
  
  :host {
    --width: calc(100% / 3);
    --height: 48px;
    --icon-close-w: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyNmZmZmZmYnIGQ9J00xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6Jy8+PC9zdmc+) no-repeat 50% 50%/1.5em auto;
    --icon-close-b: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGhlaWdodD0nMjQnIHdpZHRoPScyNCc+PHBhdGggZD0nTTAgMGgyNHYyNEgweicgZmlsbD0nbm9uZScvPjxwYXRoIGZpbGw9JyMyODI4MjgnIGQ9J00xOSA2LjQxTDE3LjU5IDUgMTIgMTAuNTkgNi40MSA1IDUgNi40MSAxMC41OSAxMiA1IDE3LjU5IDYuNDEgMTkgMTIgMTMuNDEgMTcuNTkgMTkgMTkgMTcuNTkgMTMuNDEgMTJ6Jy8+PC9zdmc+) no-repeat 50% 50%/1.5em auto;
    
    --close-bgc: transparent;
    --hover: #e1e1e1;

    --background-color: rgba(255,255,255,.6);
    --text-color: #21180b;
    --border-color: rgba(255,255,255,.5);
    --outline-color: rgba(0,0,0,.1);
    --icon-close: var(--icon-close-b);
    --padding: 1em;
  }

  .main{color:var(--text-color);position:relative;padding:1em;box-sizing:border-box;border:1px solid var(--border-color);border-bottom:0 none;box-shadow:0 0 0 1px var(--outline-color),0 0 6px rgba(0,0,0,.3);background-color:var(--background-color);backdrop-filter:blur(20px);border-radius:20px 20px 0 0;transition:transform 200ms ease,opacity 200ms ease;transform:translateY(100%);opacity:0;margin:0 1em;}
  .shortcuts__h3{font-size:1.125em;font-weight:500;line-height:2;}
  
  .shortcuts__close{position:absolute;right:.5em;top:.5em;width:var(--height);height:var(--height);border-radius:var(--height);background:var(--icon-close);background-color:var(--close-bgc);transition:background-color 150ms ease;}
  .shortcuts__close:focus{outline:0 none;--close-bgc:var(--hover);}
  .shortcuts__close:focus-visible{--close-bgc:var(--hover);}
  .shortcuts__close:active{transform:translate(1px,1px);}

  kbd{display:inline-block;margin:0 .1em;padding:.1em .6em;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#242729;text-shadow:0 1px 0 #fff;background-color:#e1e3e5;border:1px solid #adb3b8;border-radius:3px;box-shadow:0 1px 0 rgb(12 13 14 / 20%),inset 0 0 0 2px #fff;white-space:nowrap;}
  .shortcuts__ul{display:flex;flex-wrap:wrap;margin-top:.5em;}
  .shortcuts__li{width:var(--width);flex-shrink:0;margin-top:1em;box-sizing:border-box;padding-right:var(--padding);}
  
  :host(.active){pointer-events:auto;}
  :host(.active) .main{transform:translateY(0%);opacity:1;}
  
  @media (hover: hover) {
    .shortcuts__close:hover{--close-bgc:var(--hover);}
  }

  /* https://blog.hinablue.me/css-media-query-tips/ */
  @media screen and (max-width: 767px) {
    :host {
      --width: calc(100% / 2);
    }
  }

  @media screen and (max-width: 576px) {
    :host {
      --width: 100%;
      --padding: 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --background-color: rgba(0,0,0,.6);
      --text-color: #fff;
      --border-color: rgba(255,255,255,.2);
      --outline-color: rgba(0,0,0,.5);
      --icon-close: var(--icon-close-w);
      --hover: rgba(255,255,255,.1);
    }
  }
  </style>

  <div class="main">
    <h3 class="shortcuts__h3">Keyboard Shortcuts</h3>
    <a href="#close" class="shortcuts__close stuff" title="close" aria-label="close">close</a>
    <ul class="shortcuts__ul">
      <li class="shortcuts__li">
        <kbd>Cmd</kbd> + <kbd>.</kbd>︰Turn on or off 「img2Text It」.
      </li>
      
      <li class="shortcuts__li">
        <kbd>Esc</kbd>︰Turn off 「img2Text It」 or 「Shortcuts Guide」.
      </li>

      <li class="shortcuts__li">
        <kbd>Shift</kbd>︰Fix selection aspect ratio or direction.
      </li>

      <li class="shortcuts__li">
        <kbd>f</kbd>︰Switch selection to fullscreen.
      </li>

      <li class="shortcuts__li">
        <kbd>Cmd</kbd> + <kbd>c</kbd>︰Save screenshot into clipboard.
      </li>

      <li class="shortcuts__li">
        <kbd>Enter</kbd>︰Save screenshot into a image file.
      </li>

      <li class="shortcuts__li">
        <kbd>↑</kbd>、<kbd>↓</kbd>、<kbd>←</kbd>、<kbd>→</kbd>︰Move selection strictly.
      </li>

      <li class="shortcuts__li">
        <kbd>Shift</kbd> + <kbd>?</kbd>︰Turn on 「Shortcuts Guide」.
      </li>
    </ul>
  </div>
`;

const template4Sign = document.createElement('template');
template4Sign.innerHTML = `
  <style>
  /* reset */
  div,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,legend,input,textarea,p,article,aside,figcaption,figure,nav,section,mark,audio,video,main{margin:0;padding:0}
  article,aside,figcaption,figure,nav,section,main{display:block}
  fieldset,img{border:0}
  address,caption,cite,em,strong{font-style:normal;font-weight:400}
  ol,ul{list-style:none}
  caption{text-align:left}
  h1,h2,h3,h4,h5,h6{font-size:100%;font-weight:400}
  abbr{border:0;font-variant:normal}
  input,textarea,select{font-family:inherit;font-size:inherit;font-weight:inherit;}
  body{-webkit-text-size-adjust:none}
  select,input,button,textarea{font:100% arial,helvetica,clean,sans-serif}
  del{font-style:normal;text-decoration:none}
  pre{font-family:monospace;line-height:100%}
  mark{background-color:transparent;}

  :host{all:initial;font-family:system-ui,sans-serif;text-size-adjust:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;font-size:16px;width:0;height:0;display:block;overflow:hidden;z-index:10001;pointer-events:none;}
  .wrap{position:fixed;left:0;top:0;width:0;height:0;background-color:rgba(0,0,0,.7);border-radius:8px;margin-left:-60px;margin-top:-60px;opacity:1;transform:scale(1);z-index:10001;}

  .wrap{
    --stroke-dashoffset: 29.7833385;
    --timing-function: cubic-bezier(0, 0, .2, 1);
    --duration: 250ms;
  }

  .ext-crop-sign__h3{display:none;}
  .ext-crop-sign__svg{width:70%;height:70%;display:block;margin:0 auto;}
  .ext-crop-sign__svg{stroke:currentColor;stroke-width:1;stroke-dashoffset:var(--stroke-dashoffset);stroke-dasharray:var(--stroke-dashoffset);}
  .ext-crop-sign__p{font-size:1.125em;text-align:center;color:#fff;line-height:calc(120px - 120px * .7);}
  
  :host(.act) .wrap{left:50%;top:50%;width:120px;height:120px;animation:ext-img2Text-sigh-show 1500ms ease forwards;}
  :host(.act) .ext-crop-sign__svg{animation:ext-crop-sign-checkmark-path 350ms ease calc(var(--duration) / 2) forwards;}

  @keyframes ext-crop-sign-checkmark-path {
    0%,50%{stroke-dashoffset:var(--stroke-dashoffset);}
    50%{animation-timing-function:cubic-bezier(0, 0, .2, 1);}
    100%{stroke-dashoffset:0;}
  }

  @keyframes ext-img2Text-sigh-show {
    0%{opacity:0;transform:scale(0);transition-timing-function:cubic-bezier(0, 0, .2, 1);}
    16%{opacity:1;transform:scale(1);}
    84%{opacity:1;transform:scale(1);}
    100%{opacity:0;transform:scale(0);}
  }
  </style>

  <div class="wrap">
    <h3 class="ext-crop-sign__h3">ext-crop-sign</h3>
    <svg class="ext-crop-sign__svg" viewBox="0 0 24 24">
      <path fill="none" stroke-width="1.5" stroke="white" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
    </svg>
    <p class="ext-crop-sign__p">COPY</p>
  </div>
`;

const init = {
    _data: {},
    _nodes: {},
    _evtList: [],

    getSelectionInfo: function () {
        const { selection } = this._nodes;
        const { x, y, width, height } = selection.getBoundingClientRect();
        const { x: scrollX, y: scrollY } = _wcl.getScroll();

        return { x, y, width, height, scrollX, scrollY };
    },
    updateSelectionInfo: function () {
        const { selection } = this._nodes;
        const { x, y, width, height } = selection.getBoundingClientRect();

        this._data = {
            ...this._data,
            x,
            y,
            width,
            height
        };
    },
    _environmentSetting: function ({ sensorSize = defaults.sensorSize, selectionColor = defaults.selectionColor, overlayBgc = defaults.overlayBgc, overlayOpacity = defaults.overlayOpacity }) {
        const { styleSheet } = this._nodes;

        // selection
        this._data.sensorSize = sensorSize;
        this._data.selectionMinSize = sensorSize * 3;

        _wcl.addStylesheetRules('.selection--maneuver', {
            '--selection-color': selectionColor,
            '--sensor-size': `${sensorSize}px`
        }, styleSheet);

        // overlay
        _wcl.addStylesheetRules('.overlay--maneuver', {
            '--overlay-bgc': overlayBgc,
            '--overlay-opacity': overlayOpacity,
        }, styleSheet);
    },
    refresh: function ({ x, y, width, height } = this._data) {
        const { styleSheet, info } = this._nodes;

        info.textContent = `After selecting area, hit Enter to start processing image. Dimensions: ${Math.floor(width)} x ${Math.floor(height)}`;
        // const coordinate = [
        //   '0% 0%',
        //   '0% 100%',
        //   `${x}px 100%`,
        //   `${x}px ${y + height}px`,
        //   `${x}px ${y}px`,
        //   `${x + width}px ${y}px`,
        //   `${x + width}px ${y + height}px`,
        //   `${x}px ${y + height}px`,
        //   `${x}px 100%`,
        //   '100% 100%',
        //   '100% 0%',
        //   '0% 0%'
        // ];

        _wcl.addStylesheetRules('.wrap--maneuver', {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--width': `${width}px`,
            '--height': `${height}px`,
            // '--overlay-mask': `polygon(${coordinate.join()})`
        }, styleSheet);
    },
    detectAction: function ({ pX, pY }) {
        const { x, y, width, height, sensorSize } = this._data;
        let action = 'move';

        // sensorSize
        if (pX >= x && pX <= x + sensorSize && pY >= y && pY <= y + sensorSize) {
            action = 'resizeLT';
        } else if (pX >= x + width - sensorSize && pX <= x + width && pY >= y && pY <= y + sensorSize) {
            action = 'resizeRT';
        } else if (pX >= x && pX <= x + sensorSize && pY >= y + height - sensorSize && pY <= y + height) {
            action = 'resizeLB';
        } else if (pX >= x + width - sensorSize && pX <= x + width && pY >= y + height - sensorSize && pY <= y + height) {
            action = 'resizeRB';
        }

        return action;
    },
    _onDown: function (evt) {
        this._data.controllerDD = new AbortController();

        const signal = this._data.controllerDD.signal;
        const { move, up } = this._data.pursuer;
        const html = document.querySelector('html');
        const { selection, btnCloseShortcuts } = this._nodes;
        const { x: pX, y: pY } = _wcl.pointer(evt);

        if ((typeof evt.buttons !== 'undefined' && evt.buttons !== 1) || selection.dataset.action) {
            return;
        }

        evt.preventDefault();
        selection.dataset.action = 'dragging';

        // add events
        html.addEventListener(move, this._onMove, { signal });
        html.addEventListener(up, this._onUp, { signal });

        // state
        this._data.isFullScreen = false;
        this.updateSelectionInfo();

        // shortcuts
        btnCloseShortcuts.click();

        this._data.dX = pX - _wcl.scrollX - this._data.x;
        this._data.dY = pY - _wcl.scrollY - this._data.y;
        this._data.action = this.detectAction({ pX: pX - _wcl.scrollX, pY: pY - _wcl.scrollY });
    },

    _onMove: function (evt) {
        const { selection } = this._nodes;
        const { x, y, dX, dY, width, height, action, selectionMinSize } = this._data;
        const { x: pX, y: pY } = _wcl.pointer(evt);
        const { width: vW, height: vH } = _wcl.getViewportSize();
        let { aspectRatio } = this._data;

        if ((typeof evt.buttons !== 'undefined' && evt.buttons !== 1) || !selection.dataset.action) {
            return;
        }

        if (aspectRatio === 0 && evt.shiftKey) {
            // fixed aspect-ratio
            aspectRatio = height / width;
        }

        switch (action) {
            case 'move': {
                let sX = pX - _wcl.scrollX - dX; //selection X
                let sY = pY - _wcl.scrollY - dY; //selection Y

                if (evt.shiftKey) {
                    if (Math.abs(x - sX) > Math.abs(y - sY)) {
                        // fixed sY
                        sY = y;
                    } else {
                        // fixed sX
                        sX = x;
                    }
                }

                if (sX < 0) {
                    sX = 0;
                } else if (sX + width > vW) {
                    sX = vW - width;
                }

                if (sY < 0) {
                    sY = 0;
                } else if (sY + height > vH) {
                    sY = vH - height;
                }

                this.refresh({ x: sX, y: sY, width, height });
                break;
            }

            case 'resizeRB': {
                const sX = x;
                const sY = y;
                const deltaX = width - dX;
                const deltaY = height - dY;

                let sW = (pX - _wcl.scrollX) + deltaX - sX; // selection width
                let sH = (pY - _wcl.scrollY) + deltaY - sY; // selection height

                if (aspectRatio === 0) {
                    // free
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                    }

                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                    }
                } else if (aspectRatio <= 1) {
                    // Landscape (width > height or 1:1)
                    sW = Math.max(sW, sH);
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                    }

                    sH = sW * aspectRatio;
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                        sW = sH / aspectRatio;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                        sW = sH / aspectRatio;
                    }
                } else {
                    // Portrait (width < height)
                    sH = Math.max(sW, sH);
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                    }

                    sW = sH / aspectRatio;
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                        sH = sW * aspectRatio;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                        sH = sW * aspectRatio;
                    }
                }

                this.refresh({ x: sX, y: sY, width: sW, height: sH });
                break;
            }

            case 'resizeRT': {
                const sX = x;
                const deltaX = width - dX;
                const lY = y + height; // limit Y

                let sW = (pX - _wcl.scrollX) + deltaX - sX; // selection width
                let sH = lY - (pY - dY - _wcl.scrollY);

                if (aspectRatio === 0) {
                    // free
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                    }

                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (lY - sH < 0) {
                        sH = lY;
                    }
                } else if (aspectRatio <= 1) {
                    // Landscape (width > height or 1:1)
                    sW = Math.max(sW, sH);
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                    }

                    sH = sW * aspectRatio;
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                        sW = sH / aspectRatio;
                    } else if (lY - sH < 0) {
                        sH = lY;
                        sW = sH / aspectRatio;
                    }
                } else {
                    // Portrait (width < height)
                    sH = Math.max(sW, sH);
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (lY - sH < 0) {
                        sH = lY;
                    }

                    sW = sH / aspectRatio;
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                        sH = sW * aspectRatio;
                    } else if (sX + sW > vW) {
                        sW = vW - sX;
                        sH = sW * aspectRatio;
                    }
                }

                const sY = lY - sH;

                this.refresh({ x: sX, y: sY, width: sW, height: sH });
                break;
            }

            case 'resizeLT': {
                const lY = y + height; // limit Y
                const lX = x + width; // limit X

                let sW = lX - (pX - _wcl.scrollX - dX); // selection width
                let sH = lY - (pY - dY - _wcl.scrollY);

                if (aspectRatio === 0) {
                    // free
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (lX - sW < 0) {
                        sW = lX;
                    }

                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (lY - sH < 0) {
                        sH = lY;
                    }
                } else if (aspectRatio <= 1) {
                    // Landscape (width > height or 1:1)
                    sW = Math.max(sW, sH);
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (lX - sW < 0) {
                        sW = lX;
                    }

                    sH = sW * aspectRatio;
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                        sW = sH / aspectRatio;
                    } else if (lY - sH < 0) {
                        sH = lY;
                        sW = sH / aspectRatio;
                    }
                } else {
                    // Portrait (width < height)
                    sH = Math.max(sW, sH);
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (lY - sH < 0) {
                        sH = lY;
                    }

                    sW = sH / aspectRatio;
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                        sH = sW * aspectRatio;
                    } else if (lX - sW < 0) {
                        sW = lX;
                        sH = sW * aspectRatio;
                    }
                }

                const sX = lX - sW;
                const sY = lY - sH;

                this.refresh({ x: sX, y: sY, width: sW, height: sH });
                break;
            }

            case 'resizeLB': {
                const lX = x + width; // limit X
                const sY = y;
                const deltaY = height - dY;

                let sW = lX - (pX - _wcl.scrollX - dX); // selection width
                let sH = pY - _wcl.scrollY + deltaY - sY; // selection height

                if (aspectRatio === 0) {
                    // free
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (lX - sW < 0) {
                        sW = lX;
                    }

                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                    }
                } else if (aspectRatio <= 1) {
                    // Landscape (width > height or 1:1)
                    sW = Math.max(sW, sH);
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                    } else if (lX - sW < 0) {
                        sW = lX;
                    }

                    sH = sW * aspectRatio;
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                        sW = sH / aspectRatio;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                        sW = sH / aspectRatio;
                    }
                } else {
                    // Portrait (width < height)
                    sH = Math.max(sW, sH);
                    if (sH < selectionMinSize) {
                        sH = selectionMinSize;
                    } else if (sY + sH > vH) {
                        sH = vH - sY;
                    }

                    sW = sH / aspectRatio;
                    if (sW < selectionMinSize) {
                        sW = selectionMinSize;
                        sH = sW * aspectRatio;
                    } else if (lX - sW < 0) {
                        sW = lX;
                        sH = sW * aspectRatio;
                    }
                }

                const sX = lX - sW;

                this.refresh({ x: sX, y: sY, width: sW, height: sH });
                break;
            }
        }
    },

    _onUp: function (evt) {
        const { selection } = this._nodes;

        if ((typeof evt.buttons !== 'undefined' && (evt.buttons & 1)) || !selection.dataset.action) {
            return;
        }

        this._data.controllerDD.abort();
        delete selection.dataset.action;
    },

    _onKeyDown: function (evt) {
        const { key, metaKey, ctrlKey, shiftKey } = evt;
        const { wrap, shortcuts, btnCloseShortcuts, selection } = this._nodes;

        if (!document.body.classList.contains('ext-img2Text-active')) {
            return;
        }

        switch (key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight': {
                evt.preventDefault();
                this.updateSelectionInfo();

                const { x, y, width, height } = this._data;
                const { width: vW, height: vH } = _wcl.getViewportSize();

                const deltaX = (key === 'ArrowLeft') ? -1 : (key === 'ArrowRight') ? 1 : 0;
                let sX = x + deltaX;
                if (sX < 0) {
                    sX = 0;
                } else if (sX + width > vW) {
                    sX = vW - width;
                }

                const deltaY = (key === 'ArrowUp') ? -1 : (key === 'ArrowDown') ? 1 : 0;
                let sY = y + deltaY;
                if (sY < 0) {
                    sY = 0;
                } else if (sY + height > vH) {
                    sY = vH - height;
                }

                this.refresh({ x: sX, y: sY, width, height });
                break;
            }
            case 'Escape':
                if (shortcuts.classList.contains('active')) {
                    btnCloseShortcuts.click();
                } else {
                    this._curtainCall();
                }
                break;
            case 'Enter':
                if (!/(input)|(textarea)/i.test(evt.target?.tagName)) {
                    this._capture({ afterAct: 'download' });
                }
            case 'c':
                if (metaKey || ctrlKey) {
                    // ctrl + c or cmd + c to copy image to clipboard
                    this._capture({ afterAct: 'clipboard' });
                }
                break;
            case 'f': {
                const { width: vW, height: vH } = _wcl.getViewportSize();
                const { isFullScreen, previous } = this._data;

                if (selection.dataset.action === 'dragging') {
                    return;
                }

                wrap.classList.add('transform');

                if (isFullScreen) {
                    this.refresh({ ...previous });
                    this._data.isFullScreen = false;
                } else {
                    const { x, y, width, height } = this.getSelectionInfo();

                    this._data.previous = { x, y, width, height };
                    this.refresh({ x: 0, y: 0, width: vW, height: vH });

                    this._data.isFullScreen = true;
                }
                break;
            }
            case '?':
                if (shiftKey) {
                    shortcuts.classList.add('active');
                }
                break;
        }
    },
    _draw: function ({ selectionInfo, image, afterAct = 'download' }) {
        const { canvas, sign } = this._nodes;
        const { x, y, width, height } = selectionInfo;
        const { width: vW, height: vH } = _wcl.getViewportSize();
        const ctx = canvas.getContext('2d');

        let captured = new Image();
        const destroy = () => {
            captured.onload = null;
            captured.onerror = null;
            captured.src = null;
            captured = null;
        };
        captured.addEventListener('load',
            async function () {
                const { width: sW, height: sH } = this;
                const rW = sW / vW;
                const rH = sH / vH;
                const nX = x * rW;
                const nY = y * rH;
                const nW = width * rW;
                const nH = height * rH;

                canvas.width = nW;
                canvas.height = nH;

                ctx.clearRect(0, 0, nW, nH);
                ctx.drawImage(captured, nX, nY, nW, nH, 0, 0, nW, nH);

                const dataUrl = canvas.toDataURL();

                // afterAct
                if (afterAct === 'clipboard') {
                    //clipboard
                    try {
                        const data = await fetch(dataUrl);
                        const blob = await data.blob();
                        await navigator.clipboard.write([
                            new ClipboardItem({
                                [blob.type]: blob
                            })
                        ]);

                        sign.classList.add('act');
                        // console.log('Image copied.');
                    } catch (err) {
                        console.log(err.name, err.message);
                    }
                } else {
                    // download
                    chrome.runtime.sendMessage({ action: 'download', dataUrl });
                }

                destroy();
            }
        );
        captured.onerror = () => {
            destroy();
        };
        captured.src = image;
    },
    _capture: function ({ afterAct = 'download' }) {
        const selectionInfo = this.getSelectionInfo();

        this._curtainCall();

        // need to wait until selection style remove
        setTimeout(
            () => {
                chrome.runtime.sendMessage({ action: 'capture' },
                    ({ image }) => {
                        if (chrome.runtime.lastError) {
                            console.log('Error: ' + chrome.runtime.lastError.message);
                        }

                        this._draw({ selectionInfo, image, afterAct });
                    }
                );
            }
            , 100);
    },
    _onMessage: function (request, sender, sendResponse) {
        const { action } = request;

        switch (action) {
            case 'processImg':
                this.enviromentInit();

                // add event
                document.addEventListener('keydown', init._onKeyDown, true);

                document.body.classList.toggle('ext-img2Text-active');
                document.body.focus();
                break;
        }
    },
    _onAnimationend: function (evt) {
        const { sign } = this._nodes;
        const { animationName } = evt;

        if (sign.classList.contains('act') && animationName === 'ext-img2Text-sigh-show') {
            sign.classList.remove('act');
        }
    },
    _onResize: function (evt) {
        const { picker } = this._nodes;

        picker.blur();
        this._data.isFullScreen = false;
        this.refresh(this.rePosition());
    },
    _curtainCall: function () {
        const { btnCloseShortcuts } = this._nodes;

        // remove event
        document.removeEventListener('keydown', this._onKeyDown, true);

        btnCloseShortcuts.click();
        document.body.classList.remove('ext-img2Text-active');
    },
    _onCloseShortcuts: function (evt) {
        const { target } = evt;
        const { shortcuts } = this._nodes;

        evt.preventDefault();
        target.blur();
        shortcuts.classList.remove('active');
    },
    _onTransitionend: function (evt) {
        const { wrap } = this._nodes;

        if (wrap.classList.contains('transform')) {
            wrap.classList.remove('transform');
        }
    },
    _onContextmenu: function (evt) {
        const { picker, styleSheet } = this._nodes;
        const { picker: { width, height } } = this._data;
        const { x: pX, y: pY } = _wcl.pointer(evt);
        const { width: vW, height: vH } = _wcl.getViewportSize();
        let x = pX - _wcl.scrollX;
        let y = pY - _wcl.scrollY;

        evt.preventDefault();

        if (x + width > vW) {
            x = x - width;
        }

        if (y + height > vH) {
            y = y - height;
        }

        _wcl.addStylesheetRules('.aspect-ratio-picker--maneuver', {
            '--x': `${x}px`,
            '--y': `${y}px`
        }, styleSheet);

        picker.focus();
    },
    _onContextmenuClick: function (evt) {
        const { wrap, picker } = this._nodes;
        const target = evt.target.closest('a');
        let aspectRatio = 0;

        if (!target) {
            return;
        }

        evt.preventDefault();
        this._data.isFullScreen = false;

        const { width, height } = target.dataset;
        if (width && height) {
            aspectRatio = +height / +width;
        }
        this._data.aspectRatio = aspectRatio;

        picker.querySelector('.aspect-ratio-picker__a--checked').classList.remove('aspect-ratio-picker__a--checked');
        target.classList.add('aspect-ratio-picker__a--checked');

        wrap.classList.add('transform');
        this.refresh(this.rePosition());
        picker.blur();
    },

    _onUnload: function () {
        const { img2TextIt, sign } = this._nodes;

        // DOM
        img2TextIt.remove();
        sign.remove();

        // evts
        try {
            this._data.controllerG.abort();
            this._data.controllerDD.abort();
        } catch (err) {
            // some controllers might not init
        }
        this._evtList.forEach((evt) => this[evt] = null);

        // data
        _wcl.purgeObject(this._data);
        _wcl.purgeObject(this._nodes);
        _wcl.purgeObject(this._evtList);

        this._data = null;
        this._nodes = null;
        this._evtList = null;
    },
    _getConfig: function () {
        chrome.storage.sync.get(null,
            ({ sensorSize = defaults.sensorSize, selectionColor = defaults.selectionColor, overlayBgc = defaults.overlayBgc, overlayOpacity = defaults.overlayOpacity }) => {
                this._environmentSetting({
                    sensorSize,
                    selectionColor,
                    overlayBgc,
                    overlayOpacity,
                });
            }
        );
    },
    rePosition: function () {
        const { width: vW, height: vH } = _wcl.getViewportSize();
        const { selectionMinSize, aspectRatio } = this._data;
        let sW = Math.floor(vW / 2);
        let sH = Math.floor(vH / 2);
        let delta = Math.min(sW, sH);

        if (aspectRatio === 0) {
            // free
            if (sW < selectionMinSize) {
                sW = selectionMinSize;
            }

            if (sH < selectionMinSize) {
                sH = selectionMinSize;
            }
        } else if (aspectRatio <= 1) {
            // Landscape (width > height or 1:1)
            sW = delta;
            if (sW < selectionMinSize) {
                sW = selectionMinSize;
            }
            sH = sW * aspectRatio;
        } else {
            // Portrait (width < height)
            sH = delta;
            if (sH < selectionMinSize) {
                sH = selectionMinSize;
            }
            sW = sH / aspectRatio;
        }

        const sX = Math.floor((vW - sW) / 2);
        const sY = Math.floor((vH - sH) / 2);

        return {
            x: sX,
            y: sY,
            width: sW,
            height: sH
        };
    },

    enviromentInit: function () {
        if (document.querySelector('#ext-img2Text')) {
            return;
        }

        // data
        this._data = {
            ...defaults,
            controllerG: new AbortController(), // for global
            controllerDD: '', // for drag / drop evts
            pursuer: _wcl.pursuer()
        };

        this._getConfig();

        // DOM
        const img2TextIt = document.createElement('aside');
        img2TextIt.id = 'ext-img2Text';
        document.body.appendChild(img2TextIt);
        const shadowRoot = img2TextIt.attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        const sign = document.createElement('aside');
        sign.id = 'ext-img2Text-sign';
        document.body.appendChild(sign);
        const shadowRoot4Sign = sign.attachShadow({ mode: 'closed' });
        shadowRoot4Sign.appendChild(template4Sign.content.cloneNode(true));

        // shortcuts
        const shortcuts = shadowRoot.querySelector('keyboard-shortcut');
        const shadowRoot4Shortcuts = shortcuts.attachShadow({ mode: 'closed' });
        shadowRoot4Shortcuts.appendChild(template4Shortcuts.content.cloneNode(true));
        const btnCloseShortcuts = shadowRoot4Shortcuts.querySelector('.shortcuts__close');

        this._nodes = {
            img2TextIt,
            sign,
            signWrap: shadowRoot4Sign.querySelector('.wrap'),
            selection: shadowRoot.querySelector('.selection'),
            info: shadowRoot.querySelector('.selection__span'),
            wrap: shadowRoot.querySelector('.wrap'),
            canvas: document.createElement('canvas'),
            picker: shadowRoot.querySelector('.aspect-ratio-picker'),
            styleSheet: shadowRoot.querySelector('style'),
            overlay: shadowRoot.querySelector('.overlay'),
            shortcuts,
            btnCloseShortcuts
        };

        // selection rendering
        this.refresh(this.rePosition());

        // events
        const signal = this._data.controllerG.signal;
        this._nodes.selection.addEventListener(this._data.pursuer.down, this._onDown, { signal });
        this._nodes.selection.addEventListener('dblclick', this._capture, { signal });
        this._nodes.selection.addEventListener('contextmenu', this._onContextmenu, { signal });
        this._nodes.btnCloseShortcuts.addEventListener('click', this._onCloseShortcuts, { signal });
        this._nodes.overlay.addEventListener('click', this._curtainCall, { signal });
        this._nodes.signWrap.addEventListener('animationend', this._onAnimationend, { signal });
        this._nodes.wrap.addEventListener('transitionend', this._onTransitionend, { signal });
        this._nodes.picker.addEventListener('click', this._onContextmenuClick, { signal });

        window.addEventListener('resize', this._onResize, { signal });
        window.addEventListener('beforeunload', this._onUnload, { signal });

        // reset #ext-img2Text style
        _wcl.addStylesheetRules('#ext-img2Text,#ext-img2Text-sign', {
            padding: 0,
            margin: 0,
            background: 'transparent',
            width: 'auto',
            height: 'auto',
            float: 'none'
        });

        _wcl.addStylesheetRules('body.ext-img2Text-active', {
            'pointer-events': 'none'
        });

        _wcl.addStylesheetRules('body.ext-img2Text-active #ext-img2Text', {
            width: '100%',
            height: '100%',
            'pointer-events': 'auto',
            opacity: 1
        });
    },

    constructor: function () {
        // evts
        this._evtList = [
            '_getConfig',
            '_environmentSetting',
            '_capture',
            '_curtainCall',
            '_onDown',
            '_onMove',
            '_onUp',
            '_onKeyDown',
            '_onAnimationend',
            '_onResize',
            '_onCloseShortcuts',
            '_onUnload',
            '_onTransitionend',
            '_onContextmenu',
            '_onContextmenuClick',
            '_onMessage'
        ];
        this._evtList.forEach((evt) => this[evt] = this[evt].bind(this));

        chrome.runtime.onMessage.addListener(this._onMessage);
        chrome.storage.onChanged.addListener((changes) => this._getConfig());
    }
};

// wait until lib ready
navigator.whenDefined('_wcl').then(
    () => {
        init.constructor();
    },
    (err) => {
        console.error(err.message);
    }
);