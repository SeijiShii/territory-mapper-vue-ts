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

    import { Component, Vue, Prop } from 'vue-property-decorator'
    import GoogleMap from "@/views/GoogleMap.vue";
    import MapPoint from "@/models/MapPoint";
    import GoogleHelper from "@/utils/GoogleHelper";

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
            //

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
                const snappedPos = this.getSnappedPosition(ev.latLng);
                this.refreshActiveMarker(map, snappedPos);
                this.refreshActiveDrawingLineIfNeeded(map, snappedPos);
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

            if (this.lastPoint) {
                this.lastPoint = null;
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

        private activeColor = '#FFA500';
        private drawingColor = '#FFFF00';

        private drawingLineOptions = {
            strokeColor: this.drawingColor,
            strokeOpacity: 1.0,
            strokeWeight: 2
        };

        private activeMarker: any = null;
        private activeIcon: any = null;

        private refreshActiveMarker(map: any, latLng: any) {

            if (!this.activeIcon) {
                this.activeIcon = this.generateCircleIcon(this.activeColor);
            }

            if (!this.activeMarker) {
                this.activeMarker = new GoogleHelper.instance.google.maps.Marker({
                    map: map,
                    icon: this.activeIcon,
                });
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

        private generateCircleIcon(color: string) {
            return {
                path: 'M -8,0 A 8,8 0 0 1 0,-8 8,8 0 0 1 8,0 8,8 0 0 1 0,8 8,8 0 0 1 -8,0 Z',
                fillOpacity: 0,
                anchor: new GoogleHelper.instance.google.maps.Point(0, 0),
                strokeColor: color,
                strokeWeight: 3,
                scale: 1
            };
        }

        private lastPoint: MapPoint | null = null;
        private activeDrawingLine: any = null;


        private refreshActiveDrawingLineIfNeeded(map: any, latLng: any) {

            if (!this.lastPoint && !this.activeDrawingLine) {
                return
            }

            if (!this.activeDrawingLine) {
                this.activeDrawingLine = new GoogleHelper.instance.google.maps.Polyline(this.drawingLineOptions);
            } else {
                this.activeDrawingLine.setMap(null);
            }

            if (this.lastPoint) {
                const lastLatLng = {lat: this.lastPoint.lat, lng: this.lastPoint.lng};
                this.activeDrawingLine.setPath([lastLatLng, latLng]);
                this.activeDrawingLine.setMap(map);
            }
        }

        private markers: any[] = [];
        private addMapPoint(map: any, latLng: any) {

            const point = new MapPoint();
            point.lat = latLng.lat();
            point.lng = latLng.lng();

            const marker = new GoogleHelper.instance.google.maps.Marker({
                map: map,
                position: latLng,
                icon: this.generateCircleIcon(this.drawingColor),
            });

            // marker.addListener('mouseover', (ev: any) => {
            //      this.onMouseMovedOnExistingMarker(ev.latLng)
            // });

            // マーカーにポイントを差し込む
            marker.point = point;
            this.markers.push(marker);

            if (this.lastPoint) {
                const drawingLine = new GoogleHelper.instance.google.maps.Polyline(this.drawingLineOptions);
                const lastLatLng = {lat: this.lastPoint.lat, lng: this.lastPoint.lng};
                drawingLine.setPath([lastLatLng, point.latLng]);
                drawingLine.setMap(map);
            }

            this.lastPoint = point.clone();
        }

        // private onMouseMovedOnExistingMarker(latLng: any) {
        //     const marker = this.getMarkerByLatLng(latLng);
        //
        //     if (marker) {
        //         console.log(marker);
        //     }
        // }

        private getMarkerByLatLng(latLng: any) {

            for(let i = 0 ; i < this.markers.length; i++) {
                const marker2 = this.markers[i];
                if (GoogleHelper.instance.arePositionsClose(latLng, marker2.position, 8)) {
                    return marker2;
                }
            }
            return null;
        }

        private getSnappedPosition(latLng: any) {

            const closedMarker = this.getMarkerByLatLng(latLng);
            if (closedMarker) {
                return closedMarker.position
            }
            return latLng;
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
