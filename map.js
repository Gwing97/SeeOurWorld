// var local_ip = "192.168.0.107";	//局域网上的本机IP地址，若发布至互联网后，填写公网ip
// var local_ip = "localhost";
var local_ip = "www.skylight.xin";

function getQueryVariable(variable) {
	const query = window.location.search.substring(1);
	const vars = query.split("&");
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return '';
}

function QueryToJSON() {
	const query = window.location.search.substring(1);
	var vars = query.split("&");
	var json = {};
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=");
		json[pair[0]] = pair[1];
	}
	return json;
}

var MapControl = function (opts) {
	var me = this;

	me.opts = $.extend(true, {//opts中的配置会覆盖以下默认配置
		cesium_container: "cesium_container",
		toolbar_container: "toolbar_1",
		view_center: [105, 35, 15000000],
		home_orientation: {
			heading: 0,
			pitch: -90,
			roll: 0
		},
		point_orientation: {
			heading: 0,
			pitch: -45,
			roll: 0
		},
		altitude_range: {
			min: 0.0,
			max: 8848.0
		},
		model: "",
		is_global: true,
		show_atmosphere: true,
		enable_light: false,
		cesium_access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNTYyZmIwOC00MDVhLTRlODEtYTRmYS1lZGU4YjhmMWJlZDIiLCJpZCI6NDUxNTksImlhdCI6MTYyNjkzNTA4NH0.WG1cA1YXgEQFE4Dw7aGdailrJaxSRaRuLsRsfoyhbik"
	}, opts);

	me.pathpoints = Array();
	me.home_orientation = {
		// 指向
		heading: Cesium.Math.toRadians(me.opts.home_orientation.heading),
		// 视角
		pitch: Cesium.Math.toRadians(me.opts.home_orientation.pitch),
		roll: Cesium.Math.toRadians(me.opts.home_orientation.roll)
	}
	me.point_orientation = {
		// 指向
		heading: Cesium.Math.toRadians(me.opts.point_orientation.heading),
		// 视角
		pitch: Cesium.Math.toRadians(me.opts.point_orientation.pitch),
		roll: Cesium.Math.toRadians(me.opts.point_orientation.roll)
	}

	me.read_query();
	me.init();
	me.contour_init();
	me.search_init();
};

MapControl.prototype.read_query = function () {
	var me = this;

	var query = QueryToJSON();
	if (query["data"]) {
		me.path_polyline = JSON.parse(atob(query["data"]));
	}
}

MapControl.prototype.set_query = function () {
	var me = this;

}

