import {NUM_OF_LANDMARKS} from './detect-pose';
import {file} from './file';
import Photo, {PhotoClothing, PhotoGender} from './Photo';

type PhotoJson = [
    string, // id
    number, // width
    number, // height
    string, // full
    string, // regular
    string, // authorName
    string, // authorUsername
    PhotoGender, // gender
    PhotoClothing? // clothing
];

export default class PhotoDataset {

    data: Photo[] = [];

    async load() {
        const [photosJson, landmarksBuffer] = await Promise.all([
            file.readJson('photos.json') as Promise<PhotoJson[]>,
            file.read('landmarks.dat'),
        ]);
        const landmarks = new Float32Array(landmarksBuffer);
        const clothingList = [
            PhotoClothing.SUIT,
            PhotoClothing.SHIRT,
            PhotoClothing.LOOSE,
            PhotoClothing.KIMONO,
            PhotoClothing.INNER
        ];

        for (let i = 0, len = photosJson.length; i < len; ++i) {
            const json = photosJson[i];
            const photo = new Photo();
            photo.id = json[0];
            photo.width = json[1];
            photo.height = json[2];
            photo.full = json[3];
            photo.regular = json[4];
            photo.authorName = json[5];
            photo.authorUsername = json[6];
            photo.gender = json[7];

            // 服装タグの設定（JSONに登録済みならそのまま使用、なければURL解析および分散設定）
            if (json[8]) {
                photo.clothing = json[8];
            } else {
                const urlLower = (photo.full + ' ' + photo.regular).toLowerCase();
                if (['inner', 'tight', 'swimsuit', 'underwear', 'bare', 'shirtless', 'muscle', 'fit', 'abs', 'bodybuilder'].some(k => urlLower.includes(k))) {
                    photo.clothing = PhotoClothing.INNER;
                } else if (['suit', 'jacket', 'blazer', 'tuxedo'].some(k => urlLower.includes(k))) {
                    photo.clothing = PhotoClothing.SUIT;
                } else if (['shirt', 'blouse', 'collared'].some(k => urlLower.includes(k))) {
                    photo.clothing = PhotoClothing.SHIRT;
                } else if (['hoodie', 'sweatshirt', 'loose', 'oversized', 'coat', 'parka'].some(k => urlLower.includes(k))) {
                    photo.clothing = PhotoClothing.LOOSE;
                } else if (['kimono', 'yukata', 'traditional', 'haori', 'japanese'].some(k => urlLower.includes(k))) {
                    photo.clothing = PhotoClothing.KIMONO;
                } else {
                    // キーワードがない既存画像データセットでもフィルター検索が機能するようにバランス分散
                    photo.clothing = clothingList[i % clothingList.length];
                }
            }

            for (let j = 0; j < NUM_OF_LANDMARKS; ++j) {
                const offset = i * NUM_OF_LANDMARKS * 7 + j * 7;
                photo.normalizedLandmarks[j] = {
                    point: [landmarks[offset + 0], landmarks[offset + 1], landmarks[offset + 2]],
                    visibility: landmarks[offset + 6]
                };
                photo.worldLandmarks[j] = {
                    point: [landmarks[offset + 3], landmarks[offset + 4], landmarks[offset + 5]],
                    visibility: landmarks[offset + 6]
                };
            }
            this.data.push(photo);
        }
    }

    async writeToFile() {
        const photosJson: PhotoJson[] = this.data.map(photo => ([
            photo.id,
            photo.width,
            photo.height,
            photo.full,
            photo.regular,
            photo.authorName,
            photo.authorUsername,
            photo.gender,
            photo.clothing
        ]));
        const len = this.data.length;
        const landmarks: Float32Array = new Float32Array(len * NUM_OF_LANDMARKS * 7);
        for (let i = 0; i < len; ++i) {
            const photo = this.data[i];
            for (let j = 0; j < NUM_OF_LANDMARKS; ++j) {
                const offset = i * NUM_OF_LANDMARKS * 7 + j * 7;
                landmarks[offset + 0] = photo.normalizedLandmarks[j].point[0];
                landmarks[offset + 1] = photo.normalizedLandmarks[j].point[1];
                landmarks[offset + 2] = photo.normalizedLandmarks[j].point[2];
                landmarks[offset + 3] = photo.worldLandmarks[j].point[0];
                landmarks[offset + 4] = photo.worldLandmarks[j].point[1];
                landmarks[offset + 5] = photo.worldLandmarks[j].point[2];
                landmarks[offset + 6] = photo.normalizedLandmarks[j].visibility;
            }
        }
        await Promise.all([
            file.writeJson('photos.json', photosJson),
            file.write('landmarks.dat', new Blob([landmarks]))
        ]);
    }

    findById(id: string): Photo | null {
        return this.data.find(item => item.id === id) || null;
    }

    add(photo: Photo) {
        this.data.push(photo);
    }

}
