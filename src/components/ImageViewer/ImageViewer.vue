<template>
    <teleport to="body">
        <div class="image-viewer"
             v-if="show"
             @click="onBackgroundClick"
        >
            <div class="loading"
                 v-if="fullLoading"
            >
                <n-spin style="margin-right: 8px;"/>
                Full size image loading...
            </div>

            <div class="img-wrapper"
                 @wheel="onWheel"
            >
                <img :src="fullLoading ? regular : full"
                     alt=""
                     :style="imgStyle"
                     @pointerdown="onPointerDown"
                >
            </div>

            <div class="btn-close" @click="close">
                <n-icon color="#fff" size="26">
                    <close-circle-outlined/>
                </n-icon>
            </div>

            <div class="link">
                <div style="position: absolute; left: 5px; font-style: normal; font-size: 12px; opacity: .5;">
                    ID: {{ id }}
                </div>
                <div>
                    Photo by <a :href="authorUrl" target="_blank">{{ authorName }}</a>
                    on <a :href="unsplashUrl" target="_blank">Unsplash</a>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script src="./ImageViewer.ts"></script>

<style lang="scss" scoped>
.image-viewer {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 10px 10px 30px 10px;
    background: rgba(0, 0, 0, .5);

    .img-wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;

        img {
            max-width: calc(100vw - 20px);
            max-height: calc(100vh - 40px);
            box-shadow: 0 0 12px rgba(0, 0, 0, .5);
            user-select: none;
            cursor: grab;
            touch-action: none;
        }
    }

    .btn-close {
        display: flex;
        position: absolute;
        right: 8px;
        top: 8px;
        z-index: 2;
        cursor: pointer;
    }

    .loading {
        display: flex;
        align-items: center;
        position: absolute;
        left: 8px;
        top: 8px;
        z-index: 2;
        color: #fff;
    }

    .link {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 30px;
        font-size: 14px;
        color: #fff;
        font-style: italic;

        a {
            color: #fff;
        }
    }
}
</style>