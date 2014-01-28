package 
{
	import flash.external.ExternalInterface;
	import flash.net.navigateToURL;
	import flash.net.URLRequest;
	public class PopupBlockerPlugin
	{
		/**
		 * ...
		 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
		 * v1.0
		 * Created: Dec 10,2013
		 * Modified:
		 */
		
		public function PopupBlockerPlugin()
		{
		}
		
		public function getMyURL(url:String, target:String = "_blank"):void
		{
			var req:URLRequest = new URLRequest(url);
			if (!ExternalInterface.available)
			{
				navigateToURL(req, target);
			}
			else
			{
				var isIE:Boolean = EBBase.CallJSFunction("EBG.adaptor.browser.isIE");
				if (isIE)
				{
					EBBase.CallJSFunction("window.open",req.url, target);
				}
				else
				{
					navigateToURL(req, target);
				}
			}
		}
	}
}