(function () {
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
        sensorSize: 40,
        selectionColor: '#fefefe',
        overlayBgc: '#000000',
        overlayOpacity: .7
    };

    const init = {
        _data: {},
        _nodes: {},
        _refresh: function ({ sensorSize, selectionColor, overlayBgc, overlayOpacity } = this._data) {
            _wcl.addStylesheetRules('.img2Text-simulator--maneuver', {
                '--sensor-size': `${sensorSize}px`,
                '--selection-color': selectionColor,
                '--overlay-bgc': overlayBgc,
                '--overlay-opacity': overlayOpacity
            });
        },
        _setConfig: function () {
            chrome.storage.sync.get(null,
                ({ sensorSize = defaults.sensorSize, selectionColor = defaults.selectionColor, overlayBgc = defaults.overlayBgc, overlayOpacity = defaults.overlayOpacity }) => {
                    const { sensorSizeEle, selectionColorEle, overlayBgcEle, overlayOpacityEle } = this._nodes;
                    this._data = {
                        ...this._data,
                        sensorSize,
                        selectionColor,
                        overlayBgc,
                        overlayOpacity
                    };

                    sensorSizeEle.value = sensorSize;
                    selectionColorEle.value = selectionColor;
                    overlayBgcEle.value = overlayBgc;
                    overlayOpacityEle.value = overlayOpacity;

                    this._refresh();
                }
            );
        },
        _onClick: function (evt) {
            const host = evt.target.closest('a');

            if (!host) {
                return;
            }

            evt.preventDefault();
            const type = host.dataset.type;
            const { sensorSizeEle, selectionColorEle, overlayBgcEle, overlayOpacityEle } = this._nodes;
            const { sensorSize, selectionColor, overlayBgc, overlayOpacity } = defaults;

            switch (type) {
                case 'selection':
                    this._data = {
                        ...this._data,
                        sensorSize,
                        selectionColor
                    };

                    sensorSizeEle.value = sensorSize;
                    selectionColorEle.value = selectionColor;

                    chrome.storage.sync.set({
                        sensorSize: defaults.sensorSize,
                        selectionColor: defaults.selectionColor,
                    });
                    break;
                case 'overlay':
                    this._data = {
                        ...this._data,
                        overlayBgc,
                        overlayOpacity
                    };

                    overlayBgcEle.value = overlayBgc;
                    overlayOpacityEle.value = overlayOpacity;

                    chrome.storage.sync.set({
                        overlayBgc: defaults.overlayBgc,
                        overlayOpacity: defaults.overlayOpacity,
                    });
                    break;
            };

            this._refresh();
        },
        _onChange: function (evt) {
            const { target } = evt;
            const value = Number(target.value) || target.value;

            this._data[target.name] = value;
            chrome.storage.sync.set({ [target.name]: value });
            this._refresh();
        },
        constructor: function () {
            this._data = {
                ...defaults
            };

            this._nodes = {
                sensorSizeEle: document.querySelector('[name="sensorSize"]'),
                selectionColorEle: document.querySelector('[name="selectionColor"]'),
                overlayBgcEle: document.querySelector('[name="overlayBgc"]'),
                overlayOpacityEle: document.querySelector('[name="overlayOpacity"]')
            };

            // event
            this._setConfig = this._setConfig.bind(this);
            this._onChange = this._onChange.bind(this);
            this._onClick = this._onClick.bind(this);

            document.body.addEventListener('change', this._onChange);
            document.body.addEventListener('click', this._onClick);

            this._setConfig();
        }
    };

    navigator.whenDefined('_wcl').then(
        () => {
            init.constructor();
        },
        (err) => {
            console.error(err.message);
        }
    );
})();