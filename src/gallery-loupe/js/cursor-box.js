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
