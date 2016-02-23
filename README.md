This [OpenSeadragon](http://openseadragon.github.io/) plugin provides 
the capability to add filters to the images.

A demo is available [here](http://nist-isg.github.io/OpenSeadragonFiltering/).

This plugin requires OpenSeadragon 2.1+.

### Basic usage

Increase the brightness:
`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.BRIGHTNESS(50)
    }
});
`````

Decrease the brightness and invert the image:
`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: [
            OpenSeadragon.Filters.BRIGHTNESS(-50),
            OpenSeadragon.Filters.INVERT()
        ]
    }
});
`````

### Specify on which items (TiledImage) to apply the filters

Increase the brightness on item 0 and invert items 1 and 2:
`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: [{
        items: viewer.world.getItemAt(0),
        processors: [
            OpenSeadragon.Filters.BRIGHTNESS(50)
        ]
    }, {
        items: [viewer.world.getItemAt(1), viewer.world.getItemAt(2)],
        processors: [
            OpenSeadragon.Filters.INVERT()
        ]
    }]
});
`````
Note the items property. If it is not specified, the filter is applied to all
items.

### Load mode optimization

By default, the filters are applied asynchronously. This means that the tiles are
cleared from the canvas and re-downloaded (note that the browser probably cached
them though) before having the filter applied. This avoids to hang the browser
if the filtering operation is slow. It also allows to use asynchronous filters
like the ones provided by [CamanJS](http://camanjs.com).

However, if you have only fast and synchronous filters, you can force the
synchronous mode by setting `loadMode: 'sync'`:

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.BRIGHTNESS(50)
    },
    loadMode: 'sync'
});
`````

To visualize the difference between async and sync mode, one can compare how
the brightness (sync) and contrast (async) filters load in the
[demo](http://nist-isg.github.io/OpenSeadragonFiltering/).

### Provided filters

This plugin already include some filters which are accessible via
OpenSeadragon.Filters:

* Thresholding

Set all pixels equals or above the specified threshold to white and the others
to black. For colored images, the average of the 3 channels is compared to the
threshold. The specified threshold must be between 0 and 255.

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.THRESHOLDING(threshold)
    }
});
`````

* Brightness

Shift the intensity of the pixels by the specified adjustment
(between -255 and 255). 

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.BRIGHTNESS(adjustment)
    }
});
`````

* Invert

Invert the colors of the image.

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.INVERT()
    }
});
`````

* Morphological operations

[Erosion](https://en.wikipedia.org/wiki/Erosion_%28morphology%29)
and [dilation](https://en.wikipedia.org/wiki/Dilation_%28morphology%29)
over a square kernel are supported by the generic
[morphological operation](https://en.wikipedia.org/wiki/Mathematical_morphology)
filter

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: [
            // Erosion over a 3x3 kernel
            OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION(3, Math.min),

            // Dilation over a 5x5 kernel
            OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION(5, Math.max),
        ]
    }
});
`````

* Convolution

Apply a [convolution kernel](https://en.wikipedia.org/wiki/Kernel_%28image_processing%29#Convolution).

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: OpenSeadragon.Filters.CONVOLUTION([
            0, -1,  0,
           -1,  5, -1,
            0, -1,  0])
    }
});
`````

### Integration with CamanJS

[CamanJS](http://camanjs.com) supports a wide range of filters. They can be
reused with this plugin like this:

`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.setFilterOptions({
    filters: {
        processors: function(context, callback) {
            Caman(context.canvas, function() {
                this.sepia(50);
                this.vibrance(40);
                // Do not forget to call this.render with the callback
                this.render(callback);
            });
        }
    }
});
`````

Note: Caman is caching every canvas it processes. This causes two issues with
this plugin:
1. It creates a memory leak because OpenSeadragon creates a lot of canvases
which do not get garbage collected anymore.
2. Non-caman filters in between 2 camans filters get ignored.

There isn't any clean way to
[disable the cache system](https://github.com/meltingice/CamanJS/issues/185),
however one can use this hack to prevent any caching:

`````javascript
    Caman.Store.put = function() {};

    var viewer = new OpenSeadragon.Viewer(...);
    viewer.setFilterOptions({
        filters: {
            processors: [
                function(context, callback) {
                    Caman(context.canvas, function() {
                        this.sepia(50);
                        // Do not forget to call this.render with the callback
                        this.render(callback);
                    });
                },
                OpenSeadragon.Filters.INVERT(),
                function(context, callback) {
                    Caman(context.canvas, function() {
                        this.vibrance(40);
                        // Do not forget to call this.render with the callback
                        this.render(callback);
                    });
                }
            ]
        }
    });
`````

### Implementing customs filters

To implement a custom filter, one need to create a function taking a
[2D context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
and a callback as parameters. When that function is called by the plugin,
the context will be a tile's canvas context. One should use
[context.getImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
to retrieve the pixels values and
[context.putImageData](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData)
to save the modified pixels.
The callback method must be called when the filtering is done. The provided
filters are good examples for such implementations.

### Edge effects

This plugin is working on tiles and does not currently handle tiles edges.
This means that if you are using kernel based filters, you should expect
edge effects around tiles.

### Disclaimer:

This software was developed at the National Institute of Standards and
Technology by employees of the Federal Government in the course of
their official duties. Pursuant to title 17 Section 105 of the United
States Code this software is not subject to copyright protection and is
in the public domain. This software is an experimental system. NIST assumes
no responsibility whatsoever for its use by other parties, and makes no
guarantees, expressed or implied, about its quality, reliability, or
any other characteristic. We would appreciate acknowledgement if the
software is used.
