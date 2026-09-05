import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchCrotch from './MatchCrotch';
import { MatchResult, PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private chestMatcher = new MatchChest();
    private crotchMatcher = new MatchCrotch();

    prepare(model: SkeletonModel): void {
        this.chestMatcher.prepare(model);
        this.crotchMatcher.prepare(model);
    }

    match(photo: Photo): MatchResult | null {
        const resChest = this.chestMatcher.match(photo);
        const resCrotch = this.crotchMatcher.match(photo);

        if (!resChest && !resCrotch) return null;

        const score1 = resChest ? resChest.score : -100;
        const score2 = resCrotch ? resCrotch.score : -100;
        const flip = resChest ? resChest.flip : (resCrotch ? resCrotch.flip : false);

        return {
            score: (score1 + score2) / 2,
            flip: flip
        };
    }
}
