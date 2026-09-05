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
        // 各部位のマッチャーを安全に配列として保持
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

    match(model: SkeletonModel, photo: Photo): number {
        let total = 0;
        let count = 0;

        // 各部位のスコアを計算（エラー落ちを防ぐ安全設計）
        for (const matcher of this.matchers) {
            try {
                const score = matcher.match(model, photo);
                if (typeof score === 'number' && !isNaN(score)) {
                    total += score;
                    count++;
                }
            } catch {
                // 個別部位でエラーが出た場合はスキップ
            }
        }

        return count > 0 ? total / count : 0;
    }
}
