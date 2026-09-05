import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import MatchChest from './MatchChest';
import MatchCrotch from './MatchCrotch';
import MatchElbow from './MatchElbow';
import MatchKnee from './MatchKnee';
import MatchShoulder from './MatchShoulder';
import { mid } from './math';
import { MatchResult, PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    private shoulderLeft = new MatchShoulder(true);
    private shoulderRight = new MatchShoulder(false);
    private elbowLeft = new MatchElbow(true);
    private elbowRight = new MatchElbow(false);
    private kneeLeft = new MatchKnee(true);
    private kneeRight = new MatchKnee(false);
    private chest = new MatchChest();
    private crotch = new MatchCrotch();

    prepare(model: SkeletonModel): void {
        this.shoulderLeft.prepare(model);
        this.shoulderRight.prepare(model);
        this.elbowLeft.prepare(model);
        this.elbowRight.prepare(model);
        this.kneeLeft.prepare(model);
        this.kneeRight.prepare(model);
        this.chest.prepare(model);
        this.crotch.prepare(model);
    }

    match(photo: Photo): MatchResult | null {
        // 全部位（胸・腰・左右肩・左右肘・左右膝）のスコアを算定
        const resChest = this.chest.match(photo);
        const resCrotch = this.crotch.match(photo);
        const resShoulderL = this.shoulderLeft.match(photo);
        const resShoulderR = this.shoulderRight.match(photo);
        const resElbowL = this.elbowLeft.match(photo);
        const resElbowR = this.elbowRight.match(photo);
        const resKneeL = this.kneeLeft.match(photo);
        const resKneeR = this.kneeRight.match(photo);

        const allResults = [
            resChest, resCrotch,
            resShoulderL, resShoulderR,
            resElbowL, resElbowR,
            resKneeL, resKneeR
        ];
        const validResults = allResults.filter((r): r is MatchResult => r !== null);

        // 胸または腰すら検出できない画像は除外
        if (!resChest && !resCrotch) return null;

        // 得られたスコアの合計値
        let totalScore = 0;
        for (const r of validResults) {
            totalScore += r.score;
        }

        // 判定できた部位の比率に応じてボーナス計算（8部位中どれだけ判定できたか）
        const finalScore = totalScore * (validResults.length / 8);

        const normalized = photo.normalizedLandmarks;

        // 画面のズーム・カメラ位置の指定
        // 胴体の中央を中心点にする
        const centerPoint = mid(
            mid(normalized[11].point, normalized[12].point), // 両肩の中央
            mid(normalized[23].point, normalized[24].point)  // 両腰の中央
        );

        const sample = resChest || resCrotch || validResults[0];

        return {
            score: finalScore,
            center: centerPoint,
            // 関連座標に「手首(15, 16)」と「足首(27, 28)」を追加して広範囲（全身）をズームアウト表示させる
            related: [
                normalized[11].point, // 左肩
                normalized[12].point, // 右肩
                normalized[15].point, // 左手首
                normalized[16].point, // 右手首
                normalized[23].point, // 左腰
                normalized[24].point, // 右腰
                normalized[27].point, // 左足首
                normalized[28].point  // 右足首
            ],
            flip: sample ? sample.flip : false
        };
    }
}
