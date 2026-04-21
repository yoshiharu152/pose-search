<template>
    <div class="skeleton" ref="container">
        <n-spin :show="loading">
            <canvas ref="canvas"></canvas>
        </n-spin>

        <div class="anchor" style="top: 4px; left: 4px;">
            <a href="https://sketchfab.com/3d-models/skeleton-4de7b96a351a4a35b1b6e5415277ff07"
               target="_blank"
               title="Author of the original model"
            >
                <n-icon size="16"
                        color="#000"
                        class="icon-btn"
                >
                    <info-circle-outlined/>
                </n-icon>
            </a>
        </div>

        <div class="anchor" style="bottom: 4px; right: 4px;"
             v-if="!readonly"
        >
            <n-popconfirm @positive-click="reset">
                <template #trigger>
                    <n-icon size="22" color="#000"
                            class="icon-btn"
                            title="Reset"
                    >
                        <undo-outlined/>
                    </n-icon>
                </template>
                Reset model?
            </n-popconfirm>
        </div>

        <div class="anchor" style="top: 4px; right: 4px;">
            <div class="camera-orbit-btn" @pointerdown="onCameraOrbitDown">
                <div class="arrows">
                    <div class="arrow up"></div>
                    <div class="arrow down"></div>
                    <div class="arrow left"></div>
                    <div class="arrow right"></div>
                    <div class="center-dot"></div>
                </div>
            </div>
        </div>

        <div class="anchor" style="top: 60px; right: 14px;" @pointerdown="onCameraZoomDown">
            <div class="camera-zoom-btn">
                <div class="icon anchor" style="top: 2px">+</div>
                <div class="icon anchor" style="bottom: 2px">−</div>
            </div>
        </div>
    </div>
</template>

<script src="./SkeletonModelCanvas.ts"></script>

<style lang="scss">
.skeleton {
    position: relative;
    box-sizing: border-box;
    border: solid 1px #d9d9d9;
    border-radius: 2px;
    background: #f2f2f2;
    overflow: hidden;

    .n-spin-container,
    .n-spin-content {
        width: 100%;
        height: 100%;
    }

    .anchor {
        position: absolute;
        z-index: 2;
    }

    .icon-btn {
        opacity: .25;
        cursor: pointer;
        transition: opacity .3s;

        &:hover {
            opacity: .5;
        }
    }

    $iconColor: rgba(0, 0, 0, 0.45);
    $arrowW: 5px;
    $arrowH: 7px;

    .camera-orbit-btn {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        border: solid 1px #d9d9d9;
        position: relative;
        cursor: grab;
        user-select: none;
        touch-action: none;

        background: #fff;

        .arrows {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .arrow {
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
        }

        .up {
            top: 18%;
            border-width: 0 $arrowW $arrowH $arrowW;
            border-color: transparent transparent $iconColor transparent;
        }

        .down {
            bottom: 18%;
            border-width: $arrowH $arrowW 0 $arrowW;
            border-color: $iconColor transparent transparent transparent;
        }

        .left {
            left: 18%;
            border-width: $arrowW $arrowH $arrowW 0;
            border-color: transparent $iconColor transparent transparent;
        }

        .right {
            right: 18%;
            border-width: $arrowW 0 $arrowW $arrowH;
            border-color: transparent transparent transparent $iconColor;
        }

        .center-dot {
            width: $arrowW;
            height: $arrowW;
            background: $iconColor;
            border-radius: 50%;
        }
    }

    .camera-zoom-btn {
        width: 24px;
        height: 60px;
        border-radius: 12px;
        border: solid 1px #d9d9d9;
        position: relative;
        cursor: grab;
        user-select: none;
        touch-action: none;

        background: #fff;

        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-size: 20px;
            font-weight: bold;
            color: $iconColor;
        }
    }
}
</style>