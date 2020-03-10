<template>
    <div class="map-outer-frame">
        <GoogleMap class="map-inner-frame"
                v-on:on-click-map="onClickInGoogleMap"
                v-on:on-mousemove-in-map="onHoverGoogleMap"
                :zoom="17"
                :center="{lat: 36.773981, lng: 140.725157}"/>

        <div class="map-overlay">

            <div class="button-panel">
                <v-btn text
                       small
                       height="40"
                       @click="onClickDrawButton">
                    <v-icon>{{ drawButtonIcon }}</v-icon>
                </v-btn>
            </div>

            <!-- マウスカーソル -->
            <div class="cursor">
                <img :src="cursorPath">
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import { Component, Vue, Prop } from 'vue-property-decorator'
    import GoogleMap from "@/views/GoogleMap.vue";
    import vuetify from "@/plugins/vuetify";

    @Component({components: {GoogleMap}})
    export default class MapFrame extends Vue{

        isDrawing = false;
        cursor: any = null;
        overlay: any = null;

        mounted() {
            this.cursor = this.$el.querySelector('.cursor');
            this.overlay = this.$el.querySelector('.map-overlay');
            const cursorSize = 30;

            this.overlay.addEventListener('mousemove', (ev: any) => {
                this.cursor.style.visibility = 'visible';
                this.cursor.style.left = (ev.pageX - cursorSize / 2) + 'px';
                this.cursor.style.top = (ev.pageY - cursorSize / 2) + 'px';
            });

            this.overlay.addEventListener('mouseenter', () => {
                // console.log('mouseenter');
                this.cursor.style.visibility = 'visible';
            });

            this.overlay.addEventListener('mouseleave', () => {
                // console.log('mouseleave');
                this.cursor.style.visibility = 'hidden';
            });
        }

        onClickInGoogleMap(map: any, ev: any) {
            alert(map + ', ' + ev.latLng.toString());
        }

        onHoverGoogleMap(map: any, ev: any) {
            console.log(ev.latLng.toString());
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

        get cursorPath() {
            if (this.isDrawing) {
                return require("../assets/orange_target.png");
            } else {
                return require("../assets/yellow_target.png");
            }
        }

    }

</script>

<style scoped lang="scss">

    $whiteSmokeTrans: #f5f5f5BB;

    .map-outer-frame {
        position: absolute;
        height: 100%;
        width: 100%;

        .map-inner-frame {

            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            position: absolute;
        }

        .map-overlay {
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            position: absolute;

            .button-panel {
                position: absolute;
                background: $whiteSmokeTrans;
                width: 50px;
                height: 200px;
                right: 30px;
                top: 30px;
            }
        }

        .cursor {
            position: absolute;
            width: 30px;
            height: 30px;
            top: 0;
            left: 0;
            z-index: 1001;
            cursor: none;
            pointer-events: none;
            visibility: hidden;

            img {
                width: 100%;
                height: 100%;
            }
        }

        /*img.yellow-target {*/
        /*   background-image: url("../assets/yellow_target.png");*/
        /*}*/

        /*img.orange-target {*/
        /*    background-image: url("../assets/orange_target.png");*/
        /*}*/
    }


</style>