MapControl.prototype.init = function () {
	var me = this;

	var tianditu_token = 'c23af70822a130e1822f8464dd6e9fd6'
	var mapbox_token = 'pk.eyJ1IjoiZ3dpbmc5NyIsImEiOiJja251ZG5uNmswYTZlMnhvend0ejRpZHExIn0.krjMt87hQNfv3NGzyYvhng'
	// 服务域名
	var tdtUrl = 'https://t{s}.tianditu.gov.cn/'
	// 服务负载子域

	var img_tianditu_rs = new Cesium.ProviderViewModel({
		name: "天地图",
		tooltip: "天地图",
		iconUrl: "images/tianditu.png",
		creationFunction: function () {
			var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']

			var providers = Array()

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains,
				tilingScheme: new Cesium.WebMercatorTilingScheme(),
				maximumLevel: 18
			}))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains,
				tilingScheme: new Cesium.WebMercatorTilingScheme()
			}))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains,
				tilingScheme: new Cesium.WebMercatorTilingScheme(),
				maximumLevel: 18
			}))

			return providers;
		}
	});

	var img_google_rs = new Cesium.ProviderViewModel({
		name: "Google影像底图",
		tooltip: "Google影像底图",
		iconUrl: "images/GoogleEarth.ico",
		creationFunction: function () {

			var provider = new Cesium.UrlTemplateImageryProvider({
				url: 'https://www.google.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}'
				// subdomains: subdomains
			});
			return provider;
		}
	});

	var img_google_tianditu_rs = new Cesium.ProviderViewModel({
		name: "Google影像底图-带天地图注记",
		tooltip: "Google影像底图-带天地图注记",
		iconUrl: "images/GoogleEarth.ico",
		creationFunction: function () {
			var subdomains_tianditu = ['0', '1', '2', '3', '4', '5', '6', '7']

			var providers = []

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: 'https://www.google.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}'
			}))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains_tianditu,
				tilingScheme: new Cesium.WebMercatorTilingScheme()
			}))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains_tianditu,
				tilingScheme: new Cesium.WebMercatorTilingScheme(),
				maximumLevel: 18
			}))

			return providers;
		}
	});

	var img_mapbox_rs = new Cesium.ProviderViewModel({
		name: "MapBox影像底图",
		tooltip: "MapBox影像底图",
		iconUrl: "images/mapbox.png",
		creationFunction: function () {
			var provider = new Cesium.UrlTemplateImageryProvider({
				url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' + mapbox_token
			});
			return provider;
		}
	});

	var img_mapbox_tianditu_rs = new Cesium.ProviderViewModel({
		name: "MapBox影像底图-带天地图注记",
		tooltip: "MapBox影像底图-带天地图注记",
		iconUrl: "images/mapbox.png",
		creationFunction: function () {
			var subdomains_tianditu = ['0', '1', '2', '3', '4', '5', '6', '7']

			var providers = []

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' + mapbox_token
			}))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains_tianditu,
				tilingScheme: new Cesium.WebMercatorTilingScheme()
			}))

			// providers.push(new Cesium.UrlTemplateImageryProvider({
			// 	url: "https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
			// 	subdomains: subdomains_tianditu,
			// 	tilingScheme : new Cesium.WebMercatorTilingScheme()
			// }))

			providers.push(new Cesium.UrlTemplateImageryProvider({
				url: tdtUrl + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + tianditu_token,
				subdomains: subdomains_tianditu,
				tilingScheme: new Cesium.WebMercatorTilingScheme(),
				maximumLevel: 18
			}))

			return providers;
		}
	});

	var img_google_topo = new Cesium.ProviderViewModel({
		name: "Google地形图",
		tooltip: "Google地形图",
		iconUrl: "images/google_map.jpg",
		creationFunction: function () {
			var provider = new Cesium.UrlTemplateImageryProvider({
				url: 'https://www.google.com/maps/vt?lyrs=p&x={x}&y={y}&z={z}'
			});
			return provider;
		}
	});

	var img_osm_topo = new Cesium.ProviderViewModel({
		name: "OpenStreetMap地形图",
		tooltip: "OpenStreetMap地形图",
		iconUrl: "images/osm_logo.png",
		creationFunction: function () {
			var provider = new Cesium.UrlTemplateImageryProvider({
				url: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38"
				//					url: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
				//					url: "https://b.tile.opentopomap.org/{z}/{x}/{y}.png"
			})
			return provider;
		}
	});

	//var img_arcgis = new Cesium.ProviderViewModel({
	//	name: "ArcGIS地图",		//作为三维地图显示效果并不好
	//	tooltip: "ArcGIS地图",
	//	creationFunction: function () {
	//		var provider = new Cesium.UrlTemplateImageryProvider({
	//				url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}"
	//			})
	//		return provider;
	//	}
	//});

	var img_WorldSoil = new Cesium.ProviderViewModel({
		name: "全球土壤类型 2006",
		tooltip: "全球土壤类型 2006",
		iconUrl: "./images/soil.png",
		creationFunction: function () {
			var provider = new Cesium.WebMapServiceImageryProvider({
				url: "https://maps.isric.org/mapserv?map=/map/wrb.map",
				layers: "MostProbable",
				tileHeight: 256,
				tileWidth: 256,
				parameter: {
					service: 'WMS',
					version: '1.3.0',
					request: 'GetMap',
					style: 'default',
					transparent: 'true',
					format: 'image/png',
					CRS: 'EPSG:4326'
				}
			})
			return provider;
		}
	});

	var cesium_terrain = new Cesium.ProviderViewModel({
		name: "Cesium全球地形",
		tooltip: "Cesium全球地形",
		iconUrl: "./images/CesiumWorldTerrain.png",
		creationFunction: function () {
			return Cesium.createWorldTerrain({
				// required for water effects
				requestWaterMask: true,
				// required for terrain lighting
				requestVertexNormals: true
			});
		}
	});

	var ellipsoid_terrain = new Cesium.ProviderViewModel({
		name: "大地椭球体",
		tooltip: "大地椭球体",
		iconUrl: "./images/Ellipsoid.png",
		creationFunction: function () {
			var provider = new Cesium.EllipsoidTerrainProvider();
			return provider;
		}
	});

	Cesium.Ion.defaultAccessToken = me.opts.cesium_access_token;

	let enable_animation = false;
	let enable_timeline = false;
	if(me.opts.enable_time_widgt){
		enable_animation = true;
		enable_timeline = true;
	}

	me.viewer = new Cesium.Viewer(me.opts.cesium_container, {
		animation: enable_animation,	//是否创建动画小器件，左下角仪表
		timeline: enable_timeline,	//是否显示时间线控件
		geocoder: false,	//是否显示地名查找控件，右上角查询按钮
		fullscreenButton: false,	//是否显示右下角全屏按钮
		navigationHelpButton: false,	//是否显示右上角的帮助按钮
		homeButton: true,	//是否显示Home按钮
		showRenderLoopErrors: false,//如果设为true，将在一个HTML面板中显示错误信息
		sceneModePicker: true,//是否显示3D/2D选择器

		baseLayerPicker: true,//是否显示图层选择器
		scene3DOnly: false,//如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
		infoBox: false,//是否显示信息框
		selectionIndicator: false,
		//vrButton: true,	//VR模式

		imageryProviderViewModels: [
			img_google_rs,
			img_google_tianditu_rs,
			img_google_topo,
			img_mapbox_rs,
			img_mapbox_tianditu_rs,
			img_tianditu_rs,
			img_osm_topo,
			img_WorldSoil
		],//可供BaseLayerPicker选择的图像图层ProviderViewModel数组
		terrainProviderViewModels: [cesium_terrain, ellipsoid_terrain],

		// 解决截图后图片没有内容，无法得到地图场景的问题
		contextOptions: {
			webgl: {
				alpha: true,
				depth: true,
				stencil: true,
				antialias: true,
				premultipliedAlpha: true,	//通过canvas.toDataURL()实现截图需要将该项设置为true
				preserveDrawingBuffer: true,
				failIfMajorPerformanceCaveat: true
			}
		},
	});

	me.viewer._cesiumWidget._creditContainer.style.display = "none";	//去除版权信息

	// 判断是否支持图像渲染像素化处理
	var supportsImageRenderingPixelated = me.viewer.cesiumWidget._supportsImageRenderingPixelated;
	if (supportsImageRenderingPixelated) {
		// 直接拿到设备的像素比例因子 - 如我设置的1.25
		var vtxf_dpr = window.devicePixelRatio;
		while (vtxf_dpr >= 2.0) { vtxf_dpr /= 2.0; }
		// 设置渲染分辨率的比例因子
		me.viewer.resolutionScale = vtxf_dpr;
	}

	me.viewer.scene.fxaa = true
	me.viewer.scene.postProcessStages.fxaa.enabled = true

	//设置MapBox为默认的遥感影像
	me.viewer.baseLayerPicker.viewModel.selectedImagery = me.viewer.baseLayerPicker.viewModel.imageryProviderViewModels[4];
	me.viewer.baseLayerPicker.viewModel.selectedTerrain = me.viewer.baseLayerPicker.viewModel.terrainProviderViewModels[0];

	var tianditu_flag = false
	var google_flag = false

	//若可以连接上Google，则设置Google影像为默认的遥感影像
	$.ajax({
		url: "https://www.google.com/maps/vt?lyrs=s&x=0&y=0&z=0",
		method: "get",
		success: function () {
			google_flag = true
			console.log("成功连接至Google服务器");

			//若可以获取天地图标注图层，则添加带有天地图标注图层的MapBox影像
			$.ajax({
				url: 'https://t0.tianditu.gov.cn/DataServer?T=ibo_w&x=0&y=0&l=0&tk=' + tianditu_token,
				method: "get",
				success: function () {
					tianditu_flag = true;
					console.log("成功获取天地图标注图层");

					if(tianditu_flag){
						if(google_flag){
							me.viewer.baseLayerPicker.viewModel.selectedImagery = me.viewer.baseLayerPicker.viewModel.imageryProviderViewModels[1];
						} else {
							me.viewer.baseLayerPicker.viewModel.selectedImagery = me.viewer.baseLayerPicker.viewModel.imageryProviderViewModels[4];
						}
					} else {
						if(google_flag){
							me.viewer.baseLayerPicker.viewModel.selectedImagery = me.viewer.baseLayerPicker.viewModel.imageryProviderViewModels[0];
						} else {
							me.viewer.baseLayerPicker.viewModel.selectedImagery = me.viewer.baseLayerPicker.viewModel.imageryProviderViewModels[3];
						}
					}
				},
				error: function () {
					tianditu_flag = false
					console.log("无法获取天地图标注图层");
				},
				timeout: 5000
			})
		},
		error: function () {
			google_flag = false
			console.log("无法连接至Google服务器");
		},
		timeout: 5000
	})

	if(!me.opts.is_global){
		let SenceRectangle = Cesium.Rectangle.fromDegrees(
			me.opts.view_center[0] - 0.4,
			me.opts.view_center[1] - 0.3,
			me.opts.view_center[0] + 0.4,
			me.opts.view_center[1] + 0.3
		);
		
		me.viewer.scene.globe.cartographicLimitRectangle = SenceRectangle;
		me.viewer.scene.globe.backFaceCulling = true;
	}

	if(me.opts.enable_light){
		//开启光照
		me.viewer.scene.globe.enableLighting = true;

		me.viewer.scene.globe.lightingFadeOutDistance = 1e6;
		me.viewer.scene.globe.lightingFadeInDistance = 2e6;
		me.viewer.scene.globe.nightFadeOutDistance = 1e6;
		me.viewer.scene.globe.nightFadeInDistance = 2e6;
		
		//设置时间，调整太阳高度角
		me.viewer.clockViewModel.currentTime = Cesium.JulianDate.fromDate(new Date());
	}

	//调试用选项
	//me.viewer.extend(Cesium.viewerCesiumInspectorMixin);
	//显示帧速
	//me.viewer.scene.debugShowFramesPerSecond = true;

	//添加OSM Building三维建筑数据
	//me.viewer.scene.primitives.add(Cesium.createOsmBuildings());

	// Enable depth testing so things behind the terrain disappear.
	me.viewer.scene.globe.depthTestAgainstTerrain = true;

	if (!me.opts.show_atmosphere) {
		me.viewer.scene.skyBox.show = false;	//天空盒，即星空贴图
		me.viewer.scene.skyAtmosphere.show = false;	//大气效果
		me.viewer.scene.globe.showGroundAtmosphere = true;

		//隐藏地球默认的蓝色背景
		me.viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT;
		//隐藏雾效果
		me.viewer.scene.fog.enabled = false;
		//隐藏黑色背景
		//me.viewer.scene.backgroundColor=Cesium.Color.TRANSPARENT;
	}

	//导航栏
	var options = {
		defaultResetView: Cesium.Cartographic.fromDegrees(...me.opts.view_center),
		enableCompass: true,
		enableZoomControls: true,
		enableDistanceLegend: true,
		enableCompassOuterRing: false
	}
	// extend our view by the cesium navigaton mixin
	me.viewer.extend(Cesium.viewerCesiumNavigationMixin, options);

	if(me.opts.enable_time_widgt){
		$(".coordination").css({
			"bottom": "35px",
			"right": "10px",
			"left": "auto"
		});
		$(".distance-legend").css({
			"bottom": "70px"
		});
	}

	var orientation_setting
	if(me.opts.is_global){
		orientation_setting = me.home_orientation
	} else {
		orientation_setting = me.point_orientation
	}

	// 修改home按钮的行为
	me.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (commandInfo) {
		//飞回指定位置
		me.viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(
				location.longitude - location.height_above * Math.cos(orientation_setting.pitch) * Math.sin(orientation_setting.heading) / 111319.55,
				location.latitude - location.height_above * Math.cos(orientation_setting.pitch) * Math.cos(orientation_setting.heading) / 111319.55,
				location.height_above * Math.sin(-orientation_setting.pitch)
			),
			orientation: orientation_setting
		});
		// Tell the home button not to do anything
		commandInfo.cancel = true;
	});

	let location = {
		longitude: me.opts.view_center[0],
		latitude: me.opts.view_center[1],
		height_above: me.opts.view_center[2]
	}
	
	me.viewer.camera.setView({
		destination: Cesium.Cartesian3.fromDegrees(
			location.longitude - location.height_above * Math.cos(orientation_setting.pitch) * Math.sin(orientation_setting.heading) / 111319.55,
			location.latitude - location.height_above * Math.cos(orientation_setting.pitch) * Math.cos(orientation_setting.heading) / 111319.55,
			location.height_above * Math.sin(-orientation_setting.pitch)
		),
		orientation: orientation_setting
	});
	

	var longitude_show = $('#longitude_show').get(0);
	var latitude_show = $('#latitude_show').get(0);
	var altitude_show = $('#altitude_show').get(0);
	var view_height = $('#view_height_show').get(0);
	var canvas = me.viewer.scene.canvas;

	function show_coordinate(movement, type) {
		//捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
		if (movement.endPosition) {
			var cartesian = me.viewer.scene.pickPosition(movement.endPosition);
		} else if (movement.position) {
			var cartesian = me.viewer.scene.pickPosition(movement.position);
		}
		if (cartesian) {
			//将笛卡尔三维坐标转为地图坐标（弧度）
			var cartographic = me.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
			//将地图坐标（弧度）转为十进制的度数
			var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
			var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
			var alti_String = (me.viewer.scene.globe.getHeight(cartographic)).toFixed(2);
			var view_String = (me.viewer.camera.positionCartographic.height / 1000).toFixed(2);

			longitude_show.innerHTML = log_String;
			latitude_show.innerHTML = lat_String;
			altitude_show.innerHTML = alti_String;
			view_height.innerHTML = view_String;
		}
	}

	//具体事件的实现
	var handler = new Cesium.ScreenSpaceEventHandler(canvas);
	handler.setInputAction(show_coordinate, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	handler.setInputAction(show_coordinate, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

MapControl.prototype.get_altitude = function (longitude, latitude) {
	var me = this;
	return me.viewer.scene.globe.getHeight(
		Cesium.Cartographic.fromDegrees(longitude, latitude)
	);
}

MapControl.prototype.id = 0;
MapControl.prototype.get_id = function () {
	this.id += 1;
	return this.id;
}

MapControl.prototype.select_pathpoint = function () {
	var me = this;

	// 选择entity的监听器,代码自行调整,可以在overlay的基础上继承写成bubble类
	var handler = new Cesium.ScreenSpaceEventHandler(me.viewer.scene._imageryLayerCollection);

	handler.setInputAction(function (movement) {
		var overlay = new Overlay({
			MapControl: me,
			show_address: true
		});
		me.viewer.addOverlay(overlay);

		var cartesian = me.viewer.scene.pickPosition(movement.position);
		if (typeof cartesian != "undefined") {
			let ray = me.viewer.camera.getPickRay(movement.position);
			cartesian = me.viewer.scene.globe.pick(ray, me.viewer.scene);
			overlay.setPosition(cartesian);
		}
		handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

MapControl.prototype.add_pathpoint = function (location) {
	var me = this;

	me.pathpoints.push(location);
	// console.log(me.pathpoints);
}

MapControl.prototype.remove_pathpoint = function (id) {
	var me = this;

	let i = me.pathpoints.findIndex((point) => point.id == id);
	if (i != -1) {
		me.pathpoints.splice(i, 1);
	}
	// console.log(me.pathpoints);
}

MapControl.prototype.flyTo = function (location, callback) {
	var me = this;
	var viewer = me.viewer

	let approx_height = 12000;
	if (location.altitude) {
		approx_height = location.altitude + 5 * location.accuracy;
	}
	if (callback) {
		callback(location);
	}
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(
			location.longitude,
			location.latitude,
			approx_height
		),
		orientation: me.home_orientation,
		complete: () => {
			var helper = new Cesium.EventHelper();
			var zoomIn = 10;
			helper.add(viewer.scene.globe.tileLoadProgressEvent, function (event) {
				//console.log("每次加载矢量切片都会进入这个回调")
				if (event < 10) {
					viewer.camera.zoomIn(zoomIn);
					zoomIn += 5;
				}
				if (event == 0) {
					//console.log("这个是加载最后一个矢量切片的回调")
					let approx_height = 0;
					if (location.altitude) {
						approx_height = location.altitude;
					} else {
						approx_height = me.get_altitude(location.longitude, location.latitude);
					}
					let height_above = 4000;
					if (location.accuracy) {
						height_above = 5 * location.accuracy;
					}
					viewer.camera.flyTo({
						destination: Cesium.Cartesian3.fromDegrees(
							location.longitude - height_above * Math.cos(me.point_orientation.pitch) * Math.sin(me.point_orientation.heading) / 111319.55,
							location.latitude - height_above * Math.cos(me.point_orientation.pitch) * Math.cos(me.point_orientation.heading) / 111319.55,
							approx_height + height_above * Math.sin(-me.point_orientation.pitch)
						),
						orientation: me.point_orientation
					});
					if (callback) {
						callback(location);
					}
					helper.removeAll();
				}
			});
		}
	});
}

MapControl.prototype.draw_point = function (location, text = null, id = 'location') {
	var me = this;
	var viewer = me.viewer;

	viewer.entities.remove(viewer.entities.getById(id))
	var label = null;
	if (text) {
		label = {
			text: text,
			font: '18px sans-serif',
			fillColor: Cesium.Color.GOLD,
			style: Cesium.LabelStyle.FILL_AND_OUTLINE,
			outlineWidth: 2,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			pixelOffset: new Cesium.Cartesian2(20, -20),
			disableDepthTestDistance: Number.POSITIVE_INFINITY
		}
	}
	viewer.entities.add({
		id: id,
		position: Cesium.Cartesian3.fromDegrees(
			location.longitude,
			location.latitude,
			me.get_altitude(location.longitude, location.latitude)
		),
		point: {
			pixelSize: 10,
			color: Cesium.Color.BLUE,
			outlineColor: Cesium.Color.WHITE,
			outlineWidth: 1,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			disableDepthTestDistance: Number.POSITIVE_INFINITY
		},
		label: label
	})
}

MapControl.prototype.draw_polyline = function (locations) {
	var me = this;

	var positions = []
	locations.forEach((loc, i) => {
		positions.push(Cesium.Cartesian3.fromDegrees(
			loc.longitude,
			loc.latitude,
			me.get_altitude(loc.longitude, loc.latitude)
		));
	});

	var line_options = {
		name: 'route',
		polyline: {
			show: true,
			positions: positions,
			material: Cesium.Color.CHARTREUSE,
			width: 5,
			clampToGround: true
		}
	};
	me.viewer.entities.add(line_options);

	// var helper = new Cesium.EventHelper();
	// helper.add(viewer.scene.globe.tileLoadProgressEvent, function (event) {
	// 	//console.log("每次加载矢量切片都会进入这个回调")
	// 	if (event == 0) {
	// 		//console.log("这个是加载最后一个矢量切片的回调")
	// 		line_options.polyline.positions = positions;
	// 		helper.removeAll();
	// 	}
	// });
}

//定位
MapControl.prototype.getLocation = function () {
	var me = this;
	var viewer = me.viewer;

	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	function success(pos) {
		var crd = pos.coords;
		me.flyTo(crd, (location) => me.draw_point(location, "当前位置"))

		// console.log('Your current position is:')
		// console.log('Latitude : ' + crd.latitude)
		// console.log('Longitude: ' + crd.longitude)
		// console.log('altitude: ' + crd.altitude);
		// console.log('More or less ' + crd.accuracy + ' meters.')
	};

	function error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
		switch (error.code) {
			case error.PERMISSION_DENIED:
				alert("用户拒绝告知地理位置")
				break;
			case error.POSITION_UNAVAILABLE:
				alert("位置信息不可用")
				break;
			case error.TIMEOUT:
				alert("请求用户地理位置超时")
				break;
			case error.UNKNOWN_ERROR:
				alert("未知错误")
				break;
		}
	};

	if (window.h5sdk) {
		alert("调用定位API")
		window.h5sdk.device.geolocation.get({
			useCache: false,
			onSuccess: function (locationData) {
				alert(JSON.stringify(locationData));
				success(locationData)
			},
			onFail: function (errorMsg) {
				alert(JSON.stringify(errorMsg));
			}
		});
	} else {
		navigator.geolocation.getCurrentPosition(success, error, options);
	}

}

MapControl.prototype.search_init = function () {
	var me = this;
	$("#form_search").bind("submit", () => {
		me.search();
		return false;		//防止form自动跳转
	})
	$('#route_planning').click(() => {
		me.route_planning();
	});
}

MapControl.prototype.search = function () {
	var me = this;
	var amap = new amap_api();
	amap.search($("input#search").val(), (result) => {
		if (result.status == "1") {
			toggleToolbarById(me.opts.toolbar_container);
			let place_name = result.pois[0].name;
			let amap_crds = result.pois[0].location.split(',');
			let crd_trans = new Coordinate();
			let wgs84_crds = crd_trans.gcj02_to_wgs84(amap_crds[0], amap_crds[1]);
			me.flyTo({
				longitude: wgs84_crds[0],
				latitude: wgs84_crds[1]
			}, (location) => me.draw_point(location, place_name, "search_place"))
		}
	});
}

MapControl.prototype.share = function () {
	if (window.h5sdk) {
		alert("调用分享API")
		window.h5sdk.biz.util.share({
			url: "http://www.skylight.xin?data=" + btoa(JSON.stringify(me.pathpoints)),
			title: "看看地球",
			image: "http://www.skylight.xin/images/mountain.png",
			content: "可以浏览全球三维地形图，并在飞书文档里分享地点和路线",
			onSuccess: function (result) {
				alert(JSON.stringify(result));
			}
		});
	}
}

MapControl.prototype.route_planning = function () {
	var me = this;

	var amap = new amap_api();
	var crd_trans = new Coordinate();

	me.viewer.entities.removeAll();
	me.draw_point(me.pathpoints[0], null, me.pathpoints[0].id);
	for (let i = 0; i < me.pathpoints.length - 1; i++) {
		let start = crd_trans.wgs84_to_gcj02(
			me.pathpoints[i].longitude,
			me.pathpoints[i].latitude
		);
		let end = crd_trans.wgs84_to_gcj02(
			me.pathpoints[i + 1].longitude,
			me.pathpoints[i + 1].latitude
		);
		let start_string = start[0].toFixed(6) + ',' + start[1].toFixed(6);
		let end_string = end[0].toFixed(6) + ',' + end[1].toFixed(6);
		amap.route_planning(start_string, end_string, (result) => {
			// console.log(result);
			if (result.status == 1) {
				var locations = [];
				result.route.paths.forEach((path, i) => {
					path.steps.forEach((step, i) => {
						step.polyline.split(';').forEach((point, i) => {
							let wgs84_crds = crd_trans.gcj02_to_wgs84(
								parseFloat(point.split(',')[0]),
								parseFloat(point.split(',')[1])
							);
							locations.push({
								longitude: wgs84_crds[0],
								latitude: wgs84_crds[1]
							})
						})
					});
				});
				me.draw_polyline(locations);
			} else {
				alert("路线规划失败")
			}
		});
		me.draw_point(me.pathpoints[i + 1], null, me.pathpoints[i + 1].id);
	}
}

//截图
function save_to_file(scene) {
	let canvas = scene.canvas;
	let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

	let link = document.createElement("a");
	let blob = data_url_to_blob(image);
	let objurl = URL.createObjectURL(blob);
	link.download = "scene.png";
	link.href = objurl;
	link.click();
}

function data_url_to_blob(dataurl) {
	let arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

//测量空间直线距离
/********************************************/
MapControl.prototype.measureLineSpace = function () {
	var me = this;
	var viewer = me.viewer;

	// 取消双击事件-追踪该位置
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
	var positions = [];
	var poly = null;
	// var tooltip = document.getElementById("toolTip");
	var distance = 0;
	var cartesian = null;
	var floatingPoint;
	// tooltip.style.display = "block";

	handler.setInputAction(function (movement) {
		//		 tooltip.style.left = movement.endPosition.x + 3 + "px";
		//		 tooltip.style.top = movement.endPosition.y - 25 + "px";
		//		 tooltip.innerHTML = '<p>单击开始，右击结束</p>';
		cartesian = viewer.scene.pickPosition(movement.endPosition);
		if (typeof cartesian != "undefined") {
			let ray = viewer.camera.getPickRay(movement.endPosition);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
			//cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
			if (positions.length >= 2) {
				if (!Cesium.defined(poly)) {
					poly = new PolyLinePrimitive(positions);
				} else {
					positions.pop();
					// cartesian.y += (1 + Math.random());
					positions.push(cartesian);
				}
				distance = getSpaceDistance(positions);
				// console.log("distance: " + distance);
				// tooltip.innerHTML='<p>'+distance+'米</p>';
			}
		}

	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	handler.setInputAction(function (movement) {
		// tooltip.style.display = "none";
		// cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		cartesian = viewer.scene.pickPosition(movement.position);
		if (typeof cartesian != "undefined") {
			let ray = viewer.camera.getPickRay(movement.position);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
			if (positions.length == 0) {
				positions.push(cartesian.clone());
			}
			positions.push(cartesian);
			//在三维场景中添加Label
			//   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			var textDisance = distance + "米";
			// console.log(textDisance + ",lng:" + cartographic.longitude/Math.PI*180.0);
			floatingPoint = viewer.entities.add({
				name: '空间直线距离',
				// position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
				position: positions[positions.length - 1],
				point: {
					pixelSize: 6,
					color: Cesium.Color.BLUE,
					outlineColor: Cesium.Color.WHITE,
					outlineWidth: 1
				},
				label: {
					text: textDisance,
					font: '18px sans-serif',
					fillColor: Cesium.Color.GOLD,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					outlineWidth: 2,
					verticalOrigin: Cesium.VerticalOrigin.BOTTOM + 100,
					pixelOffset: new Cesium.Cartesian2(20, - 20),
					heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			});
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	handler.setInputAction(function (movement) {
		handler.destroy(); //关闭事件句柄
		positions.pop(); //最后一个点无效
		//		viewer.entities.remove(floatingPoint);
		// tooltip.style.display = "none";
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	var PolyLinePrimitive = (function () {
		function _(positions) {
			this.options = {
				name: '直线',
				polyline: {
					show: true,
					positions: [],
					material: Cesium.Color.CHARTREUSE,
					width: 5,
					clampToGround: true
				}
			};
			this.positions = positions;
			this._init();
		}
		_.prototype._init = function () {
			var _self = this;

			var _update = function () {
				return _self.positions;
			};

			//实时更新polyline.positions
			this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
			viewer.entities.add(this.options);
		};
		return _;
	})();

	//空间两点距离计算函数
	function getSpaceDistance(positions) {
		var distance = 0;
		for (var i = 0; i < positions.length - 1; i++) {
			var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
			var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
			/**根据经纬度计算出距离**/
			var geodesic = new Cesium.EllipsoidGeodesic();
			geodesic.setEndPoints(point1cartographic, point2cartographic);
			var s = geodesic.surfaceDistance;
			//console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
			//返回两点之间的距离
			s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
			distance = distance + s;
		}
		return distance.toFixed(2);
	}
}

//****************************测量空间面积************************************************//
MapControl.prototype.measureAreaSpace = function () {
	var me = this;
	var viewer = me.viewer;

	// 取消双击事件-追踪该位置
	viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	// 鼠标事件
	handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
	var positions = [];
	var tempPoints = [];
	var polygon = null;
	// var tooltip = document.getElementById("toolTip");
	var cartesian = null;
	var floatingPoint; //浮动点
	// tooltip.style.display = "block";

	handler.setInputAction(function (movement) {
		// tooltip.style.left = movement.endPosition.x + 3 + "px";
		// tooltip.style.top = movement.endPosition.y - 25 + "px";
		// tooltip.innerHTML ='<p>单击开始，右击结束</p>';
		cartesian = viewer.scene.pickPosition(movement.endPosition);
		if (typeof cartesian != "undefined") {
			let ray = viewer.camera.getPickRay(movement.endPosition);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
			//cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
			if (positions.length >= 2) {
				if (!Cesium.defined(polygon)) {
					polygon = new PolygonPrimitive(positions);
				} else {
					positions.pop();
					// cartesian.y += (1 + Math.random());
					positions.push(cartesian);
				}
				// tooltip.innerHTML='<p>'+distance+'米</p>';
			}
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	handler.setInputAction(function (movement) {
		// tooltip.style.display = "none";
		cartesian = viewer.scene.pickPosition(movement.position);
		if (typeof cartesian != "undefined") {
			let ray = viewer.camera.getPickRay(movement.position);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
			// cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			if (positions.length == 0) {
				positions.push(cartesian.clone());
			}
			//positions.pop();
			positions.push(cartesian);
			//在三维场景中添加点
			var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
			var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
			var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
			var heightString = cartographic.height;
			tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString });
			floatingPoint = viewer.entities.add({
				name: '多边形面积',
				position: positions[positions.length - 1],
				point: {
					pixelSize: 6,
					color: Cesium.Color.RED,
					outlineColor: Cesium.Color.WHITE,
					outlineWidth: 1,
					heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			});
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

	handler.setInputAction(function (movement) {
		handler.destroy();
		positions.pop();
		//tempPoints.pop();
		// viewer.entities.remove(floatingPoint);
		// tooltip.style.display = "none";
		//在三维场景中添加点
		// var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
		// var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
		// var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
		// var heightString = cartographic.height;
		// tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});

		var textArea = getArea(tempPoints) + "平方公里";
		viewer.entities.add({
			name: '多边形面积',
			position: positions[positions.length - 1],
			// point : {
			//  pixelSize : 5,
			//  color : Cesium.Color.RED,
			//  outlineColor : Cesium.Color.WHITE,
			//  outlineWidth : 2,
			//  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
			// },
			label: {
				text: textArea,
				font: '18px sans-serif',
				fillColor: Cesium.Color.GOLD,
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				outlineWidth: 2,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				pixelOffset: new Cesium.Cartesian2(20, -20),
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
	var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

	//计算多边形面积
	function getArea(points) {
		var res = 0;
		//拆分三角曲面

		for (var i = 0; i < points.length - 2; i++) {
			var j = (i + 1) % points.length;
			var k = (i + 2) % points.length;
			var totalAngle = Angle(points[i], points[j], points[k]);
			var dis_temp1 = distance(positions[i], positions[j]);
			var dis_temp2 = distance(positions[j], positions[k]);
			res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
			// console.log(res);
		}

		return (res / 1000000.0).toFixed(4);
	}

	/*角度*/
	function Angle(p1, p2, p3) {
		var bearing21 = Bearing(p2, p1);
		var bearing23 = Bearing(p2, p3);
		var angle = bearing21 - bearing23;
		if (angle < 0) {
			angle += 360;
		}
		return angle;
	}
	/*方向*/
	function Bearing(from, to) {
		var lat1 = from.lat * radiansPerDegree;
		var lon1 = from.lon * radiansPerDegree;
		var lat2 = to.lat * radiansPerDegree;
		var lon2 = to.lon * radiansPerDegree;
		var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
		if (angle < 0) {
			angle += Math.PI * 2.0;
		}
		angle = angle * degreesPerRadian; //角度
		return angle;
	}

	var PolygonPrimitive = (function () {
		function _(positions) {
			this.options = {
				name: '多边形',
				polygon: {
					hierarchy: [],
					// perPositionHeight : true,
					material: Cesium.Color.GREEN.withAlpha(0.5),
					// heightReference:20000
				}
			};
			this.hierarchy = { positions };
			this._init();
		}

		_.prototype._init = function () {
			var _self = this;
			var _update = function () {
				return _self.hierarchy;
			};
			//实时更新polygon.hierarchy
			this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
			viewer.entities.add(this.options);
		};
		return _;
	})();

	function distance(point1, point2) {
		var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
		var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
		/**根据经纬度计算出距离**/
		var geodesic = new Cesium.EllipsoidGeodesic();
		geodesic.setEndPoints(point1cartographic, point2cartographic);
		var s = geodesic.surfaceDistance;
		//console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
		//返回两点之间的距离
		s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
		return s;
	}
}

MapControl.prototype.removeEntities = function () {
	var me = this;
	me.viewer.entities.removeAll();
}
