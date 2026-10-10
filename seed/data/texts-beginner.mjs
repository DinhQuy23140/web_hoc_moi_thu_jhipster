// Extra beginner reading passages and dialogues (appended after texts.mjs).
// Same format as texts.mjs, plus `questionsVi`: Vietnamese [question, correct, wrong 1, wrong 2, wrong 3].

export const EN_TEXTS_PLUS = {
  A1: {
    readings: [
      {
        title: { vi: 'Thú cưng của tôi', en: 'My pet', ja: '私のペット' },
        passage: "I have a dog. His name is Max. He is three years old. Max is big and brown, and he has short hair. He likes playing in the garden and running in the park. Every morning I walk with Max before school. He doesn't like cats! At night, he sleeps next to my bed.",
        translation: { vi: 'Tôi có một con chó. Tên nó là Max. Nó ba tuổi. Max to và có màu nâu, lông ngắn. Nó thích chơi trong vườn và chạy nhảy trong công viên. Mỗi sáng tôi dắt Max đi dạo trước khi đi học. Nó không thích mèo! Ban đêm nó ngủ cạnh giường tôi.', en: '' },
        questions: [
          ['How old is Max?', 'Three', 'Two', 'Four', 'Five'],
          ['What colour is Max?', 'Brown', 'Black', 'White', 'Grey'],
          ['Where does Max sleep?', 'Next to the bed', 'In the garden', 'In the kitchen', 'In the park'],
        ],
        questionsVi: [
          ['Max mấy tuổi?', 'Ba tuổi', 'Hai tuổi', 'Bốn tuổi', 'Năm tuổi'],
          ['Max màu gì?', 'Màu nâu', 'Màu đen', 'Màu trắng', 'Màu xám'],
          ['Max ngủ ở đâu?', 'Cạnh giường', 'Trong vườn', 'Trong bếp', 'Ở công viên'],
        ],
      },
      {
        title: { vi: 'Thị trấn của tôi', en: 'My town', ja: '私の町' },
        passage: "I live in a small town near the sea. There is a supermarket, a bank and a library on the main street. The library is my favourite place because it is quiet. There isn't a cinema in my town, so we take the bus to the city on Saturdays. The bus stop is on the corner, near my house. People in my town are very friendly.",
        translation: { vi: 'Tôi sống ở một thị trấn nhỏ gần biển. Trên phố chính có một siêu thị, một ngân hàng và một thư viện. Thư viện là nơi tôi thích nhất vì nó yên tĩnh. Thị trấn tôi không có rạp chiếu phim, nên thứ Bảy chúng tôi đi xe buýt lên thành phố. Trạm xe buýt ở góc phố, gần nhà tôi. Người dân ở thị trấn tôi rất thân thiện.', en: '' },
        questions: [
          ['Why does the writer like the library?', 'It is quiet', 'It is big', 'It is new', 'It has a café'],
          ['What is NOT in the town?', 'A cinema', 'A bank', 'A supermarket', 'A library'],
          ['How do they go to the city?', 'By bus', 'By train', 'By car', 'On foot'],
        ],
        questionsVi: [
          ['Vì sao người viết thích thư viện?', 'Vì nó yên tĩnh', 'Vì nó rộng', 'Vì nó mới', 'Vì nó có quán cà phê'],
          ['Thị trấn KHÔNG có gì?', 'Rạp chiếu phim', 'Ngân hàng', 'Siêu thị', 'Thư viện'],
          ['Họ lên thành phố bằng gì?', 'Xe buýt', 'Tàu hỏa', 'Ô tô', 'Đi bộ'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Mua quần áo', en: 'Buying clothes', ja: '服を買う' },
        lines: [
          ['Assistant', 'Hello. Can I help you?', 'Xin chào. Tôi có thể giúp gì cho bạn?'],
          ['Nam', "Yes, I'm looking for a jacket.", 'Vâng, tôi đang tìm một chiếc áo khoác.'],
          ['Assistant', 'What colour would you like?', 'Bạn muốn màu gì?'],
          ['Nam', 'Black, please. Size medium.', 'Màu đen. Cỡ vừa.'],
          ['Assistant', 'Here you are. It is forty dollars.', 'Của bạn đây. Giá bốn mươi đô la.'],
          ['Nam', "Great, I'll take it.", 'Tuyệt, tôi lấy cái này.'],
        ],
        questions: [
          ['What does Nam want to buy?', 'A jacket', 'A shirt', 'Shoes', 'A hat'],
          ['How much is it?', '$40', '$14', '$400', '$4'],
        ],
        questionsVi: [
          ['Nam muốn mua gì?', 'Một chiếc áo khoác', 'Một chiếc áo sơ mi', 'Giày', 'Một chiếc mũ'],
          ['Nó giá bao nhiêu?', '40 đô la', '14 đô la', '400 đô la', '4 đô la'],
        ],
      },
      {
        title: { vi: 'Gọi điện cho bạn', en: 'Calling a friend', ja: '友達に電話する' },
        lines: [
          ['Mai', 'Hi Tom! What are you doing?', 'Chào Tom! Bạn đang làm gì thế?'],
          ['Tom', "I'm cooking dinner. Why?", 'Mình đang nấu bữa tối. Sao vậy?'],
          ['Mai', "Let's go to the cinema tonight.", 'Tối nay mình đi xem phim đi.'],
          ['Tom', 'Good idea! What time?', 'Ý hay đấy! Mấy giờ?'],
          ['Mai', 'At eight. I can meet you at the bus stop.', 'Lúc tám giờ. Mình gặp bạn ở trạm xe buýt nhé.'],
          ['Tom', 'OK. See you later!', 'Được. Lát gặp nhé!'],
        ],
        questions: [
          ['What is Tom doing?', 'Cooking dinner', 'Watching TV', 'Doing homework', 'Sleeping'],
          ['Where will they meet?', 'At the bus stop', 'At the cinema', "At Tom's house", 'At school'],
        ],
        questionsVi: [
          ['Tom đang làm gì?', 'Nấu bữa tối', 'Xem TV', 'Làm bài tập', 'Ngủ'],
          ['Họ sẽ gặp nhau ở đâu?', 'Ở trạm xe buýt', 'Ở rạp chiếu phim', 'Ở nhà Tom', 'Ở trường'],
        ],
      },
    ],
  },
  A2: {
    readings: [
      {
        title: { vi: 'Căn hộ mới', en: 'A new flat', ja: '新しいアパート' },
        passage: "Last month, Hoa moved to a new flat in Ho Chi Minh City. It's on the fifth floor, and there is no lift, so she has to use the stairs every day. The flat is small but comfortable, and the rent is cheaper than her old place. She shares it with a friend from university. The only problem is the street outside – it's very noisy at night. Hoa is going to buy some thick curtains this weekend.",
        translation: { vi: 'Tháng trước, Hoa chuyển đến một căn hộ mới ở TP. Hồ Chí Minh. Căn hộ ở tầng năm và không có thang máy nên ngày nào cô cũng phải đi cầu thang bộ. Căn hộ nhỏ nhưng thoải mái, tiền thuê rẻ hơn chỗ cũ. Cô ở chung với một người bạn đại học. Vấn đề duy nhất là con phố bên ngoài – ban đêm rất ồn. Cuối tuần này Hoa định mua rèm cửa dày.', en: '' },
        questions: [
          ['Why does Hoa use the stairs?', 'There is no lift', 'She likes exercise', 'The lift is slow', 'She lives on the first floor'],
          ['Who does Hoa live with?', 'A university friend', 'Her parents', 'Her sister', 'Alone'],
          ['What is the problem with the flat?', 'The street is noisy at night', 'The rent is expensive', 'It is too big', 'It is far from the city'],
        ],
        questionsVi: [
          ['Vì sao Hoa đi cầu thang bộ?', 'Không có thang máy', 'Cô ấy thích tập thể dục', 'Thang máy chậm', 'Cô ấy sống ở tầng một'],
          ['Hoa sống cùng ai?', 'Một người bạn đại học', 'Bố mẹ cô ấy', 'Chị gái cô ấy', 'Một mình'],
          ['Căn hộ có vấn đề gì?', 'Ban đêm ngoài phố ồn ào', 'Tiền thuê đắt', 'Quá rộng', 'Xa thành phố'],
        ],
      },
      {
        title: { vi: 'Bốn mùa ở Hà Nội', en: 'Four seasons in Hanoi', ja: 'ハノイの四季' },
        passage: "Hanoi has four seasons. Spring is warm and often a little wet, and people celebrate Tet at this time. Summer is very hot, with temperatures over 35 degrees and heavy storms. Many people think autumn is the best season: the weather is dry and cool, and the city smells of milk flowers. Winter is cold and grey, but it never snows. If you visit Hanoi, October is a great time to come.",
        translation: { vi: 'Hà Nội có bốn mùa. Mùa xuân ấm áp và thường hơi ẩm ướt, người dân đón Tết vào dịp này. Mùa hè rất nóng, nhiệt độ trên 35 độ và có những cơn bão lớn. Nhiều người cho rằng mùa thu là mùa đẹp nhất: thời tiết khô ráo, mát mẻ và thành phố thơm mùi hoa sữa. Mùa đông lạnh và u ám nhưng không bao giờ có tuyết. Nếu bạn đến Hà Nội, tháng Mười là thời điểm tuyệt vời.', en: '' },
        questions: [
          ['When do people celebrate Tet?', 'In spring', 'In summer', 'In autumn', 'In winter'],
          ['What is the weather like in autumn?', 'Dry and cool', 'Hot and wet', 'Cold and snowy', 'Very windy'],
          ['Which is true about winter in Hanoi?', 'It never snows', 'It is very hot', 'It snows every year', 'It is the best season'],
        ],
        questionsVi: [
          ['Người dân đón Tết vào mùa nào?', 'Mùa xuân', 'Mùa hè', 'Mùa thu', 'Mùa đông'],
          ['Thời tiết mùa thu thế nào?', 'Khô ráo và mát mẻ', 'Nóng và ẩm ướt', 'Lạnh và có tuyết', 'Rất nhiều gió'],
          ['Câu nào đúng về mùa đông Hà Nội?', 'Không bao giờ có tuyết', 'Rất nóng', 'Năm nào cũng có tuyết', 'Là mùa đẹp nhất'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Trả hàng', en: 'Returning an item', ja: '返品' },
        lines: [
          ['Customer', 'Excuse me, I bought this shirt yesterday, but it is too small.', 'Xin lỗi, hôm qua tôi mua chiếc áo này nhưng nó quá chật.'],
          ['Assistant', 'Would you like a bigger size or your money back?', 'Anh muốn đổi cỡ lớn hơn hay lấy lại tiền?'],
          ['Customer', "A bigger size, please. Do you have a large?", 'Cho tôi đổi cỡ lớn hơn. Có cỡ L không?'],
          ['Assistant', "Yes, here you are. Can I see your receipt?", 'Có, của anh đây. Cho tôi xem hóa đơn được không?'],
          ['Customer', 'Sure. Here it is.', 'Được. Đây ạ.'],
        ],
        questions: [
          ['What is the problem with the shirt?', 'It is too small', 'It is too big', 'It is the wrong colour', 'It is broken'],
          ['What does the assistant ask for?', 'The receipt', 'A credit card', 'His name', 'Cash'],
        ],
        questionsVi: [
          ['Chiếc áo có vấn đề gì?', 'Quá chật', 'Quá rộng', 'Sai màu', 'Bị hỏng'],
          ['Nhân viên yêu cầu xem gì?', 'Hóa đơn', 'Thẻ tín dụng', 'Tên của anh ấy', 'Tiền mặt'],
        ],
      },
      {
        title: { vi: 'Dự báo thời tiết', en: 'The weather forecast', ja: '天気予報' },
        lines: [
          ['Lan', 'Did you see the forecast for the weekend?', 'Bạn xem dự báo thời tiết cuối tuần chưa?'],
          ['Ben', "Yes. Saturday will be sunny, but there might be a storm on Sunday.", 'Rồi. Thứ Bảy trời nắng nhưng Chủ nhật có thể có bão.'],
          ['Lan', "Then let's go to the beach on Saturday.", 'Vậy thì mình đi biển vào thứ Bảy nhé.'],
          ['Ben', "Good idea. I'll bring some food and drinks.", 'Ý hay đấy. Mình sẽ mang đồ ăn và nước uống.'],
        ],
        questions: [
          ['What will the weather be like on Sunday?', 'There might be a storm', 'Sunny', 'Snowy', 'Warm and dry'],
          ['What will Ben bring?', 'Food and drinks', 'An umbrella', 'A camera', 'Some books'],
        ],
        questionsVi: [
          ['Thời tiết Chủ nhật sẽ thế nào?', 'Có thể có bão', 'Trời nắng', 'Có tuyết', 'Ấm và khô ráo'],
          ['Ben sẽ mang gì?', 'Đồ ăn và nước uống', 'Một chiếc ô', 'Một chiếc máy ảnh', 'Vài cuốn sách'],
        ],
      },
    ],
  },
};

export const JA_TEXTS_PLUS = {
  N5: {
    readings: [
      {
        title: { vi: 'Bốn mùa ở Nhật', en: 'Seasons in Japan', ja: 'にほんの　きせつ' },
        passage: 'にほんには　はる、なつ、あき、ふゆが　あります。はるは　あたたかくて、さくらが　きれいです。なつは　とても　あついです。わたしは　なつに　うみで　およぎます。あきは　すずしくて、たべものが　おいしいです。ふゆは　さむいですが、ゆきが　きれいです。わたしは　あきが　いちばん　すきです。',
        translation: { vi: 'Nhật Bản có mùa xuân, hạ, thu, đông. Mùa xuân ấm áp, hoa anh đào rất đẹp. Mùa hè rất nóng. Mùa hè tôi bơi ở biển. Mùa thu mát mẻ, đồ ăn ngon. Mùa đông lạnh nhưng tuyết rất đẹp. Tôi thích mùa thu nhất.', en: 'Japan has spring, summer, autumn and winter. Spring is warm and the cherry blossoms are beautiful. Summer is very hot. In summer I swim in the sea. Autumn is cool and the food is delicious. Winter is cold, but the snow is beautiful. I like autumn best.' },
        questions: [
          ['はるは　なにが　きれいですか。', 'さくら', 'ゆき', 'うみ', 'やま'],
          ['なつに　なにを　しますか。', 'うみで　およぎます', 'スキーを　します', 'はなみを　します', 'やまに　のぼります'],
          ['この人は　どの　きせつが　いちばん　すきですか。', 'あき', 'はる', 'なつ', 'ふゆ'],
        ],
        questionsVi: [
          ['Mùa xuân cái gì đẹp?', 'Hoa anh đào', 'Tuyết', 'Biển', 'Núi'],
          ['Mùa hè làm gì?', 'Bơi ở biển', 'Trượt tuyết', 'Ngắm hoa', 'Leo núi'],
          ['Người này thích mùa nào nhất?', 'Mùa thu', 'Mùa xuân', 'Mùa hè', 'Mùa đông'],
        ],
      },
      {
        title: { vi: 'Đi mua sắm', en: 'Going shopping', ja: 'かいもの' },
        passage: 'きのう、デパートへ　かいものに　いきました。あたらしい　くつが　ほしかったです。しろい　くつは　八千えんでした。たかかったですから、かいませんでした。くろい　くつは　五千えんでした。やすくて　かるいですから、それを　かいました。それから　ははに　あかい　かさを　かいました。',
        translation: { vi: 'Hôm qua tôi đến cửa hàng bách hóa để mua sắm. Tôi muốn có đôi giày mới. Đôi giày trắng giá 8.000 yên. Vì đắt nên tôi không mua. Đôi giày đen giá 5.000 yên. Vì rẻ và nhẹ nên tôi đã mua đôi đó. Sau đó tôi mua cho mẹ một chiếc ô màu đỏ.', en: "Yesterday I went shopping at a department store. I wanted new shoes. The white shoes were 8,000 yen. They were expensive, so I didn't buy them. The black shoes were 5,000 yen. They were cheap and light, so I bought them. Then I bought a red umbrella for my mother." },
        questions: [
          ['どうして　しろい　くつを　かいませんでしたか。', 'たかかったから', 'おもかったから', 'ちいさかったから', 'ふるかったから'],
          ['くろい　くつは　いくらでしたか。', '五千えん', '八千えん', '三千えん', '一万えん'],
          ['おかあさんに　なにを　かいましたか。', 'あかい　かさ', 'くろい　くつ', 'しろい　くつ', 'あかい　かばん'],
        ],
        questionsVi: [
          ['Vì sao không mua đôi giày trắng?', 'Vì đắt', 'Vì nặng', 'Vì nhỏ', 'Vì cũ'],
          ['Đôi giày đen giá bao nhiêu?', '5.000 yên', '8.000 yên', '3.000 yên', '10.000 yên'],
          ['Đã mua gì cho mẹ?', 'Chiếc ô màu đỏ', 'Đôi giày đen', 'Đôi giày trắng', 'Chiếc túi màu đỏ'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Ở nhà hàng', en: 'At a restaurant', ja: 'レストランで' },
        lines: [
          ['てんいん', 'いらっしゃいませ。なんめいさまですか。', 'Xin mời vào. Quý khách đi mấy người ạ?', 'Welcome. How many people?'],
          ['きゃく', 'ふたりです。', 'Hai người.', 'Two.'],
          ['てんいん', 'ごちゅうもんは？', 'Quý khách gọi món gì ạ?', 'What would you like to order?'],
          ['きゃく', 'てんぷらと　うどんを　ください。それから　おちゃを　ふたつ。', 'Cho tôi tempura và udon. Và hai cốc trà.', 'Tempura and udon, please. And two teas.'],
          ['てんいん', 'はい、しょうしょう　おまちください。', 'Vâng, xin quý khách đợi một chút.', 'Certainly, please wait a moment.'],
        ],
        questions: [
          ['きゃくは　なんにんですか。', 'ふたり', 'ひとり', 'さんにん', 'よにん'],
          ['のみものは　なにを　たのみましたか。', 'おちゃ', 'コーヒー', 'ジュース', 'みず'],
        ],
        questionsVi: [
          ['Khách có mấy người?', 'Hai người', 'Một người', 'Ba người', 'Bốn người'],
          ['Họ gọi đồ uống gì?', 'Trà', 'Cà phê', 'Nước ép', 'Nước lọc'],
        ],
      },
      {
        title: { vi: 'Hỏi đường đến ga', en: 'The way to the station', ja: 'えきへの　みち' },
        lines: [
          ['A', 'すみません、えきは　どこですか。', 'Xin lỗi, nhà ga ở đâu ạ?', 'Excuse me, where is the station?'],
          ['B', 'この　みちを　まっすぐ　いって、ぎんこうの　かどを　みぎです。', 'Đi thẳng con đường này, đến góc ngân hàng thì rẽ phải.', 'Go straight along this road and turn right at the bank corner.'],
          ['A', 'とおいですか。', 'Có xa không ạ?', 'Is it far?'],
          ['B', 'いいえ、あるいて　五ふんぐらいです。', 'Không, đi bộ khoảng năm phút.', 'No, about five minutes on foot.'],
          ['A', 'ありがとうございます。', 'Cảm ơn ạ.', 'Thank you.'],
        ],
        questions: [
          ['ぎんこうの　かどを　どちらへ　まがりますか。', 'みぎ', 'ひだり', 'まっすぐ', 'うしろ'],
          ['えきまで　なんぷんぐらいですか。', '五ふん', '十ぷん', '十五ふん', '三十ぷん'],
        ],
        questionsVi: [
          ['Đến góc ngân hàng thì rẽ hướng nào?', 'Bên phải', 'Bên trái', 'Đi thẳng', 'Phía sau'],
          ['Đến ga mất khoảng mấy phút?', '5 phút', '10 phút', '15 phút', '30 phút'],
        ],
      },
    ],
  },
  N4: {
    readings: [
      {
        title: { vi: 'Chuyển nhà', en: 'Moving house', ja: '引っ越し' },
        passage: '先月、会社の近くに引っ越しました。前の部屋は駅から遠くて、毎朝一時間も電車に乗らなければなりませんでした。新しい部屋は会社まで歩いて十分です。家賃は少し高いですが、朝ゆっくりできるようになりました。ただ、部屋が狭いので、いらない物をたくさん捨てました。週末は近所の公園を散歩するのが楽しみです。',
        passageReading: 'せんげつ、かいしゃのちかくにひっこしました。まえのへやはえきからとおくて、まいあさいちじかんもでんしゃにのらなければなりませんでした。あたらしいへやはかいしゃまであるいてじゅっぷんです。やちんはすこしたかいですが、あさゆっくりできるようになりました。ただ、へやがせまいので、いらないものをたくさんすてました。しゅうまつはきんじょのこうえんをさんぽするのがたのしみです。',
        translation: { vi: 'Tháng trước tôi đã chuyển đến gần công ty. Phòng cũ xa ga, sáng nào tôi cũng phải đi tàu mất cả tiếng. Phòng mới đi bộ đến công ty mất 10 phút. Tiền thuê hơi đắt nhưng buổi sáng tôi đã có thể thong thả hơn. Có điều phòng chật nên tôi đã vứt đi rất nhiều đồ không cần thiết. Cuối tuần, tôi rất thích đi dạo ở công viên gần nhà.', en: "Last month I moved near my company. My old room was far from the station, and every morning I had to ride the train for a whole hour. From the new room it's a ten-minute walk to work. The rent is a little higher, but I can now take it easy in the morning. However, the room is small, so I threw away lots of things I didn't need. On weekends I enjoy walking in the neighbourhood park." },
        questions: [
          ['新しい部屋から会社までどのくらいかかりますか。', '歩いて十分', '電車で一時間', '歩いて一時間', '電車で十分'],
          ['引っ越してから、何ができるようになりましたか。', '朝ゆっくりすること', '家賃を安くすること', '広い部屋に住むこと', '毎朝電車に乗ること'],
          ['どうして物をたくさん捨てましたか。', '部屋が狭いから', '古かったから', '引っ越しが高いから', '家族に言われたから'],
        ],
        questionsVi: [
          ['Từ phòng mới đến công ty mất bao lâu?', 'Đi bộ 10 phút', 'Đi tàu 1 tiếng', 'Đi bộ 1 tiếng', 'Đi tàu 10 phút'],
          ['Sau khi chuyển nhà, người này đã có thể làm gì?', 'Thong thả vào buổi sáng', 'Giảm tiền thuê nhà', 'Sống ở phòng rộng', 'Đi tàu mỗi sáng'],
          ['Vì sao đã vứt nhiều đồ?', 'Vì phòng chật', 'Vì đồ cũ', 'Vì chuyển nhà tốn kém', 'Vì gia đình bảo'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Rủ đi lễ hội', en: 'An invitation to a festival', ja: 'お祭りに誘う' },
        lines: [
          ['A', '今度の土曜日、近くの神社でお祭りがあるんですが、一緒に行きませんか。', 'Thứ Bảy này ở đền gần đây có lễ hội, cùng đi không?', "There's a festival at the nearby shrine this Saturday. Would you like to go together?"],
          ['B', 'いいですね。何時からですか。', 'Hay quá. Từ mấy giờ vậy?', 'Sounds good. What time does it start?'],
          ['A', '夕方六時からです。浴衣を着て行こうと思っています。', 'Từ 6 giờ chiều. Mình định mặc yukata đi.', 'From six in the evening. I am thinking of wearing a yukata.'],
          ['B', '私は浴衣を持っていないんです。', 'Mình không có yukata.', "I don't have a yukata."],
          ['A', 'じゃ、私の姉のを貸してあげますよ。', 'Vậy mình cho bạn mượn cái của chị mình nhé.', "Then I'll lend you my sister's."],
        ],
        questions: [
          ['お祭りは何時からですか。', '夕方六時', '朝十時', '昼十二時', '夜九時'],
          ['Bさんは浴衣をどうしますか。', 'Aさんのお姉さんのを借りる', '新しいのを買う', '着ないで行く', '自分のを着る'],
        ],
        questionsVi: [
          ['Lễ hội bắt đầu lúc mấy giờ?', '6 giờ chiều', '10 giờ sáng', '12 giờ trưa', '9 giờ tối'],
          ['B sẽ làm thế nào về yukata?', 'Mượn của chị gái A', 'Mua cái mới', 'Đi mà không mặc', 'Mặc của mình'],
        ],
      },
      {
        title: { vi: 'Đi tàu', en: 'Taking the train', ja: '電車に乗る' },
        lines: [
          ['客', 'すみません、横浜へ行きたいんですが、この電車は止まりますか。', 'Xin lỗi, tôi muốn đi Yokohama, tàu này có dừng không ạ?', 'Excuse me, I want to go to Yokohama. Does this train stop there?'],
          ['駅員', 'これは急行なので、横浜には止まりません。次の普通に乗ってください。', 'Đây là tàu nhanh nên không dừng ở Yokohama. Xin hãy đi chuyến tàu thường tiếp theo.', "This is an express, so it doesn't stop at Yokohama. Please take the next local train."],
          ['客', '次の普通は何分ですか。', 'Chuyến tàu thường tiếp theo là mấy phút ạ?', 'What time is the next local train?'],
          ['駅員', '十時十五分です。三番線から出ます。', '10 giờ 15 phút. Tàu chạy từ đường ray số 3.', 'It is at 10:15. It leaves from platform 3.'],
        ],
        questions: [
          ['どうしてこの電車に乗りませんか。', '横浜に止まらないから', '込んでいるから', '遅れているから', '高いから'],
          ['次の普通は何番線から出ますか。', '三番線', '一番線', '五番線', '十番線'],
        ],
        questionsVi: [
          ['Vì sao không đi chuyến tàu này?', 'Vì nó không dừng ở Yokohama', 'Vì đông', 'Vì bị trễ', 'Vì đắt'],
          ['Chuyến tàu thường tiếp theo chạy từ đường ray số mấy?', 'Số 3', 'Số 1', 'Số 5', 'Số 10'],
        ],
      },
    ],
  },
};
