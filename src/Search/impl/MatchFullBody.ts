import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchCrotch from './MatchCrotch';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { mid } from './math';
import { MatchResult, PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private shoulderLeft = new MatchShoulder(true);
    private shoulderRight = new MatchShoulder(false);
    private kneeLeft = new MatchKnee(true);
    private kneeRight = new MatchKnee(false);
    private chest = new MatchChest();
    private crotch = new MatchCrotch();

    prepare(model: SkeletonModel): void {
        this.shoulderLeft.prepare(model);
        this.shoulderRight.prepare(model);
        this.kneeLeft.prepare(model);
        this.kneeRight.prepare(model);
        this.chest.prepare(model);
        this.crotch.prepare(model);
    }

    match(photo: Photo): MatchResult | null {
        // 各主要部位のマッチング計算
        const results = [
            this.chest.match(photo),
            this.crotch.match(photo),
            this.shoulderLeft.match(photo),
            this.shoulderRight.match(photo),
            this.kneeLeft.match(photo),
            this.kneeRight.match(photo)
        ].filter((r): r is MatchResult => r !== null);

        // 一定以上の部位が一致していない場合は不適合とする
        if (results.length < 2) return null;

        // 全部位の平均スコアを算出
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const avgScore = totalScore / results.length;

        // 写真のランドマークから「全身の中心点（腰〜胸の中間）」を計算してズーム位置を固定
        const normalized = photo.normalizedLandmarks;
        const centerPoint = mid(
            mid(normalized[11].point, normalized[12].point), // 両肩の中央
            mid(normalized[23].point, normalized[24].point)  // 両腰の中央
        );

        return {
            score: avgScore,
            center: centerPoint, // 全身の中心を指定することで手足のドアップ化を防止
            related: [
                normalized[11].point,
                normalized[12].point,
                normalized[23].point,
                normalized[24].point
            ],
            flip: results[0].flip
        };
    }
}
