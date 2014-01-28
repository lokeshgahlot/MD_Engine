package 
{
	public class BrowserPlugin
	{
		/**
		 * ...
		 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
		 * v1.0
		 * Created: Nov 26,2013
		 * Modified:
		 */
		
		private var _isMac:Boolean							= false;
		private var _isFireFox:Boolean						= false;
		private var _isChrome:Boolean						= false;
		private var _isIE:Boolean							= false;
		private var _isSafari:Boolean						= false;
		private var _isOpera:Boolean						= false;
		private var _browserVersion:Number					= -1;
		private var _customJSPath:String 					= null;
		private var _clientArea:Object						= {};
		
		public function BrowserPlugin()
		{
			_customJSPath				= EBBase.GetVar("mdCustomJSPath");
		}
		
		public function get isMac():Boolean 
		{
			_isMac = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isMac"));
			return _isMac;
		}
		
		public function get isFireFox():Boolean 
		{
			_isFireFox = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isFF"));
			return _isFireFox;
		}
		
		public function get isChrome():Boolean 
		{
			_isChrome = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isChrome"));
			return _isChrome;
		}
		
		public function get browserVersion():Number 
		{
			_browserVersion = Number(EBBase.CallJSFunction("EBG.adaptor.browser.getVersion"));
			return _browserVersion;
		}
		
		public function get isOpera():Boolean 
		{
			_isOpera = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isOpera"));
			return _isOpera;
		}
		
		public function get isSafari():Boolean 
		{
			_isSafari = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isSafari"));
			return _isSafari;
		}
		
		public function get isIE():Boolean 
		{
			_isIE = Boolean(EBBase.CallJSFunction("EBG.adaptor.browser.isIE"));
			return _isIE;
		}
		
		public function get clientArea():Object 
		{
			_clientArea = Object(EBBase.CallJSFunction("EBG.adaptor.getViewPortMetrics"));
			return _clientArea;
		}
	}
}