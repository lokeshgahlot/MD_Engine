
/*

MD_NewClient.js
Created: 2013-04-17
Modified: 2014-01-21
Demo: 
Script Version: 3.1

@author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com

Known Issues:
*/

(function()
{
	var adId = window.ebAdID || 0;
	var rnd = ebRand;
	var uid = adId + "_" + rnd;
	var self = this;
	
	var customFormat = undefined;
	var cfg = undefined;
	var PIT = undefined;
	var displayWin = undefined;
	var customVars = undefined;
	var defaultPanel = undefined;
	var defaultPanelDiv = undefined;
	var isMac

	ebO.extensionHooks.push(function()
	{
		var createAdSubscription = new EBG.Events.EventSubscription(EBG.Events.EventNames.CREATE_AD, createAdHandler);
		createAdSubscription.timing = EBG.Events.EventTiming.BEFORE;
		EBG.eventMgr.subscribeToEvent(createAdSubscription);

		function createAdHandler(event)
		{
			if (event.eventData.adConfig.uid != uid) return;
			EBG.declareClass(CustomFormat, event.eventData.currentClass);
			event.eventData.currentClass = CustomFormat;
		}
	});


	function CustomFormat(adConfig)
	{
		var showAdSubscription = new EBG.Events.EventSubscription(EBG.Events.EventNames.SHOW_AD, handleShowAd);
		showAdSubscription.timing = EBG.Events.EventTiming.BEFORE;
		EBG.eventMgr.subscribeToEvent(showAdSubscription);
		
		customFormat = this;   
		cfg = adConfig;
		customVars = cfg;
		displayWin = EBG.adaptor.getDisplayWin();
		displayWin.gEbPIT = displayWin.gEbPIT || {};
		var isMac = EBG.adaptor.browser.isMac() || navigator.platform.indexOf("Mac") >0;
	
		PIT = displayWin.gEbPIT;
		PIT.subscriptions = PIT.subscriptions || {};
		EBG.callSuperConstructor(CustomFormat, customFormat, [cfg]);
		if(!customFormat._canShow() || cfg.showOnlyImage == 1) 
		{
			var defaultImg = EBG.adaptor.getElementById("ebDefaultImg_" + uid);
			return;
		}
		
		try{
		customFormat._subscribeToAdEvent(EBG.Events.EventNames.EXPAND, handlePanelExpand, EBG.Events.EventTiming.AFTER);
        customFormat._subscribeToAdEvent(EBG.Events.EventNames.COLLAPSE, handlePanelCollapse, EBG.Events.EventTiming.AFTER);
		}catch(e){}


		customFormat.public = {};
		customFormat.public.addJSEventListener 		= addJSEventListener;
		customFormat.public.removeJSEventListener 	= removeJSEventListener;
		customFormat.public.dispatchJSEvent 		= dispatchJSEvent;
		customFormat.public.changeZIndex 			= changeZIndex;
		customFormat.public.registerAsset 			= registerAsset;
		customFormat.public.clipAsset				= clipAsset;
		customFormat.public.unclipAsset				= unclipAsset;
		customFormat.public.modifyPanelDimension 	= modifyPanelDimension;
		customFormat.public.getListOfExpandedPanels = getListOfExpandedPanels;
		customFormat.public.resetRegisterAsset		= resetRegisterAsset;
		customFormat.public.log = log;
	
		try{
		defaultPanel = customFormat._panels[customFormat._defaultPanel.toLowerCase()];
		setDefault("mdDefaultPanelName", customFormat._defaultPanel.toLowerCase());
		}catch(e){}
		//customFormat._loadPanel(defaultPanel.name.toLowerCase()); 


		function handlePanelExpand(event)
		{
			dispatchJSEvent("PANEL_EXPANDED",{panelName:event.eventData.props.panel.name});
		}

		function handlePanelCollapse(event)
		{
			dispatchJSEvent("PANEL_COLLAPSED",{panelName:event.eventData.props.panel.name});
		}


		function handleShowAd(event)
		{
			if(event.dispatcher._adConfig.uid != uid) return;
			
			cfg.customJSVars = cfg.customJSVars || {};
			try{
			customFormat.panelFrequencyMgr.init(cfg.frequencyTimes, cfg.frequencyPeriod, cfg.adId, cfg.histLen, EBG.adaptor.optOut, cfg.disableAutoExpand);	
			// internal 
			setDefault("mdShouldAutoExpand", cfg.uponShow > 1 && customFormat.panelFrequencyMgr.shouldExpand());
			}catch(e){}

			setDefault("mdCustomJSPath", "EBG.ads['" + uid + "'].public.");		
			
			// events
			setDefault("mdAssetsReadyEvent", "assetsReadyEvent");
			
			// public 
			setDefault("mdEyeDivZIndex", undefined);
			setDefault("mdAutoRepositionInterval", 0);
			setDefault("mdAutoRepositionPanels", "");

			repositionFixForPanel(customVars.mdAutoRepositionPanels);
		}
		// ------------  PUBLIC METHODS  ------------ 

		function changeZIndex(zIndex, panelName)
		{
			if(adConfig && adConfig.panels)
			{
				if(panelName)
				{
					var id = cfg.panels[panelName].divId;
					var panel = EBG.adaptor.getElementById(id);
					if(panel) panel.style.zIndex = zIndex;
				}
				else
				{
					var eyeDiv = EBG.adaptor.getElementById(EBG.Const.OUTER_DIV);
					if(eyeDiv) eyeDiv.style.zIndex = zIndex;
				}
			}
		}

		function getListOfExpandedPanels()
		{
			var panels = "";
			if(adConfig && adConfig.panels)
			{
				for (var p in adConfig.panels) {
					var panel = adConfig.panels[p];
					if(panel.CC.isExpanded()) panels += panel.name +"$";
				};
			}
			if(panels != "") panels = panels.substring(0, panels.length -1);
			return panels;
		}
		
		//function modifyPanelDimension(x, y, width, height, panelName)
		function modifyPanelDimension(obj)
		{
			if(adConfig && adConfig.panels)
			{
				var panel = obj.panelName ? adConfig.panels[obj.panelName] : defaultPanel;
				if(!panel) return;
				var posObj = {};
				if(obj.x != undefined)
				{
					panel.CC.props.panel.left = obj.x;
					panel.CC.props.expand.left = obj.x;
					posObj.left = obj.x;
				}

				if(obj.y != undefined)
				{
					panel.CC.props.panel.top = obj.y;
					panel.CC.props.expand.top = obj.y;
					posObj.top = obj.y;
				}

				if(obj.width != undefined)
				{
					panel.CC.props.panel.width = obj.width;
					panel.CC.props.expand.width = obj.width;
					posObj.width = obj.width;
				}

				if(obj.height != undefined)
				{
					panel.CC.props.panel.height = obj.height;
					panel.CC.props.expand.height = obj.height;
					posObj.height = obj.height;
				}
				
				panel.CC.modifyPanel(posObj);
				var flashObj = EBG.adaptor.getElementById(panel.CC._flashResID);
				if (obj.width) flashObj.style.width = obj.width + "px";
	            if (obj.height) flashObj.style.height = obj.height + "px";
            }
		}


		function repositionFixForPanel(panelName)
		{
			if(panelName != "" && customVars.mdAutoRepositionInterval > 0)
			{
				var panels = panelName.split("$");
				self.setInterval(function() 
				{
					try{
						for (var i = 0; i < panels.length; i++) {
							var p = cfg.panels[panels[i]];
							//if(p && p.CC._panelVisible) p.CC.modifyPanel({top:p.yPos, left:p.xPos, width:p.width, height:p.height});
							if(p && p.CC._panelVisible) p.CC.recalculatePanelPosition();
						}
					}catch(e){}
				}, customVars.mdAutoRepositionInterval);
			}
		}

		function webkitRedrawFix(divToFix) {
            if (isMac && EBG.adaptor.browser.isSafari()) { 
                divToFix.style.opacity = '.99';
                var f = function() {
                    divToFix.style.opacity = '1';
                };
                setTimeout(f,1);
            }
        }
		
		function log(str)
		{
			try{if(console) console.log(str);}catch(e){}
		}

		function handlePageLoadedEvent(event)
		{
			 setTimeout(function () {
	                dispatchJSEvent("PAGE_LOADED");
	            }, 100);
		}

		if (EBG.adaptor.isPageLoaded()) handlePageLoadedEvent();
        else
        {
        	var pageLoadedSubscription = new EBG.Events.EventSubscription(EBG.Events.EventNames.PAGE_LOAD, handlePageLoadedEvent);
			pageLoadedSubscription.timing = EBG.Events.EventTiming.BEFORE;
            EBG.eventMgr.subscribeToEvent(pageLoadedSubscription);
        }

		function addJSEventListener(eventType, callbackID, interAd)
		{
			PIT.subscriptions[callbackID] = {};
			PIT.subscriptions[callbackID].eventType = eventType;
			PIT.subscriptions[callbackID].interAd = interAd;
		}

		function removeJSEventListener(callbackID)
		{
			for(var i in PIT.subscriptions) 
			{
				if(i == callbackID) 
				{
					PIT.subscriptions[i] = undefined;
					break;
				}
			}
		}

		function dispatchJSEvent(eventType, params)
		{
			for(var i in PIT.subscriptions)
			{
				var subscription = PIT.subscriptions[i];
				var isCurrentAd = i.match(rnd);
				var flashObj = EBG.adaptor.getElementById(i.split("||")[1]);
				params = params || {};
				params.type = eventType;
				params.source = {adId:adId, rnd:rnd};
				if(!subscription) continue;
				if(subscription.eventType != eventType) continue;
				if(!isCurrentAd && !subscription.interAd) continue;
				if(flashObj[i]) try{ flashObj[i](params) } catch(e) {};
			}
		}

		function resetRegisterAsset()
		{
			PIT.registeredAssets =  {};
		}

		function registerAsset(totalAssets, failTimeout) 
		{
				//if(PIT.registeredAssets == undefined) PIT.registeredAssets = {};

				PIT.registeredAssets = PIT.registeredAssets || {};
				PIT.registeredAssets.count  = PIT.registeredAssets.count || 1;
				if(PIT.registeredAssets.assetFail == undefined) PIT.registeredAssets.assetFail = false;
				else if(PIT.registeredAssets.assetFail) 
				{
					dispatchJSEvent (cfg.mdAssetsReadyEvent, {isLoaded:false});
					return;
				}
				
				function assetsFail()
				{
					if(PIT.registeredAssets.count > totalAssets) return;
					PIT.registeredAssets.assetFail = true;
					clearTimeout(PIT.registeredAssets.timeoutAssetFail);
					dispatchJSEvent (cfg.mdAssetsReadyEvent, {isLoaded:false});
				}
				
				if(PIT.registeredAssets.timeoutAssetFail == undefined) 
				{
					PIT.registeredAssets.timeoutAssetFail = setTimeout(assetsFail, parseInt(failTimeout * 1000));
				}
				
				if(PIT.registeredAssets.count == totalAssets && !PIT.registeredAssets.assetFail)
				{
					dispatchJSEvent (cfg.mdAssetsReadyEvent, {isLoaded:true});
				}
				PIT.registeredAssets.count++;
		}
	
		function clipAsset(x, y, width, height, panelName)
		{
			panelName = panelName || customFormat._defaultPanel;
			var clipTarget = EBG.adaptor.getElementById(customFormat._panels[panelName.toLowerCase()].divId);
					
			var clipLeft = x;
			var clipTop = y;
			var clipRight = clipLeft + width;
			var clipBottom = clipTop + height;
			EBG.adaptor.clip(clipTarget, clipTop, clipRight, clipBottom, clipLeft); 
			webkitRedrawFix(clipTarget);
		}

		function unclipAsset(panelName)
		{
			panelName = panelName || customFormat._defaultPanel;
			var clipTarget = EBG.adaptor.getElementById(customFormat._panels[panelName.toLowerCase()].divId);
			EBG.adaptor.unclip(clipTarget); 
		}

		// ------------  PRIVATE METHODS  ------------  
		function alignDefaultPanel(event)
		{	
		}

		function setDefault(settingName, defaultValue)
		{
			var value = customVars.hasOwnProperty(settingName) ? customVars[settingName] : defaultValue;
			if (value == "true") value = true;
			if (value == "false") value = false;
			if (value == "undefined") value = undefined;
			customVars[settingName] = value;
			customVars.customJSVars[settingName] = value;
		}
	}
})();