import type { VocabularyCard, VocabularyDeck } from './vocabulary';

const cards: VocabularyCard[] = [
  card('airport', '공항', '空港', 'gonghang', '공항에 가요.', '場所 + 에 가요 = 〜へ行きます。'),
  card('international-flight', '국제선', '国際線', 'gukjeseon', '국제선 터미널은 어디예요?', '国内線は 국내선。'),
  card('passport', '여권', 'パスポート', 'yeogwon', '여권을 보여 주세요.', '을/를 は目的語につく助詞。'),
  card('ticket', '항공권', '航空券', 'hanggonggwon', '항공권을 확인해 주세요.', '권 は「券」。'),
  card('baggage-check', '수하물 검사', '手荷物検査', 'suhamul geomsa', '수하물 검사는 어디예요?', '검사 は「検査」。'),
  card('departure-country', '출국', '出国', 'chulguk', '출국 심사를 받아요.', '入国は 입국。'),
  card('boarding-gate', '탑승구', '搭乗口', 'tapseunggu', '탑승구가 어디예요?', '구 は「口」。'),
  card('departure', '출발', '出発', 'chulbal', '출발 시간이 언제예요?', '空港や駅でよく見る単語。'),
  card('arrival', '도착', '到着', 'dochak', '도착 시간이 언제예요?', '출발 とセットで覚える。'),
  card('window-seat', '창가 좌석', '窓側の席', 'changga jwaseok', '창가 좌석으로 주세요.', '좌석 は「座席」。'),
  card('aisle-seat', '통로 좌석', '通路側の席', 'tongno jwaseok', '통로 좌석으로 주세요.', '통로 は通路。'),
  card('immigration', '입국 심사', '入国審査', 'ipguk simsa', '입국 심사를 받았어요.', '심사 は「審査」。'),
  card('baggage-claim', '수하물 찾는 곳', '手荷物受取所', 'suhamul chatneun got', '수하물 찾는 곳은 어디예요?', '찾는 곳 = 探す場所・受け取る場所。'),
  card('duty-free', '면세', '免税', 'myeonse', '면세점에 가요.', '면세점 は免税店。'),
  card('exchange', '환전', '両替', 'hwanjeon', '환전하고 싶어요.', '旅行でかなり使う動詞表現。'),
  card('airport-limo', '공항 리무진', '空港リムジン', 'gonghang rimujin', '공항 리무진을 타요.', '버스 と一緒に覚えると便利。'),
  card('direct-train', '직통 열차', '直通列車', 'jiktong yeolcha', '직통 열차가 있어요?', '열차 は列車。'),
  card('fee', '요금', '料金', 'yogeum', '요금이 얼마예요?', '얼마예요? = いくらですか。'),
  card('taxi', '택시', 'タクシー', 'taeksi', '택시를 타고 가요.', '타다 = 乗る。'),
  card('subway', '지하철', '地下鉄', 'jihacheol', '지하철역이 어디예요?', '역 とセットで覚える。'),
  card('t-money', '티머니', 'T-money', 'timeoni', '티머니를 충전해 주세요.', '韓国の交通カード名。'),
  card('transport-card', '교통카드', '交通カード', 'gyotong kadeu', '교통카드를 충전해 주세요.', '교통 は交通、카드 はカード。'),
  card('gate', '개찰구', '改札口', 'gaechalgu', '개찰구는 저쪽이에요.', '駅で使う単語。'),
  card('station', '역', '駅', 'yeok', '서울역에 가요.', '駅名 + 역。'),
  card('entrance', '입구', '入口', 'ipgu', '입구가 어디예요?', '구 は「口」。'),
  card('exit', '출구', '出口', 'chulgu', '출구가 어디예요?', '입구 とセットで覚える。'),
  card('bus-stop', '버스정류장', 'バス停留所', 'beoseu jeongnyujang', '버스정류장은 어디예요?', '정류장 は停留所。'),
  card('convenience-store', '편의점', 'コンビニ', 'pyeonuijeom', '편의점에 가고 싶어요.', '韓国旅行で頻出。'),
  card('department-store', '백화점', 'デパート', 'baekhwajeom', '백화점은 어디예요?', '백화 は百貨。'),
  card('hotel', '호텔', 'ホテル', 'hotel', '호텔을 예약했어요.', '예약 は予約。'),
  card('guesthouse', '게스트하우스', 'ゲストハウス', 'geseuteu hauseu', '게스트하우스에 묵어요.', '묵다 = 泊まる。'),
  card('checkin', '체크인', 'チェックイン', 'chekeuin', '체크인하고 싶어요.', 'ホテルでそのまま使える。'),
  card('checkout', '체크아웃', 'チェックアウト', 'chekeuaut', '체크아웃은 몇 시예요?', '아웃 だけより 체크아웃 で覚える。'),
  card('front', '프런트', 'フロント', 'peureonteu', '프런트는 어디예요?', 'ホテルの受付。'),
  card('room-number', '방 번호', '部屋番号', 'bang beonho', '방 번호가 뭐예요?', '방 = 部屋、번호 = 番号。'),
  card('bank', '은행', '銀行', 'eunhaeng', '은행은 어디예요?', '場所探しで使う。'),
  card('post-office', '우체국', '郵便局', 'ucheguk', '우체국에 가요.', '체국 の発音に注意。'),
  card('hospital', '병원', '病院', 'byeongwon', '병원에 가야 해요.', '가야 해요 = 行かなければなりません。'),
  card('pharmacy', '약국', '薬局', 'yakguk', '약국은 어디예요?', '약 = 薬。'),
  card('police', '경찰', '警察', 'gyeongchal', '경찰서에 가요.', '경찰서 は警察署。'),
  card('embassy', '일본대사관', '日本大使館', 'ilbon daesagwan', '일본대사관에 연락해요.', '대사관 = 大使館。'),
  card('water', '생수', 'ミネラルウォーター', 'saengsu', '생수 하나 주세요.', '하나 주세요 = 1つください。'),
  card('restroom', '화장실', 'トイレ', 'hwajangsil', '화장실은 어디예요?', '旅行最重要フレーズ。'),
  card('lost-item', '분실물', '忘れ物・遺失物', 'bunsilmul', '분실물이 있어요.', '분실 = 紛失。'),
  card('wallet', '지갑', '財布', 'jigap', '지갑을 잃어버렸어요.', '잃어버렸어요 = なくしました。'),
  card('cash', '현금', '現金', 'hyeongeum', '현금으로 낼게요.', 'カードではなく現金で払う時。'),
  card('small-change', '잔돈', '小銭・お釣り', 'jandon', '잔돈 있어요?', 'お釣りの意味でも使います。'),
  card('credit-card', '신용카드', 'クレジットカード', 'sinyong kadeu', '신용카드 돼요?', '돼요? = できますか。'),
  card('smartphone', '스마트폰', 'スマホ', 'seumateupon', '스마트폰을 충전하고 싶어요.', '외래어 は音で覚える。'),
  card('key-native', '열쇠', '鍵', 'yeolsoe', '열쇠를 잃어버렸어요.', '固有語の「鍵」。'),
  card('key-loanword', '키', '鍵・キー', 'ki', '키를 두고 왔어요.', '外来語としてもよく使います。'),
];

export const lessonTravelVocabularyDeck: VocabularyDeck = {
  id: 'lesson-img-5422-travel',
  title: '旅行に役立つ単語帳',
  source: 'sample',
  createdAt: 0,
  cards,
};

export const lessonTravelVocabularyRawText = cards
  .map((item) => `${item.korean}\n${item.japanese}`)
  .join('\n');

function card(
  id: string,
  korean: string,
  japanese: string,
  reading: string,
  example: string,
  note: string,
): VocabularyCard {
  return {
    confidence: 1,
    example,
    id,
    japanese,
    korean,
    note,
    reading,
  };
}
