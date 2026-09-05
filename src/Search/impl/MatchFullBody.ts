import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchElbow from './MatchElbow';
import MatchHip from './MatchHip';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { MatchResult, PoseMatcher } from './search';

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

    prepare(model: SkeletonModel): void {
        for (const matcher of this.matchers) {
            if (matcher.prepare) {
                matcher.prepare(model);
            }
        }
    }

    match(photo: Photo): MatchResult | null {
        let totalScore = 0;
        let count = 0;
        let isFlipped = false;

        for (const matcher of this.matchers) {
            try {
                const result = matcher.match(photo);
                if (result && typeof result.score === 'number' && !isNaN(result.score)) {
                    totalScore += result.score;
                    count++;
                    if (result.flip) {
                        isFlipped = true;
                    }
                }
            } catch {
                // 安全にスキップ
            }
        }

        if (count === 0) {
            return null;
        }

        return {
            score: totalScore / count,
            flip: isFlipped
        } as MatchResult;
    }
}
