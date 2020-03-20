import PointName from "@/models/PointName";
<template>
    <div class="map-outer-frame">
        <GoogleMap class="google-map-frame"
            v-on:on-click-map="onClickOnGoogleMap"
            v-on:on-right-click-map="onRightClickMap"
            v-on:on-mousemove-in-map="onMoveInGoogleMap"
            :zoom="17"
            :center="{lat: 36.773981, lng: 140.725157}"/>

        <div class="side-panel">
            <v-btn small
                   height="40"
                   @click="onClickDrawButton">
                <v-icon>{{ drawButtonIcon }}</v-icon>
            </v-btn>
        </div>

    </div>
</template>

<script lang="ts">

    import {Component, Vue} from 'vue-property-decorator'
    import GoogleMap from "@/views/GoogleMap.vue";
    import MapPoint from "@/models/MapPoint";
    import GoogleHelper from "@/utils/GoogleHelper";
    import MapLine from "@/models/MapLine";
    import MapLineList from "@/models/MapLineList";
    import PointName from "@/models/PointName";

    @Component({components: {GoogleMap}})
    export default class MapFrame extends Vue{

        private isDrawing = false;
        private outerFrame: any = null;
        private googleMapFrame: any = null;

        mounted() {

            this.outerFrame = this.$el.querySelector('.outer-frame');
            this.googleMapFrame = this.$el.querySelector('.google-map-frame');

            window.addEventListener('resize', this.refreshMapFrameSize);

            this.refreshMapFrameSize()
        }

        private onClickOnGoogleMap(map: any, ev: any) {

            if (this.isDrawing) {
                this.addMapPoint(map, ev.latLng);
            }
        }

        private onRightClickMap(map: any, ev: any) {
            this.isDrawing = false;
            this.clearActiveUIs();
        }

        private onMoveInGoogleMap(map: any, ev: any) {

            if (this.isDrawing) {
                let pos = ev.latLng;
                const snappedPoint = MapLineList.instance.getMapPointByPosition(ev.latLng, 8);
                if (snappedPoint) {
                    pos = snappedPoint.latLng
                }
                this.refreshActiveMarker(map, pos);
                this.refreshActiveDrawingLineIfNeeded(map, pos);
            }
        }

        private onClickDrawButton() {
            this.isDrawing = !this.isDrawing;

            if (!this.isDrawing) {
                this.clearActiveUIs();
            }
        }

        private clearActiveUIs() {

            if (this.activeMarker) {
                this.activeMarker.setMap(null);
                this.activeMarker = null;
            }

            if (this.activeDrawingLine) {
                this.activeDrawingLine.setMap(null);
                this.activeDrawingLine = null;
            }

            if (this.lastMarkerPoint) {
                this.lastMarkerPoint = null;
            }
        }

        private get drawButtonIcon() {
            if (this.isDrawing) {
                return 'mdi-close-octagon-outline';
            } else {
                return 'mdi-draw';
            }
        }

        private refreshMapFrameSize() {
            const frameWidth = document.body.clientWidth - 50;
            this.googleMapFrame.style.width = frameWidth + 'px';
        }

        private activeMarker: any = null;

        private refreshActiveMarker(map: any, latLng: any) {

            if (!this.activeMarker) {
                this.activeMarker = GoogleHelper.instance.generateDrawingMarker(latLng.lat(), latLng.lng(), true);
                // 描画中はマーカーが追従してくる関係で、マップの方にクリックイベントが発生しない。
                this.activeMarker.addListener('click', () => {
                    this.addMapPoint(map, this.activeMarker.getPosition());
                });
                this.activeMarker.addListener('rightclick', () => {
                    this.isDrawing = false;
                    this.clearActiveUIs();
                });
            }
            this.activeMarker.setZIndex(GoogleHelper.instance.google.maps.Marker.MAX_ZINDEX);
            this.activeMarker.setPosition(latLng);
        }

        private lastMarkerPoint: MapPoint | null = null;
        private activeDrawingLine: any = null;


        private refreshActiveDrawingLineIfNeeded(map: any, latLng: any) {

            if (!this.lastMarkerPoint && !this.activeDrawingLine) {
                return
            }

            if (!this.activeDrawingLine) {
                this.activeDrawingLine = GoogleHelper.instance.generatePolyline(false);
            } else {
                this.activeDrawingLine.setMap(null);
            }

            if (this.lastMarkerPoint) {
                this.activeDrawingLine.setPath([this.lastMarkerPoint.latLng, latLng]);
                this.activeDrawingLine.setMap(map);
            }
        }

        private addMapPoint(map: any, latLng: any) {

            // スナップしているポイントが存在するかどうか
            let point = MapLineList.instance.getMapPointByPosition(latLng, 8);
            if (!point) {
                point = new MapPoint();
                point.marker = GoogleHelper.instance.generateDrawingMarker(latLng.lat(), latLng.lng(), false);
                point.onDragMarker = MapFrame.onDragMarker;
                point.onClickMarker = this.onClickMarkerPoint;
            }

            if (this.lastMarkerPoint) {
                const drawingLine = GoogleHelper.instance.generatePolyline(false);
                drawingLine.setPath([this.lastMarkerPoint.latLng, latLng]);
                drawingLine.setMap(map);

                const line = new MapLine(this.lastMarkerPoint, point, drawingLine);
                MapLineList.instance.add(line);

                drawingLine.addListener('click', (ev: any) => {
                    MapFrame.onClickLine(line, ev.latLng);
                });
            }

            this.lastMarkerPoint = point;
        }

        private static onDragMarker(point: MapPoint | null, latLng: any) {

            if (point !== null && !point.isActive) {
                MapLineList.instance.refreshPointMarker(point);
            }

            if (!point) return;

            const lines = MapLineList.instance.getLinesByPoint(point);
            lines.forEach((line) => {
                line.refresh();
            })
        }

        private onClickMarkerPoint(point: MapPoint) {
            if (!this.isDrawing) {
                MapLineList.instance.refreshPointMarker(point);
            }
        }

        private static onClickLine(line: MapLine, latLng: any) {
            this.addPointOnLine(line, latLng);
        }

        private static addPointOnLine(line: MapLine, latLng: any) {

            const copiedEndPoint = new MapPoint();
            copiedEndPoint.marker = GoogleHelper.instance.generateDrawingMarker(line.end.latLng.lat(), line.end.latLng.lng(), false);

            const connectedLine = MapLineList.instance.getConnectedLine(line, line.end);
            if (connectedLine) {
                const connectedPointName = connectedLine.getPointName(copiedEndPoint);
                if (connectedPointName !== PointName.None) {
                    connectedLine.setPoint(connectedPointName, copiedEndPoint);
                }
            }

            line.end.marker.setPosition(latLng);
            line.refresh();

            const polyline = GoogleHelper.instance.generatePolyline(true);
            const addedLine = new MapLine(line.end, copiedEndPoint, polyline);
            addedLine.refresh();

            MapLineList.instance.add(addedLine);
        }

    }



</script>

<style scoped lang="scss">

    $whiteSmokeTrans: #f5f5f5BB;

    .map-outer-frame {
        position: relative;
        height: 100%;
        width: 100%;

        .google-map-frame {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
        }

        .side-panel {
            top: 0;
            right: 0;
            height: 100%;
            width: 50px;
            position: absolute;
            background: whitesmoke;
        }
    }


</style>
