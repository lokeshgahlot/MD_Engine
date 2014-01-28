package 
{
	import flash.events.Event;
	import flash.utils.setTimeout;
	
	/**
	 * ...
	 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
	 * v1.0
	 * Created: Nov 26,2013
	 * Modified: 
	 */
	public class WallpaperPlugin 
	{
		private var customJSPath:String = EBBase.GetVar("mdCustomJSPath");
		private var _isPageLoaded:Boolean = false;
		
		private var _listenerId:String = null;
		private var _wpQueue:Array = null;
		private var _flag1:Boolean = true;
		private var _flag2:Boolean = false;
		private var _delay:uint		= 100;
		
		public function WallpapaerPlugin()
		{
			if (_flag1)
			{
				_flag1 = false;
				if (!isPageLoaded) 
				{
					_flag2 = true;
					_listenerId = this.addJSEventListener("PAGE_LOADED", _pageLoadHandler);
				}
			}
		}
		
		private function _pageLoadHandler(e:Object):void 
		{
			this.removeJSEventListener(_listenerId);
			_isPageLoaded = true;
			if (_wpQueue != null)
			{
				for (var i = 0; i < _wpQueue.length; i++)
				{
					EBBase.CallJSFunction(_wpQueue[i].methodName, _wpQueue[i].param);
				}
				_wpQueue = null;
			}
		}
		
		public function get isPageLoaded() 
		{
			if (!_isPageLoaded)_isPageLoaded = Boolean(EBBase.CallJSFunction("EBG.adaptor.isPageLoaded"));
			return _isPageLoaded;
		}
		
		public function addJSEventListener(eventType:String, callback:Function, interAd:Boolean = false):String
		{
			var callbackID:String = "callback_" + uint(Math.random() * 10000000000) + "||" + EBBase.urlParams.ebFlashID;
			EBBase.Callback(callbackID, callback);
			EBBase.CallJSFunction(customJSPath + "addJSEventListener", eventType, callbackID, interAd);
			return callbackID; 
		}

		public function removeJSEventListener(callbackID:String):void
		{
			EBBase.CallJSFunction(customJSPath + "removeJSEventListener", callbackID);
		}
		
		public function dispatchJSEvent(eventType:String, params:Object = null)
		{
			if (params == null) params = { };
			EBBase.CallJSFunction(customJSPath + "dispatchJSEvent", eventType, params);
		}
		
		public function showWallpaper(skin:String):void
		{
			if (isPageLoaded) 
			{
				if(_flag2) EBBase.CallJSFunction("mmShowWpBackground", skin);
				else _delayCall("mmShowWpBackground", skin);
			}
			else 
			{
				if (_wpQueue == null) _wpQueue = [];
				_wpQueue.push( {methodName:"mmShowWpBackground", param:skin } );
			}
		}
		
		public function hideWallpaper(skin:String):void
		{
			if (isPageLoaded) 
			{
				if (_flag2) EBBase.CallJSFunction("mmHideWpBackground", skin);
				else _delayCall("mmHideWpBackground", skin);
			}
			else 
			{
				if (_wpQueue == null) _wpQueue = [];
				_wpQueue.push( {methodName:"mmHideWpBackground", param:skin } );
			}
		}
		
		public function showGutter():void 
		{
			if (isPageLoaded) 
			{
				if (_flag2) EBBase.CallJSFunction("mmShowGutter");
				else _delayCall("mmShowGutter");
			}
			else 
			{
				if (_wpQueue == null) _wpQueue = [];
				_wpQueue.push( { methodName:"mmShowGutter", param:"" } );
			}
		}
		
		public function hideGutter():void 
		{
			if (isPageLoaded)
			{
				if (_flag2) EBBase.CallJSFunction("mmHideGutter");
				else _delayCall("mmHideGutter");
			}
			else 
			{
				if (_wpQueue == null) _wpQueue = [];
				_wpQueue.push( { methodName:"mmHideGutter", param:"" } );
			}
		}
		
		private function _delayCall(methodName:String, params:String = "", delayTime:uint = 100)
		{
			setTimeout(function() {
						_flag2 = true;
						EBBase.CallJSFunction(methodName, params);
					}, delayTime);
		}
	}	
}