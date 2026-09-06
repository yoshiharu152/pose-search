import {WarningOutlined} from '@vicons/antd';
import {NButton, NIcon, NRadio, NRadioGroup, NSelect} from 'naive-ui';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import ImageClip from '../components/ImageClip/ImageClip.vue';
import ImageViewer from '../components/ImageViewer/ImageViewer.vue';
import {BodyPart} from '../components/SkeletonModelCanvas/model/BodyPart';
import SkeletonModel from '../components/SkeletonModelCanvas/model/SkeletonModel';
import SkeletonModelCanvas from '../components/SkeletonModelCanvas/SkeletonModelCanvas.vue';
import {MAX_NUM_OF_SEARCH_RESULTS} from '../config';
import {isMouseSupported, isWebGL2Supported} from '../utils/browser-support';
import DraggableCamera from '../utils/DraggableCamera';
import Photo, { PhotoClothing, PhotoGender } from '../utils/Photo';
import PhotoDataset from '../utils/PhotoDataset';
import { searchPexelsPhotos } from '../utils/PexelsService';

import MatchChest from './impl/MatchChest';
import MatchCrotch from './impl/MatchCrotch';
import MatchElbow from './impl/MatchElbow';
import MatchElbowCameraUnrelated from './impl/MatchElbowCameraUnrelated';
import MatchFace from './impl/MatchFace';
import MatchFullBody from './impl/MatchFullBody';
import MatchHip from './impl/MatchHip';
import MatchHipCameraUnrelated from './impl/MatchHipCameraUnrelated';
import MatchKnee from './impl/MatchKnee';
import MatchKneeCameraUnrelated from './impl/MatchKneeCameraUnrelated';
import MatchShoulder from './impl/MatchShoulder';
import MatchShoulderCameraUnrelated from './impl/MatchShoulderCameraUnrelated';
import {filterAndSort, PoseMatcher, SearchResult} from './impl/search';

// 服装カテゴリーとPexels検索キーワードの対応表
const CLOTHING_QUERY_MAP: Record<string, { query: string; tag: PhotoClothing }> = {
    suit: { query: 'suit person full body', tag: PhotoClothing.SUIT },
    shirt: { query: 'shirt person full body', tag: PhotoClothing.SHIRT },
    loose: { query: 'hoodie casual person', tag: PhotoClothing.LOOSE },
    kimono: { query: 'kimono full body', tag: PhotoClothing.KIMONO },
    inner: { query: 'swimwear fitness person', tag: PhotoClothing.INNER },
};

const matchers: {
    [name: string]: {
        matcher: PoseMatcher,
        cameraUnrelatedMatcher?: PoseMatcher,
        highlights: BodyPart[],
    }
} = {
    'Full Body': {
        matcher: new MatchFullBody(),
        highlights: [
            BodyPart.head,
            BodyPart.trunk,
            BodyPart.leftUpperArm,
            BodyPart.leftLowerArm,
            BodyPart.rightUpperArm,
            BodyPart.rightLowerArm,
            BodyPart.leftThigh,
            BodyPart.leftCalf,
            BodyPart.rightThigh,
            BodyPart.rightCalf
        ]
    },
    'Face': {
        matcher: new MatchFace(),
        highlights: [BodyPart.head]
    },
    'Chest / Spine': {
        matcher: new MatchChest(),
        highlights: [BodyPart.trunk]
    },
    'Left Shoulder': {
        matcher: new MatchShoulder(true),
        cameraUnrelatedMatcher: new MatchShoulderCameraUnrelated(true),
        highlights: [BodyPart.trunk, BodyPart.leftUpperArm]
    },
    'Right Shoulder': {
        matcher: new MatchShoulder(false),
        cameraUnrelatedMatcher: new MatchShoulderCameraUnrelated(false),
        highlights: [BodyPart.trunk, BodyPart.rightUpperArm]
    },
    'Left Elbow': {
        matcher: new MatchElbow(true),
        cameraUnrelatedMatcher: new MatchElbowCameraUnrelated(true),
        highlights: [BodyPart.leftUpperArm, BodyPart.leftLowerArm]
    },
    'Right Elbow': {
        matcher: new MatchElbow(false),
        cameraUnrelatedMatcher: new MatchElbowCameraUnrelated(false),
        highlights: [BodyPart.rightUpperArm, BodyPart.rightLowerArm]
    },
    'Crotch / Waist': {
        matcher: new MatchCrotch(),
        highlights: [BodyPart.trunk]
    },
    'Left Hip': {
        matcher: new MatchHip(true),
        cameraUnrelatedMatcher: new MatchHipCameraUnrelated(true),
        highlights: [BodyPart.trunk, BodyPart.leftThigh]
    },
    'Right Hip': {
        matcher: new MatchHip(false),
        cameraUnrelatedMatcher: new MatchHipCameraUnrelated(false),
        highlights: [BodyPart.trunk, BodyPart.rightThigh]
    },
    'Left Knee': {
        matcher: new MatchKnee(true),
        cameraUnrelatedMatcher: new MatchKneeCameraUnrelated(true),
        highlights: [BodyPart.leftThigh, BodyPart.leftCalf]
    },
    'Right Knee': {
        matcher: new MatchKnee(false),
        cameraUnrelatedMatcher: new MatchKneeCameraUnrelated(false),
        highlights: [BodyPart.rightThigh, BodyPart.rightCalf]
    }
};

