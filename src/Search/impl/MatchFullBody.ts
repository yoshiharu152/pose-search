import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchElbow from './MatchElbow';
import MatchHip from './MatchHip';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private chestMatcher: PoseMatcher;
    private leftShoulderMatcher: PoseMatcher;
    private rightShoulderMatcher: PoseMatcher;
    private leftElbowMatcher: PoseMatcher;
    private rightElbowMatcher: PoseMatcher;
    private leftHipMatcher: PoseMatcher;
    private rightHipMatcher: PoseMatcher;
    private leftKneeMatcher: PoseMatcher;
    private rightKneeMatcher: PoseMatcher;

    constructor() {
        this.chestMatcher = new MatchChest();
        this.leftShoulderMatcher = new MatchShoulder(true);
        this.rightShoulderMatcher = new MatchShoulder(false);
        this.leftElbowMatcher = new MatchElbow(true);
        this.rightElbowMatcher = new MatchElbow(false);
        this.leftHipMatcher = new MatchHip(true);
        this.rightHipMatcher = new MatchHip(false);
        this.leftKneeMatcher = new MatchKnee(true);
        this.rightKneeMatcher = new MatchKnee(false);
    }

    match(model: SkeletonModel, photo: Photo): number {
        // 各部位のスコアを取得して安全に平均値を算出
        const scores = [
            this.chestMatcher.match(model, photo),
            this.leftShoulderMatcher.match(model, photo),
            this.rightShoulderMatcher.match(model, photo),
            this.leftElbowMatcher.match(model, photo),
            this.rightElbowMatcher.match(model, photo),
            this.leftHipMatcher.match(model, photo),
            this.rightHipMatcher.match(model, photo),
            this.leftKneeMatcher.match(model, photo),
            this.rightKneeMatcher.match(model, photo)
        ];

        const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
        if (validScores.length === 0) return 0;

        const sum = validScores.reduce((acc, curr) => acc + curr, 0);
        return sum / validScores.length;
    }
}
