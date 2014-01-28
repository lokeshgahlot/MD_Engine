/*


MD_OldClient.js
Created: 2013-04-09
Modified: 2013-12-27
Script Version: 2.2

@author Lokesh Gahlot || Synechron Inc.
Known Issues:

*/

function ebCCustomEventHandlers()
{
	var ebEventHandlers = this;
	var adId = window.ebAdID || 0;
	var rnd = ebRand;
	var uid = adId + "_" + rnd;

	var customFormat = undefined;
	var du = undefined;
	var PIT = undefined;
	var displayWin = undefined;
	var customVars = undefined;
	var defaultPanel = undefined;
	var defaultPanelDiv = undefined;
	var shouldAdAutoExpend = undefined;

	ebEventHandlers.onAfterDefaultBannerShow = function (objName){customFormat = new CustomFormat(eval(objName))};
	ebEventHandlers.onBeforePanelShow = function (objName, panelName){customFormat.public.handlePanelExpand(panelName)};
	ebEventHandlers.onBeforePanelHide  = function (objName, panelName){customFormat.public.handlePanelCollapse(panelName)};
	ebEventHandlers.onHandleInteraction = function (objName, interactionName, resID){if(customFormat) customFormat.public.handleInteraction(interactionName);};

	function CustomFormat(displayUnit)
	{
		customFormat = this;
		du = displayUnit;
		displayWin = gEbDisplayPage.TI.getWin();
		customVars = du.ad;
		displayWin.gEbPIT = displayWin.gEbPIT || {};
		PIT = displayWin.gEbPIT;
		PIT.ads = PIT.ads || {};
		PIT.ads[uid] = this;
		PIT.subscriptions = PIT.subscriptions || {};
		customVars.customJSVars = customVars.customJSVars || {};

		if (du.adData.fShowOnlyImage) return;

		// internal 
		try{
		setDefault("mdShouldAutoExpand", du.shouldAdAutoExpend() && du.ad.nUponShow > 1);
		} catch(e){}
		
		setDefault("mdCustomJSPath", "gEbPIT.ads['" + uid + "'].public.");

		// events
		setDefault("mdExpandEvent", "expand");
		setDefault("mdCollapseEvent", "collapse");
		setDefault("mdAssetsReadyEvent", "assetsReadyEvent");

		// public 
		setDefault("mdEyeDivZIndex", undefined);
		setDefault("mdAutoRepositionInterval", 0);

		customFormat.public = {};
		customFormat.public.handlePanelExpand = handlePanelExpand;
		customFormat.public.handlePanelCollapse = handlePanelCollapse;
		customFormat.public.handleInteraction = handleInteraction;
		customFormat.public.addJSEventListener = addJSEventListener;
		customFormat.public.removeJSEventListener = removeJSEventListener;
		customFormat.public.dispatchJSEvent = dispatchJSEvent;
		customFormat.public.changeZIndex = changeZIndex;
		customFormat.public.registerAsset = registerAsset;
		customFormat.public.clipAsset = clipAsset;

		customFormat.public.modifyPanelDimension = modifyPanelDimension;
		customFormat.public.isMac = function() { return gEbBC.isMac();}
		customFormat.public.isChrome = function() { return gEbBC.isSafari();}
		customFormat.public.isFireFox = function() { return gEbBC.isFF();}
		customFormat.public.isIE = function() { return gEbBC.isIE();}
		customFormat.public.isOpera = function() { return gEbBC.isOpera();}
		customFormat.public.isSafari = function() { return gEbBC.isRealSafari();}
		customFormat.public.browserVersion = function() { return gEbBC.getVersion();}
		customFormat.public.placementID = function() { return du.adData.nFlightID;}
		customFormat.public.campaignID = function() { return du.adData.nCampaignID;}
		customFormat.public.isNewClientJS = function() { return false;}
		customFormat.public.log = log;
		customFormat.public.resetRegisterAsset = resetRegisterAsset;

		defaultPanel = du.defaultPanel;

		// ------------  PUBLIC METHODS  ------------ 

		function clipAsset(x, y, width, height, panelName)
		{
			panelName = panelName || defaultPanel.strPanelName;

			var panel = du.ad.panels[panelName.toLowerCase()];
			var panelDiv = panel.panelDiv;

			var clipLeft = x;
			var clipTop = y;
			var clipRight = clipLeft + width;
			var clipBottom = clipTop + height;

			panelDiv.style.clip = "rect(" + clipTop + "px " + clipRight + "px " + clipBottom + "px " + clipLeft + "px )";
			browserRedrawFix();
		}
		
		function modifyPanelDimension(x, y, width, height, panelName)
		{
			panelName = panelName || defaultPanel.strPanelName;
			panelName = panelName.toLowerCase();
			var panelFlashObj = du.ad.panels[panelName].flashObj;

			if (x != undefined) du.ad.panels[panelName].nXPos = x;
			if (y != undefined) du.ad.panels[panelName].nYPos = y;
			if (width != undefined)
			{
				if (width > 0)
				{
					du.ad.panels[panelName].nWidth = width;
					panelFlashObj.style.width = width + "px";
				}
			}
			if (height != undefined)
			{
				if (height > 0)
				{
					du.ad.panels[panelName].nWidth = height;
					panelFlashObj.style.height = height + "px";
				}
			}
			browserRedrawFix(panelName);
			du.doOnResize();
		}

		function log(str)
		{
			if(console) console.log(str);
		}

		function changeZIndex(zIndex, panelName)
		{
			if (panelName)
			{
				var panel = du.ad.panels[panelName.toLowerCase()].panelDiv;
				if (panel) panel.style.zIndex = zIndex;
			}
			else
			{
				var eyeDiv = displayWin.document.getElementById(gEbDisplayPage.TI.eyeDivId);
				if (eyeDiv) eyeDiv.style.zIndex = zIndex;
			}
		}

		function addJSEventListener(eventType, callbackID, interAd)
		{
			PIT.subscriptions[callbackID] = {};
			PIT.subscriptions[callbackID].eventType = eventType;
			PIT.subscriptions[callbackID].interAd = interAd;
		}

		function removeJSEventListener(callbackID)
		{
			for (var i in PIT.subscriptions)
			{
				if (i == callbackID)
				{
					PIT.subscriptions[i] = undefined;
					break;
				}
			}
		}

		function dispatchJSEvent(eventType, params)
		{
			for (var i in PIT.subscriptions)
			{
				var subscription = PIT.subscriptions[i];
				var isCurrentAd = i.match(rnd);
				var flashObj = displayWin.document.getElementById(i.split("||")[1]);

				params = params || {};
				params.type = eventType;

				if (!subscription) continue;
				if (subscription.eventType != eventType) continue;
				if (!isCurrentAd && !subscription.interAd) continue;
				if (flashObj[i]) try
					{
						flashObj[i](params)
				}
				catch (e)
				{};
			}
		}

		function registerAsset(totalAssets, failTimeout)
		{
				if (PIT.registeredAssets == undefined) PIT.registeredAssets = {};
				PIT.registeredAssets.count = PIT.registeredAssets.count || 1;

				if (PIT.registeredAssets.assetFail == undefined) PIT.registeredAssets.assetFail = false;
				else if (PIT.registeredAssets.assetFail)  
				{
					dispatchJSEvent(customVars.mdAssetsReadyEvent,
					{
						isLoaded: false
					});
					return;
				}

				if (PIT.registeredAssets.timeoutAssetFail == undefined) PIT.registeredAssets.timeoutAssetFail = setTimeout(assetsFail, parseInt(failTimeout * 1000));
				if (PIT.registeredAssets.count == totalAssets && !PIT.registeredAssets.assetFail)
				{
					dispatchJSEvent(customVars.mdAssetsReadyEvent,
					{
						isLoaded: true
					});
					resetRegisterAsset();
				}

				function assetsFail()
				{
					if (PIT.registeredAssets == undefined) PIT.registeredAssets = {};
					if (PIT.registeredAssets.count > totalAssets) return;
					PIT.registeredAssets.assetFail = true;
					clearTimeout(PIT.registeredAssets.timeoutAssetFail);
					dispatchJSEvent(customVars.mdAssetsReadyEvent,{isLoaded: false});
				}
				
				PIT.registeredAssets.count++;
		}
		
		function resetRegisterAsset()
		{
			//Reset all data
			PIT.registeredAssets.count 				= undefined;
			PIT.registeredAssets.timeoutAssetFail 	= undefined;
			PIT.registeredAssets					= undefined;
			PIT.registeredAssets.assetFail			= undefined;
		}

		// ------------  PRIVATE METHODS  ------------

		function handleInteraction(interactionName)
		{
			if (du.fImageOnly || !du.interactions[interactionName] || !du.interactions[interactionName].fCountAsClick == true) return;
			for (var i in du.ad.panels)
			{
				var panel = du.ad.panels[i];
				if (panel != defaultPanel) du.hidePanel(panel.strPanelName);
			}
		}

		function handlePanelExpand(panelName)
		{
			dispatchJSEvent("PANEL_EXPANDED", {
                panelName:panelName
            });

			if (panelName != defaultPanel.strPanelName) return;
			if (customVars.mdAutoRepositionInterval > 0) displayWin.setInterval(customFormat.du.doOnResize(), customVars.mdAutoRepositionInterval);
			if (customVars.mdEyeDivZIndex && !ebIsPreview()) changeZIndex(customVars.mdEyeDivZIndex);
		}

		function handlePanelCollapse(panelName)
		{
			dispatchJSEvent("PANEL_COLLAPSED", {
                panelName:panelName
            });
		}
		
		function interceptDefaultPanelShow(panelName)
		{
			if (panelName.toLowerCase() == defaultPanel.strPanelName.toLowerCase()) return;
			du.reportOriginalPanelShow(panelName);
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

		function browserRedrawFix(panelName)
		{
			if (gEbBC.isMac() && gEbBC.isSafari())
			{
				panelName = panelName || defaultPanel.strPanelName;

				var panel = du.ad.panels[panelName.toLowerCase()];
				var panelDiv = panel.panelDiv;

				panelDiv.style.opacity = '.99';
				var f = function ()
				{
					panelDiv.style.opacity = 1;
				};
				setTimeout(f, 1);
			}
		}
	}
}