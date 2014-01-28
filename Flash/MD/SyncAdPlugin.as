package 
{
	public class SyncAdPlugin
	{
		/**
		 * ...
		 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
		 * v1.0
		 * Created: Nov 26,2013
		 * Modified:
		 */
		
		private var _customJSPath:String 					= null;
		public const ASSETS_READY:String 					= EBBase.GetVar("mdAssetsReadyEvent");
		
		public function SyncAdPlugin()
		{
			_customJSPath				=  EBBase.GetVar("mdCustomJSPath");
		}
		
		public function registerAsset(totalAssets:Number, failTimeout:Number):void
		{
			EBBase.CallJSFunction(_customJSPath + "registerAsset", totalAssets, failTimeout);
		}
		
		public function resetRegisterAsset():void
		{
			EBBase.CallJSFunction(_customJSPath + "resetRegisterAsset");
		}
	}
}