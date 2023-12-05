var AW_AjaxCartProObserverObject = new AW_AjaxCartProObserver("clickOnAddToCartInCategoryList");
Object.extend(AW_AjaxCartProObserverObject, {
    uiBlocks: ["progress", "options", "add_confirmation"],
    _oldSetLocation: null,
    run: function() {
        this._oldSetLocation = setLocation;
        setLocation = this._observeFn.bind(this)
    },
    stop: function() {
        setLocation = this._oldSetLocation
    },
    fireOriginal: function(a, b) {
        this._oldSetLocation(a)
    },
    _observeFn: function(b) {
        var a = AW_AjaxCartProConfig.data.mageVersion.split(".");
        var c = (a[0] < 2 && a[1] < 5);
        if ((b.indexOf("options=cart") !== -1) || (b.indexOf("checkout/cart/add") !== -1) || ((b.indexOf("wishlist/index/cart") !== -1) && !c) || (b.indexOf("limit=") < 0 && b.indexOf("dir=") < 0 &&  (b.indexOf('slider-') == -1) && (b.indexOf('price-') == -1)) || (b.indexOf("limit=") < 0 && b.indexOf("order=") < 0 && (b.indexOf('slider-') == -1) && (b.indexOf('price-') == -1)) ) {
            this.fireCustom(b)
        } else {
            this.fireOriginal(b)
        }
    }
});
AW_AjaxCartPro.registerObserver(AW_AjaxCartProObserverObject);
delete AW_AjaxCartProObserverObject;
