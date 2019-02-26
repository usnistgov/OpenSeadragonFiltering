/*
 * This software was developed at the National Institute of Standards and
 * Technology by employees of the Federal Government in the course of
 * their official duties. Pursuant to title 17 Section 105 of the United
 * States Code this software is not subject to copyright protection and is
 * in the public domain. This software is an experimental system. NIST assumes
 * no responsibility whatsoever for its use by other parties, and makes no
 * guarantees, expressed or implied, about its quality, reliability, or
 * any other characteristic. We would appreciate acknowledgement if the
 * software is used.
 */

/**
 *
 * @author Antoine Vandecreme <antoine.vandecreme@nist.gov>
 */

require('file-loader?name=[name].[ext]!./index.html');
require('style-loader?name=[name].[ext]!./style.css');


var $ = require('jquery');
require('webpack-jquery-ui');
require('webpack-jquery-ui/css');
var Spinner = require('./spinner');
var SpinnerSlider = require('./spinner-slider');

var OpenSeadragon = require('openseadragon');
require('../openseadragon-filtering');
var viewer = new OpenSeadragon({
    id: 'openseadragon',
    prefixUrl: 'images/',
    tileSources: '//openseadragon.github.io/example-images/highsmith/highsmith.dzi',
    crossOriginPolicy: 'Anonymous'
});

// Prevent Caman from caching the canvas because without this:
// 1. We have a memory leak
// 2. Non-caman filters in between 2 camans filters get ignored.
var caman = Caman;
caman.Store.put = function() {};

