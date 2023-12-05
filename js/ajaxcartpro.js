var AW_AjaxCartProConfig = {
    actionsObservers: {},
    targetsToUpdate: {},
    data: {},
    addUpdater: function(a) {
        this.targetsToUpdate[a.name] = a
    },
    addObserver: function(a) {
        this.actionsObservers[a.name] = a
    },
    addSystemData: function(a) {
        Object.extend(this.data, a)
    }
};
var AW_AjaxCartPro = {
    config: AW_AjaxCartProConfig,
    init: function(a) {
        this.connector = AW_AjaxCartProConnector;
        this.ui = AW_AjaxCartProUI;
        this.config.addSystemData(a);
        this.startObservers()
    },
    registerUpdater: function(a) {
        this.config.addUpdater(a)
    },
    registerObserver: function(a) {
        this.config.addObserver(a)
    },
    startObservers: function(b) {
        var c = this;
        if (Object.isString(b)) {
            var a = this.config.actionsObservers[b];
            if (a) {
                a.run()
            }
        } else {
            if (typeof(this.config.actionsObservers) == "object") {
                Object.keys(this.config.actionsObservers).each(function(d) {
                    c.config.actionsObservers[d].run()
                })
            }
        }
    },
    stopObservers: function(b) {
        var c = this;
        if (Object.isString(b)) {
            var a = this.config.actionsObservers[b];
            if (a) {
                a.stop()
            }
        } else {
            if (typeof(this.config.actionsObservers) == "object") {
                Object.keys(this.config.actionsObservers).each(function(d) {
                    c.config.actionsObservers[d].stop()
                })
            }
        }
    },
    callUpdaters: function(c) {
        var a = this;
        var c = c || {};
        var b = true;
        this.ui.beforeUpdate(a.msg);
        Object.keys(c).each(function(f) {
            if (!b || c[f] === null) {
                return
            }
            var d = true;
            try {
                d = a.config.targetsToUpdate[f].update(c[f])
            } catch (g) {
                d = false;
                if (window.console) {
                    console.log(g.name)
                }
            }
            b = b && d
        });
        this.ui.afterUpdate(a.msg);
        delete a.msg;
        return b
    },
    fire: function(b, d, a) {
        if (b.indexOf("?") != -1) {
            this.stopObservers();
            window.location = b;
            return
        }
        if ($("shopping-cart-table") != null) {
            if (a.name == "clickOnAddToCartInCategoryList") {
                this.stopObservers();
                var e = $$("button.btn-continue").first();
                e.click();
                return
            }
        }
        if ($("out-of-stock-sub") != null) {
            if ($("out-of-stock-sub").visible()) {
                this.stopObservers();
                document.getElementById("product_addtocart_form").submit();
                return
            }
        }
        var c = this;
        this.ui.observer = a;
        this.ui.beforeFire();
        var d = d || {};
        d["block[]"] = [];
        Object.keys(c.config.targetsToUpdate).each(function(f) {
            if (c.config.targetsToUpdate[f].updateOnActionRequest) {
                d["block[]"].push(f)
            }
        });
        this.connector.sendRequest(b, d, function(g) {
            if (g.has_optional_selection === true) {
                a.fireOriginal(b, d);
                return;
            }
            var f = Object.values(g.block).without(null).length > 0;
            if (f) {
                var h = c.callUpdaters(g.block);
                if (!h) {
                    document.location.reload();
                    return;
                }
                c.stopObservers();
                c.startObservers();
                if (g.has_optional_selection == false ) {
                    c.ui.blocks.options._addToCartBtnOnClick(a);
                }
                return;
            }
            if (g.redirect_to) {
                c.msg = g.msg;
                c.fire(g.redirect_to, d, a);
                return;
            }
            c.update(function(i) {
                document.location.reload()
            }, {
                actionData: Object.toJSON(g.action_data)
            })
        }, function(f) {
            a.fireOriginal(b, d)
        })
    },
    update: function(c, a) {
        var e = this;
        c = c || function() {};
        var b = document.location.href;
        var d = a;
        d["block[]"] = [];
        Object.keys(e.config.targetsToUpdate).each(function(f) {
            if (e.config.targetsToUpdate[f].updateOnUpdateRequest) {
                d["block[]"].push(f)
            }
        });
        this.connector.sendRequest(b, d, function(f) {
            var g = e.callUpdaters(f.block);
            if (!g) {
                c(f);
                return
            }
            e.stopObservers();
            e.startObservers();
            e.ui.afterFire(d)
        }, c)
    }
};
var AW_AjaxCartProConnector = {
    defaultParameters: {
        awacp: 1
    },
    sendRequest: function(c, e, f, b) {
        var d = this;
        var e = e || {};
        var b = b || function() {};
        var f = f || function() {};
        Object.extend(e, this.defaultParameters);
        var a = {
            parameters: e,
            onSuccess: this.onSuccessFn(f, b),
            onFailure: this.onFailureFn(f, b)
        };
        c = c.replace(/http[^:]*:/, document.location.protocol);
        new Ajax.Request(c, a)
    },
    onSuccessFn: function(success, failure) {
        return function(transport) {
            try {
                eval("var json = " + transport.responseText + " || {}")
            } catch (e) {
                failure({});
                return
            }
            if (!json.success) {
                failure(json);
                return
            }
            success(json)
        }
    },
    onFailureFn: function(b, a) {
        return function(c) {
            a(json)
        }
    }
};
var AW_AjaxCartProUI = {
    observer: null,
    blocks: {},
    config: AW_AjaxCartProConfig.data,
    hideCls: "ajaxcartpro-box-hide",
    showCls: "ajaxcartpro-box-show",
    overlayCssSelector: "#acp-overlay",
    beforeFire: function() {
        return this._call("beforeFire", arguments)
    },
    afterFire: function() {
        return this._call("afterFire", arguments)
    },
    beforeUpdate: function(a) {
        return this._call("beforeUpdate", arguments)
    },
    afterUpdate: function() {
        return this._call("afterUpdate", arguments)
    },
    registerBlock: function(a) {
        var a = a || {};
        if (!a.name) {
            return
        }
        this.blocks[a.name] = a
    },
    showBlock: function(b) {
        b = this._initEl(b);
        if (!b) {
            return false
        }
        var c = this._collectPos(b, "center", this.config.dialogsVAlign);
        if (c[0] < 50) {
            c[0] = 50;
            b.setStyle({
                width: (document.viewport.getWidth() - 100) + "px"
            })
        }
        if (c[1] < 50) {
            c[1] = 50;
            b.setStyle({
                height: (document.viewport.getHeight() - 100) + "px"
            })
        }
        b.setStyle({
            left: c[0] + "px",
            top: c[1] + "px"
        });
        this._show(b);
        var a = $$(this.overlayCssSelector)[0];
        this._show(a);
        return true
    },
    updatePosition: function(a) {
        a = this._initEl(a);
        if (!a) {
            return false
        }
        var b = this._collectPos(a, "center", this.config.dialogsVAlign);
        if (b[0] < 50) {
            b[0] = 50;
            a.setStyle({
                width: (document.viewport.getWidth() - 100) + "px"
            })
        }
        if (b[1] < 50) {
            b[1] = 50;
            a.setStyle({
                height: (document.viewport.getHeight() - 100) + "px"
            })
        }
        a.setStyle({
            left: b[0] + "px",
            top: b[1] + "px"
        });
        return true
    },
    hideBlock: function(b) {
        b = this._initEl(b);
        if (!b) {
            return false
        }
        b.setStyle({
            height: "auto",
            width: "auto"
        });
        var c = this;
        var d = 0;
        Object.keys(c.blocks).each(function(e) {
            var f = c.blocks[e];
            if (f.enabled === true) {
                d++
            }
        });
        if (d === 0) {
            var a = $$(this.overlayCssSelector)[0];
            this._hide(a)
        }
        this._hide(b);
        return true
    },
    _call: function(d, b) {
        var c = this;
        Object.keys(c.blocks).each(function(e) {
            if (c.observer.uiBlocks.indexOf(e) === -1) {
                return
            }
            var f = c.blocks[e];
            if (typeof(f[d]) == "function") {
                f[d](b)
            }
        });
        var a = true;
        Object.keys(c.blocks).each(function(e) {
            if (!a) {
                return
            }
            var f = c.blocks[e];
            if (f.enabled === true) {
                a = a && c.showBlock(f.cssSelector)
            } else {
                a = a && c.hideBlock(f.cssSelector)
            }
        });
        return a
    },
    _show: function(a) {
        a.removeClassName(this.hideCls);
        a.addClassName(this.showCls)
    },
    _hide: function(a) {
        if (a.className == 'grouped-items-table-wrapper') {
            debugger;
        }
        a.removeClassName(this.showCls);
        a.addClassName(this.hideCls)
    },
    _initEl: function(a) {
        if (Object.isString(a)) {
            a = $$(a);
            if (a.length > 0) {
                a = a[0]
            } else {
                return false
            }
        }
        a = $(a);
        if (!a) {
            return false
        }
        return a
    },
    _collectPos: function(a, b, c) {
        var g, f;
        var h = a.getWidth();
        var e = document.viewport.getWidth();
        switch (b) {
            case "center":
                g = e / 2 - h / 2;
                break;
            case "left":
                g = 50;
                break;
            case "right":
                g = e - h;
                break;
            default:
        }
        var d = a.getHeight();
        var i = document.viewport.getHeight();
        switch (c) {
            case "top":
                f = 50;
                break;
            case "center":
                f = i / 2 - d / 2;
                break;
            case "bottom":
                f = i - d;
                break;
            default:
        }
        return [g, f]
    }
};
var AW_AjaxCartProObserver = Class.create();
AW_AjaxCartProObserver.prototype = {
    name: null,
    uiBlocks: [],
    initialize: function(a) {
        this.name = a
    },
    run: function() {
        return
    },
    stop: function() {
        return
    },
    fireOriginal: function(a, b) {
        document.location.href = a;
        return
    },
    fireCustom: function(a, b) {
        var b = b || {};
        AW_AjaxCartPro.fire(a, b, this)
    }
};
var AW_AjaxCartProUpdater = Class.create();
AW_AjaxCartProUpdater.prototype = {
    config: AW_AjaxCartProConfig.data,
    selectors: null,
    parentSelector: null,
    name: null,
    initialize: function(a, b, c) {
        this.name = a;
        this.selectors = b || null;
        this.parentSelector = c || null
    },
    beforeUpdate: function(a) {
        return
    },
    afterUpdate: function(a) {
        return
    },
    update: function(b) {
        this.beforeUpdate(b);
        var c = this;
        var a = this.selectors;
        if (a === null) {
            a = this._getRootSelectors(b)
        }
        var d = new Element("div");
        d.innerHTML = b;
        if (d.childElements().length != a.length && d.childElements().length > 0) {
            return false
        }
        if (!this._checkSelectorsOnUnique(a)) {
            return false
        }
        a.each(function(f) {
            var e = d.select(f)[0];
            var g = null;
            c._getSelectorsToTarget(f).each(function(h) {
                if (g !== null) {
                    return
                }
                if ($$(h).length > 0) {
                    g = $$(h)[0]
                }
            });
            if (!g) {
                return
            }
            if (!e) {
                g.parentNode.removeChild(g);
                return
            }
            g.parentNode.replaceChild(e, g)
        });
        delete d;
        this._evalScripts(b);
        this.afterUpdate(b, a);
        return true
    },
    _getRootSelectors: function(b) {
        var c = new Element("div");
        c.innerHTML = b;
        var a = [];
        c.childElements().each(function(d) {
            a.push(this._getCssSelectorsByElement(d))
        }, this);
        delete c;
        return a
    },
    _checkSelectorsOnUnique: function(a) {
        var b = true;
        a.each(function(e) {
            var d = this._getSelectorsToTarget(e);
            var c = null;
            d.each(function(f) {
                if (c !== null) {
                    return
                }
                if ($$(f) > 0) {
                    c = $$(f)[0]
                }
            });
            if ($$(c).length > 1) {
                b = false
            }
        }, this);
        return b
    },
    _getSelectorsToTarget: function(a) {
        var b = [];
        if (this.parentSelector !== null) {
            this.parentSelector.each(function(d) {
                var c = d + " " + a;
                b.push(c)
            })
        } else {
            b.push(a)
        }
        return b
    },
    _getCssSelectorsByElement: function(b) {
        b = $(b);
        var a = b.tagName.toLowerCase();
        var c = a;
        $H({
            id: "id",
            className: "class"
        }).each(function(g) {
            var f = g.first(),
                d = g.last(),
                e = (b[f] || "").toString();
            if (e) {
                if (d === "id") {
                    c += "#" + e
                } else {
                    e = e.split(" ").join(".");
                    c += "." + e
                }
            }
        });
        return c
    },
    _evalScripts: function(html) {
        var scripts = html.extractScripts();
        scripts.each(function(script) {
            try {
                script = script.replace("//<![CDATA[", "").replace("//]]>", "");
                script = script.replace("/*<![CDATA[*/", "").replace("/*]]>*/", "");
                eval(script.replace(/var /gi, ""))
            } catch (e) {
                if (window.console) {
                    console.log(e.message)
                }
            }
        })
    }
};
var AW_AjaxCartProUIBlocks = [{
    cssSelector: "#ajaxcartpro-progress",
    name: "progress",
    enabled: false,
    beforeFire: function(a) {
        if (!AW_AjaxCartPro.config.data.useProgress) {
            return
        }
        this.enabled = true
    },
    afterFire: function(a) {},
    beforeUpdate: function(a) {},
    afterUpdate: function(a) {
        this.enabled = false
    }
}, {
    name: "add_confirmation",
    cssSelector: "#ajaxcartpro-add-confirm",
    enabled: false,
    beforeFire: function(a) {
        this.enabled = false
    },
    afterFire: function(a) {
        if (!AW_AjaxCartPro.config.data.addProductConfirmationEnabled) {
            return
        }
        this.enabled = true;
        this._cntBtnInit()
    },
    beforeUpdate: function(a) {},
    afterUpdate: function(a) {},
    _cntBtnInit: function() {
        var a = $$(this.cssSelector)[0].select(".aw-acp-continue")[0];
        if (!a) {
            return
        }
        a.stopObserving("click", this._cntBtnOnClick.bind(this));
        a.observe("click", this._cntBtnOnClick.bind(this));
        if (AW_AjaxCartPro.config.data.addProductCounterBeginFrom > 0) {
            this._initCounterForBtn(a, AW_AjaxCartPro.config.data.addProductCounterBeginFrom)
        }
    },
    _cntBtnOnClick: function(a) {
        this.enabled = false;
        AW_AjaxCartProUI.hideBlock(this.cssSelector);
        a.stop()
    },
    _initCounterForBtn: function(e, a) {
        var d = e.innerHTML;
        e.innerHTML = d + " (" + a + ")";
        var c = setInterval(function() {
            a--;
            if (a === 0) {
                e.click()
            }
            e.innerHTML = d + " (" + a + ")"
        }, 1000);
        var b = function(f) {
            clearInterval(c);
            e.stopObserving("click", this.bind(this))
        };
        e.observe("click", b.bind(b))
    }
}, {
    name: "remove_confirmation",
    cssSelector: "#ajaxcartpro-remove-confirm",
    enabled: false,
    beforeFire: function(a) {
        this.enabled = false
    },
    afterFire: function(a) {
        if (!AW_AjaxCartPro.config.data.removeProductConfirmationEnabled) {
            return
        }
        this.enabled = true;
        this._cntBtnInit()
    },
    beforeUpdate: function(a) {},
    afterUpdate: function(a) {},
    _cntBtnInit: function() {
        var a = $$(this.cssSelector)[0].select(".aw-acp-continue")[0];
        if (!a) {
            return
        }
        a.stopObserving("click", this._cntBtnOnClick.bind(this));
        a.observe("click", this._cntBtnOnClick.bind(this));
        if (AW_AjaxCartPro.config.data.removeProductCounterBeginFrom > 0) {
            this._initCounterForBtn(a, AW_AjaxCartPro.config.data.removeProductCounterBeginFrom)
        }
    },
    _cntBtnOnClick: function(a) {
        this.enabled = false;
        AW_AjaxCartProUI.hideBlock(this.cssSelector);
        a.stop()
    },
    _initCounterForBtn: function(e, a) {
        var d = e.innerHTML;
        e.innerHTML = d + " (" + a + ")";
        var c = setInterval(function() {
            a--;
            if (a === 0) {
                e.click()
            }
            e.innerHTML = d + " (" + a + ")"
        }, 1000);
        var b = function(f) {
            clearInterval(c);
            e.stopObserving("click", this.bind(this))
        };
        e.observe("click", b.bind(b))
    }
}, {
    name: "options",
    rootCssSelector: "#acp-configurable-block",
    cssSelector: "#acp-product-options",
    enabled: false,
    beforeFire: function(a) {},
    afterFire: function(a) {},
    beforeUpdate: function(a) {},
    afterUpdate: function(a) {
        var b = $$(this.cssSelector);
        if (b.length === 1) {
            this.enabled = true;
            var c = a[0];
            this._addMsgBlock(c);
            this._appearGroupedBlock();
            this._appearGiftBlock();
            this._cancelBtnInit();
            this._addToCartBtnInit()
        }
    },
    _addMsgBlock: function(b) {
        if (!b || !b.length || b.length < 1) {
            return
        }
        var a = $$(".acp-msg-block")[0];
        a.innerHTML = "";
        AW_AjaxCartProUI._show(a);
        b.each(function(d) {
            var c = new Element("li");
            c.innerHTML = d;
            a.appendChild(c)
        })
    },
    _appearGroupedBlock: function() {
        var a = ["div.grouped-items-table-wrapper", "table.grouped-items-table", "table#super-product-table"];
        var b = null;
        a.each(function(c) {
            if (b !== null) {
                return
            }
            b = $("acp-product-type-data").select(c);
            if (b.length === 0) {
                b = null;
                return
            }
            b = b[0]
        });
        AW_AjaxCartProUI._show($("acp-product-type-data"));
        $("acp-product-type-data").childElements().each(function(c) {
            if (c === b || c.tagName.toLocaleLowerCase() === "script") {
                return
            }
            AW_AjaxCartProUI._hide(c)
        });
        return
    },
    _appearGiftBlock: function() {
        var a = $("acp-product-type-data").select(".giftcard-send-form");
        if (a.length === 0) {
            return
        }
        a = a[0];
        AW_AjaxCartProUI._show($("acp-product-type-data"));
        AW_AjaxCartProUI._show(a.up());
        a.up().childElements().each(function(b) {
            if (b === a || b.tagName.toLocaleLowerCase() === "script") {
                return
            }
            AW_AjaxCartProUI._hide(b)
        });
        return
    },
    _cancelBtnInit: function() {
        var a = $$(this.cssSelector)[0].select(".aw-acp-continue")[0];
        a.stopObserving("click", this._cancelBtnOnClick.bind(this));
        a.observe("click", this._cancelBtnOnClick.bind(this))
    },
    _cancelBtnOnClick: function(a) {
        this._hideBlock();
        a.stop()
    },
    _addToCartBtnInit: function() {
        var a = $$(this.cssSelector)[0].select(".aw-acp-checkout")[0];
        a.stopObserving("click", this._addToCartBtnOnClick.bind(this));
        a.observe("click", this._addToCartBtnOnClick.bind(this))
    },
    _addToCartBtnOnClick: function(a) {
        if (productAddToCartFormAcp.validator && productAddToCartFormAcp.validator.validate()) {
            productAddToCartFormAcp.form.submit();
            this._hideBlock()
        }
        a.stop()
    },
    _hideBlock: function() {
        this.enabled = false;
        AW_AjaxCartProUI.hideBlock(this.cssSelector);
        $$(this.rootCssSelector)[0].down().remove()
    }
}];
AW_AjaxCartProUIBlocks.each(function(a) {
    AW_AjaxCartProUI.registerBlock(a)
});