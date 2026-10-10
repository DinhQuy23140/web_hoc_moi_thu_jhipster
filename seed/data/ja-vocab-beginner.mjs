// Extra beginner units (appended after JA_VOCAB N5 / N4). Same line format as ja-vocab.mjs:
// word|reading|romaji|part of speech|Vietnamese|English|example|example reading|example (Vietnamese)|example (English)

export const JA_BEGINNER = {
  N5: [
    {
      key: 'n5-actions',
      topic: { vi: 'Hành động thường ngày', en: 'Everyday actions', ja: '毎日の動作' },
      words: `
話す|はなす|hanasu|verb|nói chuyện|to speak, to talk|友達と日本語で話します。|ともだちとにほんごではなします。|Tôi nói chuyện với bạn bằng tiếng Nhật.|I talk with my friend in Japanese.
勉強|べんきょう|benkyou|noun|việc học|study|毎晩勉強します。|まいばんべんきょうします。|Tối nào tôi cũng học bài.|I study every evening.
働く|はたらく|hataraku|verb|làm việc|to work|兄は銀行で働いています。|あにはぎんこうではたらいています。|Anh trai tôi làm việc ở ngân hàng.|My older brother works at a bank.
作る|つくる|tsukuru|verb|làm, chế tạo, nấu|to make|母は晩ご飯を作ります。|はははばんごはんをつくります。|Mẹ tôi nấu bữa tối.|My mother makes dinner.
使う|つかう|tsukau|verb|sử dụng|to use|このパソコンを使ってもいいですか。|このパソコンをつかってもいいですか。|Tôi dùng máy tính này được không?|May I use this computer?
開ける|あける|akeru|verb|mở|to open|窓を開けてください。|まどをあけてください。|Hãy mở cửa sổ ra.|Please open the window.
閉める|しめる|shimeru|verb|đóng|to close|ドアを閉めてください。|ドアをしめてください。|Hãy đóng cửa lại.|Please close the door.
入る|はいる|hairu|verb|đi vào|to enter|部屋に入ります。|へやにはいります。|Tôi đi vào phòng.|I enter the room.
出る|でる|deru|verb|đi ra, rời khỏi|to go out, to leave|七時に家を出ます。|しちじにいえをでます。|Tôi ra khỏi nhà lúc 7 giờ.|I leave home at seven.
立つ|たつ|tatsu|verb|đứng|to stand|立ってください。|たってください。|Xin hãy đứng lên.|Please stand up.
座る|すわる|suwaru|verb|ngồi|to sit|ここに座ってください。|ここにすわってください。|Mời ngồi ở đây.|Please sit here.
遊ぶ|あそぶ|asobu|verb|chơi|to play|子供たちが公園で遊んでいます。|こどもたちがこうえんであそんでいます。|Bọn trẻ đang chơi ở công viên.|The children are playing in the park.
泳ぐ|およぐ|oyogu|verb|bơi|to swim|夏は海で泳ぎます。|なつはうみでおよぎます。|Mùa hè tôi bơi ở biển.|I swim in the sea in summer.
歌う|うたう|utau|verb|hát|to sing|カラオケで歌を歌いました。|カラオケでうたをうたいました。|Tôi đã hát karaoke.|I sang songs at karaoke.
撮る|とる|toru|verb|chụp (ảnh)|to take (a photo)|ここで写真を撮りましょう。|ここでしゃしんをとりましょう。|Chụp ảnh ở đây nhé.|Let's take a photo here.
貸す|かす|kasu|verb|cho mượn|to lend|ペンを貸してください。|ペンをかしてください。|Cho tôi mượn cây bút nhé.|Please lend me a pen.
借りる|かりる|kariru|verb|mượn|to borrow|図書館で本を借りました。|としょかんでほんをかりました。|Tôi đã mượn sách ở thư viện.|I borrowed a book from the library.
忘れる|わすれる|wasureru|verb|quên|to forget|宿題を忘れました。|しゅくだいをわすれました。|Tôi quên bài tập rồi.|I forgot my homework.`,
    },
    {
      key: 'n5-adjectives',
      topic: { vi: 'Tính từ cơ bản', en: 'Basic adjectives', ja: '基本の形容詞' },
      words: `
暑い|あつい|atsui|i-adjective|nóng (thời tiết)|hot (weather)|今日はとても暑いです。|きょうはとてもあついです。|Hôm nay rất nóng.|It is very hot today.
寒い|さむい|samui|i-adjective|lạnh (thời tiết)|cold (weather)|冬の北海道は寒いです。|ふゆのほっかいどうはさむいです。|Hokkaido mùa đông rất lạnh.|Hokkaido is cold in winter.
長い|ながい|nagai|i-adjective|dài|long|妹は髪が長いです。|いもうとはかみがながいです。|Em gái tôi tóc dài.|My younger sister has long hair.
短い|みじかい|mijikai|i-adjective|ngắn|short|この映画は短いです。|このえいがはみじかいです。|Bộ phim này ngắn.|This movie is short.
多い|おおい|ooi|i-adjective|nhiều|many, a lot|東京は人が多いです。|とうきょうはひとがおおいです。|Tokyo đông người.|There are many people in Tokyo.
少ない|すくない|sukunai|i-adjective|ít|few, little|この町は車が少ないです。|このまちはくるまがすくないです。|Thị trấn này ít xe.|There are few cars in this town.
難しい|むずかしい|muzukashii|i-adjective|khó|difficult|漢字は難しいです。|かんじはむずかしいです。|Chữ Hán khó.|Kanji is difficult.
易しい|やさしい|yasashii|i-adjective|dễ|easy|この問題は易しいです。|このもんだいはやさしいです。|Bài này dễ.|This question is easy.
楽しい|たのしい|tanoshii|i-adjective|vui|fun, enjoyable|旅行はとても楽しかったです。|りょこうはとてもたのしかったです。|Chuyến du lịch rất vui.|The trip was a lot of fun.
忙しい|いそがしい|isogashii|i-adjective|bận rộn|busy|今週は忙しいです。|こんしゅうはいそがしいです。|Tuần này tôi bận.|I am busy this week.
明るい|あかるい|akarui|i-adjective|sáng sủa; vui vẻ|bright; cheerful|この部屋は明るいです。|このへやはあかるいです。|Căn phòng này sáng sủa.|This room is bright.
暗い|くらい|kurai|i-adjective|tối|dark|外はもう暗いです。|そとはもうくらいです。|Bên ngoài đã tối rồi.|It is already dark outside.
広い|ひろい|hiroi|i-adjective|rộng|spacious, wide|この公園は広いです。|このこうえんはひろいです。|Công viên này rộng.|This park is spacious.
狭い|せまい|semai|i-adjective|chật, hẹp|narrow, small (space)|私の部屋は狭いです。|わたしのへやはせまいです。|Phòng tôi chật.|My room is small.
静か|しずか|shizuka|na-adjective|yên tĩnh|quiet|図書館は静かです。|としょかんはしずかです。|Thư viện yên tĩnh.|The library is quiet.
有名|ゆうめい|yuumei|na-adjective|nổi tiếng|famous|京都は有名な町です。|きょうとはゆうめいなまちです。|Kyoto là thành phố nổi tiếng.|Kyoto is a famous city.
きれい|きれい|kirei|na-adjective|đẹp; sạch|beautiful; clean|この花はきれいです。|このはなはきれいです。|Bông hoa này đẹp.|This flower is beautiful.
上手|じょうず|jouzu|na-adjective|giỏi|skilful, good at|姉は料理が上手です。|あねはりょうりがじょうずです。|Chị tôi nấu ăn giỏi.|My older sister is good at cooking.`,
    },
    {
      key: 'n5-shopping-counters',
      topic: { vi: 'Mua sắm & đếm số', en: 'Shopping & counting', ja: '買い物と数え方' },
      words: `
一つ|ひとつ|hitotsu|counter|một cái|one (thing)|りんごを一つください。|りんごをひとつください。|Cho tôi một quả táo.|One apple, please.
二つ|ふたつ|futatsu|counter|hai cái|two (things)|ケーキを二つ買いました。|ケーキをふたつかいました。|Tôi đã mua hai cái bánh.|I bought two cakes.
三つ|みっつ|mittsu|counter|ba cái|three (things)|卵を三つ使います。|たまごをみっつつかいます。|Dùng ba quả trứng.|Use three eggs.
万|まん|man|number|mười nghìn|ten thousand|このカメラは三万円です。|このカメラはさんまんえんです。|Máy ảnh này giá 30.000 yên.|This camera is 30,000 yen.
枚|まい|mai|counter|tờ, tấm (vật mỏng)|counter for flat things|切手を五枚ください。|きってをごまいください。|Cho tôi năm con tem.|Five stamps, please.
本|ほん|hon|counter|cây, chai (vật dài)|counter for long things|ペンを二本買いました。|ペンをにほんかいました。|Tôi đã mua hai cây bút.|I bought two pens.
全部|ぜんぶ|zenbu|noun|tất cả|all, everything|全部でいくらですか。|ぜんぶでいくらですか。|Tất cả bao nhiêu tiền?|How much is it altogether?
少し|すこし|sukoshi|adverb|một chút|a little|日本語が少しわかります。|にほんごがすこしわかります。|Tôi hiểu một chút tiếng Nhật.|I understand a little Japanese.
たくさん|たくさん|takusan|adverb|nhiều|a lot|お土産をたくさん買いました。|おみやげをたくさんかいました。|Tôi đã mua nhiều quà.|I bought a lot of souvenirs.
デパート|デパート|depaato|noun|cửa hàng bách hóa|department store|デパートで靴を買いました。|デパートでくつをかいました。|Tôi đã mua giày ở cửa hàng bách hóa.|I bought shoes at the department store.
服|ふく|fuku|noun|quần áo|clothes|新しい服がほしいです。|あたらしいふくがほしいです。|Tôi muốn có quần áo mới.|I want new clothes.
靴|くつ|kutsu|noun|giày|shoes|この靴は少し大きいです。|このくつはすこしおおきいです。|Đôi giày này hơi rộng.|These shoes are a little big.
傘|かさ|kasa|noun|cái ô|umbrella|傘を持っていますか。|かさをもっていますか。|Bạn có mang ô không?|Do you have an umbrella?
かばん|かばん|kaban|noun|cái cặp, túi xách|bag|このかばんは軽いです。|このかばんはかるいです。|Cái túi này nhẹ.|This bag is light.
時計|とけい|tokei|noun|đồng hồ|watch, clock|父に時計をあげました。|ちちにとけいをあげました。|Tôi đã tặng bố chiếc đồng hồ.|I gave my father a watch.
財布|さいふ|saifu|noun|cái ví|wallet|財布をなくしました。|さいふをなくしました。|Tôi làm mất ví rồi.|I lost my wallet.
色|いろ|iro|noun|màu sắc|colour|どの色が好きですか。|どのいろがすきですか。|Bạn thích màu nào?|Which colour do you like?
赤い|あかい|akai|i-adjective|màu đỏ|red|赤い車がほしいです。|あかいくるまがほしいです。|Tôi muốn có chiếc xe màu đỏ.|I want a red car.`,
    },
    {
      key: 'n5-nature-seasons',
      topic: { vi: 'Thiên nhiên & bốn mùa', en: 'Nature & seasons', ja: '自然と季節' },
      words: `
春|はる|haru|noun|mùa xuân|spring|春に桜が咲きます。|はるにさくらがさきます。|Hoa anh đào nở vào mùa xuân.|Cherry blossoms bloom in spring.
夏|なつ|natsu|noun|mùa hè|summer|夏休みに海へ行きます。|なつやすみにうみへいきます。|Kỳ nghỉ hè tôi đi biển.|I go to the sea during summer vacation.
秋|あき|aki|noun|mùa thu|autumn|秋は涼しいです。|あきはすずしいです。|Mùa thu mát mẻ.|Autumn is cool.
冬|ふゆ|fuyu|noun|mùa đông|winter|冬はスキーをします。|ふゆはスキーをします。|Mùa đông tôi trượt tuyết.|I ski in winter.
空|そら|sora|noun|bầu trời|sky|今日は空が青いです。|きょうはそらがあおいです。|Hôm nay bầu trời xanh.|The sky is blue today.
海|うみ|umi|noun|biển|sea|海で泳ぎました。|うみでおよぎました。|Tôi đã bơi ở biển.|I swam in the sea.
花|はな|hana|noun|hoa|flower|母に花を買いました。|ははにはなをかいました。|Tôi đã mua hoa cho mẹ.|I bought flowers for my mother.
犬|いぬ|inu|noun|con chó|dog|犬と散歩します。|いぬとさんぽします。|Tôi đi dạo cùng con chó.|I take a walk with my dog.
猫|ねこ|neko|noun|con mèo|cat|猫が二匹います。|ねこがにひきいます。|Có hai con mèo.|There are two cats.
鳥|とり|tori|noun|con chim|bird|木の上に鳥がいます。|きのうえにとりがいます。|Trên cây có con chim.|There is a bird in the tree.
風|かぜ|kaze|noun|gió|wind|今日は風が強いです。|きょうはかぜがつよいです。|Hôm nay gió mạnh.|The wind is strong today.
動物|どうぶつ|doubutsu|noun|động vật|animal|どんな動物が好きですか。|どんなどうぶつがすきですか。|Bạn thích con vật nào?|What kind of animals do you like?
池|いけ|ike|noun|cái ao|pond|池に魚がいます。|いけにさかながいます。|Trong ao có cá.|There are fish in the pond.
庭|にわ|niwa|noun|khu vườn|garden|庭に木があります。|にわにきがあります。|Trong vườn có cây.|There is a tree in the garden.
暖かい|あたたかい|atatakai|i-adjective|ấm áp|warm|今日は暖かいですね。|きょうはあたたかいですね。|Hôm nay trời ấm nhỉ.|It's warm today, isn't it?
星|ほし|hoshi|noun|ngôi sao|star|夜、星がきれいです。|よる、ほしがきれいです。|Ban đêm sao rất đẹp.|The stars are beautiful at night.
散歩|さんぽ|sanpo|noun|đi dạo|walk, stroll|朝、公園を散歩します。|あさ、こうえんをさんぽします。|Buổi sáng tôi đi dạo công viên.|I take a walk in the park in the morning.
公園|こうえん|kouen|noun|công viên|park|公園で写真を撮りました。|こうえんでしゃしんをとりました。|Tôi đã chụp ảnh ở công viên.|I took photos in the park.`,
    },
  ],
  N4: [
    {
      key: 'n4-daily-life',
      topic: { vi: 'Đời sống hằng ngày', en: 'Daily life', ja: '日常生活' },
      words: `
引っ越す|ひっこす|hikkosu|verb|chuyển nhà|to move house|来月大阪に引っ越します。|らいげつおおさかにひっこします。|Tháng sau tôi chuyển đến Osaka.|I will move to Osaka next month.
片付ける|かたづける|katazukeru|verb|dọn dẹp, sắp xếp|to tidy up|おもちゃを片付けなさい。|おもちゃをかたづけなさい。|Dọn đồ chơi đi con.|Tidy up your toys.
捨てる|すてる|suteru|verb|vứt bỏ|to throw away|古い服を捨てました。|ふるいふくをすてました。|Tôi đã vứt quần áo cũ.|I threw away old clothes.
壊れる|こわれる|kowareru|verb|bị hỏng|to break (intransitive)|パソコンが壊れました。|パソコンがこわれました。|Máy tính bị hỏng rồi.|My computer broke.
直す|なおす|naosu|verb|sửa chữa|to fix, to repair|自転車を直してもらいました。|じてんしゃをなおしてもらいました。|Tôi đã nhờ sửa xe đạp.|I had my bicycle fixed.
汚れる|よごれる|yogoreru|verb|bị bẩn|to get dirty|シャツが汚れました。|シャツがよごれました。|Áo sơ mi bị bẩn rồi.|My shirt got dirty.
冷蔵庫|れいぞうこ|reizouko|noun|tủ lạnh|refrigerator|牛乳は冷蔵庫に入れてください。|ぎゅうにゅうはれいぞうこにいれてください。|Hãy cho sữa vào tủ lạnh.|Please put the milk in the fridge.
洗濯|せんたく|sentaku|noun|giặt giũ|laundry|日曜日に洗濯をします。|にちようびにせんたくをします。|Chủ nhật tôi giặt đồ.|I do the laundry on Sundays.
生活|せいかつ|seikatsu|noun|cuộc sống, sinh hoạt|life, daily living|日本の生活に慣れました。|にほんのせいかつになれました。|Tôi đã quen với cuộc sống ở Nhật.|I got used to life in Japan.
家賃|やちん|yachin|noun|tiền thuê nhà|rent|この部屋の家賃は高いです。|このへやのやちんはたかいです。|Tiền thuê phòng này đắt.|The rent for this room is high.
値段|ねだん|nedan|noun|giá cả|price|値段を見て驚きました。|ねだんをみておどろきました。|Tôi ngạc nhiên khi thấy giá.|I was surprised when I saw the price.
払う|はらう|harau|verb|trả tiền|to pay|カードで払えますか。|カードではらえますか。|Có trả bằng thẻ được không?|Can I pay by card?
売る|うる|uru|verb|bán|to sell|この店は古い本を売っています。|このみせはふるいほんをうっています。|Cửa hàng này bán sách cũ.|This shop sells old books.
足りる|たりる|tariru|verb|đủ|to be enough|お金が足りません。|おかねがたりません。|Không đủ tiền.|I don't have enough money.
無料|むりょう|muryou|noun|miễn phí|free of charge|子供は無料です。|こどもはむりょうです。|Trẻ em được miễn phí.|Children are free.
番号|ばんごう|bangou|noun|số (điện thoại, thứ tự)|number|電話番号を教えてください。|でんわばんごうをおしえてください。|Cho tôi xin số điện thoại.|Please tell me your phone number.
留守|るす|rusu|noun|vắng nhà|being away from home|昨日は留守でした。|きのうはるすでした。|Hôm qua tôi vắng nhà.|I was out yesterday.
自由|じゆう|jiyuu|na-adjective|tự do|free (liberty)|週末は自由な時間が多いです。|しゅうまつはじゆうなじかんがおおいです。|Cuối tuần có nhiều thời gian tự do.|I have a lot of free time on weekends.`,
    },
    {
      key: 'n4-hobbies',
      topic: { vi: 'Sở thích & giải trí', en: 'Hobbies & entertainment', ja: '趣味と娯楽' },
      words: `
趣味|しゅみ|shumi|noun|sở thích|hobby|私の趣味は読書です。|わたしのしゅみはどくしょです。|Sở thích của tôi là đọc sách.|My hobby is reading.
興味|きょうみ|kyoumi|noun|sự quan tâm, hứng thú|interest|日本の歴史に興味があります。|にほんのれきしにきょうみがあります。|Tôi quan tâm đến lịch sử Nhật Bản.|I am interested in Japanese history.
釣り|つり|tsuri|noun|câu cá|fishing|父と川へ釣りに行きました。|ちちとかわへつりにいきました。|Tôi đã đi câu cá ở sông với bố.|I went fishing in the river with my father.
美術館|びじゅつかん|bijutsukan|noun|bảo tàng mỹ thuật|art museum|週末、美術館へ行きました。|しゅうまつ、びじゅつかんへいきました。|Cuối tuần tôi đến bảo tàng mỹ thuật.|I went to the art museum on the weekend.
漫画|まんが|manga|noun|truyện tranh|comic, manga|電車で漫画を読みます。|でんしゃでまんがをよみます。|Tôi đọc truyện tranh trên tàu.|I read manga on the train.
小説|しょうせつ|shousetsu|noun|tiểu thuyết|novel|この小説はとても面白いです。|このしょうせつはとてもおもしろいです。|Cuốn tiểu thuyết này rất hay.|This novel is very interesting.
踊る|おどる|odoru|verb|nhảy múa|to dance|お祭りでみんなで踊りました。|おまつりでみんなでおどりました。|Mọi người đã cùng nhảy ở lễ hội.|Everyone danced together at the festival.
弾く|ひく|hiku|verb|chơi (nhạc cụ)|to play (an instrument)|姉はピアノを弾きます。|あねはピアノをひきます。|Chị tôi chơi piano.|My older sister plays the piano.
試合|しあい|shiai|noun|trận đấu|match, game|明日サッカーの試合があります。|あしたサッカーのしあいがあります。|Ngày mai có trận bóng đá.|There is a soccer match tomorrow.
選手|せんしゅ|senshu|noun|tuyển thủ, vận động viên|player, athlete|彼は有名な野球選手です。|かれはゆうめいなやきゅうせんしゅです。|Anh ấy là cầu thủ bóng chày nổi tiếng.|He is a famous baseball player.
応援|おうえん|ouen|noun|cổ vũ, ủng hộ|cheering, support|みんなで応援しましょう。|みんなでおうえんしましょう。|Mọi người cùng cổ vũ nào.|Let's all cheer together.
楽しみ|たのしみ|tanoshimi|noun|niềm vui, mong chờ|something to look forward to|旅行が楽しみです。|りょこうがたのしみです。|Tôi rất mong chờ chuyến du lịch.|I'm looking forward to the trip.
番組|ばんぐみ|bangumi|noun|chương trình (TV)|TV programme|好きな番組は何ですか。|すきなばんぐみはなんですか。|Chương trình yêu thích của bạn là gì?|What is your favourite programme?
遊園地|ゆうえんち|yuuenchi|noun|công viên giải trí|amusement park|子供と遊園地へ行きました。|こどもとゆうえんちへいきました。|Tôi đã đến công viên giải trí với con.|I went to the amusement park with my child.
花見|はなみ|hanami|noun|ngắm hoa anh đào|cherry-blossom viewing|公園で花見をしました。|こうえんではなみをしました。|Chúng tôi đã ngắm hoa ở công viên.|We did cherry-blossom viewing in the park.
祭り|まつり|matsuri|noun|lễ hội|festival|夏祭りに浴衣を着て行きました。|なつまつりにゆかたをきていきました。|Tôi mặc yukata đi lễ hội mùa hè.|I wore a yukata to the summer festival.
動物園|どうぶつえん|doubutsuen|noun|vườn thú|zoo|動物園でパンダを見ました。|どうぶつえんでパンダをみました。|Tôi đã xem gấu trúc ở vườn thú.|I saw pandas at the zoo.
誘う|さそう|sasou|verb|rủ, mời|to invite|友達を映画に誘いました。|ともだちをえいがにさそいました。|Tôi đã rủ bạn đi xem phim.|I invited a friend to a movie.`,
    },
    {
      key: 'n4-town-transport',
      topic: { vi: 'Đường phố & đi lại', en: 'Town & getting around', ja: '町と交通' },
      words: `
交通|こうつう|koutsuu|noun|giao thông|traffic, transport|東京は交通が便利です。|とうきょうはこうつうがべんりです。|Giao thông ở Tokyo rất tiện.|Transport in Tokyo is convenient.
信号|しんごう|shingou|noun|đèn giao thông|traffic light|信号が赤です。止まってください。|しんごうがあかです。とまってください。|Đèn đỏ rồi. Hãy dừng lại.|The light is red. Please stop.
交差点|こうさてん|kousaten|noun|ngã tư|intersection|次の交差点を右に曲がってください。|つぎのこうさてんをみぎにまがってください。|Hãy rẽ phải ở ngã tư tiếp theo.|Please turn right at the next intersection.
角|かど|kado|noun|góc (phố)|corner|銀行はあの角にあります。|ぎんこうはあのかどにあります。|Ngân hàng ở góc kia.|The bank is on that corner.
橋|はし|hashi|noun|cây cầu|bridge|橋を渡ると駅があります。|はしをわたるとえきがあります。|Qua cầu là đến nhà ga.|Cross the bridge and there is the station.
駐車場|ちゅうしゃじょう|chuushajou|noun|bãi đỗ xe|parking lot|駐車場はどこですか。|ちゅうしゃじょうはどこですか。|Bãi đỗ xe ở đâu?|Where is the parking lot?
地下鉄|ちかてつ|chikatetsu|noun|tàu điện ngầm|subway|地下鉄で会社へ行きます。|ちかてつでかいしゃへいきます。|Tôi đi làm bằng tàu điện ngầm.|I go to work by subway.
急行|きゅうこう|kyuukou|noun|tàu nhanh|express train|急行は次の駅に止まりません。|きゅうこうはつぎのえきにとまりません。|Tàu nhanh không dừng ở ga tiếp theo.|The express doesn't stop at the next station.
席|せき|seki|noun|chỗ ngồi|seat|この席は空いていますか。|このせきはあいていますか。|Chỗ này còn trống không?|Is this seat free?
込む|こむ|komu|verb|đông đúc|to be crowded|朝の電車はとても込みます。|あさのでんしゃはとてもこみます。|Tàu buổi sáng rất đông.|Morning trains are very crowded.
空く|あく|aku|verb|trống, vắng|to become empty|昼の電車は空いています。|ひるのでんしゃはあいています。|Tàu buổi trưa vắng.|Midday trains are empty.
渡る|わたる|wataru|verb|băng qua|to cross|道を渡るときは気をつけて。|みちをわたるときはきをつけて。|Khi qua đường hãy cẩn thận.|Be careful when you cross the road.
曲がる|まがる|magaru|verb|rẽ|to turn|二つ目の角を左に曲がります。|ふたつめのかどをひだりにまがります。|Rẽ trái ở góc thứ hai.|Turn left at the second corner.
止まる|とまる|tomaru|verb|dừng lại|to stop|バスが止まりました。|バスがとまりました。|Xe buýt đã dừng.|The bus stopped.
届ける|とどける|todokeru|verb|giao, chuyển đến|to deliver|荷物を届けに来ました。|にもつをとどけにきました。|Tôi đến giao hàng.|I came to deliver a package.
郵便局|ゆうびんきょく|yuubinkyoku|noun|bưu điện|post office|郵便局で切手を買いました。|ゆうびんきょくできってをかいました。|Tôi đã mua tem ở bưu điện.|I bought stamps at the post office.
警察|けいさつ|keisatsu|noun|cảnh sát|police|財布を落としたので警察に行きました。|さいふをおとしたのでけいさつにいきました。|Tôi đánh rơi ví nên đã đến cảnh sát.|I lost my wallet, so I went to the police.
遅れる|おくれる|okureru|verb|bị muộn, trễ|to be late|電車が十分遅れています。|でんしゃがじゅっぷんおくれています。|Tàu bị trễ 10 phút.|The train is ten minutes late.`,
    },
  ],
};