// List of filters with their templates.
var availableFilters = [
    {
        name: 'Invert',
        generate: function() {
            return {
                html: '',
                getParams: function() {
                    return '';
                },
                getFilter: function() {
                    /*eslint new-cap: 0*/
                    return OpenSeadragon.Filters.INVERT();
                },
                sync: true
            };
        }
    }, {
        name: 'Colorize',
        help: 'The adjustment range (strength) is from 0 to 100.' +
            'The higher the value, the closer the colors in the ' +
            'image shift towards the given adjustment color.' +
            'Color values are between 0 to 255',
        generate: function(updateCallback) {
            var redSpinnerId = 'redSpinner-' + idIncrement;
            var greenSpinnerId = 'greenSpinner-' + idIncrement;
            var blueSpinnerId = 'blueSpinner-' + idIncrement;
            var strengthSpinnerId = 'strengthSpinner-' + idIncrement;
            /*eslint max-len: 0*/
            var $html = $('<div class="wdzt-table-layout">' +
                '<div class="wdzt-row-layout">' +
                '    <div class="wdzt-cell-layout">' +
                '        Red: <span id="' + redSpinnerId + '"></span>' +
                '    </div>' +
                '    <div class="wdzt-cell-layout">' +
                '        Green: <span id="' + greenSpinnerId + '"></span>' +
                '    </div>' +
                '    <div class="wdzt-cell-layout">' +
                '        Blue: <span id="' + blueSpinnerId + '"></span>' +
                '    </div>' +
                '    <div class="wdzt-cell-layout">' +
                '        Strength: <span id="' + strengthSpinnerId + '"></span>' +
                '    </div>' +
                '</div>' +
                '</div>');
            var redSpinner = new Spinner({
                $element: $html.find('#' + redSpinnerId),
                init: 100,
                min: 0,
                max: 255,
                step: 1,
                updateCallback: updateCallback
            });
            var greenSpinner = new Spinner({
                $element: $html.find('#' + greenSpinnerId),
                init: 20,
                min: 0,
                max: 255,
                step: 1,
                updateCallback: updateCallback
            });
            var blueSpinner = new Spinner({
                $element: $html.find('#' + blueSpinnerId),
                init: 20,
                min: 0,
                max: 255,
                step: 1,
                updateCallback: updateCallback
            });
            var strengthSpinner = new Spinner({
                $element: $html.find('#' + strengthSpinnerId),
                init: 50,
                min: 0,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    var red = redSpinner.getValue();
                    var green = greenSpinner.getValue();
                    var blue = blueSpinner.getValue();
                    var strength = strengthSpinner.getValue();
                    return 'R: ' + red + ' G: ' + green + ' B: ' + blue +
                        ' S: ' + strength;
                },
                getFilter: function() {
                    var red = redSpinner.getValue();
                    var green = greenSpinner.getValue();
                    var blue = blueSpinner.getValue();
                    var strength = strengthSpinner.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.colorize(red, green, blue, strength);
                            this.render(callback);
                        });
                    };
                }
            };
        }
    }, {
        name: 'Contrast',
        help: 'Range is from 0 to infinity, although sane values are from 0 ' +
            'to 4 or 5. Values between 0 and 1 will lessen the contrast ' +
            'while values greater than 1 will increase it.',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 1.3,
                min: 0,
                sliderMax: 4,
                step: 0.1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.CONTRAST(
                        spinnerSlider.getValue());
                },
                sync: true
            };
        }
    }, {
        name: 'Exposure',
        help: 'Range is -100 to 100. Values < 0 will decrease ' +
            'exposure while values > 0 will increase exposure',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 10,
                min: -100,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.exposure(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Gamma',
        help: 'Range is from 0 to infinity, although sane values ' +
            'are from 0 to 4 or 5. Values between 0 and 1 will ' +
            'lessen the contrast while values greater than 1 will increase it.',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 0.5,
                min: 0,
                sliderMax: 5,
                step: 0.1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return OpenSeadragon.Filters.GAMMA(value);
                }
            };
        }
    }, {
        name: 'Hue',
        help: 'hue value is between 0 to 100 representing the ' +
            'percentage of Hue shift in the 0 to 360 range',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 20,
                min: 0,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.hue(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Saturation',
        help: 'saturation value has to be between -100 and 100',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 50,
                min: -100,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.saturation(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Vibrance',
        help: 'vibrance value has to be between -100 and 100',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 50,
                min: -100,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.vibrance(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Sepia',
        help: 'sepia value has to be between 0 and 100',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 50,
                min: 0,
                max: 100,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.sepia(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Noise',
        help: 'Noise cannot be smaller than 0',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 50,
                min: 0,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    var value = spinnerSlider.getValue();
                    return function(context, callback) {
                        caman(context.canvas, function() {
                            this.noise(value);
                            this.render(callback); // don't forget to call the callback.
                        });
                    };
                }
            };
        }
    }, {
        name: 'Greyscale',
        generate: function() {
            return {
                html: '',
                getParams: function() {
                    return '';
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.GREYSCALE();
                },
                sync: true
            };
        }
    }, {
        name: 'Sobel Edge',
        generate: function() {
            return {
                html: '',
                getParams: function() {
                    return '';
                },
                getFilter: function() {
                    return function(context, callback) {
                        var imgData = context.getImageData(
                            0, 0, context.canvas.width, context.canvas.height);
                        var pixels = imgData.data;
                        var originalPixels = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
                        var oneRowOffset = context.canvas.width * 4;
                        var onePixelOffset = 4;
                        var Gy, Gx;
                        var idx = 0;
                        for (var i = 1; i < context.canvas.height - 1; i += 1) {
                            idx = oneRowOffset * i + 4;
                            for (var j = 1; j < context.canvas.width - 1; j += 1) {
                                Gy = originalPixels[idx - onePixelOffset + oneRowOffset] + 2 * originalPixels[idx + oneRowOffset] + originalPixels[idx + onePixelOffset + oneRowOffset];
                                Gy = Gy - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - oneRowOffset] + originalPixels[idx + onePixelOffset - oneRowOffset]);
                                Gx = originalPixels[idx + onePixelOffset - oneRowOffset] + 2 * originalPixels[idx + onePixelOffset] + originalPixels[idx + onePixelOffset + oneRowOffset];
                                Gx = Gx - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - onePixelOffset] + originalPixels[idx - onePixelOffset + oneRowOffset]);
                                pixels[idx] = Math.sqrt(Gx * Gx + Gy * Gy); // 0.5*Math.abs(Gx) + 0.5*Math.abs(Gy);//100*Math.atan(Gy,Gx);
                                pixels[idx + 1] = 0;
                                pixels[idx + 2] = 0;
                                idx += 4;
                            }
                        }
                        context.putImageData(imgData, 0, 0);
                        callback();
                    };
                }
            };
        }
    }, {
        name: 'Brightness',
        help: 'Brightness must be between -255 (darker) and 255 (brighter).',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 50,
                min: -255,
                max: 255,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.BRIGHTNESS(
                        spinnerSlider.getValue());
                },
                sync: true
            };
        }
    }, {
        name: 'Erosion',
        help: 'The erosion kernel size must be an odd number.',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinner = new Spinner({
                $element: $html,
                init: 3,
                min: 3,
                step: 2,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinner.getValue();
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION(
                        spinner.getValue(), Math.min);
                }
            };
        }
    }, {
        name: 'Dilation',
        help: 'The dilation kernel size must be an odd number.',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinner = new Spinner({
                $element: $html,
                init: 3,
                min: 3,
                step: 2,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinner.getValue();
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION(
                        spinner.getValue(), Math.max);
                }
            };
        }
    }, {
        name: 'Thresholding',
        help: 'The threshold must be between 0 and 255.',
        generate: function(updateCallback) {
            var $html = $('<div></div>');
            var spinnerSlider = new SpinnerSlider({
                $element: $html,
                init: 127,
                min: 0,
                max: 255,
                step: 1,
                updateCallback: updateCallback
            });
            return {
                html: $html,
                getParams: function() {
                    return spinnerSlider.getValue();
                },
                getFilter: function() {
                    return OpenSeadragon.Filters.THRESHOLDING(
                        spinnerSlider.getValue());
                },
                sync: true
            };
        }
    }];
