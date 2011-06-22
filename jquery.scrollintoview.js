/// <reference path="../jquery-1.4.1-vsdoc.js" />
/*---------------------------------*/
/* Plugin author: Robert Koritnik  */
/* Version      : 1.1 (4 Feb 2011) */
/*---------------------------------*/

(function ($) {
	var converter = {
		vertical: { x: false, y: true },
		horizontal: { x: true, y: false },
		both: { x: true, y: true },
		x: { x: true, y: false },
		y: { x: false, y: true }
	};

	var settings = {
		duration: "fast",
		direction: "both"
	};

	$.fn.extend({
		scrollintoview: function (options) {
			/// <summary>Scrolls the first element in the set into view by scrolling its closest scrollable parent.</summary>
			/// <param name="options" type="Object">Additional options that can configure scrolling:
			///		duration (default: "fast") - jQuery animation speed (can be a duration string or number of milliseconds)
			///		direction (default: "both") - select possible scrollings ("vertical" or "y", "horizontal" or "x", "both")
			/// </param>
			/// <return type="jQuery">Returns the same jQuery set that this function was run on.</return>

			options = $.extend({}, settings, options);
			options.direction = converter[typeof (options.direction) === "string" && options.direction.toLowerCase()] || converter.both;

			var dirStr = "";
			if (options.direction.x === true) dirStr = "horizontal";
			if (options.direction.y === true) dirStr = dirStr ? "both" : "vertical";

			var el = this.eq(0);
			var scroller = el.closest(":scrollable(" + dirStr + ")");

			// check if there's anything to scroll in the first place
			if (scroller.length > 0)
			{
				scroller = scroller.eq(0);
				var sizes = {
					visible: (function () {
						var vDim = scroller.offset();
						return {
							top: vDim.top,
							left: vDim.left,
							bottom: vDim.top + scroller[0].clientHeight,
							right: vDim.left + scroller[0].clientWidth,
							scrollX: scroller.scrollLeft(),
							scrollY: scroller.scrollTop()
						};
					})(),
					actual: (function () {
						var vDim = el.offset();
						return {
							top: vDim.top,
							left: vDim.left,
							bottom: vDim.top + el.outerHeight(),
							right: vDim.left + el.outerWidth()
						};
					})()
				};
				var padding = {
					top: sizes.actual.top - sizes.visible.top,
					bottom: sizes.visible.bottom - sizes.actual.bottom,
					left: sizes.actual.left - sizes.visible.left,
					right: sizes.visible.right - sizes.actual.right
				};

				var animOptions = {};

				// vertical scroll
				if (options.direction.y === true)
				{
					if (padding.top < 0)
					{
						animOptions.scrollTop = sizes.visible.scrollY + padding.top;
					}
					if (padding.top > 0 && padding.bottom < 0)
					{
						// Using Math.Min() ensures that elements higher than scroll height get cut off at the bottom
						animOptions.scrollTop = sizes.visible.scrollY + Math.min(-padding.bottom, padding.top);
					}
				}

				// horizontal scroll
				if (options.direction.x === true)
				{
					if (padding.left < 0)
					{
						animOptions.scrollLeft = sizes.visible.scrollX + padding.left;
					}
					if (padding.left > 0 && padding.right < 0)
					{
						// Using Math.Min() ensures that elements wider than scroll width get cut off on the right
						animOptions.scrollLeft = sizes.visible.scrollX + Math.min(-padding.right, padding.left);
					}
				}

				// scroll if needed
				if (!jQuery.isEmptyObject(animOptions))
				{
					scroller.animate(animOptions, options.duration);
				}
			}

			// return set back
			return this;
		}
	});

	var scrollValue = {
		auto: true,
		scroll: true,
		visible: false,
		hidden: false
	};

	$.extend($.expr[":"], {
		scrollable: function (element, index, meta, stack) {
			var direction = converter[typeof (meta[3]) === "string" && meta[3].toLowerCase()] || converter.both;
			var styles = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle);
			var overflow = {
				x: scrollValue[styles.overflowX.toLowerCase()] || false,
				y: scrollValue[styles.overflowY.toLowerCase()] || false
			};
			// check if completely unscrollable
			if (!overflow.x && !overflow.y)
			{
				return false;
			}

			// element can be scrollable
			var px = document.defaultView.getComputedStyle ? true : false;
			var border = {
				vertical: parseFloat(px ? styles.borderTopWidth : $.css(element, "borderTopWidth")) + parseFloat(px ? styles.borderBottomWidth : $.css(element, "borderBottomWidth")),
				horizontal: parseFloat(px ? styles.borderLeftWidth : $.css(element, "borderLeftWidth")) + parseFloat(px ? styles.borderRightWidth : $.css(element, "borderRightWidth"))
			};
			var size = {
				height: {
					scroll: element.scrollHeight,
					actual: element.offsetHeight - border.vertical,
					client: element.clientHeight
				},
				width: {
					scroll: element.scrollWidth,
					actual: element.offsetWidth - border.horizontal,
					client: element.clientWidth
				},
				scrollableX: function () {
					return this.height.actual > this.height.client && this.width.scroll > this.width.client;
				},
				scrollableY: function () {
					return this.width.actual > this.width.client && this.height.scroll > this.height.client;
				}
			};
			return direction.y && size.scrollableY() || direction.x && size.scrollableX();
		}
	});
})(jQuery);
