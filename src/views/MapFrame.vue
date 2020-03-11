<template>
    <div class="map-outer-frame">
        <GoogleMap class="google-map-frame"
            v-on:on-google-map-mounted="onGoogleMapMounted"
            v-on:on-click-map="onClickOnGoogleMap"
            v-on:on-mousemove-in-map="onMoveInGoogleMap"
            :zoom="17"
            :center="{lat: 36.773981, lng: 140.725157}"/>

        <div class="side-panel">
            <v-btn text
                   small
                   height="40"
                   @click="onClickDrawButton">
                <v-icon>{{ drawButtonIcon }}</v-icon>
            </v-btn>
        </div>

<!--        <canvas class="map-overlay-canvas"></canvas>-->

    </div>
</template>

<script lang="ts">

    import { Component, Vue, Prop } from 'vue-property-decorator'
    import GoogleMap from "@/views/GoogleMap.vue";
    import vuetify from "@/plugins/vuetify";

    @Component({components: {GoogleMap}})
    export default class MapFrame extends Vue{

        google: any = null;
        isDrawing = false;
        outerFrame: any = null;
        googleMapFrame: any = null;
        // mapOverlayCanvas: any = null;

        mounted() {

            this.outerFrame = this.$el.querySelector('.outer-frame');
            this.googleMapFrame = this.$el.querySelector('.google-map-frame');
            // this.mapOverlayCanvas = this.$el.querySelector('.map-overlay-canvas');

            window.addEventListener('resize', this.refreshMapFrameSize);

            this.refreshMapFrameSize()
        }

        onGoogleMapMounted(google: any) {
            this.google = google;
        }

        onClickOnGoogleMap(map: any, ev: any) {
            // alert(map + ', ' + ev.latLng.toString());

        }

        onMoveInGoogleMap(map: any, ev: any) {
            // console.log(point);

            // this.drawCoordinateLines(point.x, point.y);

            if (this.isDrawing) {
                this.drawCoordinateLines(map, ev.latLng)
            }

        }

        onClickDrawButton() {
            this.isDrawing = !this.isDrawing;
        }



        get drawButtonIcon() {
            if (this.isDrawing) {
                return 'mdi-close-octagon-outline';
            } else {
                return 'mdi-draw';
            }
        }

        refreshMapFrameSize() {
            const frameWidth = document.body.clientWidth - 50;
            this.googleMapFrame.style.width = frameWidth + 'px';

            // this.mapOverlayCanvas.style.width = frameWidth + 'px';
            // this.mapOverlayCanvas.style.height = document.body.clientHeight + 'px';
            //
            // // ここで再びカンバスに自分の大きさを教えないと座標が壊れる。
            // this.mapOverlayCanvas.width = this.mapOverlayCanvas.offsetWidth;
            // this.mapOverlayCanvas.height = this.mapOverlayCanvas.offsetHeight;
        }

        activeColor = '#FFA500';

        coordinateLineOptions = {
            strokeColor: this.activeColor,
            strokeOpacity: 1.0,
            strokeWeight: 1
        };

        verticalLine: any = null;
        horizontalLine: any = null;

        drawCoordinateLines(map: any, latLng: any) {

            const x = latLng.lat(),
                y = latLng.lng();

            if (this.verticalLine) {
                this.verticalLine.setMap(null);
            } else {
                this.verticalLine = new this.google.maps.Polyline(this.coordinateLineOptions);
            }

            this.verticalLine.setPath([{lat: -90, lng: y}, {lat: 0, lng: y}, {lat: 90, lng: y}]);
            this.verticalLine.setMap(map);

            if (this.horizontalLine) {
                this.horizontalLine.setMap(null);

            } else {
                this.horizontalLine = new this.google.maps.Polyline(this.coordinateLineOptions);

            }

            this.horizontalLine.setPath([{lat: x, lng: -180}, {lat: x, lng: 0}, {lat: x, lng: 180}]);
            this.horizontalLine.setMap(map);
        }

        // drawCoordinateLines(x: number, y: number) {
        //     const ctx = this.mapOverlayCanvas.getContext('2d');
        //
        //     if (ctx) {
        //         ctx.clearRect(0, 0, this.mapOverlayCanvas.width, this.mapOverlayCanvas.height);
        //
        //         if (this.isDrawing) {
        //
        //             ctx.strokeStyle = 'rgb(255, 165, 0)';
        //
        //             ctx.beginPath();
        //             ctx.moveTo(0, y);
        //             ctx.lineTo(this.mapOverlayCanvas.width, y);
        //             ctx.stroke();
        //
        //             ctx.beginPath();
        //             ctx.moveTo(x, 0);
        //             ctx.lineTo(x, this.mapOverlayCanvas.height);
        //             ctx.stroke();
        //         }
        //     }
        // }

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

        /*.map-overlay-canvas {*/
        /*    position: absolute;*/
        /*    top: 0;*/
        /*    left: 0;*/
        /*    pointer-events: none;*/
        /*}*/
    }


</style>