availableFilters.sort(function(f1, f2) {
    return f1.name.localeCompare(f2.name);
});

var idIncrement = 0;
var hashTable = {};

availableFilters.forEach(function(filter) {
    var $li = $('<li></li>');
    var $plus = $('<img src="images/plus.png" alt="+" class="button">');
    $li.append($plus);
    $li.append(filter.name);
    $li.appendTo($('#available'));
    $plus.click(function() {
        var id = 'selected_' + idIncrement++;
        var generatedFilter = filter.generate(updateFilters);
        hashTable[id] = {
            name: filter.name,
            generatedFilter: generatedFilter
        };
        var $li = $('<li id="' + id + '"><div class="wdzt-table-layout"><div class="wdzt-row-layout"></div></div></li>');
        var $minus = $('<div class="wdzt-cell-layout"><img src="images/minus.png" alt="-" class="button"></div>');
        $li.find('.wdzt-row-layout').append($minus);
        $li.find('.wdzt-row-layout').append('<div class="wdzt-cell-layout filterLabel">' + filter.name + '</div>');
        if (filter.help) {
            var $help = $('<div class="wdzt-cell-layout"><img src="images/help-browser-2.png" alt="help" title="' +
                filter.help + '"></div>');
            $help.tooltip();
            $li.find('.wdzt-row-layout').append($help);
        }
        $li.find('.wdzt-row-layout').append(
            $('<div class="wdzt-cell-layout wdzt-full-width"></div>')
            .append(generatedFilter.html));
        $minus.click(function() {
            delete hashTable[id];
            $li.remove();
            updateFilters();
        });
        $li.appendTo($('#selected'));
        updateFilters();
    });
});

$('#selected').sortable({
    containment: 'parent',
    axis: 'y',
    tolerance: 'pointer',
    update: updateFilters
});

function updateFilters() {
    var filters = [];
    var sync = true;
    $('#selected li').each(function() {
        var id = this.id;
        var filter = hashTable[id];
        filters.push(filter.generatedFilter.getFilter());
        sync &= filter.generatedFilter.sync;
    });
    viewer.setFilterOptions({
        filters: {
            processors: filters
        },
        loadMode: sync ? 'sync' : 'async'
    });
}

