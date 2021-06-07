
var uuid = 0;

Cesium.Viewer.prototype.addOverlay = function (overlay) {
	overlay.setViewer(this);
	this._container.appendChild(overlay.element);
};

/**
 * 3D场景气泡框,new 出来后要记得添加进去
 * @param opts{Object}
 * @param opts.id {property} id
 * @param opts.element {document.element} element元素
 * @param opts.position {Array} 气泡框初始化的位置，可以不传
 *
 * @constructor
 */

Overlay = function (opts) {
	opts= opts|| {};
	var me = this;

	/**
	 * @type {string|number} overlay id
	 */
	// me.id = opts.id;
	me.id = uuid;
	uuid++;
	/**
	 * @type {document.element} overlay的内容元素
	 */

	me.MapControl = opts.MapControl;

	$("body").append($("#popup").clone().attr("id","popup_"+me.id));
	$("#popup_"+me.id).find(".popup_content").attr("id","popup_content_"+me.id);
	$("#popup_"+me.id).find(".popup_coord").attr("id","popup_coord_"+me.id);

	$("#popup_"+me.id).find(".popup_extend").attr("id","popup_extend_"+me.id);
	$("#popup_"+me.id).find(".popup_mini").attr("id","popup_mini_"+me.id);
	$("#popup_mini_"+me.id).click(()=>{
		$('#popup_extend_'+me.id).toggleClass("popup_extend_hide");
	})

	$("#popup_"+me.id).find(".popup_yes").attr("id","popup_yes_"+me.id);
	$("#popup_yes_"+me.id).click(()=>{
		let li = $("#point").parent().clone().css("display","list-item")
		$("#pathpoints").append(li);
		li.append(li.find("a#point").attr("id","point_"+me.id).css("display","inline-block"));
		$("#point_"+me.id).text(`(${me.location.longitude.toFixed(6)}, ${me.location.latitude.toFixed(6)})`);
		$("#point_"+me.id).click(()=>{
			me.flyTo();
		});
		me.MapControl.add_pathpoint(me.location);
		$("#popup_yes_"+me.id).text("已添加");
		$("#popup_yes_"+me.id).attr("disabled",true);
	});

	$("#popup_"+me.id).find(".popup_doc").attr("id","popup_doc_"+me.id);
	$("#popup_doc_"+me.id).click(()=>{
		if(window.tt){
			alert('选择云空间文档列表');
			window.tt.docsPicker({
			    success: (res)=>{
			        alert('已选择：');
					alert(JSON.stringify(res.fileList))
			    },
				fail: (error)=>{
					alert(JSON.stringify(error));
					// 失败回调
				}
			});
		}
	})

	$("#popup_"+me.id).find(".popup_locate").attr("id","popup_locate_"+me.id);
	$("#popup_locate_"+me.id).click(()=>{
		me.flyTo();
	})

	me.flyTo = function(){
		//将笛卡尔三维坐标转为地图坐标（弧度）
		var cartographic = Cesium.Cartographic.fromCartesian(me._worldPosition);
		me._viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(
					Cesium.Math.toDegrees(cartographic.longitude),
					Cesium.Math.toDegrees(cartographic.latitude),
					9000
				)
			});
	}

	$("#popup_"+me.id).find(".popup_no").attr("id","popup_no_"+me.id);
	$("#popup_no_"+me.id).click(()=>{
		if(opts.no){
			opts.no();
		}
		me.setPosition(undefined);
		me.MapControl.remove_pathpoint(me.id);
		$("#popup_"+me.id).remove();
		$("#point_"+me.id).parent().remove();
	});

	me.element = document.getElementById("popup_"+me.id);
	/**
	 * @type {Array} 保存Popup框的x,y坐标
	 */

	me._worldPosition = null;
	/**
	 * @type {*} popup框相对于原点偏移像素值
	 */
	me.offset = opts.offset;
	/**
	 * @type {Cesium.Cartesian2}
	 */
	me.scratch = new Cesium.Cartesian2();
	/**
	 *
	 * @type {Cesium.Viewer}
	 * @private
	 */
	me._viewer = null;

	me.first_time = true;
	/**
	 * @private
	 * 初始化Popup框
	 */
	me.init = function () {
		if(opts.content){
			$("#popup_content_"+me.id).html(content);
		}
		if(opts.show_address){
			var amap = new amap_api();
			amap.geocode(me.location, (result)=>{
				if(result.status == "1"){
					$("#popup_content_"+me.id).html(result.regeocode.formatted_address+'</br>');
				}
			});
		}
		$("#popup_coord_"+me.id).html(`经度：${me.location.longitude.toFixed(6)}°</br>
			纬度：${me.location.latitude.toFixed(6)}°</br>`);
	};
	/**
	 * 设置关联的cesium viewer
	 * @param viewer
	 */
	me.setViewer = function (viewer) {
		me._viewer = viewer;
		me._viewer.scene.preRender.addEventListener(function () {
			if (me.element.style.display !== "none") {
				me.update();
			};
		});
		var helper = new Cesium.EventHelper();
		helper.add(viewer.scene.globe.tileLoadProgressEvent, function (event) {
			//console.log("每次加载矢量切片都会进入这个回调")
			if (event == 0) {
				//console.log("这个是加载最后一个矢量切片的回调")
				me.update();
				helper.removeAll();
			}
		});
	};
	/**
	 * 获取关联的cesium viewer
	 * @return {Cesium.Viewer}
	 */
	me.getViewer = function () {
		return this._viewer;
	};
	/**
	 * 设置位置
	 * @param position{Array}
	 */
	me.setPosition = function (position) {
		if (!position) {
			me.close();
			return;
		}
		if (position instanceof Array) {
			position[0] = position[0] || 0;
			position[1] = position[1] || 0;
			position[2] = position[2] || 0;
			position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
		}
		if (!me.getViewer()) {
			return;
		}
		//将笛卡尔三维坐标转为地图坐标（弧度）
		var cartographic = Cesium.Cartographic.fromCartesian(position);
		//将地图坐标（弧度）转为十进制的度数
		me.location = {
			id: me.id,
			longitude: Cesium.Math.toDegrees(cartographic.longitude),
			latitude: Cesium.Math.toDegrees(cartographic.latitude)
		};

		var approx_height = me._viewer.scene.globe.getHeight(
			Cesium.Cartographic.fromDegrees(me.location.longitude,me.location.latitude)
		);
		position = Cesium.Cartesian3.fromDegrees(me.location.longitude, me.location.latitude, approx_height);
		var canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(me.getViewer().scene, position);
		if (Cesium.defined(canvasPosition)) {
			me.element.style.bottom = (12 + window.innerHeight - canvasPosition.y) + 'px';
			me.element.style.left = canvasPosition.x - 48 + 'px';
			me.show();
		}
		me._worldPosition = position;
		if(me.first_time){
			me.init();
			me.first_time = false;
		}
	};

	me.update = function () {
		me.setPosition(me._worldPosition);
	};
	/**
	 *
	 * @return {Array}
	 */
	me.getPosition = function () {
		return me._worldPosition;
	};

	me.getLngLat = function () {
		return me.location;
	}

	me.close = function () {
		me.element.style.display = "none";
	};

	me.show = function () {
		me.element.style.display = "block";
	};

};
