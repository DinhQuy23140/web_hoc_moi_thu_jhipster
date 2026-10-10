// Japanese vocabulary by JLPT level.
// Line format: word|reading|romaji|part of speech|Vietnamese|English|example|example reading|example (Vietnamese)|example (English)

export const JA_VOCAB = {
  N5: [
    {
      key: 'n5-people',
      topic: { vi: 'Con người & chào hỏi', en: 'People & greetings', ja: '人と挨拶' },
      words: `
私|わたし|watashi|pronoun|tôi|I, me|私は学生です。|わたしはがくせいです。|Tôi là học sinh.|I am a student.
先生|せんせい|sensei|noun|giáo viên|teacher|田中先生は優しいです。|たなかせんせいはやさしいです。|Thầy Tanaka rất hiền.|Mr. Tanaka is kind.
学生|がくせい|gakusei|noun|học sinh, sinh viên|student|弟は大学の学生です。|おとうとはだいがくのがくせいです。|Em trai tôi là sinh viên đại học.|My younger brother is a university student.
友達|ともだち|tomodachi|noun|bạn bè|friend|友達と映画を見ました。|ともだちとえいがをみました。|Tôi đã xem phim cùng bạn.|I watched a movie with a friend.
家族|かぞく|kazoku|noun|gia đình|family|家族は四人です。|かぞくはよにんです。|Gia đình tôi có bốn người.|There are four people in my family.
母|はは|haha|noun|mẹ (của mình)|(my) mother|母は料理が上手です。|はははりょうりがじょうずです。|Mẹ tôi nấu ăn giỏi.|My mother is good at cooking.
父|ちち|chichi|noun|bố (của mình)|(my) father|父は会社員です。|ちちはかいしゃいんです。|Bố tôi là nhân viên công ty.|My father is an office worker.
子供|こども|kodomo|noun|trẻ con|child|公園に子供がたくさんいます。|こうえんにこどもがたくさんいます。|Có nhiều trẻ con ở công viên.|There are many children in the park.
名前|なまえ|namae|noun|tên|name|お名前は何ですか。|おなまえはなんですか。|Tên bạn là gì?|What is your name?
人|ひと|hito|noun|người|person|あの人は誰ですか。|あのひとはだれですか。|Người kia là ai?|Who is that person?
男|おとこ|otoko|noun|đàn ông, nam|man, male|男の子が走っています。|おとこのこがはしっています。|Cậu bé đang chạy.|A boy is running.
女|おんな|onna|noun|phụ nữ, nữ|woman, female|女の人が歌っています。|おんなのひとがうたっています。|Người phụ nữ đang hát.|A woman is singing.
おはよう|おはよう|ohayou|greeting|chào buổi sáng|good morning|おはようございます、先生。|おはようございます、せんせい。|Chào buổi sáng, thưa thầy.|Good morning, teacher.
こんにちは|こんにちは|konnichiwa|greeting|xin chào|hello, good afternoon|こんにちは、元気ですか。|こんにちは、げんきですか。|Xin chào, bạn khỏe không?|Hello, how are you?
ありがとう|ありがとう|arigatou|greeting|cảm ơn|thank you|手伝ってくれてありがとう。|てつだってくれてありがとう。|Cảm ơn vì đã giúp tôi.|Thank you for helping me.
すみません|すみません|sumimasen|greeting|xin lỗi, xin phép|excuse me, sorry|すみません、駅はどこですか。|すみません、えきはどこですか。|Xin lỗi, nhà ga ở đâu ạ?|Excuse me, where is the station?
元気|げんき|genki|na-adjective|khỏe mạnh|healthy, energetic|祖父はとても元気です。|そふはとてもげんきです。|Ông tôi rất khỏe.|My grandfather is very healthy.
会う|あう|au|verb|gặp|to meet|明日友達に会います。|あしたともだちにあいます。|Ngày mai tôi gặp bạn.|I will meet a friend tomorrow.`,
    },
    {
      key: 'n5-home',
      topic: { vi: 'Nhà cửa & sinh hoạt', en: 'Home & daily life', ja: '家と生活' },
      words: `
家|いえ|ie|noun|nhà|house, home|私の家は駅の近くです。|わたしのいえはえきのちかくです。|Nhà tôi ở gần ga.|My house is near the station.
部屋|へや|heya|noun|phòng|room|部屋を掃除します。|へやをそうじします。|Tôi dọn phòng.|I clean my room.
机|つくえ|tsukue|noun|cái bàn (học)|desk|机の上に本があります。|つくえのうえにほんがあります。|Có quyển sách trên bàn.|There is a book on the desk.
椅子|いす|isu|noun|cái ghế|chair|椅子に座ってください。|いすにすわってください。|Mời ngồi xuống ghế.|Please sit on the chair.
窓|まど|mado|noun|cửa sổ|window|窓を開けてもいいですか。|まどをあけてもいいですか。|Tôi mở cửa sổ được không?|May I open the window?
起きる|おきる|okiru|verb|thức dậy|to wake up|毎朝六時に起きます。|まいあさろくじにおきます。|Mỗi sáng tôi dậy lúc sáu giờ.|I wake up at six every morning.
寝る|ねる|neru|verb|ngủ|to sleep|夜十一時に寝ます。|よるじゅういちじにねます。|Tôi ngủ lúc 11 giờ đêm.|I go to bed at 11 p.m.
見る|みる|miru|verb|xem, nhìn|to see, to watch|テレビを見ます。|テレビをみます。|Tôi xem TV.|I watch TV.
読む|よむ|yomu|verb|đọc|to read|毎日新聞を読みます。|まいにちしんぶんをよみます。|Tôi đọc báo mỗi ngày.|I read the newspaper every day.
書く|かく|kaku|verb|viết|to write|手紙を書きました。|てがみをかきました。|Tôi đã viết thư.|I wrote a letter.
聞く|きく|kiku|verb|nghe; hỏi|to listen; to ask|音楽を聞きます。|おんがくをききます。|Tôi nghe nhạc.|I listen to music.
洗う|あらう|arau|verb|rửa|to wash|手を洗ってください。|てをあらってください。|Hãy rửa tay.|Please wash your hands.
風呂|ふろ|furo|noun|bồn tắm|bath|夜にお風呂に入ります。|よるにおふろにはいります。|Buổi tối tôi tắm bồn.|I take a bath at night.
毎日|まいにち|mainichi|noun|mỗi ngày|every day|毎日日本語を勉強します。|まいにちにほんごをべんきょうします。|Tôi học tiếng Nhật mỗi ngày.|I study Japanese every day.
掃除|そうじ|souji|noun|dọn dẹp|cleaning|日曜日に掃除をします。|にちようびにそうじをします。|Chủ nhật tôi dọn dẹp.|I clean on Sundays.
休む|やすむ|yasumu|verb|nghỉ ngơi|to rest|疲れたから少し休みます。|つかれたからすこしやすみます。|Mệt rồi nên tôi nghỉ một chút.|I'm tired, so I'll rest a little.
新しい|あたらしい|atarashii|i-adjective|mới|new|新しい靴を買いました。|あたらしいくつをかいました。|Tôi đã mua giày mới.|I bought new shoes.
古い|ふるい|furui|i-adjective|cũ|old (things)|この家は古いです。|このいえはふるいです。|Ngôi nhà này cũ.|This house is old.`,
    },
    {
      key: 'n5-food',
      topic: { vi: 'Ăn uống & mua sắm', en: 'Food & shopping', ja: '食べ物と買い物' },
      words: `
食べる|たべる|taberu|verb|ăn|to eat|朝ご飯を食べます。|あさごはんをたべます。|Tôi ăn sáng.|I eat breakfast.
飲む|のむ|nomu|verb|uống|to drink|コーヒーを飲みます。|コーヒーをのみます。|Tôi uống cà phê.|I drink coffee.
水|みず|mizu|noun|nước|water|水をください。|みずをください。|Cho tôi nước.|Water, please.
ご飯|ごはん|gohan|noun|cơm; bữa ăn|rice; meal|ご飯を食べましょう。|ごはんをたべましょう。|Cùng ăn cơm nào.|Let's eat.
肉|にく|niku|noun|thịt|meat|私は肉が好きです。|わたしはにくがすきです。|Tôi thích thịt.|I like meat.
魚|さかな|sakana|noun|cá|fish|この魚は新しいです。|このさかなはあたらしいです。|Con cá này tươi.|This fish is fresh.
野菜|やさい|yasai|noun|rau|vegetable|野菜をたくさん食べてください。|やさいをたくさんたべてください。|Hãy ăn nhiều rau.|Please eat lots of vegetables.
果物|くだもの|kudamono|noun|hoa quả|fruit|どんな果物が好きですか。|どんなくだものがすきですか。|Bạn thích loại hoa quả nào?|What kind of fruit do you like?
お茶|おちゃ|ocha|noun|trà|tea|お茶をどうぞ。|おちゃをどうぞ。|Mời bạn dùng trà.|Please have some tea.
買う|かう|kau|verb|mua|to buy|スーパーで卵を買いました。|スーパーでたまごをかいました。|Tôi đã mua trứng ở siêu thị.|I bought eggs at the supermarket.
店|みせ|mise|noun|cửa hàng|shop|あの店は安いです。|あのみせはやすいです。|Cửa hàng kia rẻ.|That shop is cheap.
高い|たかい|takai|i-adjective|đắt; cao|expensive; tall|この時計は高いです。|このとけいはたかいです。|Cái đồng hồ này đắt.|This watch is expensive.
安い|やすい|yasui|i-adjective|rẻ|cheap|この本は安いです。|このほんはやすいです。|Quyển sách này rẻ.|This book is cheap.
美味しい|おいしい|oishii|i-adjective|ngon|delicious|このラーメンは美味しいです。|このラーメンはおいしいです。|Mì ramen này ngon.|This ramen is delicious.
円|えん|en|noun|yên (tiền Nhật)|yen|これは五百円です。|これはごひゃくえんです。|Cái này 500 yên.|This is 500 yen.
いくら|いくら|ikura|question|bao nhiêu (tiền)|how much|このかばんはいくらですか。|このかばんはいくらですか。|Cái túi này bao nhiêu tiền?|How much is this bag?
好き|すき|suki|na-adjective|thích|liked, favourite|甘いものが好きです。|あまいものがすきです。|Tôi thích đồ ngọt.|I like sweet things.
料理|りょうり|ryouri|noun|món ăn; nấu ăn|cooking, dish|日本料理を作りました。|にほんりょうりをつくりました。|Tôi đã nấu món Nhật.|I made Japanese food.`,
    },
    {
      key: 'n5-time',
      topic: { vi: 'Thời gian & con số', en: 'Time & numbers', ja: '時間と数' },
      words: `
今日|きょう|kyou|noun|hôm nay|today|今日は暑いです。|きょうはあついです。|Hôm nay trời nóng.|It's hot today.
明日|あした|ashita|noun|ngày mai|tomorrow|明日は休みです。|あしたはやすみです。|Ngày mai là ngày nghỉ.|Tomorrow is a day off.
昨日|きのう|kinou|noun|hôm qua|yesterday|昨日は雨でした。|きのうはあめでした。|Hôm qua trời mưa.|It rained yesterday.
今|いま|ima|noun|bây giờ|now|今、何時ですか。|いま、なんじですか。|Bây giờ là mấy giờ?|What time is it now?
朝|あさ|asa|noun|buổi sáng|morning|朝、ジョギングをします。|あさ、ジョギングをします。|Buổi sáng tôi chạy bộ.|I jog in the morning.
夜|よる|yoru|noun|buổi tối, đêm|night|夜は静かです。|よるはしずかです。|Ban đêm yên tĩnh.|The night is quiet.
時間|じかん|jikan|noun|thời gian; giờ|time; hour|時間がありません。|じかんがありません。|Tôi không có thời gian.|I don't have time.
週末|しゅうまつ|shuumatsu|noun|cuối tuần|weekend|週末は何をしますか。|しゅうまつはなにをしますか。|Cuối tuần bạn làm gì?|What do you do on weekends?
月曜日|げつようび|getsuyoubi|noun|thứ Hai|Monday|月曜日から仕事です。|げつようびからしごとです。|Tôi làm việc từ thứ Hai.|I work from Monday.
一|いち|ichi|number|một|one|りんごを一つください。|りんごをひとつください。|Cho tôi một quả táo.|One apple, please.
十|じゅう|juu|number|mười|ten|十分待ってください。|じゅっぷんまってください。|Xin đợi mười phút.|Please wait ten minutes.
百|ひゃく|hyaku|number|một trăm|hundred|百円しかありません。|ひゃくえんしかありません。|Tôi chỉ có 100 yên.|I only have 100 yen.
千|せん|sen|number|một nghìn|thousand|これは千円です。|これはせんえんです。|Cái này một nghìn yên.|This is 1,000 yen.
年|とし|toshi|noun|năm; tuổi|year; age|今年は日本へ行きます。|ことしはにほんへいきます。|Năm nay tôi sẽ đi Nhật.|I'm going to Japan this year.
毎朝|まいあさ|maiasa|noun|mỗi sáng|every morning|毎朝牛乳を飲みます。|まいあさぎゅうにゅうをのみます。|Mỗi sáng tôi uống sữa.|I drink milk every morning.
早い|はやい|hayai|i-adjective|sớm; nhanh|early; fast|父は朝が早いです。|ちちはあさがはやいです。|Bố tôi dậy sớm.|My father gets up early.
遅い|おそい|osoi|i-adjective|muộn; chậm|late; slow|もう遅いから帰ります。|もうおそいからかえります。|Muộn rồi nên tôi về đây.|It's late, so I'll go home.
半|はん|han|noun|rưỡi, một nửa|half|七時半に会いましょう。|しちじはんにあいましょう。|Gặp nhau lúc bảy rưỡi nhé.|Let's meet at 7:30.`,
    },
    {
      key: 'n5-places',
      topic: { vi: 'Địa điểm, giao thông & động từ', en: 'Places, transport & verbs', ja: '場所・交通・動詞' },
      words: `
駅|えき|eki|noun|nhà ga|station|駅まで歩きます。|えきまであるきます。|Tôi đi bộ đến ga.|I walk to the station.
学校|がっこう|gakkou|noun|trường học|school|学校は八時からです。|がっこうははちじからです。|Trường học bắt đầu từ 8 giờ.|School starts at eight.
会社|かいしゃ|kaisha|noun|công ty|company|兄は会社で働いています。|あにはかいしゃではたらいています。|Anh tôi làm việc ở công ty.|My older brother works at a company.
病院|びょういん|byouin|noun|bệnh viện|hospital|病院へ行きました。|びょういんへいきました。|Tôi đã đi bệnh viện.|I went to the hospital.
銀行|ぎんこう|ginkou|noun|ngân hàng|bank|銀行は三時までです。|ぎんこうはさんじまでです。|Ngân hàng mở cửa đến 3 giờ.|The bank is open until three.
電車|でんしゃ|densha|noun|tàu điện|train|電車で会社へ行きます。|でんしゃでかいしゃへいきます。|Tôi đi làm bằng tàu điện.|I go to work by train.
車|くるま|kuruma|noun|xe hơi|car|車を運転します。|くるまをうんてんします。|Tôi lái xe hơi.|I drive a car.
道|みち|michi|noun|con đường|road, way|この道をまっすぐ行ってください。|このみちをまっすぐいってください。|Hãy đi thẳng con đường này.|Please go straight along this road.
行く|いく|iku|verb|đi|to go|来週東京へ行きます。|らいしゅうとうきょうへいきます。|Tuần sau tôi đi Tokyo.|I'm going to Tokyo next week.
来る|くる|kuru|verb|đến|to come|友達が家に来ます。|ともだちがいえにきます。|Bạn tôi sẽ đến nhà.|My friend is coming to my house.
帰る|かえる|kaeru|verb|về (nhà)|to go home|五時に家へ帰ります。|ごじにいえへかえります。|Tôi về nhà lúc 5 giờ.|I go home at five.
歩く|あるく|aruku|verb|đi bộ|to walk|公園を歩きましょう。|こうえんをあるきましょう。|Cùng đi bộ trong công viên nào.|Let's walk in the park.
乗る|のる|noru|verb|lên (xe), đi (tàu xe)|to ride, to get on|バスに乗ります。|バスにのります。|Tôi lên xe buýt.|I get on the bus.
近い|ちかい|chikai|i-adjective|gần|near|学校は家から近いです。|がっこうはいえからちかいです。|Trường gần nhà.|The school is close to my house.
遠い|とおい|tooi|i-adjective|xa|far|空港は遠いです。|くうこうはとおいです。|Sân bay xa.|The airport is far.
右|みぎ|migi|noun|bên phải|right|右に曲がってください。|みぎにまがってください。|Hãy rẽ phải.|Please turn right.
左|ひだり|hidari|noun|bên trái|left|銀行は左にあります。|ぎんこうはひだりにあります。|Ngân hàng ở bên trái.|The bank is on the left.
待つ|まつ|matsu|verb|đợi|to wait|ここで待っています。|ここでまっています。|Tôi đang đợi ở đây.|I'm waiting here.`,
    },
    {
      key: 'n5-kanji',
      topic: { vi: 'Hán tự N5 cơ bản', en: 'Basic N5 kanji', ja: 'N5の基本漢字' },
      words: `
日|ひ|hi|kanji|ngày; mặt trời (NHẬT)|day; sun|今日はいい日です。|きょうはいいひです。|Hôm nay là một ngày đẹp.|Today is a good day.
月|つき|tsuki|kanji|mặt trăng; tháng (NGUYỆT)|moon; month|月がきれいです。|つきがきれいです。|Trăng đẹp quá.|The moon is beautiful.
火|ひ|hi|kanji|lửa (HỎA)|fire|火に気をつけてください。|ひにきをつけてください。|Hãy cẩn thận với lửa.|Be careful with fire.
山|やま|yama|kanji|núi (SƠN)|mountain|富士山は高い山です。|ふじさんはたかいやまです。|Phú Sĩ là ngọn núi cao.|Mt. Fuji is a high mountain.
川|かわ|kawa|kanji|sông (XUYÊN)|river|川で泳ぎました。|かわでおよぎました。|Tôi đã bơi ở sông.|I swam in the river.
木|き|ki|kanji|cây (MỘC)|tree|庭に大きい木があります。|にわにおおきいきがあります。|Có cây lớn trong vườn.|There is a big tree in the garden.
金|かね|kane|kanji|tiền; vàng (KIM)|money; gold|お金がありません。|おかねがありません。|Tôi không có tiền.|I have no money.
口|くち|kuchi|kanji|miệng (KHẨU)|mouth|口を開けてください。|くちをあけてください。|Hãy há miệng ra.|Please open your mouth.
目|め|me|kanji|mắt (MỤC)|eye|目が痛いです。|めがいたいです。|Tôi bị đau mắt.|My eyes hurt.
手|て|te|kanji|tay (THỦ)|hand|手を挙げてください。|てをあげてください。|Hãy giơ tay lên.|Please raise your hand.
足|あし|ashi|kanji|chân (TÚC)|foot, leg|足が疲れました。|あしがつかれました。|Chân tôi mỏi rồi.|My legs are tired.
大きい|おおきい|ookii|kanji|to, lớn (ĐẠI)|big|大きい犬がいます。|おおきいいぬがいます。|Có con chó to.|There is a big dog.
小さい|ちいさい|chiisai|kanji|nhỏ (TIỂU)|small|小さい猫が好きです。|ちいさいねこがすきです。|Tôi thích mèo nhỏ.|I like small cats.
上|うえ|ue|kanji|trên (THƯỢNG)|above, on|机の上にペンがあります。|つくえのうえにペンがあります。|Có cây bút trên bàn.|There is a pen on the desk.
下|した|shita|kanji|dưới (HẠ)|below, under|椅子の下に猫がいます。|いすのしたにねこがいます。|Có con mèo dưới ghế.|There is a cat under the chair.
中|なか|naka|kanji|trong (TRUNG)|inside|箱の中に何がありますか。|はこのなかになにがありますか。|Trong hộp có gì?|What is in the box?
雨|あめ|ame|kanji|mưa (VŨ)|rain|雨が降っています。|あめがふっています。|Trời đang mưa.|It's raining.
天気|てんき|tenki|kanji|thời tiết (THIÊN KHÍ)|weather|今日はいい天気ですね。|きょうはいいてんきですね。|Hôm nay thời tiết đẹp nhỉ.|Nice weather today, isn't it?`,
    },
  ],
  N4: [
    {
      key: 'n4-family-society',
      topic: { vi: 'Gia đình & xã hội', en: 'Family & society', ja: '家族と社会' },
      words: `
両親|りょうしん|ryoushin|noun|bố mẹ|parents|両親は田舎に住んでいます。|りょうしんはいなかにすんでいます。|Bố mẹ tôi sống ở quê.|My parents live in the countryside.
祖母|そぼ|sobo|noun|bà (của mình)|(my) grandmother|祖母は八十歳です。|そぼははちじゅっさいです。|Bà tôi 80 tuổi.|My grandmother is 80.
結婚|けっこん|kekkon|noun|kết hôn|marriage|姉は来月結婚します。|あねはらいげつけっこんします。|Chị tôi sẽ kết hôn tháng sau.|My older sister is getting married next month.
赤ちゃん|あかちゃん|akachan|noun|em bé|baby|赤ちゃんが泣いています。|あかちゃんがないています。|Em bé đang khóc.|The baby is crying.
近所|きんじょ|kinjo|noun|hàng xóm, lân cận|neighbourhood|近所に公園があります。|きんじょにこうえんがあります。|Gần nhà có công viên.|There is a park in the neighbourhood.
世話|せわ|sewa|noun|chăm sóc|care, looking after|犬の世話をします。|いぬのせわをします。|Tôi chăm sóc con chó.|I look after the dog.
育てる|そだてる|sodateru|verb|nuôi dưỡng|to raise, to bring up|三人の子供を育てました。|さんにんのこどもをそだてました。|Tôi đã nuôi ba đứa con.|I raised three children.
集まる|あつまる|atsumaru|verb|tập trung, tụ tập|to gather|正月に家族が集まります。|しょうがつにかぞくがあつまります。|Gia đình tụ họp vào dịp năm mới.|The family gathers at New Year.
規則|きそく|kisoku|noun|quy tắc|rule|規則を守ってください。|きそくをまもってください。|Hãy tuân thủ quy tắc.|Please follow the rules.
習慣|しゅうかん|shuukan|noun|thói quen, tập quán|custom, habit|日本の習慣を学びます。|にほんのしゅうかんをまなびます。|Tôi học phong tục Nhật Bản.|I learn Japanese customs.
文化|ぶんか|bunka|noun|văn hóa|culture|日本の文化に興味があります。|にほんのぶんかにきょうみがあります。|Tôi quan tâm đến văn hóa Nhật.|I'm interested in Japanese culture.
約束|やくそく|yakusoku|noun|lời hứa, cuộc hẹn|promise, appointment|約束を忘れないでください。|やくそくをわすれないでください。|Đừng quên lời hứa nhé.|Please don't forget the promise.
招待|しょうたい|shoutai|noun|lời mời|invitation|パーティーに招待されました。|パーティーにしょうたいされました。|Tôi được mời dự tiệc.|I was invited to the party.
親切|しんせつ|shinsetsu|na-adjective|tốt bụng|kind|隣の人はとても親切です。|となりのひとはとてもしんせつです。|Người hàng xóm rất tốt bụng.|My neighbour is very kind.
説明|せつめい|setsumei|noun|giải thích|explanation|もう一度説明してください。|もういちどせつめいしてください。|Xin hãy giải thích lại một lần nữa.|Please explain once more.
相談|そうだん|soudan|noun|bàn bạc, tư vấn|consultation|先生に相談しました。|せんせいにそうだんしました。|Tôi đã hỏi ý kiến thầy giáo.|I consulted my teacher.
挨拶|あいさつ|aisatsu|noun|chào hỏi|greeting|毎朝隣の人に挨拶します。|まいあさとなりのひとにあいさつします。|Mỗi sáng tôi chào hàng xóm.|I greet my neighbour every morning.
お祝い|おいわい|oiwai|noun|chúc mừng, quà mừng|celebration, gift|誕生日のお祝いをしました。|たんじょうびのおいわいをしました。|Chúng tôi đã mừng sinh nhật.|We celebrated a birthday.`,
    },
    {
      key: 'n4-travel-weather',
      topic: { vi: 'Du lịch & thời tiết', en: 'Travel & weather', ja: '旅行と天気' },
      words: `
旅行|りょこう|ryokou|noun|du lịch|travel, trip|夏休みに旅行します。|なつやすみにりょこうします。|Tôi đi du lịch vào kỳ nghỉ hè.|I'll travel during summer vacation.
空港|くうこう|kuukou|noun|sân bay|airport|空港まで一時間かかります。|くうこうまでいちじかんかかります。|Đến sân bay mất một tiếng.|It takes an hour to the airport.
予約|よやく|yoyaku|noun|đặt trước|reservation|ホテルを予約しました。|ホテルをよやくしました。|Tôi đã đặt khách sạn.|I booked a hotel.
地図|ちず|chizu|noun|bản đồ|map|地図を見ながら歩きます。|ちずをみながらあるきます。|Tôi vừa đi vừa xem bản đồ.|I walk while looking at a map.
景色|けしき|keshiki|noun|phong cảnh|scenery|ここからの景色は素晴らしいです。|ここからのけしきはすばらしいです。|Phong cảnh từ đây thật tuyệt.|The view from here is wonderful.
お土産|おみやげ|omiyage|noun|quà lưu niệm|souvenir|友達にお土産を買いました。|ともだちにおみやげをかいました。|Tôi đã mua quà cho bạn.|I bought a souvenir for my friend.
出発|しゅっぱつ|shuppatsu|noun|xuất phát|departure|バスは九時に出発します。|バスはくじにしゅっぱつします。|Xe buýt xuất phát lúc 9 giờ.|The bus departs at nine.
到着|とうちゃく|touchaku|noun|đến nơi|arrival|飛行機は午後に到着します。|ひこうきはごごにとうちゃくします。|Máy bay đến vào buổi chiều.|The plane arrives in the afternoon.
乗り換える|のりかえる|norikaeru|verb|chuyển tàu xe|to transfer|新宿で電車を乗り換えます。|しんじゅくででんしゃをのりかえます。|Tôi chuyển tàu ở Shinjuku.|I change trains at Shinjuku.
台風|たいふう|taifuu|noun|bão|typhoon|台風が来ています。|たいふうがきています。|Bão đang đến.|A typhoon is coming.
晴れる|はれる|hareru|verb|trời quang, nắng|to clear up|明日は晴れるでしょう。|あしたははれるでしょう。|Ngày mai có lẽ trời nắng.|It will probably be sunny tomorrow.
曇り|くもり|kumori|noun|trời nhiều mây|cloudy weather|今日は一日中曇りです。|きょうはいちにちじゅうくもりです。|Hôm nay trời nhiều mây cả ngày.|It's cloudy all day today.
雪|ゆき|yuki|noun|tuyết|snow|北海道は雪が多いです。|ほっかいどうはゆきがおおいです。|Hokkaido có nhiều tuyết.|Hokkaido gets a lot of snow.
涼しい|すずしい|suzushii|i-adjective|mát mẻ|cool|秋は涼しいです。|あきはすずしいです。|Mùa thu mát mẻ.|Autumn is cool.
季節|きせつ|kisetsu|noun|mùa|season|どの季節が一番好きですか。|どのきせつがいちばんすきですか。|Bạn thích mùa nào nhất?|Which season do you like best?
見物|けんぶつ|kenbutsu|noun|tham quan|sightseeing|京都でお寺を見物しました。|きょうとでおてらをけんぶつしました。|Tôi đã tham quan chùa ở Kyoto.|I went sightseeing at temples in Kyoto.
泊まる|とまる|tomaru|verb|trọ lại|to stay overnight|旅館に泊まりました。|りょかんにとまりました。|Tôi đã nghỉ tại nhà trọ kiểu Nhật.|I stayed at a Japanese inn.
荷物|にもつ|nimotsu|noun|hành lý|luggage|荷物が重いです。|にもつがおもいです。|Hành lý nặng.|The luggage is heavy.`,
    },
    {
      key: 'n4-health-feelings',
      topic: { vi: 'Sức khỏe & cảm xúc', en: 'Health & feelings', ja: '健康と気持ち' },
      words: `
病気|びょうき|byouki|noun|bệnh|illness|病気で学校を休みました。|びょうきでがっこうをやすみました。|Tôi nghỉ học vì ốm.|I missed school because I was sick.
熱|ねつ|netsu|noun|sốt|fever|熱が三十八度あります。|ねつがさんじゅうはちどあります。|Tôi sốt 38 độ.|I have a fever of 38 degrees.
薬|くすり|kusuri|noun|thuốc|medicine|食後に薬を飲んでください。|しょくごにくすりをのんでください。|Hãy uống thuốc sau bữa ăn.|Take the medicine after meals.
怪我|けが|kega|noun|vết thương|injury|サッカーで怪我をしました。|サッカーでけがをしました。|Tôi bị thương khi đá bóng.|I got injured playing soccer.
痛い|いたい|itai|i-adjective|đau|painful|頭が痛いです。|あたまがいたいです。|Tôi bị đau đầu.|I have a headache.
疲れる|つかれる|tsukareru|verb|mệt|to get tired|今日はとても疲れました。|きょうはとてもつかれました。|Hôm nay tôi rất mệt.|I'm very tired today.
心配|しんぱい|shinpai|noun|lo lắng|worry|心配しないでください。|しんぱいしないでください。|Đừng lo lắng.|Please don't worry.
嬉しい|うれしい|ureshii|i-adjective|vui mừng|happy, glad|合格して嬉しいです。|ごうかくしてうれしいです。|Tôi vui vì đã đỗ.|I'm happy that I passed.
悲しい|かなしい|kanashii|i-adjective|buồn|sad|その映画は悲しかったです。|そのえいがはかなしかったです。|Bộ phim đó buồn.|That movie was sad.
寂しい|さびしい|sabishii|i-adjective|cô đơn|lonely|一人で寂しいです。|ひとりでさびしいです。|Ở một mình tôi thấy cô đơn.|I'm lonely by myself.
怒る|おこる|okoru|verb|giận|to get angry|母に怒られました。|ははにおこられました。|Tôi bị mẹ mắng.|I was scolded by my mother.
びっくりする|びっくりする|bikkuri suru|verb|giật mình|to be surprised|大きな音にびっくりしました。|おおきなおとにびっくりしました。|Tôi giật mình vì tiếng động lớn.|I was startled by the loud noise.
気分|きぶん|kibun|noun|tâm trạng, cảm giác|mood, feeling|今日は気分がいいです。|きょうはきぶんがいいです。|Hôm nay tâm trạng tôi tốt.|I feel good today.
安心|あんしん|anshin|noun|yên tâm|relief, peace of mind|それを聞いて安心しました。|それをきいてあんしんしました。|Nghe vậy tôi yên tâm rồi.|I'm relieved to hear that.
運動|うんどう|undou|noun|vận động, thể dục|exercise|毎日運動しています。|まいにちうんどうしています。|Tôi tập thể dục mỗi ngày.|I exercise every day.
健康|けんこう|kenkou|noun|sức khỏe|health|健康のために野菜を食べます。|けんこうのためにやさいをたべます。|Tôi ăn rau vì sức khỏe.|I eat vegetables for my health.
治る|なおる|naoru|verb|khỏi bệnh|to recover, to heal|風邪が治りました。|かぜがなおりました。|Tôi đã khỏi cảm.|My cold has gone.
恥ずかしい|はずかしい|hazukashii|i-adjective|xấu hổ|embarrassing|人前で話すのは恥ずかしいです。|ひとまえではなすのははずかしいです。|Nói trước đám đông thật ngại.|Speaking in public is embarrassing.`,
    },
    {
      key: 'n4-school-work',
      topic: { vi: 'Trường học & công việc', en: 'School & work', ja: '学校と仕事' },
      words: `
授業|じゅぎょう|jugyou|noun|giờ học|class, lesson|授業は九時に始まります。|じゅぎょうはくじにはじまります。|Giờ học bắt đầu lúc 9 giờ.|Class starts at nine.
宿題|しゅくだい|shukudai|noun|bài tập về nhà|homework|宿題を忘れました。|しゅくだいをわすれました。|Tôi quên làm bài tập.|I forgot my homework.
試験|しけん|shiken|noun|kỳ thi|exam|来週試験があります。|らいしゅうしけんがあります。|Tuần sau có kỳ thi.|There's an exam next week.
合格|ごうかく|goukaku|noun|thi đỗ|passing an exam|日本語能力試験に合格しました。|にほんごのうりょくしけんにごうかくしました。|Tôi đã đỗ kỳ thi năng lực tiếng Nhật.|I passed the JLPT.
復習|ふくしゅう|fukushuu|noun|ôn tập|review|毎晩復習します。|まいばんふくしゅうします。|Tối nào tôi cũng ôn bài.|I review every night.
留学|りゅうがく|ryuugaku|noun|du học|studying abroad|来年日本に留学します。|らいねんにほんにりゅうがくします。|Năm sau tôi du học Nhật.|I will study in Japan next year.
仕事|しごと|shigoto|noun|công việc|work, job|仕事は大変ですが、楽しいです。|しごとはたいへんですが、たのしいです。|Công việc vất vả nhưng vui.|Work is hard but fun.
会議|かいぎ|kaigi|noun|cuộc họp|meeting|午後に会議があります。|ごごにかいぎがあります。|Buổi chiều có họp.|There's a meeting in the afternoon.
残業|ざんぎょう|zangyou|noun|làm thêm giờ|overtime|昨日は残業しました。|きのうはざんぎょうしました。|Hôm qua tôi làm thêm giờ.|I worked overtime yesterday.
給料|きゅうりょう|kyuuryou|noun|tiền lương|salary|給料は二十五日にもらいます。|きゅうりょうはにじゅうごにちにもらいます。|Tôi nhận lương vào ngày 25.|I get paid on the 25th.
アルバイト|アルバイト|arubaito|noun|việc làm thêm|part-time job|コンビニでアルバイトをしています。|コンビニでアルバイトをしています。|Tôi làm thêm ở cửa hàng tiện lợi.|I work part-time at a convenience store.
経験|けいけん|keiken|noun|kinh nghiệm|experience|いい経験になりました。|いいけいけんになりました。|Đó là một trải nghiệm tốt.|It was a good experience.
準備|じゅんび|junbi|noun|chuẩn bị|preparation|発表の準備をしています。|はっぴょうのじゅんびをしています。|Tôi đang chuẩn bị bài phát biểu.|I'm preparing for a presentation.
連絡|れんらく|renraku|noun|liên lạc|contact|後で連絡します。|あとでれんらくします。|Tôi sẽ liên lạc sau.|I'll contact you later.
遅刻|ちこく|chikoku|noun|đi muộn|being late|会議に遅刻してしまいました。|かいぎにちこくしてしまいました。|Tôi lỡ đến họp muộn.|I was late for the meeting.
社長|しゃちょう|shachou|noun|giám đốc|company president|社長は今出張中です。|しゃちょうはいましゅっちょうちゅうです。|Giám đốc hiện đang đi công tác.|The president is on a business trip now.
調べる|しらべる|shiraberu|verb|tìm hiểu, tra cứu|to look up, to investigate|辞書で言葉を調べます。|じしょでことばをしらべます。|Tôi tra từ trong từ điển.|I look up words in the dictionary.
頑張る|がんばる|ganbaru|verb|cố gắng|to do one's best|試験のために頑張ります。|しけんのためにがんばります。|Tôi sẽ cố gắng cho kỳ thi.|I'll do my best for the exam.`,
    },
    {
      key: 'n4-kanji',
      topic: { vi: 'Hán tự N4', en: 'N4 kanji words', ja: 'N4の漢字語' },
      words: `
世界|せかい|sekai|kanji|thế giới (THẾ GIỚI)|world|世界を旅行したいです。|せかいをりょこうしたいです。|Tôi muốn du lịch khắp thế giới.|I want to travel the world.
意味|いみ|imi|kanji|ý nghĩa (Ý VỊ)|meaning|この言葉の意味は何ですか。|このことばのいみはなんですか。|Từ này nghĩa là gì?|What does this word mean?
問題|もんだい|mondai|kanji|vấn đề, câu hỏi (VẤN ĐỀ)|problem, question|この問題は難しいです。|このもんだいはむずかしいです。|Câu hỏi này khó.|This problem is difficult.
自分|じぶん|jibun|kanji|bản thân (TỰ PHÂN)|oneself|自分で料理を作ります。|じぶんでりょうりをつくります。|Tôi tự nấu ăn.|I cook by myself.
特別|とくべつ|tokubetsu|kanji|đặc biệt (ĐẶC BIỆT)|special|今日は特別な日です。|きょうはとくべつなひです。|Hôm nay là ngày đặc biệt.|Today is a special day.
急ぐ|いそぐ|isogu|kanji|vội vàng (CẤP)|to hurry|急いでください。|いそいでください。|Xin hãy nhanh lên.|Please hurry.
始める|はじめる|hajimeru|kanji|bắt đầu (THỦY)|to begin|日本語の勉強を始めました。|にほんごのべんきょうをはじめました。|Tôi đã bắt đầu học tiếng Nhật.|I started studying Japanese.
終わる|おわる|owaru|kanji|kết thúc (CHUNG)|to end|授業が終わりました。|じゅぎょうがおわりました。|Giờ học đã kết thúc.|The class has ended.
考える|かんがえる|kangaeru|kanji|suy nghĩ (KHẢO)|to think|よく考えてください。|よくかんがえてください。|Hãy suy nghĩ kỹ.|Please think carefully.
教える|おしえる|oshieru|kanji|dạy, chỉ (GIÁO)|to teach|道を教えてください。|みちをおしえてください。|Xin chỉ đường cho tôi.|Please tell me the way.
運転|うんてん|unten|kanji|lái xe (VẬN CHUYỂN)|driving|父は運転が上手です。|ちちはうんてんがじょうずです。|Bố tôi lái xe giỏi.|My father is a good driver.
写真|しゃしん|shashin|kanji|ảnh (TẢ CHÂN)|photograph|写真を撮ってもいいですか。|しゃしんをとってもいいですか。|Tôi chụp ảnh được không?|May I take a photo?
映画|えいが|eiga|kanji|phim (ÁNH HỌA)|movie|映画館で映画を見ました。|えいがかんでえいがをみました。|Tôi đã xem phim ở rạp.|I watched a movie at the cinema.
音楽|おんがく|ongaku|kanji|âm nhạc (ÂM NHẠC)|music|クラシック音楽が好きです。|クラシックおんがくがすきです。|Tôi thích nhạc cổ điển.|I like classical music.
便利|べんり|benri|kanji|tiện lợi (TIỆN LỢI)|convenient|この辞書は便利です。|このじしょはべんりです。|Từ điển này tiện lợi.|This dictionary is convenient.
不便|ふべん|fuben|kanji|bất tiện (BẤT TIỆN)|inconvenient|田舎は交通が不便です。|いなかはこうつうがふべんです。|Ở quê giao thông bất tiện.|Transport is inconvenient in the countryside.
必要|ひつよう|hitsuyou|kanji|cần thiết (TẤT YẾU)|necessary|パスポートが必要です。|パスポートがひつようです。|Cần có hộ chiếu.|A passport is necessary.
安全|あんぜん|anzen|kanji|an toàn (AN TOÀN)|safe|日本は安全な国です。|にほんはあんぜんなくにです。|Nhật Bản là đất nước an toàn.|Japan is a safe country.`,
    },
  ],
  N3: [
    {
      key: 'n3-daily-society',
      topic: { vi: 'Đời sống & xã hội', en: 'Daily life & society', ja: '生活と社会' },
      words: `
生活|せいかつ|seikatsu|noun|cuộc sống, sinh hoạt|life, living|東京の生活に慣れました。|とうきょうのせいかつになれました。|Tôi đã quen với cuộc sống ở Tokyo.|I've got used to life in Tokyo.
環境|かんきょう|kankyou|noun|môi trường|environment|環境を守ることが大切です。|かんきょうをまもることがたいせつです。|Bảo vệ môi trường là điều quan trọng.|Protecting the environment is important.
地域|ちいき|chiiki|noun|khu vực|region, area|この地域は自然が豊かです。|このちいきはしぜんがゆたかです。|Khu vực này giàu thiên nhiên.|This area is rich in nature.
住民|じゅうみん|juumin|noun|cư dân|resident|住民が反対しています。|じゅうみんがはんたいしています。|Cư dân đang phản đối.|The residents are opposed.
ゴミ|ゴミ|gomi|noun|rác|garbage|ゴミは月曜日に出してください。|ゴミはげつようびにだしてください。|Hãy đổ rác vào thứ Hai.|Please put out the garbage on Mondays.
節約|せつやく|setsuyaku|noun|tiết kiệm|saving, economising|電気を節約しましょう。|でんきをせつやくしましょう。|Hãy tiết kiệm điện.|Let's save electricity.
慣れる|なれる|nareru|verb|quen với|to get used to|新しい仕事に慣れましたか。|あたらしいしごとになれましたか。|Bạn đã quen với công việc mới chưa?|Have you got used to your new job?
増える|ふえる|fueru|verb|tăng lên|to increase|外国人観光客が増えています。|がいこくじんかんこうきゃくがふえています。|Khách du lịch nước ngoài đang tăng.|Foreign tourists are increasing.
減る|へる|heru|verb|giảm xuống|to decrease|子供の数が減っています。|こどものかずがへっています。|Số trẻ em đang giảm.|The number of children is decreasing.
変化|へんか|henka|noun|sự thay đổi|change|社会は大きく変化しました。|しゃかいはおおきくへんかしました。|Xã hội đã thay đổi lớn.|Society has changed greatly.
影響|えいきょう|eikyou|noun|ảnh hưởng|influence|台風の影響で電車が止まりました。|たいふうのえいきょうででんしゃがとまりました。|Do ảnh hưởng của bão, tàu đã dừng.|Trains stopped due to the typhoon.
原因|げんいん|gen'in|noun|nguyên nhân|cause|事故の原因を調べています。|じこのげんいんをしらべています。|Đang điều tra nguyên nhân tai nạn.|They are investigating the cause of the accident.
解決|かいけつ|kaiketsu|noun|giải quyết|solution|問題が解決しました。|もんだいがかいけつしました。|Vấn đề đã được giải quyết.|The problem has been solved.
事故|じこ|jiko|noun|tai nạn|accident|交通事故に気をつけてください。|こうつうじこにきをつけてください。|Hãy cẩn thận tai nạn giao thông.|Watch out for traffic accidents.
目立つ|めだつ|medatsu|verb|nổi bật|to stand out|彼女の赤い服は目立ちます。|かのじょのあかいふくはめだちます。|Bộ đồ đỏ của cô ấy rất nổi bật.|Her red dress stands out.
普通|ふつう|futsuu|na-adjective|bình thường|ordinary, usual|普通の生活が一番です。|ふつうのせいかつがいちばんです。|Cuộc sống bình thường là tốt nhất.|An ordinary life is best.
迷惑|めいわく|meiwaku|noun|phiền hà|trouble, nuisance|人に迷惑をかけないでください。|ひとにめいわくをかけないでください。|Đừng gây phiền cho người khác.|Please don't bother others.
手続き|てつづき|tetsuzuki|noun|thủ tục|procedure|市役所で手続きをしました。|しやくしょでてつづきをしました。|Tôi đã làm thủ tục ở tòa thị chính.|I did the paperwork at city hall.`,
    },
    {
      key: 'n3-work-economy',
      topic: { vi: 'Công việc & kinh tế', en: 'Work & economy', ja: '仕事と経済' },
      words: `
経済|けいざい|keizai|noun|kinh tế|economy|日本の経済について勉強しています。|にほんのけいざいについてべんきょうしています。|Tôi đang học về kinh tế Nhật Bản.|I'm studying the Japanese economy.
景気|けいき|keiki|noun|tình hình kinh tế|business conditions|景気が良くなってきました。|けいきがよくなってきました。|Kinh tế đã bắt đầu khởi sắc.|The economy has started to improve.
企業|きぎょう|kigyou|noun|doanh nghiệp|enterprise, company|大企業に就職したいです。|だいきぎょうにしゅうしょくしたいです。|Tôi muốn vào làm ở doanh nghiệp lớn.|I want to work for a big company.
就職|しゅうしょく|shuushoku|noun|tìm được việc|finding employment|兄は銀行に就職しました。|あにはぎんこうにしゅうしょくしました。|Anh tôi đã vào làm ở ngân hàng.|My brother got a job at a bank.
面接|めんせつ|mensetsu|noun|phỏng vấn|interview|明日面接があります。|あしためんせつがあります。|Ngày mai tôi có buổi phỏng vấn.|I have an interview tomorrow.
担当|たんとう|tantou|noun|phụ trách|being in charge|この仕事の担当は誰ですか。|このしごとのたんとうはだれですか。|Ai phụ trách công việc này?|Who is in charge of this work?
報告|ほうこく|houkoku|noun|báo cáo|report|上司に結果を報告しました。|じょうしにけっかをほうこくしました。|Tôi đã báo cáo kết quả với cấp trên.|I reported the results to my boss.
上司|じょうし|joushi|noun|cấp trên|superior, boss|上司に相談します。|じょうしにそうだんします。|Tôi sẽ bàn với cấp trên.|I'll consult my boss.
部下|ぶか|buka|noun|cấp dưới|subordinate|部下を育てるのは難しいです。|ぶかをそだてるのはむずかしいです。|Đào tạo cấp dưới thật khó.|Training subordinates is difficult.
取引|とりひき|torihiki|noun|giao dịch|transaction, deal|新しい会社と取引を始めました。|あたらしいかいしゃととりひきをはじめました。|Chúng tôi đã bắt đầu giao dịch với công ty mới.|We started doing business with a new company.
商品|しょうひん|shouhin|noun|sản phẩm, hàng hóa|product|この商品はよく売れています。|このしょうひんはよくうれています。|Sản phẩm này bán rất chạy.|This product is selling well.
値段|ねだん|nedan|noun|giá cả|price|値段が少し高いです。|ねだんがすこしたかいです。|Giá hơi đắt.|The price is a little high.
利用|りよう|riyou|noun|sử dụng|use, utilisation|図書館を利用します。|としょかんをりようします。|Tôi sử dụng thư viện.|I use the library.
計画|けいかく|keikaku|noun|kế hoạch|plan|旅行の計画を立てました。|りょこうのけいかくをたてました。|Tôi đã lên kế hoạch du lịch.|I made a travel plan.
締め切り|しめきり|shimekiri|noun|hạn chót|deadline|レポートの締め切りは金曜日です。|レポートのしめきりはきんようびです。|Hạn nộp báo cáo là thứ Sáu.|The report deadline is Friday.
責任|せきにん|sekinin|noun|trách nhiệm|responsibility|責任を持って仕事をします。|せきにんをもってしごとをします。|Tôi làm việc có trách nhiệm.|I work responsibly.
出張|しゅっちょう|shucchou|noun|công tác|business trip|来週大阪へ出張します。|らいしゅうおおさかへしゅっちょうします。|Tuần sau tôi đi công tác Osaka.|I'm going on a business trip to Osaka next week.
給与|きゅうよ|kyuuyo|noun|tiền lương (trang trọng)|salary, wages|給与は銀行に振り込まれます。|きゅうよはぎんこうにふりこまれます。|Lương được chuyển vào ngân hàng.|Salaries are paid into a bank account.`,
    },
    {
      key: 'n3-nature',
      topic: { vi: 'Thiên nhiên', en: 'Nature', ja: '自然' },
      words: `
自然|しぜん|shizen|noun|thiên nhiên|nature|自然の中で暮らしたいです。|しぜんのなかでくらしたいです。|Tôi muốn sống giữa thiên nhiên.|I want to live in nature.
地震|じしん|jishin|noun|động đất|earthquake|昨夜地震がありました。|さくやじしんがありました。|Tối qua có động đất.|There was an earthquake last night.
災害|さいがい|saigai|noun|thiên tai|disaster|災害に備えましょう。|さいがいにそなえましょう。|Hãy chuẩn bị cho thiên tai.|Let's prepare for disasters.
気温|きおん|kion|noun|nhiệt độ không khí|temperature|今日は気温が高いです。|きょうはきおんがたかいです。|Hôm nay nhiệt độ cao.|The temperature is high today.
湿度|しつど|shitsudo|noun|độ ẩm|humidity|日本の夏は湿度が高いです。|にほんのなつはしつどがたかいです。|Mùa hè Nhật có độ ẩm cao.|Japanese summers are humid.
森|もり|mori|noun|rừng|forest|森の中を散歩しました。|もりのなかをさんぽしました。|Tôi đã đi dạo trong rừng.|I took a walk in the forest.
海岸|かいがん|kaigan|noun|bờ biển|coast|海岸でゴミを拾いました。|かいがんでゴミをひろいました。|Tôi đã nhặt rác ở bờ biển.|I picked up trash on the beach.
波|なみ|nami|noun|sóng|wave|今日は波が高いです。|きょうはなみがたかいです。|Hôm nay sóng cao.|The waves are high today.
植物|しょくぶつ|shokubutsu|noun|thực vật|plant|部屋に植物を置いています。|へやにしょくぶつをおいています。|Tôi đặt cây trong phòng.|I keep plants in my room.
動物|どうぶつ|doubutsu|noun|động vật|animal|動物園で動物を見ました。|どうぶつえんでどうぶつをみました。|Tôi đã xem động vật ở sở thú.|I saw animals at the zoo.
星|ほし|hoshi|noun|ngôi sao|star|田舎では星がよく見えます。|いなかではほしがよくみえます。|Ở quê nhìn rõ sao.|You can see the stars well in the countryside.
咲く|さく|saku|verb|nở (hoa)|to bloom|春に桜が咲きます。|はるにさくらがさきます。|Hoa anh đào nở vào mùa xuân.|Cherry blossoms bloom in spring.
枯れる|かれる|kareru|verb|khô héo|to wither|水をやらなかったので花が枯れました。|みずをやらなかったのではながかれました。|Vì không tưới nước nên hoa đã héo.|The flowers withered because I didn't water them.
空気|くうき|kuuki|noun|không khí|air|山の空気はきれいです。|やまのくうきはきれいです。|Không khí trên núi trong lành.|The mountain air is clean.
汚れる|よごれる|yogoreru|verb|bị bẩn|to get dirty|川の水が汚れています。|かわのみずがよごれています。|Nước sông bị ô nhiễm.|The river water is dirty.
資源|しげん|shigen|noun|tài nguyên|resources|資源を大切にしましょう。|しげんをたいせつにしましょう。|Hãy trân trọng tài nguyên.|Let's value our resources.
温暖化|おんだんか|ondanka|noun|sự nóng lên (toàn cầu)|global warming|地球温暖化が進んでいます。|ちきゅうおんだんかがすすんでいます。|Trái đất đang nóng lên.|Global warming is progressing.
景色|けしき|keshiki|noun|phong cảnh|scenery|窓から海の景色が見えます。|まどからうみのけしきがみえます。|Từ cửa sổ có thể nhìn thấy cảnh biển.|You can see the sea from the window.`,
    },
    {
      key: 'n3-feelings',
      topic: { vi: 'Tính cách & cảm xúc', en: 'Personality & feelings', ja: '性格と感情' },
      words: `
性格|せいかく|seikaku|noun|tính cách|personality|彼は明るい性格です。|かれはあかるいせいかくです。|Anh ấy có tính cách vui vẻ.|He has a cheerful personality.
素直|すなお|sunao|na-adjective|ngoan, thẳng thắn|honest, obedient|素直に謝りました。|すなおにあやまりました。|Tôi đã thành thật xin lỗi.|I apologised honestly.
真面目|まじめ|majime|na-adjective|nghiêm túc, chăm chỉ|serious, diligent|彼女は真面目な学生です。|かのじょはまじめながくせいです。|Cô ấy là học sinh chăm chỉ.|She is a diligent student.
我慢|がまん|gaman|noun|nhẫn nại, chịu đựng|patience, endurance|痛みを我慢しました。|いたみをがまんしました。|Tôi đã chịu đựng cơn đau.|I endured the pain.
感動|かんどう|kandou|noun|cảm động|being moved|その映画に感動しました。|そのえいがにかんどうしました。|Tôi đã cảm động vì bộ phim đó.|I was moved by that movie.
感謝|かんしゃ|kansha|noun|biết ơn|gratitude|皆さんに感謝しています。|みなさんにかんしゃしています。|Tôi biết ơn mọi người.|I'm grateful to everyone.
後悔|こうかい|koukai|noun|hối hận|regret|あの時のことを後悔しています。|あのときのことをこうかいしています。|Tôi hối hận về chuyện lúc đó.|I regret what happened then.
緊張|きんちょう|kinchou|noun|căng thẳng, hồi hộp|nervousness|面接で緊張しました。|めんせつできんちょうしました。|Tôi đã hồi hộp khi phỏng vấn.|I was nervous at the interview.
自信|じしん|jishin|noun|tự tin|confidence|日本語に自信があります。|にほんごにじしんがあります。|Tôi tự tin về tiếng Nhật.|I'm confident in my Japanese.
不安|ふあん|fuan|na-adjective|bất an|anxious|将来が不安です。|しょうらいがふあんです。|Tôi bất an về tương lai.|I'm anxious about the future.
満足|まんぞく|manzoku|noun|hài lòng|satisfaction|結果に満足しています。|けっかにまんぞくしています。|Tôi hài lòng với kết quả.|I'm satisfied with the result.
羨ましい|うらやましい|urayamashii|i-adjective|ghen tị, thèm muốn|envious|あなたが羨ましいです。|あなたがうらやましいです。|Tôi ghen tị với bạn.|I envy you.
懐かしい|なつかしい|natsukashii|i-adjective|hoài niệm, nhớ|nostalgic|この歌は懐かしいです。|このうたはなつかしいです。|Bài hát này gợi nhiều hoài niệm.|This song brings back memories.
落ち着く|おちつく|ochitsuku|verb|bình tĩnh|to calm down|落ち着いて話してください。|おちついてはなしてください。|Hãy bình tĩnh nói.|Please calm down and talk.
諦める|あきらめる|akirameru|verb|từ bỏ|to give up|夢を諦めないでください。|ゆめをあきらめないでください。|Đừng từ bỏ ước mơ.|Don't give up on your dreams.
悩む|なやむ|nayamu|verb|phiền não, trăn trở|to worry, to be troubled|進路について悩んでいます。|しんろについてなやんでいます。|Tôi đang trăn trở về con đường tương lai.|I'm worried about my future path.
優しい|やさしい|yasashii|i-adjective|hiền, tốt bụng|kind, gentle|祖母はいつも優しいです。|そぼはいつもやさしいです。|Bà tôi luôn hiền hậu.|My grandmother is always kind.
厳しい|きびしい|kibishii|i-adjective|nghiêm khắc|strict|父はとても厳しいです。|ちちはとてもきびしいです。|Bố tôi rất nghiêm khắc.|My father is very strict.`,
    },
  ],
  N2: [
    {
      key: 'n2-business',
      topic: { vi: 'Kinh doanh', en: 'Business', ja: 'ビジネス' },
      words: `
経営|けいえい|keiei|noun|kinh doanh, quản lý|management|父は小さな会社を経営しています。|ちちはちいさなかいしゃをけいえいしています。|Bố tôi điều hành một công ty nhỏ.|My father runs a small company.
業績|ぎょうせき|gyouseki|noun|thành tích kinh doanh|business performance|今年は業績が伸びました。|ことしはぎょうせきがのびました。|Năm nay thành tích kinh doanh tăng.|Business results improved this year.
交渉|こうしょう|koushou|noun|đàm phán|negotiation|価格について交渉しました。|かかくについてこうしょうしました。|Chúng tôi đã đàm phán về giá.|We negotiated the price.
契約|けいやく|keiyaku|noun|hợp đồng|contract|新しい契約を結びました。|あたらしいけいやくをむすびました。|Chúng tôi đã ký hợp đồng mới.|We signed a new contract.
提案|ていあん|teian|noun|đề xuất|proposal|彼の提案が採用されました。|かれのていあんがさいようされました。|Đề xuất của anh ấy đã được thông qua.|His proposal was adopted.
見積もり|みつもり|mitsumori|noun|báo giá|estimate, quote|見積もりを送ってください。|みつもりをおくってください。|Xin hãy gửi báo giá.|Please send us a quote.
顧客|こきゃく|kokyaku|noun|khách hàng|client, customer|顧客の満足度を高めます。|こきゃくのまんぞくどをたかめます。|Nâng cao mức độ hài lòng của khách hàng.|We raise customer satisfaction.
競争|きょうそう|kyousou|noun|cạnh tranh|competition|市場の競争が激しいです。|しじょうのきょうそうがはげしいです。|Cạnh tranh thị trường rất khốc liệt.|Market competition is fierce.
需要|じゅよう|juyou|noun|nhu cầu|demand|電気自動車の需要が高まっています。|でんきじどうしゃのじゅようがたかまっています。|Nhu cầu xe điện đang tăng.|Demand for electric cars is rising.
供給|きょうきゅう|kyoukyuu|noun|cung cấp|supply|供給が需要に追いつきません。|きょうきゅうがじゅようにおいつきません。|Cung không theo kịp cầu.|Supply can't keep up with demand.
利益|りえき|rieki|noun|lợi nhuận|profit|会社は大きな利益を上げました。|かいしゃはおおきなりえきをあげました。|Công ty đã thu lợi nhuận lớn.|The company made a large profit.
損失|そんしつ|sonshitsu|noun|tổn thất|loss|大きな損失を出しました。|おおきなそんしつをだしました。|Đã gây ra tổn thất lớn.|We suffered a big loss.
投資|とうし|toushi|noun|đầu tư|investment|新しい技術に投資します。|あたらしいぎじゅつにとうしします。|Chúng tôi đầu tư vào công nghệ mới.|We invest in new technology.
採用|さいよう|saiyou|noun|tuyển dụng; áp dụng|hiring; adoption|今年は十人を採用しました。|ことしはじゅうにんをさいようしました。|Năm nay đã tuyển mười người.|We hired ten people this year.
昇進|しょうしん|shoushin|noun|thăng chức|promotion|課長に昇進しました。|かちょうにしょうしんしました。|Tôi đã được thăng chức trưởng phòng.|I was promoted to section chief.
効率|こうりつ|kouritsu|noun|hiệu suất|efficiency|仕事の効率を上げたいです。|しごとのこうりつをあげたいです。|Tôi muốn nâng cao hiệu suất công việc.|I want to work more efficiently.
対応|たいおう|taiou|noun|xử lý, ứng phó|handling, response|お客様の苦情に対応します。|おきゃくさまのくじょうにたいおうします。|Xử lý khiếu nại của khách hàng.|We respond to customer complaints.
実績|じっせき|jisseki|noun|thành tích thực tế|track record|彼は営業で実績があります。|かれはえいぎょうでじっせきがあります。|Anh ấy có thành tích trong kinh doanh.|He has a track record in sales.`,
    },
    {
      key: 'n2-science-tech',
      topic: { vi: 'Khoa học & công nghệ', en: 'Science & technology', ja: '科学と技術' },
      words: `
技術|ぎじゅつ|gijutsu|noun|kỹ thuật, công nghệ|technology, technique|日本の技術は世界で有名です。|にほんのぎじゅつはせかいでゆうめいです。|Công nghệ Nhật nổi tiếng thế giới.|Japanese technology is world-famous.
開発|かいはつ|kaihatsu|noun|phát triển|development|新しい薬を開発しています。|あたらしいくすりをかいはつしています。|Đang phát triển loại thuốc mới.|They are developing a new drug.
研究|けんきゅう|kenkyuu|noun|nghiên cứu|research|大学で研究を続けています。|だいがくでけんきゅうをつづけています。|Tôi đang tiếp tục nghiên cứu ở đại học.|I'm continuing research at university.
実験|じっけん|jikken|noun|thí nghiệm|experiment|実験は成功しました。|じっけんはせいこうしました。|Thí nghiệm đã thành công.|The experiment succeeded.
発明|はつめい|hatsumei|noun|phát minh|invention|電話は偉大な発明です。|でんわはいだいなはつめいです。|Điện thoại là phát minh vĩ đại.|The telephone is a great invention.
情報|じょうほう|jouhou|noun|thông tin|information|インターネットで情報を集めます。|インターネットでじょうほうをあつめます。|Tôi thu thập thông tin trên internet.|I gather information on the internet.
人工知能|じんこうちのう|jinkou chinou|noun|trí tuệ nhân tạo|artificial intelligence|人工知能が仕事を変えています。|じんこうちのうがしごとをかえています。|Trí tuệ nhân tạo đang thay đổi công việc.|AI is changing work.
宇宙|うちゅう|uchuu|noun|vũ trụ|space, universe|宇宙に行ってみたいです。|うちゅうにいってみたいです。|Tôi muốn thử đi vũ trụ.|I'd like to go to space.
分析|ぶんせき|bunseki|noun|phân tích|analysis|データを分析しました。|データをぶんせきしました。|Tôi đã phân tích dữ liệu.|I analysed the data.
仕組み|しくみ|shikumi|noun|cơ chế, cấu tạo|mechanism|この機械の仕組みを説明します。|このきかいのしくみをせつめいします。|Tôi sẽ giải thích cơ chế của máy này.|I'll explain how this machine works.
機能|きのう|kinou|noun|chức năng|function|このスマホには便利な機能があります。|このスマホにはべんりなきのうがあります。|Chiếc điện thoại này có chức năng tiện lợi.|This smartphone has useful functions.
進歩|しんぽ|shinpo|noun|tiến bộ|progress|医学は大きく進歩しました。|いがくはおおきくしんぽしました。|Y học đã tiến bộ vượt bậc.|Medicine has made great progress.
普及|ふきゅう|fukyuu|noun|phổ cập|spread, diffusion|スマートフォンが普及しました。|スマートフォンがふきゅうしました。|Điện thoại thông minh đã được phổ cập.|Smartphones have become widespread.
装置|そうち|souchi|noun|thiết bị|device, apparatus|安全装置が作動しました。|あんぜんそうちがさどうしました。|Thiết bị an toàn đã hoạt động.|The safety device activated.
操作|そうさ|sousa|noun|thao tác, vận hành|operation|操作は簡単です。|そうさはかんたんです。|Thao tác đơn giản.|It's easy to operate.
検索|けんさく|kensaku|noun|tìm kiếm|search|ネットで検索してみてください。|ネットでけんさくしてみてください。|Hãy thử tìm kiếm trên mạng.|Try searching online.
保存|ほぞん|hozon|noun|lưu trữ, bảo quản|saving, preservation|ファイルを保存してください。|ファイルをほぞんしてください。|Hãy lưu tệp lại.|Please save the file.
証明|しょうめい|shoumei|noun|chứng minh|proof|理論が証明されました。|りろんがしょうめいされました。|Lý thuyết đã được chứng minh.|The theory was proven.`,
    },
    {
      key: 'n2-abstract',
      topic: { vi: 'Từ ngữ trừu tượng', en: 'Abstract expressions', ja: '抽象的な語彙' },
      words: `
傾向|けいこう|keikou|noun|khuynh hướng|tendency|若者は本を読まない傾向があります。|わかものはほんをよまないけいこうがあります。|Giới trẻ có xu hướng không đọc sách.|Young people tend not to read books.
価値|かち|kachi|noun|giá trị|value|この絵は価値があります。|このえはかちがあります。|Bức tranh này có giá trị.|This painting is valuable.
意識|いしき|ishiki|noun|ý thức|consciousness, awareness|環境への意識が高まっています。|かんきょうへのいしきがたかまっています。|Ý thức về môi trường đang tăng.|Environmental awareness is rising.
観点|かんてん|kanten|noun|quan điểm|point of view|別の観点から考えましょう。|べつのかんてんからかんがえましょう。|Hãy suy nghĩ từ quan điểm khác.|Let's think from a different perspective.
状況|じょうきょう|joukyou|noun|tình hình|situation|状況が悪化しています。|じょうきょうがあっかしています。|Tình hình đang xấu đi.|The situation is getting worse.
程度|ていど|teido|noun|mức độ|degree, extent|ある程度は理解できます。|あるていどはりかいできます。|Tôi có thể hiểu ở một mức độ nào đó.|I can understand to some extent.
範囲|はんい|han'i|noun|phạm vi|range, scope|試験の範囲を教えてください。|しけんのはんいをおしえてください。|Hãy cho tôi biết phạm vi thi.|Please tell me what the exam covers.
目的|もくてき|mokuteki|noun|mục đích|purpose|旅行の目的は何ですか。|りょこうのもくてきはなんですか。|Mục đích chuyến đi là gì?|What is the purpose of your trip?
手段|しゅだん|shudan|noun|phương tiện, cách thức|means|あらゆる手段を試しました。|あらゆるしゅだんをためしました。|Tôi đã thử mọi cách.|I tried every means.
現象|げんしょう|genshou|noun|hiện tượng|phenomenon|不思議な現象が起きました。|ふしぎなげんしょうがおきました。|Một hiện tượng kỳ lạ đã xảy ra.|A strange phenomenon occurred.
要素|ようそ|youso|noun|yếu tố|element, factor|成功にはいくつかの要素があります。|せいこうにはいくつかのようそがあります。|Thành công có một vài yếu tố.|There are several factors in success.
前提|ぜんてい|zentei|noun|tiền đề|premise|結婚を前提に付き合っています。|けっこんをぜんていにつきあっています。|Chúng tôi hẹn hò với tiền đề kết hôn.|We are dating with marriage in mind.
概念|がいねん|gainen|noun|khái niệm|concept|この概念は理解しにくいです。|このがいねんはりかいしにくいです。|Khái niệm này khó hiểu.|This concept is hard to understand.
矛盾|むじゅん|mujun|noun|mâu thuẫn|contradiction|彼の話には矛盾があります。|かれのはなしにはむじゅんがあります。|Câu chuyện của anh ấy có mâu thuẫn.|His story has contradictions.
共通|きょうつう|kyoutsuu|noun|chung, điểm chung|common, shared|二人には共通の趣味があります。|ふたりにはきょうつうのしゅみがあります。|Hai người có sở thích chung.|The two share a hobby.
具体的|ぐたいてき|gutaiteki|na-adjective|cụ thể|concrete, specific|具体的な例を挙げてください。|ぐたいてきなれいをあげてください。|Hãy đưa ra ví dụ cụ thể.|Please give a concrete example.
一般的|いっぱんてき|ippanteki|na-adjective|phổ biến, thông thường|general, common|それは一般的な考え方です。|それはいっぱんてきなかんがえかたです。|Đó là cách nghĩ phổ biến.|That's a common way of thinking.
積極的|せっきょくてき|sekkyokuteki|na-adjective|tích cực|active, positive|積極的に発言してください。|せっきょくてきにはつげんしてください。|Hãy phát biểu tích cực.|Please speak up actively.`,
    },
  ],
  N1: [
    {
      key: 'n1-politics-economy',
      topic: { vi: 'Chính trị & kinh tế', en: 'Politics & economics', ja: '政治と経済' },
      words: `
政策|せいさく|seisaku|noun|chính sách|policy|政府は新しい経済政策を発表した。|せいふはあたらしいけいざいせいさくをはっぴょうした。|Chính phủ đã công bố chính sách kinh tế mới.|The government announced a new economic policy.
施策|しさく|shisaku|noun|biện pháp|measure|少子化対策の施策が求められている。|しょうしかたいさくのしさくがもとめられている。|Cần có biện pháp đối phó với tỉ lệ sinh giảm.|Measures against the falling birth rate are needed.
財政|ざいせい|zaisei|noun|tài chính (quốc gia)|public finance|国の財政は厳しい状況にある。|くにのざいせいはきびしいじょうきょうにある。|Tài chính quốc gia đang khó khăn.|National finances are in a difficult state.
赤字|あかじ|akaji|noun|thâm hụt|deficit|三年連続で赤字になった。|さんねんれんぞくであかじになった。|Đã thâm hụt ba năm liên tiếp.|We ran a deficit three years in a row.
規制|きせい|kisei|noun|quy định, hạn chế|regulation|規制緩和が進められている。|きせいかんわがすすめられている。|Việc nới lỏng quy định đang được thúc đẩy.|Deregulation is being promoted.
是正|ぜせい|zesei|noun|chấn chỉnh|correction, rectification|格差の是正が課題だ。|かくさのぜせいがかだいだ。|Chấn chỉnh chênh lệch là vấn đề cần giải quyết.|Correcting inequality is an issue.
格差|かくさ|kakusa|noun|chênh lệch|disparity, gap|所得格差が拡大している。|しょとくかくさがかくだいしている。|Chênh lệch thu nhập đang gia tăng.|Income disparity is widening.
施行|しこう|shikou|noun|thi hành (luật)|enforcement|新しい法律が来月施行される。|あたらしいほうりつがらいげつしこうされる。|Luật mới sẽ được thi hành vào tháng sau.|The new law takes effect next month.
世論|よろん|yoron|noun|dư luận|public opinion|世論の反発を受けた。|よろんのはんぱつをうけた。|Đã vấp phải phản ứng của dư luận.|It faced a public backlash.
景気後退|けいきこうたい|keiki koutai|noun|suy thoái kinh tế|recession|景気後退の懸念が強まっている。|けいきこうたいのけねんがつよまっている。|Lo ngại suy thoái kinh tế đang gia tăng.|Fears of recession are growing.
懸念|けねん|kenen|noun|lo ngại|concern|安全性への懸念が示された。|あんぜんせいへのけねんがしめされた。|Mối lo ngại về độ an toàn đã được nêu ra.|Concerns about safety were raised.
妥協|だきょう|dakyou|noun|thỏa hiệp|compromise|両国は妥協に達した。|りょうこくはだきょうにたっした。|Hai nước đã đạt được thỏa hiệp.|The two countries reached a compromise.
撤廃|てっぱい|teppai|noun|bãi bỏ|abolition|関税の撤廃を目指す。|かんぜいのてっぱいをめざす。|Hướng tới việc bãi bỏ thuế quan.|They aim to abolish tariffs.
均衡|きんこう|kinkou|noun|cân bằng|balance, equilibrium|需要と供給の均衡が崩れた。|じゅようときょうきゅうのきんこうがくずれた。|Cân bằng cung cầu đã bị phá vỡ.|The balance of supply and demand collapsed.
停滞|ていたい|teitai|noun|trì trệ|stagnation|経済の停滞が続いている。|けいざいのていたいがつづいている。|Sự trì trệ kinh tế vẫn tiếp diễn.|Economic stagnation continues.
抜本的|ばっぽんてき|bapponteki|na-adjective|triệt để|drastic, fundamental|抜本的な改革が必要だ。|ばっぽんてきなかいかくがひつようだ。|Cần một cuộc cải cách triệt để.|Fundamental reform is needed.
潤う|うるおう|uruou|verb|được hưởng lợi, sung túc|to profit, to be enriched|観光客の増加で地元が潤った。|かんこうきゃくのぞうかでじもとがうるおった。|Địa phương được hưởng lợi nhờ khách du lịch tăng.|The local area prospered thanks to more tourists.
担う|になう|ninau|verb|gánh vác|to bear, to shoulder|若者が未来を担う。|わかものがみらいをになう。|Giới trẻ gánh vác tương lai.|Young people will shoulder the future.`,
    },
    {
      key: 'n1-culture',
      topic: { vi: 'Văn học & văn hóa', en: 'Literature & culture', ja: '文学と文化' },
      words: `
趣|おもむき|omomuki|noun|phong vị, nét thú vị|charm, elegance|この庭には独特の趣がある。|このにわにはどくとくのおもむきがある。|Khu vườn này có nét đặc sắc riêng.|This garden has a unique charm.
風情|ふぜい|fuzei|noun|phong vị, nét tao nhã|elegance, atmosphere|雪景色には風情がある。|ゆきげしきにはふぜいがある。|Cảnh tuyết rất tao nhã.|A snowy landscape has a special charm.
伝統|でんとう|dentou|noun|truyền thống|tradition|伝統を受け継ぐことは大切だ。|でんとうをうけつぐことはたいせつだ。|Kế thừa truyền thống là điều quan trọng.|Inheriting traditions is important.
継承|けいしょう|keishou|noun|kế thừa|succession, inheritance|技術の継承が課題となっている。|ぎじゅつのけいしょうがかだいとなっている。|Kế thừa kỹ thuật đang là vấn đề.|Passing on skills has become an issue.
描写|びょうしゃ|byousha|noun|miêu tả|depiction|作者の心理描写が見事だ。|さくしゃのしんりびょうしゃがみごとだ。|Cách miêu tả tâm lý của tác giả thật xuất sắc.|The author's psychological depiction is superb.
比喩|ひゆ|hiyu|noun|ẩn dụ, so sánh|metaphor|この詩には多くの比喩が使われている。|このしにはおおくのひゆがつかわれている。|Bài thơ này dùng nhiều ẩn dụ.|This poem uses many metaphors.
叙情的|じょじょうてき|jojouteki|na-adjective|trữ tình|lyrical|叙情的なメロディーが心に残る。|じょじょうてきなメロディーがこころにのこる。|Giai điệu trữ tình đọng lại trong lòng.|The lyrical melody stays in your heart.
醍醐味|だいごみ|daigomi|noun|cái thú, tinh túy|real pleasure, essence|旅の醍醐味は出会いだ。|たびのだいごみはであいだ。|Cái thú của du lịch là những cuộc gặp gỡ.|The true joy of travel is the people you meet.
造詣|ぞうけい|zoukei|noun|hiểu biết sâu|deep knowledge|彼は日本美術に造詣が深い。|かれはにほんびじゅつにぞうけいがふかい。|Ông ấy có hiểu biết sâu về mỹ thuật Nhật.|He has deep knowledge of Japanese art.
傑作|けっさく|kessaku|noun|kiệt tác|masterpiece|これは彼の最高傑作だ。|これはかれのさいこうけっさくだ。|Đây là kiệt tác xuất sắc nhất của ông ấy.|This is his greatest masterpiece.
余韻|よいん|yoin|noun|dư âm|lingering impression|映画の余韻に浸っている。|えいがのよいんにひたっている。|Tôi vẫn đắm chìm trong dư âm bộ phim.|I'm still immersed in the film's afterglow.
洗練|せんれん|senren|noun|tinh tế, trau chuốt|refinement|洗練されたデザインが人気だ。|せんれんされたデザインがにんきだ。|Thiết kế tinh tế đang được ưa chuộng.|Refined designs are popular.
素朴|そぼく|soboku|na-adjective|mộc mạc, giản dị|simple, unsophisticated|田舎の素朴な暮らしに憧れる。|いなかのそぼくなくらしにあこがれる。|Tôi khao khát cuộc sống mộc mạc ở quê.|I long for the simple country life.
奥深い|おくぶかい|okubukai|i-adjective|sâu sắc, thâm thúy|profound|茶道は奥深い世界だ。|さどうはおくぶかいせかいだ。|Trà đạo là một thế giới thâm sâu.|The tea ceremony is a profound world.
嗜む|たしなむ|tashinamu|verb|có sở thích, biết chút ít|to have a taste for|祖父は書道を嗜んでいる。|そふはしょどうをたしなんでいる。|Ông tôi có thú chơi thư pháp.|My grandfather practises calligraphy as a pastime.
著す|あらわす|arawasu|verb|viết, trước tác|to write (a book)|彼は多くの名著を著した。|かれはおおくのめいちょをあらわした。|Ông ấy đã viết nhiều tác phẩm nổi tiếng.|He wrote many famous books.
廃れる|すたれる|sutareru|verb|bị mai một|to go out of use|古い習慣が廃れつつある。|ふるいしゅうかんがすたれつつある。|Những phong tục cũ đang dần mai một.|Old customs are dying out.
重んじる|おもんじる|omonjiru|verb|coi trọng|to value, to respect|日本人は礼儀を重んじる。|にほんじんはれいぎをおもんじる。|Người Nhật coi trọng lễ nghi.|Japanese people value good manners.`,
    },
    {
      key: 'n1-advanced',
      topic: { vi: 'Từ vựng trừu tượng nâng cao', en: 'Advanced abstract vocabulary', ja: '上級抽象語彙' },
      words: `
曖昧|あいまい|aimai|na-adjective|mơ hồ|vague, ambiguous|彼は曖昧な返事をした。|かれはあいまいなへんじをした。|Anh ấy đã trả lời mơ hồ.|He gave a vague reply.
顕著|けんちょ|kencho|na-adjective|rõ rệt|remarkable, marked|効果が顕著に現れた。|こうかがけんちょにあらわれた。|Hiệu quả đã thể hiện rõ rệt.|The effects appeared clearly.
画期的|かっきてき|kakkiteki|na-adjective|mang tính đột phá|epoch-making|画期的な発明が生まれた。|かっきてきなはつめいがうまれた。|Một phát minh mang tính đột phá đã ra đời.|An epoch-making invention was born.
著しい|いちじるしい|ichijirushii|i-adjective|đáng kể, rõ rệt|remarkable, striking|技術の進歩が著しい。|ぎじゅつのしんぽがいちじるしい。|Sự tiến bộ kỹ thuật rất đáng kể.|Technological progress is remarkable.
妥当|だとう|datou|na-adjective|thỏa đáng, hợp lý|appropriate, valid|その判断は妥当だと思う。|そのはんだんはだとうだとおもう。|Tôi nghĩ phán đoán đó là hợp lý.|I think that judgement is reasonable.
緩和|かんわ|kanwa|noun|nới lỏng, làm dịu|relaxation, easing|痛みを緩和する薬だ。|いたみをかんわするくすりだ。|Đây là thuốc làm dịu cơn đau.|This is medicine to ease pain.
促進|そくしん|sokushin|noun|xúc tiến, thúc đẩy|promotion, acceleration|国際交流を促進する。|こくさいこうりゅうをそくしんする。|Thúc đẩy giao lưu quốc tế.|We promote international exchange.
把握|はあく|haaku|noun|nắm bắt|grasp, understanding|状況を正確に把握する必要がある。|じょうきょうをせいかくにはあくするひつようがある。|Cần nắm bắt chính xác tình hình.|We need to grasp the situation accurately.
模索|もさく|mosaku|noun|tìm tòi, mò mẫm|groping, searching|解決策を模索している。|かいけつさくをもさくしている。|Đang tìm tòi giải pháp.|We are searching for a solution.
踏まえる|ふまえる|fumaeru|verb|dựa trên|to be based on|調査結果を踏まえて提案する。|ちょうさけっかをふまえてていあんする。|Đề xuất dựa trên kết quả khảo sát.|We make proposals based on the survey results.
培う|つちかう|tsuchikau|verb|bồi dưỡng, vun đắp|to cultivate|経験によって培われた力だ。|けいけんによってつちかわれたちからだ。|Đó là năng lực được vun đắp qua kinh nghiệm.|It is an ability cultivated through experience.
委ねる|ゆだねる|yudaneru|verb|giao phó|to entrust|判断を専門家に委ねる。|はんだんをせんもんかにゆだねる。|Giao phó phán đoán cho chuyên gia.|We leave the decision to experts.
覆す|くつがえす|kutsugaesu|verb|lật ngược|to overturn|常識を覆す発見だ。|じょうしきをくつがえすはっけんだ。|Đó là phát hiện lật ngược lẽ thường.|It's a discovery that overturns common sense.
免れる|まぬがれる|manugareru|verb|tránh khỏi|to escape, to avoid|責任を免れることはできない。|せきにんをまぬがれることはできない。|Không thể trốn tránh trách nhiệm.|You cannot escape responsibility.
否める|いなめる|inameru|verb|phủ nhận (thường dùng ở dạng phủ định)|to deny|準備不足は否めない。|じゅんびぶそくはいなめない。|Không thể phủ nhận việc thiếu chuẩn bị.|The lack of preparation is undeniable.
相応しい|ふさわしい|fusawashii|i-adjective|phù hợp, xứng đáng|suitable, worthy|彼こそリーダーに相応しい。|かれこそリーダーにふさわしい。|Chính anh ấy mới xứng đáng làm lãnh đạo.|He is the one worthy of being leader.
一概に|いちがいに|ichigai ni|adverb|nhất loạt, vơ đũa cả nắm|unconditionally, generally|一概には言えない。|いちがいにはいえない。|Không thể nói chung chung được.|You can't make a sweeping statement.
敢えて|あえて|aete|adverb|cố tình, mạnh dạn|daringly, deliberately|敢えて厳しい道を選んだ。|あえてきびしいみちをえらんだ。|Tôi đã cố tình chọn con đường khó khăn.|I deliberately chose the hard path.`,
    },
  ],
};
