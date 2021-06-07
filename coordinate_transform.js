/**
* Created by Wandergis on 2015/7/8.
* 提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
* coordinate_transform.js
*/
var Coordinate = function () {
	var me = this;

	//定义一些常量
	me.x_PI = 3.14159265358979324 * 3000.0 / 180.0;
	me.PI = 3.1415926535897932384626;
	me.a = 6378245.0;
	me.ee = 0.00669342162296594323;
};

Coordinate.prototype.transformlat = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
	ret += (20.0 * Math.sin(6.0 * lng * me.PI) + 20.0 * Math.sin(2.0 * lng * me.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(lat * me.PI) + 40.0 * Math.sin(lat / 3.0 * me.PI)) * 2.0 / 3.0;
	ret += (160.0 * Math.sin(lat / 12.0 * me.PI) + 320 * Math.sin(lat * me.PI / 30.0)) * 2.0 / 3.0;
	return ret
};

Coordinate.prototype.transformlng = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
	ret += (20.0 * Math.sin(6.0 * lng * me.PI) + 20.0 * Math.sin(2.0 * lng * me.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(lng * me.PI) + 40.0 * Math.sin(lng / 3.0 * me.PI)) * 2.0 / 3.0;
	ret += (150.0 * Math.sin(lng / 12.0 * me.PI) + 300.0 * Math.sin(lng / 30.0 * me.PI)) * 2.0 / 3.0;
	return ret
};


/**
* 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
* 即 百度 转 谷歌、高德
* @param bd_lon
* @param bd_lat
* @returns {*[]}
*/
Coordinate.prototype.bd09_to_gcj02 = function (bd_lon, bd_lat) {
	var me = this;

	var bd_lon = +bd_lon;
	var bd_lat = +bd_lat;
	var x = bd_lon - 0.0065;
	var y = bd_lat - 0.006;
	var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * me.x_PI);
	var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * me.x_PI);
	var gg_lng = z * Math.cos(theta);
	var gg_lat = z * Math.sin(theta);
	return [gg_lng, gg_lat]
};

/**
* 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
* 即谷歌、高德 转 百度
* @param lng
* @param lat
* @returns {*[]}
*/
Coordinate.prototype.gcj02_to_bd09 = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * me.x_PI);
	var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * me.x_PI);
	var bd_lng = z * Math.cos(theta) + 0.0065;
	var bd_lat = z * Math.sin(theta) + 0.006;
	return [bd_lng, bd_lat]
};

/**
* WGS84转GCj02
* @param lng
* @param lat
* @returns {*[]}
*/
Coordinate.prototype.wgs84_to_gcj02 = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	if (me.out_of_china(lng, lat)) {
		return [lng, lat]
	} else {
		var dlat = me.transformlat(lng - 105.0, lat - 35.0);
		var dlng = me.transformlng(lng - 105.0, lat - 35.0);
		var radlat = lat / 180.0 * me.PI;
		var magic = Math.sin(radlat);
		magic = 1 - me.ee * magic * magic;
		var sqrtmagic = Math.sqrt(magic);
		dlat = (dlat * 180.0) / ((me.a * (1 - me.ee)) / (magic * sqrtmagic) * me.PI);
		dlng = (dlng * 180.0) / (me.a / sqrtmagic * Math.cos(radlat) * me.PI);
		var mglat = lat + dlat;
		var mglng = lng + dlng;
		return [mglng, mglat]
	}
};

/**
* GCJ02 转换为 WGS84
* @param lng
* @param lat
* @returns {*[]}
*/
Coordinate.prototype.gcj02_to_wgs84 = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	if (me.out_of_china(lng, lat)) {
		return [lng, lat]
	} else {
		var dlat = me.transformlat(lng - 105.0, lat - 35.0);
		var dlng = me.transformlng(lng - 105.0, lat - 35.0);
		var radlat = lat / 180.0 * me.PI;
		var magic = Math.sin(radlat);
		magic = 1 - me.ee * magic * magic;
		var sqrtmagic = Math.sqrt(magic);
		dlat = (dlat * 180.0) / ((me.a * (1 - me.ee)) / (magic * sqrtmagic) * me.PI);
		dlng = (dlng * 180.0) / (me.a / sqrtmagic * Math.cos(radlat) * me.PI);
		var mglat = lat + dlat;
		var mglng = lng + dlng;
		return [lng * 2 - mglng, lat * 2 - mglat]
	}
};

/**
* 判断是否在国内，不在国内则不做偏移
* @param lng
* @param lat
* @returns {boolean}
*/
Coordinate.prototype.out_of_china = function (lng, lat) {
	var me = this;

	var lat = +lat;
	var lng = +lng;
	// 纬度3.86~53.55,经度73.66~135.05
	return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
};
