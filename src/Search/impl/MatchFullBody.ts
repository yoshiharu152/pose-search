import SkeletonModel from '../../components/SkeletonModelCanvas/model/SkeletonModel';
import Photo from '../../utils/Photo';
import { PoseMatcher } from './search';

export default class MatchFullBody implements PoseMatcher {
    match(model: SkeletonModel, photo: Photo): number {
        if (!photo.landmarks || photo.landmarks.length === 0) {
            return -Infinity;
        }
        return 0;
    }
}
