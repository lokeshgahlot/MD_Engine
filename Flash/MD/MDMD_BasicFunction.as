package 
{	
	/**
	 * ...
	 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
	 *  v3.0
	 * Created: Nov 26,2013
	 * * Modified:
	 */
	
	import flash.utils.Proxy;
	import flash.utils.flash_proxy;
	
	dynamic public class  MDMD_BasicFunction  extends Proxy
	{
		private static var _instance:MDMD_BasicFunction 	= null;
		
		private var  _customJSPath:String 					= null;
		private	var _isAutoExpand:Boolean					= false;
		private var _listenerQueue:Array					= [];
		public var uid:String								= EBBase.GetVar("uid");
		
		public var enableLogger:Boolean						= true;
		private var plugins:Array 							= null;
		
		public function MDMD_BasicFunction()
		{
			_customJSPath				= EBBase.GetVar("mdCustomJSPath");
			showMsg();
		}
		
		private function showMsg()
		{
			log("===============MD v3.0=================");
		}
	
		public static function getInstance():MDMD_BasicFunction
		{
			if (_instance == null) _instance = new MDMD_BasicFunction();
			return _instance;
		}
		
		public function addJSEventListener(eventType:String, callback:Function, interAd:Boolean = false):void
		{
			var info:Object = _getEventInfo(eventType);
			if (info.eventId == "" || (info.eventId != "" && interAd &&  !info.interAd))
			{
				if (info.eventId == "")
				{
					var randomId:uint = uint(Math.random() * 10000000000);
					var callbackID:String = "callback_" + randomId + "||" + EBBase.urlParams.ebFlashID;
					info.eventId = callbackID;
					EBBase.Callback(callbackID, _callback);
				}
				EBBase.CallJSFunction(_customJSPath + "addJSEventListener", eventType, info.eventId, interAd);
			}
			
			if (!_checkRedundantEvent(eventType, callback))
			{
				var t:Object = {
					eventType:eventType,
					callback:callback,
					eventId: info.eventId,
					interAd:interAd
					}
				_listenerQueue[_listenerQueue.length] = t;
			} 
		}
		
		private function _callback(e:Object):void
		{
			
			var t:Array = _listenerQueue.concat();
			for (var i:uint = 0; i < t.length; i++)
			{
				if (t[i].eventType == e.type)
				{
					var id:String = e.source.adId + "_" + e.source.rnd;
					if (!t[i].interAd && id != uid) continue; 
					t[i].callback(e);
				}
			}
		}
		
		private function _checkRedundantEvent(eventName:String, callback:Function):Boolean
		{
			for (var i:uint = 0; i < _listenerQueue.length; i++)
			{
				if (_listenerQueue[i].eventType == eventName && _listenerQueue[i].callback == callback) break;
			}
			if (i == _listenerQueue.length) return false;
			return true;
		}

		private function _getEventInfo(eventName:String):Object
		{
			var info:Object = { eventId:"", interAd:false };
			for (var i:uint = 0; i < _listenerQueue.length; i++) 
				if (_listenerQueue[i].eventType == eventName) 
				{
					info.eventId = _listenerQueue[i].eventId;
					if (_listenerQueue[i].interAd) 
					{
						info.interAd = true;
						break;
					}
				}
			return info; 
		}
		
		public function removeJSEventListener(eventType:String, callback:Function):void
		{
			if (_listenerQueue == null) return;
			var queueIndex:int = -1;
			var eventList:Array = [];
			for (var i:uint = 0; i < _listenerQueue.length; i++)
			{
				if (_listenerQueue[i].eventType == eventType)
				{
					if (callback == _listenerQueue[i].callback) queueIndex = i;
					eventList[eventList.length] = _listenerQueue[i];
				}
			}
			
			if (queueIndex > -1)
			{
				if (eventList.length == 1) EBBase.CallJSFunction(_customJSPath + "removeJSEventListener", _listenerQueue[queueIndex].eventId);
				_listenerQueue.splice(queueIndex, 1);
			}
		}
		
		public function dispatchJSEvent(eventType:String, params:Object = null):void
		{
			if (params == null) params = { };
			EBBase.CallJSFunction(_customJSPath + "dispatchJSEvent", eventType, params);
		}
		
		public function activatePlugin(... args):void
		{
			for (var i:int = 0; i < args.length; i++) 
			{
				var plugin:Object = new args[i]();
				if (plugins == null) plugins = [];
				if (!_checkPluginAlreadyIncluded(plugin)) continue;
				plugins.push(plugin);
			}
		}
		
		public function deactivatePlugin(... args):void
		{
			for (var i:int = 0; i < args.length; i++) 
			{
				var plugin:Object = new args[i]();
				for (var j:int = 0; j < plugins.length; j++) 
				{
					if (String(plugin) == String(plugins[j]))
					{
						plugins.splice(j, 1);
						break;
					}
				}
			}
		}
		
		private function _checkPluginAlreadyIncluded(plugin:Object):Boolean
		{
			if (plugins)
			{
				for (var i:int = 0; i < plugins.length; i++) 
				{
					if(String(plugin) == String(plugins[i]))break;
				}
				if (i == plugins.length) return true;
				else return false;
			}
			return false;
		}
				
		flash_proxy override function getProperty(propertyName:*):*
		{
			for(var i:uint=0; i<plugins.length; ++i)
			{
				if(plugins[i].hasOwnProperty(propertyName)) 
				{
					return plugins[i][propertyName];
				}
			}
		}
		
		flash_proxy override function callProperty(methodName:*, ... rest):*
		{
			for(var i:uint=0; i<plugins.length; ++i)
			{
				if(plugins[i].hasOwnProperty(methodName)) 
				{
					//plugins[i][methodName].apply(null, rest);
					//break;
					return plugins[i][methodName].apply(null, rest);
				}
			}
		}
		
		public function get isAutoExpand():Boolean 
		{
			_isAutoExpand = EBBase.GetVar("mdShouldAutoExpand");
			return _isAutoExpand;
		}
		
		public function log(msg:String):void 
		{
			if (enableLogger)
			{
				trace(msg);
				EBBase.CallJSFunction(_customJSPath + "log", msg);
			}
		}
	}
}

