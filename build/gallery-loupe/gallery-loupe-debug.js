YUI.add('gallery-loupe', function(Y) {

/*global Y */
/**
 * Loupe - a photo magnification widget based on gallery-magnifier and yui-magnifier
 */

var YLang = Y.Lang,
    isNumber = YLang.isNumber,
    getCN = Y.ClassNameManager.getClassName,

    KLASS = 'Loupe',
    LOUPE = 'loupe',

    CLASSNAME = getCN(LOUPE, 'display'),
    HIDECLASS = getCN(LOUPE, 'hidden');

function Loupe(config) {
    Loupe.superclass.constructor.apply(this, arguments);
}

Y.Loupe = Y.extend(Loupe, Y.Widget, {
    // proto
    // CONTENT_TEMPLATE: null,

    // metadata cache
    _image: null,

    initializer: function (config) {
        this._image = {};
    },

    renderUI: function () {
        this._renderDisplay();
    },

    bindUI: function () {
        this._bindEvents();
    },

    syncUI: function () {
        var host = this.get('contentBox'),
            image = this._image;
        // TODO: move to htmlParser?
        image.width  = parseInt(host.getStyle('width'),  10);
        image.height = parseInt(host.getStyle('height'), 10);
        image.left = host.getX();
        image.top  = host.getY();
        image.right  = image.left + image.width;
        image.bottom = image.top + image.height;
    },

    destructor: function () {
        this._unbindEvents();
        this._destroyDisplay();
    },

    _bindEvents: function () {
        var host = this.get('contentBox'),
            display = this.get('display'),
            follow = this.get('follow');

        if (!follow) {
            this._MM = host.on('mousemove', this._moveViewport, this);
            this._MO = host.on('mouseout', function () {
                display.addClass(HIDECLASS);
            }, this);
            this._ME = host.on('mouseover', function () {
                display.removeClass(HIDECLASS);
            }, this);
        } else {
            this._ME = host.on('mouseover', function () {
                display.removeClass(HIDECLASS);
                this._MM = Y.one('body').on('mousemove', this._moveViewport, this);
            }, this);
        }
    },

    _unbindEvents: function () {
        if (this._MM) {
            this._MM.unbind();
        }
        if (this._MO) {
            this._MO.unbind();
        }
        if (this._ME) {
            this._ME.unbind();
        }
    },

    _destroyDisplay: function () {
        this.get('display').remove();
    },

    _renderDisplay: function () {
        var display = this.get('display'),
            height = this.get('height'),
            width = this.get('width'),
            img;

        if (!Y.Lang.isValue(display)) {
            display = Y.Node.create('<div></div>');
            this.set('display', display);
            this.get('contentBox').get('parentNode').append(display);
        }

        display.setContent('<div><img /></div>');

        img = display.one('img');

        if (Y.Lang.isValue(height)) {
            display.setStyle('height', height);
        }
        if (Y.Lang.isValue(width)) {
            display.setStyle('width', width);
        }

        display.setStyle('position', 'absolute');

        if (!this.get('follow')) {
            display.setXY([this.get('staticX'), this.get('staticY')]);
            display.one('div').setStyle('position', 'relative');
        } else {
            display.setXY([0, 0]);
        }

        display.addClass(CLASSNAME);

        this._configureImage();

        display.addClass(HIDECLASS);
    },

    _configureImage: function () {
        var magnificationFactor = this.get('zoom'),
            display = this.get('display'),
            host = this.get('contentBox'),
            img = display.one('img');

        img.set('src', host.get('src'));
        img.setStyles({
            height: this._image.height * magnificationFactor,
            width : this._image.width  * magnificationFactor
        });
    },

    _moveViewport: function (e) {
        var imageData = this._image,
            magnificationFactor = this.get('zoom'),
            display = this.get('display'),
            view = display.one('div'),
            x = e.pageX - imageData.left,
            y = e.pageY - imageData.top,
            heightMod = this.get('height') / 2,
            widthMod = this.get('width') / 2,
            newX = -x * magnificationFactor + heightMod,
            newY = -y * magnificationFactor + widthMod;

        if (e.pageX >= imageData.left && e.pageX <= imageData.right && e.pageY >= imageData.top && e.pageY <= imageData.bottom) {
            if (this.get('follow')) {
                display.setXY([e.pageX - widthMod, e.pageY - heightMod]);
            }
            view.setXY([newX, newY]);
        } else {
            display.addClass(HIDECLASS);
            this._MM.detach();
        }
    }

}, {

    NAME: 'loupe',

    NS: 'loupe',

    ATTRS: {
        srcNode: {
            validator: function (node) {
                if (!node.test('img')) {
                    Y.message("Can't be attached to this node.", 'warn', KLASS);
                    return false;
                }
                return true;
            }
        },
        follow: {
            value: false,
            validator: YLang.isBoolean
        },
        display: {
            writeOnce: true,
            setter: Y.one
        },
        height: {
            value: 100,
            validator: isNumber
        },
        width: {
            value: 100,
            validator: isNumber
        },
        zoom: {
            value: 2,
            validator: isNumber
        },
        staticX: {
            validator: isNumber
        },
        staticY: {
            validator: isNumber
        }
    }

});

/*global Y */
/**
 * Lens
 */
function Lens(config) {
    Lens.superclass.constructor.apply(this, arguments);
}
Lens.NAME = 'lens';
Lens.ATTRS = {
    imageSrc: {},
    loadingImageSrc: {},
    imageHeight: {
        value: 0
    },
    imageWidth: {
        value: 0
    },
    showDelay: {
        value: 0
    }
};

Lens.IMAGE_CLASS = Y.ClassNameManager.getClassName(Lens.NAME, 'image');
Lens.LOADING_IMAGE_CLASS = Y.ClassNameManager.getClassName(Lens.NAME, 'loading-image');

Lens.IMAGE_TEMPLATE = '<img class="' + Lens.IMAGE_CLASS + '" />';
Lens.LOADING_IMAGE_TEMPLATE = '<img class="' + Lens.LOADING_IMAGE_CLASS + '" />';

Lens.HTML_PARSER = {};

Y.Lens = Y.extend(Lens, Y.Overlay, {

    renderUI: function () {
        // styling we are dependent on
        this.get('contentBox').setStyles({
            'overflow': 'hidden',
            'position': 'relative'
        });

        this._renderLoadingImage();
        this._renderImage();
    },

    bindUI: function () {
        Y.on('load', Y.bind(this._onImageLoad, this), this.get('contentBox').one('.' + Lens.IMAGE_CLASS));
    },

    _renderLoadingImage: function () {
        var imageSrc, contentBox, image;

        imageSrc = this.get('loadingImageSrc');
        if (!imageSrc) {
            return;
        }

        contentBox = this.get('contentBox');
        image = contentBox.one('.' + Lens.LOADING_IMAGE_CLASS);
        if (!image) {
            image = Y.Node.create(Lens.LOADING_IMAGE_TEMPLATE);
            contentBox.appendChild(image);
        }

        image.set('src', imageSrc).setStyle('display', 'block');

        this.loadingImageNode = image;
    },

    _renderImage: function () {
        var contentBox = this.get('contentBox'),
            image = contentBox.one('.' + Lens.IMAGE_CLASS);

        if (!image) {
            image = Y.Node.create(Lens.IMAGE_TEMPLATE);
            contentBox.appendChild(image);

            //styling we are dependent on
            image.setStyle('position', 'absolute');
        }

        image.set('src', this.get('imageSrc'));

        if (this.get('loadingImageSrc')) {
            image.setStyle('display', 'none');
        } else {
            image.setStyle('display', 'block');
        }

        this.imageNode = image;
    },

    _onImageLoad: function (e) {
        var imageRegion = this.imageNode.get('region');

        //hide loading image, show main image
        this.loadingImageNode.setStyle('display', 'none');
        this.imageNode.setStyle('display', 'block');

        //set image dimensions
        this.imageWidth = imageRegion.right - imageRegion.left;
        this.imageHeight = imageRegion.bottom - imageRegion.top;
    },

    setOffsets: function (newLeft, newTop) {
        this.imageNode.setStyle('top', newTop + 'px');
        this.imageNode.setStyle('left', newLeft + 'px');
    },

    show: function () {
        var oThis = this;
        this.isShowPending = true;
        setTimeout(function () {
            if (oThis.isShowPending) {
                Lens.superclass.show.call(oThis);
            }
        }, this.get('showDelay'));
    },

    hide: function () {
        this.isShowPending = false;
        Lens.superclass.hide.call(this);
    }

});

/*global Y */
/**
 * CursorBox
 */
function CursorBox(config) {
    CursorBox.superclass.constructor.apply(this, arguments);
}
CursorBox.NAME = 'cursorBox';
CursorBox.ATTRS = {
    showDelay: {
        value: 0
    },
    parentElement: {},
    extendedBoundary: {}
};

Y.CursorBox = Y.extend(CursorBox, Y.Overlay, {
    _realWidth : 0,
    _realHeight: 0,

    renderUI: function () {},

    bindUI: function () {
        Y.on("mousemove", Y.bind(this._onMouseMove, this), document.body);
    },

    show: function () {
        var oThis = this;
        this.isShowPending = true;
        setTimeout(function () {
            if (oThis.isShowPending) {
                CursorBox.superclass.show.call(oThis);
            }
        }, this.get('showDelay'));
    },

    hide: function () {
        this.isShowPending = false;
        CursorBox.superclass.hide.call(this);
    },

    _onMouseMove: function (evt) {
        if (!(this.get('visible') || this.isShowPending)) {
            return false;
        }
        var coords = [evt.pageX, evt.pageY],
            boundaryRegion = this._getBoundary().get('region'),
            bbRegion = this.get('boundingBox').get('region'),

            width  = bbRegion.right - bbRegion.left,
            height = bbRegion.bottom - bbRegion.top,

            maxX = boundaryRegion.right  - (width  / 2),
            minX = boundaryRegion.left   + (width  / 2),
            maxY = boundaryRegion.bottom - (height / 2),
            minY = boundaryRegion.top    + (height / 2);

        if (coords[0] > maxX) { coords[0] = maxX; }
        if (coords[0] < minX) { coords[0] = minX; }
        if (coords[1] > maxY) { coords[1] = maxY; }
        if (coords[1] < minY) { coords[1] = minY; }

        this.setPosition(coords);
    },

    _getBoundary: function () {
        return this.get('extendedBoundary') || this.get('parentElement');
    },

    _setBoundaryVars: function () {
        this._boundaryRegion = this._boundary.get('region');
    },

    _afterParentElementChanged: function (el) {
        this._setBoundaryVars();
        this._parentRegion = this.get('parentElement').get('region');
    },

    _afterExtendedBoundaryChanged: function (el) {
        this._setBoundaryVars();
    },

    _setRealWidthAndHeight: function () {
        var region = this.get('boundingBox').get('region');
        this._realWidth  = region.right  - region.left;
        this._realHeight = region.bottom - region.top;
    },

    getOffsets: function () {
        var myRegion = this.get('boundingBox').get('region');
        return [myRegion.left - this._parentRegion.left, myRegion.top - this._parentRegion.top];
    },

    setPosition: function (coords) {
        var bbRegion = this.get('boundingBox').get('region'),
            width  = bbRegion.right  - bbRegion.left,
            height = bbRegion.bottom - bbRegion.top,
            x = coords[0] - (width  / 2),
            y = coords[1] - (height / 2);

        this.move(x, y);
    }

});


}, '@VERSION@' ,{skinnable:true, requires:['node', 'widget']});
