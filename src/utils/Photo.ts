export const enum PhotoGender {
    UNMARKED, MALE, FEMALE
}

export function getPhotoGenderByTags(tags: string[]): PhotoGender {
    let male = false;
    let female = false;
    if (
        tags.includes('male')
        || tags.includes('man')
        || tags.includes('men')
        || tags.includes('boy')
        || tags.includes('boys')
    ) {
        male = true;
    }
    if (
        tags.includes('female')
        || tags.includes('woman')
        || tags.includes('women')
        || tags.includes('girl')
        || tags.includes('girls')
    ) {
        female = true;
    }
    if (male && !female) {
        return PhotoGender.MALE;
    }
    if (!male && female) {
        return PhotoGender.FEMALE;
    }
    return PhotoGender.UNMARKED;
}

export const enum PhotoClothing {
    ALL = 'all',
    SUIT = 'suit',
    SHIRT = 'shirt',
    LOOSE = 'loose',
    KIMONO = 'kimono',
    INNER = 'inner'
}

export function getPhotoClothingByTags(tags: string[]): PhotoClothing {
    const lowerTags = tags.map(t => t.toLowerCase());

    // インナー・ピタッとした服・筋肉・身体のラインが分かるキーワード群
    const innerKeywords = [
        'inner', 'tight', 'swimsuit', 'swimwear', 'bikini', 'underwear', 
        'bare', 'shirtless', 'nude', 'physique', 'muscle', 'fitness', 
        'fit', 'athletic', 'tank top', 'sports bra', 'torso', 'bodybuilder', 'abs'
    ];
    if (lowerTags.some(t => innerKeywords.some(kw => t.includes(kw)))) {
        return PhotoClothing.INNER;
    }

    if (lowerTags.some(t => ['suit', 'jacket', 'blazer', 'formal', 'tuxedo'].some(kw => t.includes(kw)))) {
        return PhotoClothing.SUIT;
    }
    if (lowerTags.some(t => ['shirt', 'blouse', 'collared', 'dress-shirt'].some(kw => t.includes(kw)))) {
        return PhotoClothing.SHIRT;
    }
    if (lowerTags.some(t => ['hoodie', 'sweatshirt', 'loose', 'oversized', 'coat', 'parka'].some(kw => t.includes(kw)))) {
        return PhotoClothing.LOOSE;
    }
    if (lowerTags.some(t => ['kimono', 'yukata', 'traditional', 'haori', 'japanese'].some(kw => t.includes(kw)))) {
        return PhotoClothing.KIMONO;
    }

    return PhotoClothing.ALL;
}

export default class Photo {
    id: string = '';
    width: number = 0;
    height: number = 0;

    full: string = '';
    regular: string = '';

    authorName: string = '';
    authorUsername: string = '';

    gender: PhotoGender = PhotoGender.UNMARKED;
    clothing: PhotoClothing = PhotoClothing.ALL;

    /** @see https://google.github.io/mediapipe/solutions/pose.html */
    normalizedLandmarks: { point: [number, number, number], visibility: number }[] = [];
    /** @see https://google.github.io/mediapipe/solutions/pose.html */
    worldLandmarks: { point: [number, number, number], visibility: number }[] = [];
}
