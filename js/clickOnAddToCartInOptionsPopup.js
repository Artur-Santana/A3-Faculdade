var AW_AjaxCartProObserverObject=new AW_AjaxCartProObserver("clickOnAddToCartInOptionsPopup");Object.extend(AW_AjaxCartProObserverObject,{uiBlocks:["progress","options","add_confirmation"],_oldSubmitFn:null,run:function(){var a=this._getTargetObj();if(!a){return}this._oldSubmitFn=a.form.submit;a.form.submit=this._observeFn.bind(this);return},stop:function(){var a=this._getTargetObj();if(!a){return}a.form.submit=this._oldSubmitFn},fireOriginal:function(a,c){var b=this._getTargetObj();if(!b){return}this.stop();b.submit()},_observeFn:function(){var a=this._getTargetObj();if(!a){return}var b=a.form.readAttribute("action")||"";var c=a.form.serialize(true);this.fireCustom(b,c)},_getTargetObj:function(){var a=false;if(typeof(productAddToCartFormAcp)!="undefined"){a=productAddToCartFormAcp}if(!a){return false}return a}});AW_AjaxCartPro.registerObserver(AW_AjaxCartProObserverObject);delete AW_AjaxCartProObserverObject;