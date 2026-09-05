import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchElbow from './MatchElbow';
import MatchHip from './MatchHip';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private matchers: PoseMatcher[];

    constructor() {
        this.matchers = [
            new MatchChest() as PoseMatcher,
            new MatchShoulder(true) as PoseMatcher,
            new MatchShoulder(false) as PoseMatcher,
            new MatchElbow(true) as PoseMatcher,
            new MatchElbow(false) as PoseMatcher,
            new MatchHip(true) as PoseMatcher,
            new MatchHip(false) as PoseMatcher,
            new MatchKnee(true) as PoseMatcher,
            new MatchKnee(false) as PoseMatcher
        ];
    }

    // PoseMatcherに必要な prepare(model) を実装
    prepare(model: SkeletonModel): void {
        for (const matcher of this.matchers) {
            if (matcher.prepare) {
                matcher.prepare(model);
            }
        }
    }

    // PoseMatcherに必要な match(photo) を実装 (1つの引数)
    match(photo: Photo): number {
        let total = 0;
        let count = 0;

        for (const matcher of this.matchers) {
            try {
                const score = matcher.match(photo);
                if (typeof score === 'number' && !isNaN(score)) {
                    total += score;
                    count++;
                }
            } catch {
                // 安全にスキップ
            }
        }

        return count > 0 ? total / count : 0;
    }
}
