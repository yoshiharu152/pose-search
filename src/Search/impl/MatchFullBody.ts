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
        // 各マッチャーの計算を個別に実行
        const resChest = this.chest.match(photo);
        const resCrotch = this.crotch.match(photo);
        const resShoulderL = this.shoulderLeft.match(photo);
        const resShoulderR = this.shoulderRight.match(photo);
        const resKneeL = this.kneeLeft.match(photo);
        const resKneeR = this.kneeRight.match(photo);

        const allResults = [resChest, resCrotch, resShoulderL, resShoulderR, resKneeL, resKneeR];
        const validResults = allResults.filter((r): r is MatchResult => r !== null);

        // 胸または腰すら検出できない画像は除外
        if (!resChest && !resCrotch) return null;

        // 得られたスコアの合計値（マッチした部位が多い＆精度が高いほどハイスコア）
        let totalScore = 0;
        for (const r of validResults) {
            totalScore += r.score;
        }

        // マッチした部位数に応じたボーナス（全身の多くの部位が一致している画像を優遇）
        const finalScore = totalScore * (validResults.length / 6);

        const normalized = photo.normalizedLandmarks;
        const centerPoint = mid(
            mid(normalized[11].point, normalized[12].point), // 両肩の中央
            mid(normalized[23].point, normalized[24].point)  // 両腰の中央
        );

        const sample = resChest || resCrotch || validResults[0];

        return {
            score: finalScore,
            center: centerPoint, // 全身の中央にカメラを固定
            related: [
                normalized[11].point,
                normalized[12].point,
                normalized[23].point,
                normalized[24].point
            ],
            flip: sample ? sample.flip : false
        };
    }
}
