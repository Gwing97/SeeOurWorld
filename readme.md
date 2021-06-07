# 地理模型库

>   高万靖        2021年6月7日

## 一、设计目标

实现一个可用于初高中地理课堂教学以及地理科普使用的三维地图应用。



## 二、系统体系结构

### 系统软硬件环境

**存储需求**：需要较大存储容量的硬盘。

>   光是一块70km*70km的演示区域就占用了一个多GB。

服务器所运行的操作系统：Linux（目前使用的是Ubutun 20.04，可以使用其他版本的Linux）

>   目前Tomcat还是跑在windows上的，后续考虑全部迁移至Linux

服务器程序：

-   [Apache Tomcat](https://tomcat.apache.org/)：网页服务器
-   [GeoServer](http://geoserver.org/)：地图数据服务器
-   [Cesium Terrain Server](https://github.com/geo-data/cesium-terrain-server)：高程数据服务器



### 数据来源

-   数字高程模型
    -   12.5m分辨率：[ALOS PALSAR](https://search.asf.alaska.edu/)
    -   30m分辨率：[ASTGTM2](http://www.gscloud.cn/sources/details/310?pid=302)
-   全色遥感影像
    -   10m分辨率：[ALOS AVNIR2](https://search.asf.alaska.edu/)、[Sentinel 2](https://creodias.eu/)
    -   15m分辨率：高分一号
    -   30m分辨率：LandSat

>   测试区域数据下载：ALOS AVNIR2


-   背景地图（只需引用链接，无需下载）：
    -   [OpenStreetMap](https://www.openstreetmap.org/)（自带等高线）
    -   Google、MapBox遥感影像
    -   天地图（遥感影像以及地图注记）

## 三、代码说明

-   网页：
    -   index.html：首页，可浏览已制作完成的模型库

    -   map_globe.html：浏览三维地形图
    
    -   map_style.css：样式表，确定了浏览界面的样式
-   JavaScript代码文件：
    -   map.js：实现功能的主程序，通过Cesium配置我自定义的三维地形图
    -   map_contour.js：利用Cesium自带的功能渲染等高线、分层设色地形图、坡度、坡向
    -   map_overlay.js：实现了三维地图上的弹出气泡窗口
    -   amap_api.js：高德地图API，调用了地名检索、地理编码、路径规划功能
    
-   相关引用库：
    -   [Bootstrap](https://v3.bootcss.com/)：用于设计网页的用户界面

    -   [Cesium](https://github.com/CesiumGS/cesium)：提供的了基础的三维地球浏览功能

    -   [cesium-navigation](https://github.com/alberto-acevedo/cesium-navigation)：提供了地图导航栏功能

    -   [ECharts](https://echarts.apache.org/zh/index.html)：提供了统计图表等数据可视化功能

