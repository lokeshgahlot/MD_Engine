package 
{
	import flash.external.ExternalInterface;
	public class PanelPlugin
	{
		/**
		 * ...
		 * @author Lokesh Gahlot || Synechron Inc. || lokesh.gahlot@synechron.com
		 * v1.0
		 * Created: Nov 26,2013
		 * Modified:
		 */
		
		private var _defaultPanelName:String = "";
		private var _listOfExpandedPanels:String = "";
		private var customJSPath:String = EBBase.GetVar("mdCustomJSPath");
		
		public const PANEL_EXPANDED:String = "PANEL_EXPANDED";
		public const PANEL_COLLAPSED:String = "PANEL_COLLAPSED";
		
		public function PanelPlugin()
		{
		}
		
		public function get defaultPanelName():String 
		{
			if(_defaultPanelName == "")_defaultPanelName = EBBase.GetVar("mdDefaultPanelName")? EBBase.GetVar("mdDefaultPanelName") : "";
			return _defaultPanelName;
		}
		
		public function get listOfExpandedPanels():String 
		{
			_listOfExpandedPanels = String(EBBase.CallJSFunction(customJSPath + "getListOfExpandedPanels"));
			return _listOfExpandedPanels;
		}
		
		public function modifyPanelDimension(x:Number = undefined, y:Number = undefined, width:Number = undefined, height:Number = undefined, panelName:String = undefined) :void
		{
			var _x = isNaN(x)?undefined : x;
			var _y = isNaN(y)?undefined : y;
			var _width = isNaN(width)?undefined : width;
			var _height = isNaN(height)?undefined : height;
			EBBase.CallJSFunction(customJSPath + "modifyPanelDimension", {panelName:panelName, x:_x, y:_y, width:_width, height:_height});
		}
		
		public function clipPanel(x:int, y:int, width:int, height:int, panelName:String = undefined) :void
		{
			EBBase.CallJSFunction(customJSPath + "clipAsset", x, y, width, height, panelName);
		}
		
		public function unclipPanel(panelName:String = undefined) :void
		{
			EBBase.CallJSFunction(customJSPath + "unclipAsset", panelName);
		}
		
		public function changeZIndex(zIndex:Number, panelName:String = undefined):void
		{
			EBBase.CallJSFunction(customJSPath + "changeZIndex", zIndex, panelName);
		}
	}
}