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