export default defineComponent({
    components: {
        NButton,
        NSelect,
        NRadio,
        NRadioGroup,
        NIcon,
        WarningOutlined,
        SkeletonModelCanvas,
        ImageClip,
        ImageViewer,
    },
    setup() {
        const supportWebGL2 = isWebGL2Supported();
        const supportMouse = isMouseSupported();

        const dataset = new PhotoDataset();
        const model = new SkeletonModel();
        const camera = new DraggableCamera();

        const searchResultDom = ref<HTMLElement>();

        const dbLoading = ref(false);
        const bodyPartOptions = Object.keys(matchers).map(option => ({value: option, label: option}));
        const bodyPart = ref<string>('Full Body');
        const gender = ref(0);
        const clothingType = ref('all');
        const cameraRelated = ref(1);

        const searching = ref(false);
        const searchResult = ref<SearchResult[]>();

        const showImageViewer = ref(false);
        const imageViewerFlip = ref(false);
        const currentPhoto = ref<Photo>(new Photo());

        onMounted(async function () {
            try {
                dbLoading.value = true;
                await nextTick();
                await dataset.load();
            } finally {
                dbLoading.value = false;
            }
        });

        async function search() {
            try {
                searching.value = true;
                searchResult.value = [];
                await nextTick();

                let pexelsResults: SearchResult[] = [];

                if (clothingType.value && clothingType.value !== 'all') {
                    const config = CLOTHING_QUERY_MAP[clothingType.value];
                    if (config) {
                        const fetchedPhotos = await searchPexelsPhotos(config.query, config.tag, 15);
                        
                        pexelsResults = fetchedPhotos.map(photo => ({
                            photo,
                            score: 0.8,
                            flip: false,
                            center: [0, 0, 0] as [number, number, number],
                            related: {}
                        } as SearchResult));
                    }
                }

                const bodyPartMatchers = matchers[bodyPart.value!];
                if (bodyPartMatchers) {
                    let list = dataset.data;

                    if (gender.value) {
                        list = list.filter(photo => photo.gender === gender.value || photo.gender === PhotoGender.UNMARKED);
                    }

                    if (clothingType.value && clothingType.value !== 'all') {
                        const types = ['suit', 'shirt', 'loose', 'kimono', 'inner'];
                        const selectedIndex = types.indexOf(clothingType.value);
                        if (selectedIndex >= 0) {
                            list = list.filter((_, index) => (index % types.length) === selectedIndex);
                        }
                    }

                    const isCameraOn = Number(cameraRelated.value) !== 0;
                    const matcher = isCameraOn || !bodyPartMatchers.cameraUnrelatedMatcher ?
                        bodyPartMatchers.matcher : bodyPartMatchers.cameraUnrelatedMatcher;

                    let localResults: SearchResult[] = [];
                    try {
                        localResults = filterAndSort(list, model, matcher);
                    } catch (e) {
                        console.warn('Local pose matching skipped due to data format:', e);
                    }

                    searchResult.value = [...pexelsResults, ...localResults].slice(0, MAX_NUM_OF_SEARCH_RESULTS);

                    if (searchResultDom.value) {
                        searchResultDom.value.scrollTop = 0;
                    }
                }
            } catch (err) {
                console.error('Search Error:', err);
            } finally {
                searching.value = false;
            }
        }

        function showLargePhoto(item: SearchResult) {
            showImageViewer.value = true;
            imageViewerFlip.value = item.flip;
            currentPhoto.value = item.photo;
        }

        function onControlPointClick(clickedBodyPart: BodyPart) {
            let bestMatch: string | null = null;
            let bestScore = -1;

            for (const [optionName, matcherData] of Object.entries(matchers)) {
                if (optionName === 'Full Body') continue;
                const highlights = matcherData.highlights;
                const index = highlights.indexOf(clickedBodyPart);

                if (index >= 0) {
                    const score = (highlights.length - index) * 100 - highlights.length;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = optionName;
                    }
                }
            }

            if (bestMatch) {
                bodyPart.value = bestMatch;
            }
        }

        return {
            supportWebGL2,
            supportMouse,

            matchers,
            model,
            camera,

            searchResultDom,

            dbLoading,
            bodyPartOptions,
            bodyPart,
            gender,
            clothingType,
            cameraRelated,

            searchResult,
            searching,

            showImageViewer,
            imageViewerFlip,
            currentPhoto,

            search,
            showLargePhoto,
            onControlPointClick,
        };
    }
});
