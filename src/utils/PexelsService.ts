import Photo, { PhotoClothing, PhotoGender } from './Photo';

// 取得したPexels APIキーをここに設定してください
const PEXELS_API_KEY = 'ZstaRWCgbf3EmLAH0SQ1nFRR8OmQZz6YgesXS0UGO97LPJd59HjRi6VY';

/**
 * Pexels APIから服装キーワードで画像を検索してPhotoオブジェクト配列で返します
 * @param query 検索キーワード（例: "suit person", "kimono", "swimwear"）
 * @param clothingTag 割り当てる服装タグ
 * @param perPage 取得件数（デフォルト20件）
 */
export async function searchPexelsPhotos(
    query: string, 
    clothingTag: PhotoClothing = PhotoClothing.ALL, 
    perPage: number = 20
): Promise<Photo[]> {
    if (!PEXELS_API_KEY || PEXELS_API_KEY === 'ZstaRWCgbf3EmLAH0SQ1nFRR8OmQZz6YgesXS0UGO97LPJd59HjRi6VY') {
        console.warn('Pexels APIキーが設定されていません。');
        return [];
    }

    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`, 
            {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Pexels API エラー: ${response.statusText}`);
        }

        const data = await response.json();

        return data.photos.map((item: any) => {
            const photo = new Photo();
            photo.id = `pexels-${item.id}`;
            photo.width = item.width;
            photo.height = item.height;
            photo.full = item.src.large2x || item.src.original;
            photo.regular = item.src.large || item.src.medium;
            photo.authorName = item.photographer;
            photo.authorUsername = item.photographer;
            photo.gender = PhotoGender.UNMARKED;
            photo.clothing = clothingTag;
            return photo;
        });
    } catch (error) {
        console.error('Pexelsからの画像取得に失敗しました:', error);
        return [];
    }
}
