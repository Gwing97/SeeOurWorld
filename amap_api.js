
var amap_api = function(){
	this.amap_key = "99ef4ceb65c7e636823e45e9de520dc3";

}

amap_api.prototype.route_planning = function(origin, destination, callback) {
	var me = this;

	$.ajax({
		url: "https://restapi.amap.com/v3/direction/driving",
		method: "GET",	//method是jquery1.9.0加入的属性，如果使用1.9.0之前的版本，则用type
		async: true,
		data: {
			key: me.amap_key,
			origin: origin,
			destination: destination
		},
		success: function(result){
			callback(result);
		},
		error: function(result){
			console.log("无法使用高德API");
		}
	});
}

amap_api.prototype.search = function(search_text, callback) {
	var me = this;

	$.ajax({
		url: "https://restapi.amap.com/v3/place/text",
		method: "GET",	//method是jquery1.9.0加入的属性，如果使用1.9.0之前的版本，则用type
		async: true,
		data: {
			key: me.amap_key,
			keywords: search_text,
			offset: 5,
			page: 1,
			extensions: "base"
		},
		success: function(result){
			callback(result);
		},
		error: function(result){
			console.log("无法使用高德API");
		}
	});
}

amap_api.prototype.geocode = function(location, callback) {
	var me = this;

	let crd_trans = new Coordinate();
	let gaode_crds = crd_trans.wgs84_to_gcj02(location.longitude,location.latitude);

	$.ajax({
		url: "https://restapi.amap.com/v3/geocode/regeo",
		method: "GET",	//method是jquery1.9.0加入的属性，如果使用1.9.0之前的版本，则用type
		async: true,
		data: {
			key: me.amap_key,
			location: `${gaode_crds[0]},${gaode_crds[1]}`,
			extensions: "base"
		},
		success: function(result){
			callback(result);
		},
		error: function(result){
			console.log("无法使用高德API");
		}
	});
}
