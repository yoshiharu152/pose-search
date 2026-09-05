import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchElbow from './MatchElbow';
import MatchHip from './MatchHip';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private chestMatcher = new MatchChest();
    private leftShoulderMatcher = new MatchShoulder(true);
    private rightShoulderMatcher = new MatchShoulder(false);
    private leftElbowMatcher = new MatchElbow(true);
    private rightElbowMatcher = new MatchElbow(false);
    private leftHipMatcher = new MatchHip(true);
    private rightHipMatcher = new MatchHip(false);
    private leftKneeMatcher = new MatchKnee(true);
    private rightKneeMatcher = new MatchKnee(false);

    match(model: SkeletonModel, photo: Photo): number {
        // 全身の主要部位の誤差スコアを総合加算
        const score = 
            this.chestMatcher.match(model, photo) +
            this.leftShoulderMatcher.match(model, photo) +
            this.rightShoulderMatcher.match(model, photo) +
            this.leftElbowMatcher.match(model, photo) +
            this.rightElbowMatcher.match(model, photo) +
            this.leftHipMatcher.match(model, photo) +
            this.rightHipMatcher.match(model, photo) +
            this.leftKneeMatcher.match(model, photo) +
            this.rightKneeMatcher.match(model, photo);

        return score / 9;
    }
}
