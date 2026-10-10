// Reading passages and listening dialogues, grouped by level pool.
// questions: [question, correct answer, wrong 1, wrong 2, wrong 3]
// dialogue lines: [speaker, text, Vietnamese, English (Japanese dialogues only)]

export const EN_TEXTS = {
  A1: {
    readings: [
      {
        title: { vi: 'Gia đình của Anna', en: "Anna's family", ja: 'アンナの家族' },
        passage: "My name is Anna. I am twelve years old and I live in a small house in Manchester. There are four people in my family: my mother, my father, my brother Tom and me. My mother is a nurse and my father is a bus driver. Tom is eight. He loves football. We have a cat called Milo. Every Sunday, we eat lunch together at my grandmother's house.",
        translation: { vi: 'Tên tôi là Anna. Tôi mười hai tuổi và sống trong một ngôi nhà nhỏ ở Manchester. Gia đình tôi có bốn người: mẹ, bố, em trai Tom và tôi. Mẹ tôi là y tá, bố tôi là tài xế xe buýt. Tom tám tuổi. Em ấy rất thích bóng đá. Chúng tôi có một con mèo tên Milo. Chủ nhật nào chúng tôi cũng ăn trưa cùng nhau ở nhà bà.', en: '' },
        questions: [
          ['How many people are there in Anna\'s family?', 'Four', 'Three', 'Five', 'Two'],
          ['What is her father\'s job?', 'A bus driver', 'A nurse', 'A teacher', 'A doctor'],
          ['Where do they eat lunch on Sundays?', "At her grandmother's house", 'At a restaurant', 'At school', 'In the park'],
        ],
      },
      {
        title: { vi: 'Một ngày của Minh', en: "Minh's day", ja: 'ミンさんの一日' },
        passage: "Minh is a student in Hanoi. He gets up at six o'clock every morning. He has bread and milk for breakfast. Then he goes to school by bike. School starts at seven. Minh likes English and Maths, but he doesn't like History. After school, he plays badminton with his friends. In the evening, he does his homework and watches TV. He goes to bed at ten.",
        translation: { vi: 'Minh là học sinh ở Hà Nội. Mỗi sáng cậu dậy lúc sáu giờ. Cậu ăn sáng bằng bánh mì và sữa. Sau đó cậu đạp xe đến trường. Trường học bắt đầu lúc bảy giờ. Minh thích tiếng Anh và Toán nhưng không thích Lịch sử. Sau giờ học, cậu chơi cầu lông với bạn. Buổi tối, cậu làm bài tập và xem TV. Cậu đi ngủ lúc mười giờ.', en: '' },
        questions: [
          ['How does Minh go to school?', 'By bike', 'By bus', 'On foot', 'By car'],
          ['Which subject doesn\'t Minh like?', 'History', 'English', 'Maths', 'Music'],
          ['What does he do after school?', 'He plays badminton', 'He watches TV', 'He sleeps', 'He cooks dinner'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Ở quán cà phê', en: 'At the café', ja: 'カフェで' },
        lines: [
          ['Waiter', 'Good morning! What would you like?', 'Chào buổi sáng! Quý khách muốn dùng gì?'],
          ['Lisa', "I'd like a cup of tea and a sandwich, please.", 'Cho tôi một tách trà và một chiếc bánh sandwich.'],
          ['Waiter', 'Sure. Milk or lemon with your tea?', 'Vâng. Trà dùng với sữa hay chanh ạ?'],
          ['Lisa', 'Lemon, please. How much is that?', 'Chanh nhé. Hết bao nhiêu tiền?'],
          ['Waiter', "That's six pounds fifty.", 'Tổng cộng sáu bảng năm mươi xu.'],
        ],
        questions: [
          ['What does Lisa order?', 'Tea and a sandwich', 'Coffee and cake', 'Juice and a salad', 'Water and soup'],
          ['How much does she pay?', '£6.50', '£5.60', '£16.50', '£6.15'],
        ],
      },
      {
        title: { vi: 'Hỏi đường', en: 'Asking for directions', ja: '道を聞く' },
        lines: [
          ['Tourist', 'Excuse me, where is the train station?', 'Xin lỗi, nhà ga ở đâu ạ?'],
          ['Man', 'Go straight on and turn left at the bank.', 'Đi thẳng rồi rẽ trái ở ngân hàng.'],
          ['Tourist', 'Is it far?', 'Có xa không ạ?'],
          ['Man', "No, it's about five minutes on foot.", 'Không, đi bộ khoảng năm phút.'],
          ['Tourist', 'Thank you very much!', 'Cảm ơn rất nhiều!'],
        ],
        questions: [
          ['Where does the tourist want to go?', 'The train station', 'The bank', 'The hotel', 'The museum'],
          ['How long does it take to walk there?', 'About five minutes', 'About fifteen minutes', 'An hour', 'Two minutes'],
        ],
      },
    ],
  },
  A2: {
    readings: [
      {
        title: { vi: 'Chuyến đi Đà Nẵng', en: 'A trip to Da Nang', ja: 'ダナン旅行' },
        passage: "Last summer, Sarah travelled to Da Nang with her two best friends. They flew from London to Ho Chi Minh City and then took a short domestic flight. Their hotel was near My Khe beach, so they went swimming every morning. On the third day, they visited the Marble Mountains and took lots of photos. The food was delicious and cheap. Sarah's favourite dish was mi Quang. The only problem was the heat — it was over 35 degrees every day! Sarah says she wants to go back next year.",
        translation: { vi: 'Mùa hè năm ngoái, Sarah đi Đà Nẵng cùng hai người bạn thân. Họ bay từ London đến TP. Hồ Chí Minh rồi đi một chuyến bay nội địa ngắn. Khách sạn của họ gần bãi biển Mỹ Khê nên sáng nào họ cũng đi bơi. Ngày thứ ba, họ tham quan Ngũ Hành Sơn và chụp rất nhiều ảnh. Đồ ăn ngon và rẻ. Món Sarah thích nhất là mì Quảng. Vấn đề duy nhất là cái nóng — ngày nào cũng trên 35 độ! Sarah nói cô muốn quay lại vào năm sau.', en: '' },
        questions: [
          ['Who did Sarah travel with?', 'Two friends', 'Her parents', 'Her sister', 'Alone'],
          ['What did they do every morning?', 'They went swimming', 'They visited temples', 'They went shopping', 'They slept late'],
          ['What was the problem during the trip?', 'It was very hot', 'The food was bad', 'The hotel was far', 'It rained a lot'],
        ],
      },
      {
        title: { vi: 'Lối sống lành mạnh', en: 'A healthy lifestyle', ja: '健康的な生活' },
        passage: "Doctors say that there are three simple ways to stay healthy. First, eat a balanced diet with lots of fruit and vegetables, and avoid too much sugar. Second, exercise for at least thirty minutes a day. You don't need to go to a gym — walking or cycling is fine. Third, get enough sleep. Adults need seven to nine hours every night. People who follow these rules usually feel happier and have more energy.",
        translation: { vi: 'Các bác sĩ nói có ba cách đơn giản để giữ sức khỏe. Thứ nhất, ăn uống cân bằng với nhiều trái cây và rau, tránh ăn quá nhiều đường. Thứ hai, tập thể dục ít nhất ba mươi phút mỗi ngày. Bạn không cần đến phòng gym — đi bộ hay đạp xe cũng được. Thứ ba, ngủ đủ giấc. Người lớn cần bảy đến chín tiếng mỗi đêm. Những người theo các quy tắc này thường cảm thấy vui vẻ và tràn đầy năng lượng hơn.', en: '' },
        questions: [
          ['How long should you exercise each day?', 'At least 30 minutes', 'At least 2 hours', '10 minutes', 'Only at weekends'],
          ['How many hours of sleep do adults need?', '7 to 9 hours', '5 to 6 hours', '10 to 12 hours', '4 hours'],
          ['According to the text, which is true?', "You don't have to go to a gym", 'You must stop eating sugar completely', 'Cycling is bad for you', 'Children need less sleep'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Đặt phòng khách sạn', en: 'Booking a hotel room', ja: 'ホテルの予約' },
        lines: [
          ['Receptionist', 'Sunrise Hotel, how can I help you?', 'Khách sạn Sunrise xin nghe, tôi có thể giúp gì?'],
          ['Mark', "I'd like to book a double room for three nights, from the 12th of May.", 'Tôi muốn đặt một phòng đôi ba đêm, từ ngày 12 tháng 5.'],
          ['Receptionist', 'Let me check... Yes, we have one with a sea view. It\'s 80 dollars a night.', 'Để tôi kiểm tra... Vâng, chúng tôi còn một phòng nhìn ra biển. Giá 80 đô một đêm.'],
          ['Mark', 'Is breakfast included?', 'Có bao gồm bữa sáng không?'],
          ['Receptionist', 'Yes, breakfast is served from 6:30 to 10.', 'Có, bữa sáng phục vụ từ 6:30 đến 10 giờ.'],
        ],
        questions: [
          ['How many nights does Mark want to stay?', 'Three', 'Two', 'Five', 'Twelve'],
          ['How much is the room per night?', '$80', '$18', '$30', '$800'],
        ],
      },
      {
        title: { vi: 'Ở phòng khám', en: "At the doctor's", ja: '診療所で' },
        lines: [
          ['Doctor', "What's the matter?", 'Bạn bị sao vậy?'],
          ['Ben', "I've had a headache and a sore throat since Monday.", 'Tôi bị đau đầu và đau họng từ thứ Hai.'],
          ['Doctor', 'Do you have a fever?', 'Bạn có bị sốt không?'],
          ['Ben', 'Yes, a little. About 38 degrees.', 'Có, hơi sốt. Khoảng 38 độ.'],
          ['Doctor', "It's probably the flu. Take this medicine three times a day and get plenty of rest.", 'Có lẽ là cúm. Uống thuốc này ba lần một ngày và nghỉ ngơi nhiều nhé.'],
        ],
        questions: [
          ['When did Ben\'s problem start?', 'On Monday', 'Yesterday', 'Last week', 'This morning'],
          ['How often should he take the medicine?', 'Three times a day', 'Once a day', 'Twice a week', 'Every hour'],
        ],
      },
    ],
  },
  B1: {
    readings: [
      {
        title: { vi: 'Rác thải nhựa', en: 'The problem with plastic', ja: 'プラスチック問題' },
        passage: "Every year, around eight million tonnes of plastic end up in the oceans. Much of it comes from single-use items such as bags, bottles and straws. Plastic does not break down easily; it can take hundreds of years to disappear. Meanwhile, sea animals often mistake it for food. Some countries have already banned plastic bags, and many supermarkets now charge customers for them. Experts believe that individuals can also make a difference by carrying reusable bottles and saying no to unnecessary packaging.",
        translation: { vi: 'Mỗi năm, khoảng tám triệu tấn nhựa trôi ra đại dương. Phần lớn đến từ đồ dùng một lần như túi, chai và ống hút. Nhựa không dễ phân hủy; có thể mất hàng trăm năm mới biến mất. Trong khi đó, động vật biển thường nhầm nó là thức ăn. Một số quốc gia đã cấm túi nhựa, và nhiều siêu thị nay thu phí khách hàng. Các chuyên gia tin rằng mỗi cá nhân cũng có thể tạo ra thay đổi bằng cách mang theo chai tái sử dụng và từ chối bao bì không cần thiết.', en: '' },
        questions: [
          ['How much plastic enters the oceans each year?', 'About eight million tonnes', 'About eight thousand tonnes', 'Eighty million tonnes', 'It is not mentioned'],
          ['Why is plastic dangerous for sea animals?', 'They think it is food', 'It makes the water hot', 'It is too heavy', 'It changes their colour'],
          ['What can individuals do, according to experts?', 'Use reusable bottles', 'Stop going to supermarkets', 'Buy more plastic bags', 'Clean the oceans themselves'],
        ],
      },
      {
        title: { vi: 'Làm việc từ xa', en: 'Working from home', ja: '在宅勤務' },
        passage: "Since 2020, millions of people have started working from home. Many employees enjoy the flexibility: they save time and money on commuting and can spend more time with their families. However, remote work also has disadvantages. Some people feel lonely and find it difficult to separate their work life from their personal life. Companies, too, have mixed opinions. While some have reduced office costs, others worry about teamwork and communication. As a result, many businesses now choose a 'hybrid' model, with staff in the office two or three days a week.",
        translation: { vi: 'Từ năm 2020, hàng triệu người bắt đầu làm việc tại nhà. Nhiều nhân viên thích sự linh hoạt: họ tiết kiệm thời gian, tiền đi lại và có nhiều thời gian bên gia đình hơn. Tuy nhiên, làm việc từ xa cũng có nhược điểm. Một số người cảm thấy cô đơn và khó tách bạch công việc với đời sống riêng. Các công ty cũng có ý kiến trái chiều. Trong khi một số đã giảm chi phí văn phòng, số khác lo ngại về làm việc nhóm và giao tiếp. Vì vậy, nhiều doanh nghiệp chọn mô hình "kết hợp", nhân viên lên văn phòng hai hoặc ba ngày một tuần.', en: '' },
        questions: [
          ['Which is an advantage of working from home?', 'Saving time on commuting', 'Meeting colleagues every day', 'Higher salaries', 'Bigger offices'],
          ['What problem do some remote workers have?', 'They feel lonely', 'They travel too much', 'They earn less money', 'They sleep too much'],
          ['What is a "hybrid" model?', 'Working partly at home and partly in the office', 'Working only at night', 'Having two jobs', 'Working in two countries'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Phỏng vấn xin việc', en: 'A job interview', ja: '就職面接' },
        lines: [
          ['Interviewer', 'So, why do you want to work for our company?', 'Vậy tại sao bạn muốn làm việc cho công ty chúng tôi?'],
          ['Linh', "I've followed your projects for years, and I really admire your focus on sustainable design.", 'Tôi đã theo dõi các dự án của quý công ty nhiều năm và rất ngưỡng mộ việc tập trung vào thiết kế bền vững.'],
          ['Interviewer', 'What experience do you have?', 'Bạn có kinh nghiệm gì?'],
          ['Linh', 'I worked as a junior designer for two years, and I led a small team on a park project.', 'Tôi làm nhà thiết kế cấp dưới hai năm và đã dẫn dắt một nhóm nhỏ trong dự án công viên.'],
          ['Interviewer', 'Great. When could you start?', 'Tuyệt. Khi nào bạn có thể bắt đầu?'],
          ['Linh', 'I need to give one month\'s notice, so from the first of next month.', 'Tôi cần báo trước một tháng, vậy nên từ ngày đầu tháng sau.'],
        ],
        questions: [
          ["What does Linh admire about the company?", 'Its focus on sustainable design', 'Its high salaries', 'Its location', 'Its big offices'],
          ['How long did Linh work as a junior designer?', 'Two years', 'One month', 'Five years', 'Six months'],
        ],
      },
      {
        title: { vi: 'Lên kế hoạch cuối tuần', en: 'Weekend plans', ja: '週末の予定' },
        lines: [
          ['Tom', 'Are you doing anything this weekend?', 'Cuối tuần này bạn có làm gì không?'],
          ['Mai', "I was going to go hiking, but the forecast says it's going to rain.", 'Mình định đi leo núi nhưng dự báo nói trời sẽ mưa.'],
          ['Tom', 'How about the new science museum instead? I\'ve heard it\'s amazing.', 'Thế đi bảo tàng khoa học mới thì sao? Mình nghe nói nó tuyệt lắm.'],
          ['Mai', 'Good idea! Shall we meet at ten outside the main entrance?', 'Ý hay đấy! Mình gặp nhau lúc mười giờ ở cổng chính nhé?'],
          ['Tom', "Perfect. I'll book the tickets online.", 'Tuyệt. Mình sẽ đặt vé trực tuyến.'],
        ],
        questions: [
          ['Why did Mai change her plan?', 'Because it will rain', 'Because she is ill', 'Because the museum is closed', 'Because Tom is busy'],
          ['Who will book the tickets?', 'Tom', 'Mai', 'Both of them', 'Nobody'],
        ],
      },
    ],
  },
  B2: {
    readings: [
      {
        title: { vi: 'Khoa học về giấc ngủ', en: 'The science of sleep', ja: '睡眠の科学' },
        passage: "For a long time, sleep was considered a passive state in which the body simply rested. Modern research, however, has revealed that the brain is remarkably active during the night. While we sleep, it consolidates memories, removes waste products and regulates hormones that control appetite and mood. Chronic sleep deprivation has been linked to a range of serious conditions, including heart disease, obesity and depression. Despite this evidence, surveys suggest that a third of adults regularly get less than the recommended seven hours. Scientists attribute this partly to the use of screens late at night, as blue light interferes with the production of melatonin, the hormone that makes us feel sleepy.",
        translation: { vi: 'Trong thời gian dài, giấc ngủ được coi là trạng thái thụ động khi cơ thể chỉ nghỉ ngơi. Tuy nhiên, nghiên cứu hiện đại đã cho thấy não hoạt động rất tích cực vào ban đêm. Khi ta ngủ, não củng cố ký ức, loại bỏ chất thải và điều hòa hormone kiểm soát cảm giác thèm ăn và tâm trạng. Thiếu ngủ kéo dài có liên quan đến nhiều bệnh nghiêm trọng như bệnh tim, béo phì và trầm cảm. Dù có bằng chứng này, khảo sát cho thấy một phần ba người trưởng thành thường xuyên ngủ ít hơn bảy tiếng khuyến nghị. Các nhà khoa học cho rằng một phần nguyên nhân là việc dùng màn hình vào đêm khuya, vì ánh sáng xanh cản trở sản sinh melatonin — hormone khiến ta buồn ngủ.', en: '' },
        questions: [
          ['What was the old view of sleep?', 'It was a passive state', 'It was dangerous', 'It was unnecessary', 'It was very active'],
          ['Which is NOT mentioned as a function of the sleeping brain?', 'Building muscles', 'Consolidating memories', 'Removing waste', 'Regulating hormones'],
          ['Why does screen use affect sleep?', 'Blue light reduces melatonin', 'Screens make noise', 'People forget the time', 'Screens raise body temperature'],
        ],
      },
      {
        title: { vi: 'Kinh tế chia sẻ', en: 'The sharing economy', ja: 'シェアリングエコノミー' },
        passage: "Platforms such as Airbnb and Grab have transformed the way people travel and earn money. By connecting individuals directly, these services allow homeowners to rent out spare rooms and drivers to use their own vehicles to make a living. Supporters argue that the sharing economy makes better use of existing resources and offers consumers cheaper, more convenient options. Critics, on the other hand, point out that it can drive up housing costs in popular cities and that workers often lack basic protections such as sick pay and insurance. Governments around the world are now struggling to design regulations that protect workers without stifling innovation.",
        translation: { vi: 'Các nền tảng như Airbnb và Grab đã thay đổi cách mọi người đi lại và kiếm tiền. Bằng cách kết nối trực tiếp các cá nhân, những dịch vụ này cho phép chủ nhà cho thuê phòng trống và tài xế dùng xe riêng để kiếm sống. Những người ủng hộ cho rằng kinh tế chia sẻ tận dụng tốt hơn tài nguyên sẵn có và mang lại lựa chọn rẻ, tiện lợi hơn cho người tiêu dùng. Ngược lại, những người phản đối chỉ ra rằng nó có thể đẩy giá nhà ở các thành phố du lịch lên cao và người lao động thường thiếu các bảo vệ cơ bản như lương nghỉ ốm hay bảo hiểm. Các chính phủ trên thế giới hiện đang loay hoay xây dựng quy định bảo vệ người lao động mà không kìm hãm đổi mới.', en: '' },
        questions: [
          ['According to supporters, the sharing economy...', 'makes better use of resources', 'increases housing costs', 'protects workers', 'is only for rich people'],
          ['What is one criticism mentioned?', 'Workers lack sick pay and insurance', 'Services are too expensive', 'It is illegal everywhere', 'It reduces innovation'],
          ['What is the main challenge for governments?', 'Regulating without stopping innovation', 'Building more hotels', 'Banning all platforms', 'Training new drivers'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Thảo luận về dự án', en: 'A project discussion', ja: 'プロジェクトの話し合い' },
        lines: [
          ['Manager', "We're two weeks behind schedule. What's causing the delay?", 'Chúng ta đang chậm tiến độ hai tuần. Điều gì gây ra sự chậm trễ?'],
          ['Anna', 'Mainly the supplier. They sent the wrong components, so we had to reorder.', 'Chủ yếu do nhà cung cấp. Họ gửi sai linh kiện nên chúng ta phải đặt lại.'],
          ['Manager', 'Could we have avoided that?', 'Lẽ ra chúng ta có thể tránh được không?'],
          ['Anna', 'Possibly, if we had checked the order confirmation more carefully.', 'Có thể, nếu chúng ta kiểm tra xác nhận đơn hàng kỹ hơn.'],
          ['Manager', "Right. Let's introduce a double-check system from now on.", 'Đúng vậy. Từ giờ hãy áp dụng hệ thống kiểm tra hai lần.'],
        ],
        questions: [
          ['What caused the delay?', 'The supplier sent the wrong parts', 'Staff were ill', 'The budget was cut', 'The client changed the design'],
          ['What will the team do from now on?', 'Use a double-check system', 'Change supplier', 'Work at weekends', 'Hire more staff'],
        ],
      },
      {
        title: { vi: 'Bàn về mạng xã hội', en: 'Debating social media', ja: 'SNSについての議論' },
        lines: [
          ['Host', 'Should teenagers be allowed to use social media freely?', 'Thanh thiếu niên có nên được tự do sử dụng mạng xã hội không?'],
          ['Dr. Lee', 'I believe some limits are necessary. Studies link heavy use to anxiety and poor sleep.', 'Tôi tin rằng cần có giới hạn. Các nghiên cứu cho thấy sử dụng nhiều liên quan đến lo âu và ngủ kém.'],
          ['Sam', "But it's also how young people stay connected and learn about the world.", 'Nhưng đó cũng là cách giới trẻ kết nối và tìm hiểu thế giới.'],
          ['Dr. Lee', "I'm not saying we should ban it — just teach responsible use.", 'Tôi không nói là nên cấm — chỉ là dạy cách sử dụng có trách nhiệm.'],
        ],
        questions: [
          ["What is Dr. Lee's opinion?", 'Some limits are needed', 'Social media should be banned', 'There is no problem', 'Teenagers should use it more'],
          ['What does Sam emphasise?', 'Social media helps young people connect', 'Social media causes anxiety', 'Parents should decide', 'Schools should ban phones'],
        ],
      },
    ],
  },
  C1: {
    readings: [
      {
        title: { vi: 'Nghịch lý của sự lựa chọn', en: 'The paradox of choice', ja: '選択のパラドックス' },
        passage: "Conventional wisdom holds that the more options we have, the better off we are. Yet psychologist Barry Schwartz argues the opposite: an abundance of choice can be paralysing. When confronted with dozens of nearly identical products, consumers often struggle to decide and, having finally made a choice, are more likely to regret it, haunted by the alternatives they rejected. In one well-known experiment, shoppers offered six varieties of jam were ten times more likely to make a purchase than those offered twenty-four. Schwartz does not advocate eliminating choice altogether; rather, he suggests that we would benefit from deliberately limiting our options and settling for what is 'good enough'.",
        translation: { vi: 'Quan niệm thông thường cho rằng càng nhiều lựa chọn thì càng tốt. Tuy nhiên, nhà tâm lý học Barry Schwartz lập luận điều ngược lại: quá nhiều lựa chọn có thể khiến ta tê liệt. Khi đối mặt với hàng chục sản phẩm gần giống nhau, người tiêu dùng thường khó quyết định và khi cuối cùng đã chọn, họ dễ hối tiếc hơn vì bị ám ảnh bởi những phương án đã bỏ qua. Trong một thí nghiệm nổi tiếng, người mua được mời sáu loại mứt có khả năng mua hàng cao gấp mười lần so với những người được mời hai mươi tư loại. Schwartz không chủ trương loại bỏ hoàn toàn sự lựa chọn; thay vào đó, ông gợi ý rằng chúng ta sẽ có lợi khi chủ động giới hạn lựa chọn và chấp nhận điều "đủ tốt".', en: '' },
        questions: [
          ["What is Schwartz's main argument?", 'Too much choice can be harmful', 'People need more options', 'Jam is unhealthy', 'Shopping makes people happy'],
          ['In the jam experiment, which group bought more?', 'Those offered six varieties', 'Those offered twenty-four varieties', 'Both groups equally', 'Neither group'],
          ['What does Schwartz recommend?', "Accepting what is 'good enough'", 'Eliminating all choice', 'Always choosing the most expensive', 'Asking experts for every decision'],
        ],
      },
      {
        title: { vi: 'Nguy cơ mất ngôn ngữ', en: 'Language extinction', ja: '言語の消滅' },
        passage: "Of the roughly 7,000 languages spoken today, linguists estimate that nearly half could disappear by the end of this century. Languages typically die not through sudden catastrophe but through a gradual shift, as younger generations adopt a dominant language for economic and social advantages. When a language vanishes, so too does a unique repository of knowledge — about local ecosystems, medicinal plants and ways of perceiving the world. Revitalisation efforts, ranging from immersion schools to smartphone apps, have achieved notable successes, Welsh and Hawaiian being frequently cited examples. Nevertheless, such initiatives require sustained funding and, crucially, the commitment of the communities themselves.",
        translation: { vi: 'Trong số khoảng 7.000 ngôn ngữ đang được sử dụng ngày nay, các nhà ngôn ngữ học ước tính gần một nửa có thể biến mất vào cuối thế kỷ này. Ngôn ngữ thường không chết vì thảm họa đột ngột mà qua sự chuyển đổi dần dần, khi thế hệ trẻ dùng ngôn ngữ chiếm ưu thế vì lợi ích kinh tế và xã hội. Khi một ngôn ngữ biến mất, một kho tri thức độc đáo cũng mất theo — về hệ sinh thái địa phương, cây thuốc và cách nhìn nhận thế giới. Các nỗ lực phục hồi, từ trường học đắm chìm đến ứng dụng điện thoại, đã đạt thành công đáng kể, tiếng Wales và tiếng Hawaii thường được nêu làm ví dụ. Dù vậy, các sáng kiến này cần nguồn tài trợ bền vững và quan trọng nhất là sự cam kết của chính cộng đồng.', en: '' },
        questions: [
          ['How do languages usually die?', 'Through a gradual shift to a dominant language', 'Through natural disasters', 'Because of government bans', 'Because they are too difficult'],
          ['What is lost when a language disappears?', 'Unique knowledge about the world', 'Only some words', 'Nothing important', 'Economic advantages'],
          ['What is crucial for revitalisation?', 'Community commitment', 'A new alphabet', 'International laws', 'Tourism'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Hội thảo về AI', en: 'A seminar on AI', ja: 'AIに関するセミナー' },
        lines: [
          ['Professor', 'Would anyone care to challenge the claim that AI will create more jobs than it destroys?', 'Có ai muốn phản biện nhận định rằng AI sẽ tạo ra nhiều việc làm hơn số việc nó xóa bỏ không?'],
          ['Student A', "I'd argue it's premature to say. Historically, technology has created new roles, but the pace of change now is unprecedented.", 'Em cho rằng còn quá sớm để kết luận. Trong lịch sử, công nghệ đã tạo ra vai trò mới, nhưng tốc độ thay đổi hiện nay là chưa từng có.'],
          ['Professor', "That's a fair point. So, what would you propose?", 'Đó là một ý hợp lý. Vậy em đề xuất gì?'],
          ['Student A', 'Substantial investment in retraining, funded partly by the companies benefiting most from automation.', 'Đầu tư đáng kể vào đào tạo lại, được tài trợ một phần bởi các công ty hưởng lợi nhiều nhất từ tự động hóa.'],
        ],
        questions: [
          ["What is the student's view about AI and jobs?", "It's too early to be sure", 'AI will definitely destroy jobs', 'AI creates more jobs', 'Technology never creates jobs'],
          ['Who should partly fund retraining, according to the student?', 'Companies benefiting from automation', 'Students themselves', 'Universities', 'Foreign governments'],
        ],
      },
    ],
  },
  BIZ: {
    readings: [
      {
        title: { vi: 'Thông báo nội bộ', en: 'Internal memo', ja: '社内通知' },
        passage: "To: All staff\nFrom: Facilities Department\nSubject: Office renovation\n\nPlease be advised that renovation work on the third floor will begin on Monday, 4 March, and is expected to last two weeks. During this period, employees in the Marketing and Sales departments will temporarily relocate to the conference rooms on the fifth floor. The cafeteria will remain open, but the east elevator will be out of service. We apologise for any inconvenience and appreciate your cooperation. Questions should be directed to Ms. Harper at extension 214.",
        translation: { vi: 'Gửi: Toàn thể nhân viên. Từ: Phòng Cơ sở vật chất. Chủ đề: Cải tạo văn phòng. Xin thông báo rằng công việc cải tạo tầng ba sẽ bắt đầu vào thứ Hai, ngày 4 tháng 3, dự kiến kéo dài hai tuần. Trong thời gian này, nhân viên phòng Marketing và Kinh doanh sẽ tạm chuyển đến các phòng hội nghị ở tầng năm. Căng tin vẫn mở cửa, nhưng thang máy phía đông sẽ ngừng hoạt động. Chúng tôi xin lỗi vì sự bất tiện và cảm ơn sự hợp tác của các bạn. Mọi thắc mắc xin liên hệ cô Harper theo số máy lẻ 214.', en: '' },
        questions: [
          ['What is the purpose of the memo?', 'To announce office renovation', 'To introduce a new manager', 'To close the cafeteria', 'To announce a holiday'],
          ['Where will the Sales department work temporarily?', 'In conference rooms on the fifth floor', 'At home', 'In the cafeteria', 'On the third floor'],
          ['What will NOT be available?', 'The east elevator', 'The cafeteria', 'The fifth floor', 'Extension 214'],
        ],
      },
      {
        title: { vi: 'Thư khiếu nại', en: 'A letter of complaint', ja: '苦情の手紙' },
        passage: "Dear Customer Service Manager,\n\nI am writing regarding order #58213, which I placed on your website on 2 June. Although the delivery was promised within three working days, the package did not arrive until 14 June. Furthermore, one of the two office chairs I ordered was damaged. I have attached photos as evidence. I would appreciate it if you could arrange a replacement for the damaged chair and refund the express shipping fee of $25, since the service was not provided as advertised.\n\nI look forward to your prompt reply.\nSincerely,\nDaniel Cho",
        translation: { vi: 'Kính gửi Quản lý Dịch vụ Khách hàng, tôi viết thư liên quan đến đơn hàng #58213 đặt trên website ngày 2 tháng 6. Mặc dù được hứa giao trong ba ngày làm việc, kiện hàng mãi đến ngày 14 tháng 6 mới tới. Hơn nữa, một trong hai chiếc ghế văn phòng tôi đặt bị hỏng. Tôi đã đính kèm ảnh làm bằng chứng. Tôi mong quý công ty sắp xếp thay thế chiếc ghế hỏng và hoàn lại phí giao hàng nhanh 25 đô la, vì dịch vụ không được cung cấp như quảng cáo. Mong sớm nhận được hồi âm. Trân trọng, Daniel Cho.', en: '' },
        questions: [
          ['When did the package arrive?', '14 June', '2 June', '5 June', '25 June'],
          ['What does Mr. Cho request?', 'A replacement chair and a refund', 'A new desk', 'A discount on his next order', 'A meeting with the manager'],
          ['What did he attach to the letter?', 'Photos', 'The receipt', 'A contract', 'A new order form'],
        ],
      },
      {
        title: { vi: 'Quảng cáo tuyển dụng', en: 'Job advertisement', ja: '求人広告' },
        passage: "GreenLeaf Logistics is seeking an experienced Warehouse Supervisor to join our growing team in Hai Phong. The successful candidate will oversee daily operations, manage a team of 15 staff, and ensure that all shipments are dispatched on time. Applicants must have at least three years of supervisory experience and a good command of English. Knowledge of inventory management software is a plus. We offer a competitive salary, health insurance and performance-based bonuses. To apply, please send your résumé and a cover letter to hr@greenleaf.example by 30 September.",
        translation: { vi: 'GreenLeaf Logistics đang tìm kiếm Giám sát Kho có kinh nghiệm gia nhập đội ngũ đang phát triển tại Hải Phòng. Ứng viên trúng tuyển sẽ giám sát hoạt động hằng ngày, quản lý đội 15 nhân viên và đảm bảo mọi lô hàng được gửi đúng hạn. Ứng viên phải có ít nhất ba năm kinh nghiệm giám sát và tiếng Anh tốt. Biết phần mềm quản lý tồn kho là một lợi thế. Chúng tôi đưa ra mức lương cạnh tranh, bảo hiểm y tế và thưởng theo hiệu suất. Để ứng tuyển, vui lòng gửi sơ yếu lý lịch và thư xin việc đến hr@greenleaf.example trước ngày 30 tháng 9.', en: '' },
        questions: [
          ['How many staff will the supervisor manage?', '15', '3', '30', '50'],
          ['What is required for the job?', 'Three years of supervisory experience', 'A university degree in logistics', 'Knowledge of Japanese', 'A driving licence'],
          ['What is described as "a plus"?', 'Knowledge of inventory software', 'Living in Hai Phong', 'Health insurance', 'A cover letter'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Sắp xếp cuộc họp', en: 'Arranging a meeting', ja: '会議の調整' },
        lines: [
          ['Woman', "Hi Kevin, I'd like to set up a meeting with the new client. Are you free on Thursday afternoon?", 'Chào Kevin, tôi muốn sắp xếp một cuộc họp với khách hàng mới. Chiều thứ Năm anh rảnh không?'],
          ['Man', "Unfortunately I'm at a trade fair until Thursday. How about Friday morning?", 'Tiếc là tôi đi hội chợ thương mại đến thứ Năm. Sáng thứ Sáu thì sao?'],
          ['Woman', 'Friday at ten works for me. Should I book the large meeting room?', 'Thứ Sáu lúc mười giờ được đấy. Tôi có nên đặt phòng họp lớn không?'],
          ['Man', "Yes, and could you prepare the sales figures for the last quarter?", 'Có, và chị chuẩn bị số liệu doanh số quý trước được không?'],
        ],
        questions: [
          ['Why can\'t the man meet on Thursday?', 'He is at a trade fair', 'He is on holiday', 'He is ill', 'He has another meeting'],
          ['What will the woman prepare?', 'Last quarter\'s sales figures', 'A contract', 'Lunch for the client', 'A new product sample'],
        ],
      },
      {
        title: { vi: 'Gọi điện cho nhà cung cấp', en: 'Calling a supplier', ja: '仕入先への電話' },
        lines: [
          ['Man', "Hello, this is Paul from Bright Office Supplies. I'm calling about your order of printer paper.", 'Xin chào, tôi là Paul từ Bright Office Supplies. Tôi gọi về đơn hàng giấy in của chị.'],
          ['Woman', 'Oh yes, is there a problem?', 'À vâng, có vấn đề gì không?'],
          ['Man', "I'm afraid we're out of stock until next Wednesday. Would you accept a partial shipment today?", 'Tôi e là chúng tôi hết hàng đến thứ Tư tới. Chị có đồng ý nhận một phần hàng hôm nay không?'],
          ['Woman', 'That would be fine. Please send whatever you have, and the rest next week.', 'Được thôi. Hãy gửi số hàng anh có, phần còn lại tuần sau.'],
        ],
        questions: [
          ['What is the problem?', 'The paper is out of stock', 'The price has increased', 'The order was lost', 'The delivery address is wrong'],
          ['What does the woman agree to?', 'A partial shipment', 'Cancel the order', 'Change supplier', 'Pay extra'],
        ],
      },
      {
        title: { vi: 'Thông báo tại sân bay', en: 'Airport announcement', ja: '空港のアナウンス' },
        lines: [
          ['Announcer', 'Attention passengers on flight VN 254 to Singapore.', 'Hành khách trên chuyến bay VN 254 đi Singapore xin chú ý.'],
          ['Announcer', 'Due to bad weather, departure has been delayed by approximately ninety minutes.', 'Do thời tiết xấu, giờ khởi hành bị hoãn khoảng chín mươi phút.'],
          ['Announcer', 'The new boarding gate is 12. Meal vouchers are available at the service desk.', 'Cửa lên máy bay mới là số 12. Phiếu ăn có sẵn tại quầy dịch vụ.'],
        ],
        questions: [
          ['Why is the flight delayed?', 'Bad weather', 'A technical problem', 'A missing crew member', 'Heavy traffic'],
          ['Where can passengers get meal vouchers?', 'At the service desk', 'At gate 12', 'On the plane', 'At the check-in counter'],
        ],
      },
    ],
  },
  ACA: {
    readings: [
      {
        title: { vi: 'Đô thị xanh', en: 'Green cities', ja: '緑の都市' },
        passage: "As more than half of the world's population now lives in urban areas, city planners are increasingly turning to green infrastructure to address environmental challenges. Parks, green roofs and tree-lined streets do more than improve aesthetics; they absorb rainwater, reducing the risk of flooding, and lower urban temperatures by several degrees during heatwaves. Research also indicates that access to green space is associated with lower levels of stress and higher levels of physical activity among residents. Singapore, often described as a 'city in a garden', has made greenery a legal requirement for new developments. Critics, however, warn that such projects can raise property values and displace lower-income residents — a phenomenon known as 'green gentrification'.",
        translation: { vi: 'Khi hơn một nửa dân số thế giới sống ở đô thị, các nhà quy hoạch ngày càng sử dụng hạ tầng xanh để giải quyết thách thức môi trường. Công viên, mái nhà xanh và đường phố rợp bóng cây không chỉ làm đẹp; chúng hấp thụ nước mưa, giảm nguy cơ ngập lụt và hạ nhiệt độ đô thị vài độ trong các đợt nắng nóng. Nghiên cứu cũng chỉ ra rằng tiếp cận không gian xanh gắn liền với mức căng thẳng thấp hơn và vận động nhiều hơn ở cư dân. Singapore, thường được gọi là "thành phố trong vườn", đã quy định cây xanh là yêu cầu bắt buộc với dự án mới. Tuy nhiên, các nhà phê bình cảnh báo những dự án như vậy có thể làm tăng giá bất động sản và đẩy cư dân thu nhập thấp ra đi — hiện tượng gọi là "đô thị hóa xanh".', en: '' },
        questions: [
          ['Which benefit of green infrastructure is mentioned?', 'Reducing the risk of flooding', 'Creating more parking spaces', 'Increasing tourism', 'Lowering taxes'],
          ['What has Singapore done?', 'Made greenery a legal requirement', 'Banned new buildings', 'Removed all parks', 'Reduced its population'],
          ["What is 'green gentrification'?", 'Lower-income residents being pushed out', 'Planting trees in poor areas', 'Painting buildings green', 'Free housing for residents'],
        ],
      },
      {
        title: { vi: 'Học ngôn ngữ và não bộ', en: 'Bilingualism and the brain', ja: 'バイリンガルと脳' },
        passage: "A growing body of research suggests that speaking more than one language may offer cognitive benefits. Bilingual individuals constantly switch between languages, a process which appears to strengthen executive functions such as attention control and problem-solving. Some studies have even found that bilingualism can delay the onset of dementia symptoms by four to five years. However, not all researchers agree. Several large-scale studies have failed to replicate these advantages, leading some scientists to argue that earlier findings may have been influenced by factors such as education and socio-economic status. What remains undisputed is that learning a language at any age enriches cultural understanding and opens up professional opportunities.",
        translation: { vi: 'Ngày càng nhiều nghiên cứu cho thấy nói nhiều hơn một ngôn ngữ có thể mang lại lợi ích nhận thức. Người song ngữ liên tục chuyển đổi giữa các ngôn ngữ, quá trình này dường như củng cố chức năng điều hành như kiểm soát chú ý và giải quyết vấn đề. Một số nghiên cứu còn phát hiện song ngữ có thể trì hoãn triệu chứng sa sút trí tuệ bốn đến năm năm. Tuy nhiên, không phải nhà nghiên cứu nào cũng đồng ý. Một vài nghiên cứu quy mô lớn không tái hiện được những lợi ích này, khiến một số nhà khoa học cho rằng kết quả trước đó có thể bị ảnh hưởng bởi các yếu tố như học vấn và địa vị kinh tế xã hội. Điều không thể tranh cãi là học ngôn ngữ ở bất kỳ độ tuổi nào đều làm phong phú hiểu biết văn hóa và mở ra cơ hội nghề nghiệp.', en: '' },
        questions: [
          ['What may bilingualism strengthen?', 'Executive functions', 'Physical strength', 'Eyesight', 'Musical talent'],
          ['Why do some scientists doubt the benefits?', 'Large studies failed to replicate them', 'Bilinguals are rare', 'The tests were too easy', 'Dementia is not real'],
          ['What does the writer say is undisputed?', 'Language learning enriches cultural understanding', 'Bilinguals never get dementia', 'Children learn faster than adults', 'Education is not important'],
        ],
      },
      {
        title: { vi: 'Năng lượng tái tạo', en: 'The rise of renewables', ja: '再生可能エネルギーの台頭' },
        passage: "Over the past decade, the cost of solar panels has fallen by approximately 90 percent, making solar power the cheapest source of electricity in many parts of the world. Wind energy has followed a similar trajectory. Consequently, renewables accounted for the majority of new power capacity installed globally in recent years. Nevertheless, significant obstacles remain. Because the sun does not always shine and the wind does not always blow, electricity grids require large-scale storage solutions, such as batteries, to ensure a stable supply. Moreover, mining the minerals needed for batteries raises its own environmental and ethical concerns.",
        translation: { vi: 'Trong thập kỷ qua, chi phí tấm pin mặt trời đã giảm khoảng 90%, khiến điện mặt trời trở thành nguồn điện rẻ nhất ở nhiều nơi trên thế giới. Năng lượng gió cũng có quỹ đạo tương tự. Do đó, năng lượng tái tạo chiếm phần lớn công suất điện mới lắp đặt toàn cầu trong những năm gần đây. Tuy nhiên, vẫn còn nhiều trở ngại lớn. Vì mặt trời không phải lúc nào cũng chiếu và gió không phải lúc nào cũng thổi, lưới điện cần giải pháp lưu trữ quy mô lớn như pin để đảm bảo nguồn cung ổn định. Hơn nữa, khai thác khoáng sản làm pin cũng đặt ra những lo ngại về môi trường và đạo đức.', en: '' },
        questions: [
          ['By how much has the cost of solar panels fallen?', 'About 90 percent', 'About 9 percent', 'About 50 percent', 'It has increased'],
          ['Why are storage solutions needed?', 'Sun and wind are not constant', 'Batteries are cheap', 'Grids are too old', 'People use less electricity'],
          ['What concern is raised about batteries?', 'Mining minerals has environmental issues', 'They are too heavy', 'They cannot store electricity', 'They are illegal'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Trao đổi với giáo sư hướng dẫn', en: 'Meeting a tutor', ja: '指導教員との面談' },
        lines: [
          ['Tutor', "I've read your draft. The argument is interesting, but the evidence in section two is rather thin.", 'Tôi đã đọc bản nháp của em. Lập luận thú vị nhưng bằng chứng ở phần hai khá mỏng.'],
          ['Student', 'Should I add more statistics?', 'Em có nên thêm số liệu thống kê không ạ?'],
          ['Tutor', 'Yes, ideally from peer-reviewed journals rather than news websites.', 'Có, tốt nhất là từ các tạp chí có bình duyệt thay vì trang tin tức.'],
          ['Student', 'And the deadline is still the 15th?', 'Hạn chót vẫn là ngày 15 ạ?'],
          ['Tutor', "Yes, but I can give you a one-week extension if you need it.", 'Đúng, nhưng tôi có thể gia hạn một tuần nếu em cần.'],
        ],
        questions: [
          ["What is the problem with the student's draft?", 'The evidence in section two is weak', 'It is too long', 'It has no introduction', 'It is off topic'],
          ['What kind of sources does the tutor recommend?', 'Peer-reviewed journals', 'News websites', 'Social media posts', 'Textbooks only'],
        ],
      },
      {
        title: { vi: 'Bài giảng về đô thị hóa', en: 'A lecture on urbanisation', ja: '都市化の講義' },
        lines: [
          ['Lecturer', "Today we'll look at three consequences of rapid urbanisation in developing countries.", 'Hôm nay chúng ta sẽ xem xét ba hệ quả của đô thị hóa nhanh ở các nước đang phát triển.'],
          ['Lecturer', 'First, the strain on infrastructure: roads, water supply and public transport often cannot keep pace.', 'Thứ nhất, áp lực lên hạ tầng: đường sá, cấp nước và giao thông công cộng thường không theo kịp.'],
          ['Lecturer', 'Second, the growth of informal settlements, where residents lack secure housing.', 'Thứ hai, sự gia tăng các khu định cư tự phát, nơi cư dân thiếu nhà ở ổn định.'],
          ['Lecturer', 'And third — perhaps surprisingly — economic opportunity, as cities generate around 80 percent of global GDP.', 'Và thứ ba — có lẽ đáng ngạc nhiên — là cơ hội kinh tế, vì các thành phố tạo ra khoảng 80% GDP toàn cầu.'],
        ],
        questions: [
          ['How many consequences does the lecturer discuss?', 'Three', 'Two', 'Four', 'Eight'],
          ['What share of global GDP do cities generate?', 'About 80 percent', 'About 18 percent', 'About 50 percent', 'About 8 percent'],
        ],
      },
      {
        title: { vi: 'Thảo luận nhóm', en: 'A group discussion', ja: 'グループディスカッション' },
        lines: [
          ['Emma', 'For our presentation, I suggest we focus on how social media affects political opinions.', 'Cho bài thuyết trình, mình đề xuất tập trung vào việc mạng xã hội ảnh hưởng đến quan điểm chính trị thế nào.'],
          ['Raj', "That's quite broad. Could we narrow it down to young voters?", 'Chủ đề đó khá rộng. Chúng ta có thể thu hẹp lại ở cử tri trẻ không?'],
          ['Emma', 'Good idea. I can analyse the survey data if you handle the literature review.', 'Ý hay đấy. Mình có thể phân tích dữ liệu khảo sát nếu bạn lo phần tổng quan tài liệu.'],
          ['Raj', "Deal. Let's meet again on Thursday to compare notes.", 'Chốt vậy. Thứ Năm gặp lại để đối chiếu ghi chép nhé.'],
        ],
        questions: [
          ['How does Raj want to change the topic?', 'Focus on young voters', 'Choose a new topic', 'Add more countries', 'Remove social media'],
          ['What will Emma do?', 'Analyse the survey data', 'Write the literature review', 'Book a room', 'Contact the teacher'],
        ],
      },
    ],
  },
};

export const JA_TEXTS = {
  N5: {
    readings: [
      {
        title: { vi: 'Gia đình tôi', en: 'My family', ja: 'わたしのかぞく' },
        passage: 'わたしはリンです。ベトナムからきました。いま、とうきょうにすんでいます。かぞくは　ちち、はは、あに、わたしの　よにんです。ちちは　かいしゃいんです。ははは　せんせいです。あには　だいがくせいです。わたしは　にほんごがっこうで　べんきょうしています。まいにち　たのしいです。',
        translation: { vi: 'Tôi là Linh. Tôi đến từ Việt Nam. Hiện giờ tôi sống ở Tokyo. Gia đình tôi có bốn người: bố, mẹ, anh trai và tôi. Bố tôi là nhân viên công ty. Mẹ tôi là giáo viên. Anh tôi là sinh viên đại học. Tôi đang học ở trường tiếng Nhật. Mỗi ngày đều vui.', en: "I'm Linh. I came from Vietnam. Now I live in Tokyo. My family has four people: my father, mother, older brother and me. My father is an office worker. My mother is a teacher. My brother is a university student. I study at a Japanese language school. Every day is fun." },
        questions: [
          ['リンさんは　どこから　きましたか。', 'ベトナム', 'にほん', 'ちゅうごく', 'アメリカ'],
          ['リンさんの　おかあさんの　しごとは　なんですか。', 'せんせい', 'かいしゃいん', 'いしゃ', 'がくせい'],
          ['かぞくは　なんにんですか。', 'よにん', 'さんにん', 'ごにん', 'ふたり'],
        ],
      },
      {
        title: { vi: 'Ngày nghỉ', en: 'My day off', ja: 'やすみの日' },
        passage: 'きのうは　にちようびでした。あさ　くじに　おきました。ごぜんちゅう、へやを　そうじしました。ひるごはんは　ともだちと　レストランで　ラーメンを　たべました。とても　おいしかったです。ごごは　こうえんを　さんぽしました。よる、うちで　えいがを　みました。',
        translation: { vi: 'Hôm qua là Chủ nhật. Tôi dậy lúc 9 giờ sáng. Buổi sáng, tôi dọn phòng. Bữa trưa, tôi ăn ramen ở nhà hàng với bạn. Rất ngon. Buổi chiều, tôi đi dạo ở công viên. Buổi tối, tôi xem phim ở nhà.', en: 'Yesterday was Sunday. I got up at nine. In the morning I cleaned my room. For lunch I ate ramen at a restaurant with a friend. It was very tasty. In the afternoon I took a walk in the park. In the evening I watched a movie at home.' },
        questions: [
          ['なんじに　おきましたか。', 'くじ', 'しちじ', 'じゅうじ', 'はちじ'],
          ['ひるごはんに　なにを　たべましたか。', 'ラーメン', 'すし', 'パン', 'カレー'],
          ['よる、なにを　しましたか。', 'えいがを　みました', 'さんぽしました', 'そうじしました', 'べんきょうしました'],
        ],
      },
      {
        title: { vi: 'Phòng của tôi', en: 'My room', ja: 'わたしのへや' },
        passage: 'わたしの　へやは　あまり　ひろくないですが、あかるくて　きれいです。まどの　ちかくに　つくえが　あります。つくえの　うえに　パソコンと　ほんが　あります。ベッドの　したに　ねこが　います。ねこの　なまえは　タマです。',
        translation: { vi: 'Phòng tôi không rộng lắm nhưng sáng sủa và sạch đẹp. Gần cửa sổ có cái bàn. Trên bàn có máy tính và sách. Dưới giường có con mèo. Tên con mèo là Tama.', en: "My room isn't very big, but it's bright and clean. There is a desk near the window. On the desk there are a computer and books. There is a cat under the bed. The cat's name is Tama." },
        questions: [
          ['つくえは　どこに　ありますか。', 'まどの　ちかく', 'ベッドの　した', 'ドアの　まえ', 'へやの　そと'],
          ['ベッドの　したに　なにが　いますか。', 'ねこ', 'いぬ', 'こども', 'とり'],
          ['へやは　どうですか。', 'あかるくて　きれいです', 'ひろくて　くらいです', 'ふるくて　きたないです', 'とても　ひろいです'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Ở cửa hàng', en: 'At a shop', ja: 'みせで' },
        lines: [
          ['店員', 'いらっしゃいませ。', 'Xin mời quý khách.', 'Welcome.'],
          ['客', 'すみません、この　Tシャツは　いくらですか。', 'Xin lỗi, cái áo phông này bao nhiêu tiền?', 'Excuse me, how much is this T-shirt?'],
          ['店員', 'せんごひゃくえんです。', '1.500 yên ạ.', "It's 1,500 yen."],
          ['客', 'じゃ、これを　ください。', 'Vậy cho tôi cái này.', "Then I'll take this one."],
        ],
        questions: [
          ['Tシャツは　いくらですか。', 'せんごひゃくえん', 'ごひゃくえん', 'せんえん', 'にせんえん'],
          ['きゃくは　Tシャツを　かいますか。', 'はい、かいます', 'いいえ、かいません', 'わかりません', 'あした　かいます'],
        ],
      },
      {
        title: { vi: 'Hẹn gặp', en: 'Making plans', ja: 'やくそく' },
        lines: [
          ['A', 'あした、いっしょに　えいがを　みませんか。', 'Mai đi xem phim cùng nhau không?', 'Would you like to see a movie together tomorrow?'],
          ['B', 'いいですね。なんじに　あいましょうか。', 'Hay đấy. Mấy giờ gặp nhau nhỉ?', 'Sounds good. What time shall we meet?'],
          ['A', 'ごご　にじに　えきの　まえで　あいましょう。', 'Gặp nhau lúc 2 giờ chiều trước nhà ga nhé.', "Let's meet at 2 p.m. in front of the station."],
          ['B', 'わかりました。じゃ、また　あした。', 'Được rồi. Vậy hẹn mai nhé.', 'Okay. See you tomorrow.'],
        ],
        questions: [
          ['ふたりは　あした　なにを　しますか。', 'えいがを　みます', 'かいものを　します', 'ごはんを　たべます', 'べんきょうします'],
          ['どこで　あいますか。', 'えきの　まえ', 'がっこう', 'こうえん', 'レストラン'],
        ],
      },
      {
        title: { vi: 'Tự giới thiệu', en: 'Self-introduction', ja: 'じこしょうかい' },
        lines: [
          ['田中', 'はじめまして。たなかです。どうぞ　よろしく。', 'Rất vui được gặp. Tôi là Tanaka. Rất mong được giúp đỡ.', "Nice to meet you. I'm Tanaka."],
          ['ナム', 'はじめまして。ナムです。ベトナムから　きました。', 'Rất vui được gặp. Tôi là Nam. Tôi đến từ Việt Nam.', "Nice to meet you. I'm Nam, from Vietnam."],
          ['田中', 'ナムさんは　がくせいですか。', 'Anh Nam là sinh viên à?', 'Are you a student, Nam?'],
          ['ナム', 'いいえ、エンジニアです。', 'Không, tôi là kỹ sư.', "No, I'm an engineer."],
        ],
        questions: [
          ['ナムさんは　どこから　きましたか。', 'ベトナム', 'にほん', 'タイ', 'かんこく'],
          ['ナムさんの　しごとは　なんですか。', 'エンジニア', 'がくせい', 'せんせい', 'いしゃ'],
        ],
      },
    ],
  },
  N4: {
    readings: [
      {
        title: { vi: 'Lần đầu leo núi Phú Sĩ', en: 'Climbing Mt. Fuji', ja: '富士山に登った' },
        passage: '先月、友達と富士山に登りました。夜の十時に登り始めて、朝の四時ごろ頂上に着きました。とても寒くて、疲れましたが、頂上から見た日の出は本当にきれいでした。下りるときは足が痛くなりましたが、いい経験になりました。また来年も登りたいと思います。',
        passageReading: 'せんげつ、ともだちとふじさんにのぼりました。よるのじゅうじにのぼりはじめて、あさのよじごろちょうじょうにつきました。とてもさむくて、つかれましたが、ちょうじょうからみたひのではほんとうにきれいでした。おりるときはあしがいたくなりましたが、いいけいけんになりました。またらいねんものぼりたいとおもいます。',
        translation: { vi: 'Tháng trước, tôi đã leo núi Phú Sĩ cùng bạn. Chúng tôi bắt đầu leo lúc 10 giờ tối và lên đến đỉnh khoảng 4 giờ sáng. Trời rất lạnh và mệt, nhưng bình minh nhìn từ đỉnh núi thật sự rất đẹp. Lúc xuống núi chân tôi bị đau nhưng đó là một trải nghiệm tốt. Tôi muốn năm sau lại leo nữa.', en: 'Last month I climbed Mt. Fuji with a friend. We started at 10 p.m. and reached the top around 4 a.m. It was very cold and tiring, but the sunrise from the summit was truly beautiful. My legs hurt on the way down, but it was a good experience. I want to climb again next year.' },
        questions: [
          ['何時ごろ頂上に着きましたか。', '朝の四時ごろ', '夜の十時ごろ', '朝の八時ごろ', '昼の十二時ごろ'],
          ['頂上で何がきれいでしたか。', '日の出', '星', '花', '雪'],
          ['この人は来年どうしたいですか。', 'また登りたい', 'もう登りたくない', '海へ行きたい', '友達に会いたい'],
        ],
      },
      {
        title: { vi: 'Thông báo của chung cư', en: 'Apartment notice', ja: 'マンションのお知らせ' },
        passage: '住民の皆様へ。来週の水曜日、午前九時から午後三時まで、水道の工事をします。この時間は水が使えませんので、前の日に水を準備しておいてください。また、ゴミは月曜日と木曜日の朝八時までに出してください。ご協力をお願いします。管理人',
        passageReading: 'じゅうみんのみなさまへ。らいしゅうのすいようび、ごぜんくじからごごさんじまで、すいどうのこうじをします。このじかんはみずがつかえませんので、まえのひにみずをじゅんびしておいてください。また、ゴミはげつようびともくようびのあさはちじまでにだしてください。ごきょうりょくをおねがいします。かんりにん',
        translation: { vi: 'Gửi các cư dân. Thứ Tư tuần sau, từ 9 giờ sáng đến 3 giờ chiều sẽ sửa đường ống nước. Trong thời gian này không dùng được nước, vì vậy hãy chuẩn bị nước từ hôm trước. Ngoài ra, hãy đổ rác trước 8 giờ sáng thứ Hai và thứ Năm. Rất mong sự hợp tác. Người quản lý.', en: 'To all residents. Next Wednesday, from 9 a.m. to 3 p.m., there will be plumbing work. Water cannot be used during this time, so please prepare water the day before. Also, please put out garbage by 8 a.m. on Mondays and Thursdays. Thank you for your cooperation. The manager.' },
        questions: [
          ['工事は何曜日ですか。', '水曜日', '月曜日', '木曜日', '金曜日'],
          ['住民は前の日に何をしなければなりませんか。', '水を準備する', 'ゴミを出す', '管理人に電話する', '部屋を掃除する'],
          ['ゴミはいつ出しますか。', '月曜日と木曜日の朝', '水曜日の午後', '毎日の夜', '土曜日の朝'],
        ],
      },
      {
        title: { vi: 'Sở thích của tôi', en: 'My hobby', ja: '私の趣味' },
        passage: '私の趣味は料理です。日本に来てから、自分で料理を作るようになりました。最初は簡単な料理しか作れませんでしたが、今は天ぷらやすき焼きも作れます。週末は友達を家に呼んで、一緒に食べたり話したりします。来年は料理教室に通うつもりです。',
        passageReading: 'わたしのしゅみはりょうりです。にほんにきてから、じぶんでりょうりをつくるようになりました。さいしょはかんたんなりょうりしかつくれませんでしたが、いまはてんぷらやすきやきもつくれます。しゅうまつはともだちをいえによんで、いっしょにたべたりはなしたりします。らいねんはりょうりきょうしつにかようつもりです。',
        translation: { vi: 'Sở thích của tôi là nấu ăn. Từ khi đến Nhật, tôi bắt đầu tự nấu. Lúc đầu tôi chỉ nấu được món đơn giản, nhưng giờ tôi có thể làm cả tempura và sukiyaki. Cuối tuần tôi mời bạn đến nhà, cùng ăn và trò chuyện. Năm sau tôi định đi học lớp nấu ăn.', en: 'My hobby is cooking. Since coming to Japan, I started cooking for myself. At first I could only make simple dishes, but now I can make tempura and sukiyaki. On weekends I invite friends over to eat and chat. Next year I plan to attend a cooking class.' },
        questions: [
          ['この人はいつから料理を作るようになりましたか。', '日本に来てから', '子供のときから', '大学に入ってから', '去年から'],
          ['週末は何をしますか。', '友達と食べたり話したりする', '料理教室に通う', 'レストランで働く', '旅行する'],
          ['来年どうするつもりですか。', '料理教室に通う', '国へ帰る', 'レストランを開く', '料理をやめる'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Ở bệnh viện', en: 'At the hospital', ja: '病院で' },
        lines: [
          ['医者', 'どうしましたか。', 'Bạn bị làm sao?', "What's the matter?"],
          ['患者', '昨日から熱があって、のどが痛いんです。', 'Từ hôm qua tôi bị sốt và đau họng.', "I've had a fever and a sore throat since yesterday."],
          ['医者', '風邪ですね。この薬を一日三回、食後に飲んでください。', 'Là cảm rồi. Hãy uống thuốc này ba lần một ngày sau bữa ăn.', "It's a cold. Take this medicine three times a day after meals."],
          ['患者', 'お風呂に入ってもいいですか。', 'Tôi tắm được không ạ?', 'May I take a bath?'],
          ['医者', '熱が下がるまで、入らないでください。', 'Cho đến khi hạ sốt thì đừng tắm nhé.', 'Please don\'t until your fever goes down.'],
        ],
        questions: [
          ['患者はいつから熱がありますか。', '昨日から', '今朝から', '先週から', '三日前から'],
          ['薬は一日何回飲みますか。', '三回', '一回', '二回', '四回'],
        ],
      },
      {
        title: { vi: 'Hỏi về chuyến du lịch', en: 'Talking about a trip', ja: '旅行の話' },
        lines: [
          ['A', '夏休みはどこかへ行きましたか。', 'Kỳ nghỉ hè bạn có đi đâu không?', 'Did you go anywhere during summer vacation?'],
          ['B', 'ええ、北海道へ行きました。涼しくて、食べ物も美味しかったです。', 'Có, tôi đi Hokkaido. Mát mẻ và đồ ăn cũng ngon.', 'Yes, I went to Hokkaido. It was cool and the food was delicious.'],
          ['A', 'いいですね。私はまだ行ったことがありません。', 'Thích nhỉ. Tôi chưa từng đi.', "Nice. I've never been there."],
          ['B', '冬は雪祭りがありますから、ぜひ行ってみてください。', 'Mùa đông có lễ hội tuyết, nhất định hãy thử đi nhé.', "There's a snow festival in winter, so you should definitely go."],
        ],
        questions: [
          ['Bさんは夏休みにどこへ行きましたか。', '北海道', '沖縄', '京都', '大阪'],
          ['Aさんは北海道へ行ったことがありますか。', 'いいえ、ありません', 'はい、あります', '冬に行きました', '来週行きます'],
        ],
      },
    ],
  },
  N3: {
    readings: [
      {
        title: { vi: 'Văn hóa xếp hàng', en: 'Queuing culture', ja: '行列の文化' },
        passage: '日本では、駅のホームやレストランの前で、人々がきちんと並んで待つ姿をよく見かける。外国人観光客の中には、これに驚く人も多い。並ぶことが当たり前になっている理由の一つは、「他人に迷惑をかけない」という考え方が社会に広く根付いているからだと言われている。一方で、人気の店に何時間も並ぶことを楽しむ人もいて、行列そのものが一種のイベントになっている場合もある。',
        passageReading: 'にほんでは、えきのホームやレストランのまえで、ひとびとがきちんとならんでまつすがたをよくみかける。がいこくじんかんこうきゃくのなかには、これにおどろくひともおおい。ならぶことがあたりまえになっているりゆうのひとつは、「たにんにめいわくをかけない」というかんがえかたがしゃかいにひろくねづいているからだといわれている。いっぽうで、にんきのみせになんじかんもならぶことをたのしむひともいて、ぎょうれつそのものがいっしゅのイベントになっているばあいもある。',
        translation: { vi: 'Ở Nhật, ta thường thấy cảnh mọi người xếp hàng ngay ngắn chờ đợi trên sân ga hay trước nhà hàng. Nhiều du khách nước ngoài ngạc nhiên vì điều này. Một lý do khiến việc xếp hàng trở nên đương nhiên được cho là vì quan niệm "không làm phiền người khác" đã ăn sâu trong xã hội. Mặt khác, cũng có người thích xếp hàng hàng giờ ở cửa hàng nổi tiếng, và có khi bản thân việc xếp hàng trở thành một kiểu sự kiện.', en: 'In Japan you often see people waiting in neat lines on station platforms and outside restaurants. Many foreign tourists are surprised by this. One reason queuing is taken for granted is said to be the deeply rooted idea of "not causing trouble for others". On the other hand, some people enjoy queuing for hours at popular shops, and the queue itself can become a kind of event.' },
        questions: [
          ['外国人観光客は何に驚きますか。', '人々がきちんと並ぶこと', '電車が遅れること', '店が少ないこと', '料理が高いこと'],
          ['並ぶ理由の一つは何だと言われていますか。', '他人に迷惑をかけないという考え方', '法律で決まっているから', '店員が命令するから', '時間がたくさんあるから'],
          ['この文章によると、正しいものはどれですか。', '並ぶことを楽しむ人もいる', '日本人は並ぶのが嫌いだ', '行列は禁止されている', '観光客は並ばない'],
        ],
      },
      {
        title: { vi: 'Làm việc ở cửa hàng tiện lợi', en: 'Working at a konbini', ja: 'コンビニのアルバイト' },
        passage: '大学に入ってから、近所のコンビニでアルバイトを始めた。最初は覚えることが多くて大変だった。レジの使い方だけでなく、荷物の受け取りや公共料金の支払いなど、コンビニの仕事は想像以上に幅広い。しかし、半年ほど働くうちに慣れてきて、今では常連のお客さんと話すのが楽しみになっている。この経験を通して、敬語も自然に使えるようになった。',
        passageReading: 'だいがくにはいってから、きんじょのコンビニでアルバイトをはじめた。さいしょはおぼえることがおおくてたいへんだった。レジのつかいかただけでなく、にもつのうけとりやこうきょうりょうきんのしはらいなど、コンビニのしごとはそうぞういじょうにはばひろい。しかし、はんとしほどはたらくうちになれてきて、いまではじょうれんのおきゃくさんとはなすのがたのしみになっている。このけいけんをとおして、けいごもしぜんにつかえるようになった。',
        translation: { vi: 'Từ khi vào đại học, tôi bắt đầu làm thêm ở cửa hàng tiện lợi gần nhà. Lúc đầu có nhiều thứ phải nhớ nên rất vất vả. Không chỉ cách dùng máy tính tiền, mà còn nhận hàng, thanh toán hóa đơn công cộng... công việc ở cửa hàng tiện lợi đa dạng hơn tưởng tượng. Tuy nhiên, làm khoảng nửa năm thì tôi quen dần, và giờ nói chuyện với khách quen trở thành niềm vui. Qua trải nghiệm này, tôi cũng dùng kính ngữ một cách tự nhiên.', en: 'After entering university, I started a part-time job at a nearby convenience store. At first it was hard because there was so much to learn. Besides the register, convenience store work is broader than I imagined, including receiving parcels and paying utility bills. But after about six months I got used to it, and now I enjoy talking with regular customers. Through this experience, I also became able to use honorific language naturally.' },
        questions: [
          ['最初、アルバイトはどうでしたか。', '覚えることが多くて大変だった', 'とても簡単だった', 'お客さんが少なかった', '給料が高かった'],
          ['どのくらい働いて慣れてきましたか。', '半年ほど', '一週間ほど', '三年ほど', '一日'],
          ['このアルバイトを通して何ができるようになりましたか。', '敬語を自然に使うこと', '料理を作ること', '車を運転すること', '英語を話すこと'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Bàn chuyện công việc', en: 'Talking with a boss', ja: '上司との会話' },
        lines: [
          ['部長', '山田さん、明日の会議の資料はもうできましたか。', 'Anh Yamada, tài liệu cho cuộc họp ngày mai xong chưa?', 'Yamada, are the materials for tomorrow\'s meeting ready?'],
          ['山田', 'すみません、まだ半分しかできていません。今日中に仕上げます。', 'Xin lỗi, mới xong được một nửa. Tôi sẽ hoàn thành trong hôm nay.', "Sorry, only half is done. I'll finish it today."],
          ['部長', 'そうですか。売上のグラフも入れておいてくださいね。', 'Vậy à. Nhớ cho cả biểu đồ doanh số vào nhé.', 'I see. Please include the sales graph too.'],
          ['山田', 'はい、わかりました。終わり次第、メールでお送りします。', 'Vâng, tôi hiểu rồi. Xong là tôi gửi email ngay.', "Yes, understood. I'll email it as soon as it's done."],
        ],
        questions: [
          ['資料はどのくらいできていますか。', '半分', '全部', '少しも', '三分の一'],
          ['部長は何を入れてほしいと言いましたか。', '売上のグラフ', '写真', '地図', '会社の歴史'],
        ],
      },
      {
        title: { vi: 'Tìm phòng trọ', en: 'Looking for an apartment', ja: '部屋探し' },
        lines: [
          ['客', '駅から歩いて十分以内で、家賃が六万円ぐらいの部屋はありますか。', 'Có phòng nào đi bộ từ ga trong vòng 10 phút, tiền thuê khoảng 6 man không?', 'Do you have a room within a ten-minute walk from the station for about 60,000 yen?'],
          ['不動産屋', 'こちらはいかがですか。駅から八分で、家賃は五万八千円です。', 'Phòng này thì sao ạ? Cách ga 8 phút, tiền thuê 58.000 yên.', 'How about this one? Eight minutes from the station, 58,000 yen a month.'],
          ['客', 'いいですね。ペットは飼えますか。', 'Được đấy. Có nuôi thú cưng được không?', 'Nice. Can I keep pets?'],
          ['不動産屋', '申し訳ありませんが、ペットは禁止なんです。', 'Rất tiếc, ở đây cấm nuôi thú cưng.', "I'm sorry, but pets aren't allowed."],
        ],
        questions: [
          ['紹介された部屋は駅から何分ですか。', '八分', '十分', '五分', '十五分'],
          ['この部屋の問題は何ですか。', 'ペットが飼えない', '家賃が高い', '駅から遠い', '部屋が狭い'],
        ],
      },
    ],
  },
  N2: {
    readings: [
      {
        title: { vi: 'Xã hội già hóa', en: 'An ageing society', ja: '高齢化社会' },
        passage: '日本では、65歳以上の人口が全体の約3割を占めており、世界でも最も高齢化が進んだ国の一つとなっている。この状況は、年金や医療費の増加といった財政面の課題だけでなく、地方における労働力不足や、一人暮らしの高齢者の孤立といった社会的な問題も引き起こしている。こうした中、ロボットによる介護支援や、高齢者が地域で活躍できる仕組みづくりなど、さまざまな取り組みが始まっている。高齢化を単なる「問題」としてではなく、新しい社会のあり方を考えるきっかけとして捉える視点が求められていると言えるだろう。',
        passageReading: '',
        translation: { vi: 'Ở Nhật, dân số từ 65 tuổi trở lên chiếm khoảng 30% tổng dân số, khiến Nhật trở thành một trong những nước già hóa nhanh nhất thế giới. Tình trạng này không chỉ gây ra vấn đề tài chính như gia tăng chi phí lương hưu và y tế, mà còn gây ra các vấn đề xã hội như thiếu lao động ở địa phương và sự cô lập của người già sống một mình. Trong bối cảnh đó, nhiều nỗ lực đã bắt đầu như robot hỗ trợ chăm sóc hay xây dựng cơ chế giúp người cao tuổi hoạt động trong cộng đồng. Có thể nói cần có góc nhìn coi già hóa không đơn thuần là "vấn đề" mà là cơ hội để suy nghĩ về hình thái xã hội mới.', en: 'In Japan, people aged 65 and over make up about 30% of the population, making it one of the most aged countries in the world. This causes not only fiscal problems such as rising pension and medical costs, but also social problems like labour shortages in rural areas and isolation of elderly people living alone. Amid this, various initiatives have begun, such as robotic care support and systems that let seniors be active in their communities. A perspective that sees ageing not merely as a "problem" but as an opportunity to rethink society is needed.' },
        questions: [
          ['65歳以上の人口はどのくらいですか。', '約3割', '約1割', '約半分', '約8割'],
          ['社会的な問題として挙げられているのはどれか。', '一人暮らしの高齢者の孤立', '若者の増加', '観光客の減少', '物価の低下'],
          ['筆者の考えに最も近いのはどれか。', '高齢化を新しい社会を考えるきっかけにすべきだ', '高齢化は解決できない問題だ', 'ロボットは役に立たない', '年金を廃止すべきだ'],
        ],
      },
      {
        title: { vi: 'Làm việc từ xa ở Nhật', en: 'Telework in Japan', ja: 'テレワークの普及' },
        passage: '感染症の拡大をきっかけに、日本でもテレワークを導入する企業が急増した。通勤時間がなくなったことで、家族と過ごす時間や自己啓発の時間が増えたと評価する声がある一方、同僚とのコミュニケーション不足や、仕事と私生活の境界があいまいになることへの不安も聞かれる。また、職種によってはテレワークが難しいため、働き方の格差が広がっているという指摘もある。今後は、出社と在宅を組み合わせた柔軟な働き方が主流になっていくと考えられる。',
        passageReading: '',
        translation: { vi: 'Nhân sự lây lan của dịch bệnh, số doanh nghiệp áp dụng làm việc từ xa ở Nhật cũng tăng mạnh. Một mặt có ý kiến đánh giá rằng nhờ không phải đi lại, thời gian dành cho gia đình và tự học tăng lên; mặt khác cũng có lo ngại về việc thiếu giao tiếp với đồng nghiệp và ranh giới giữa công việc với đời tư trở nên mơ hồ. Ngoài ra, vì một số ngành nghề khó làm từ xa nên có ý kiến chỉ ra rằng chênh lệch về cách làm việc đang nới rộng. Trong tương lai, cách làm việc linh hoạt kết hợp đến công ty và ở nhà được cho là sẽ trở thành xu hướng chính.', en: 'Triggered by the spread of infectious disease, the number of Japanese companies adopting telework surged. Some praise the extra time for family and self-improvement thanks to no commute, while others worry about lack of communication with colleagues and the blurring of work and private life. Some also point out that gaps in working styles are widening because telework is difficult in certain occupations. Flexible styles combining office and home work are expected to become mainstream.' },
        questions: [
          ['テレワークが急増したきっかけは何か。', '感染症の拡大', '法律の改正', '通勤費の値上げ', '新しい技術の発明'],
          ['テレワークの不安として挙げられているのはどれか。', '同僚とのコミュニケーション不足', '給料が上がること', '通勤時間が増えること', '家族と会えないこと'],
          ['今後の働き方はどうなると考えられているか。', '出社と在宅を組み合わせた働き方', '全員が在宅勤務', '全員が毎日出社', 'テレワークの禁止'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Đàm phán với khách hàng', en: 'Negotiating with a client', ja: '取引先との交渉' },
        lines: [
          ['取引先', '御社の見積もりを拝見しましたが、予算を少し上回っておりまして…。', 'Chúng tôi đã xem báo giá của quý công ty, nhưng hơi vượt ngân sách...', "We've reviewed your quote, but it's slightly over our budget..."],
          ['営業', 'さようでございますか。数量を増やしていただければ、一割ほどお値引きできますが。', 'Vậy ạ. Nếu quý vị tăng số lượng, chúng tôi có thể giảm khoảng 10%.', 'I see. If you increase the quantity, we can offer about a 10% discount.'],
          ['取引先', 'なるほど。社内で検討させていただけますか。', 'Ra vậy. Cho phép chúng tôi xem xét nội bộ được không?', 'I see. May we discuss it internally?'],
          ['営業', 'もちろんです。来週中にご返事をいただけますと幸いです。', 'Tất nhiên. Rất mong nhận được phản hồi trong tuần sau.', "Of course. We'd appreciate your reply sometime next week."],
        ],
        questions: [
          ['取引先の問題は何か。', '見積もりが予算を超えている', '納期が遅い', '品質が悪い', '担当者がいない'],
          ['値引きの条件は何か。', '数量を増やすこと', '現金で払うこと', '来週契約すること', '新しい商品を買うこと'],
        ],
      },
    ],
  },
  N1: {
    readings: [
      {
        title: { vi: 'Giá trị của sự bất tiện', en: 'The value of inconvenience', ja: '不便益という考え方' },
        passage: '技術の進歩は、私たちの生活からあらゆる「不便」を取り除こうとしてきた。しかし近年、「不便益」という考え方が注目を集めている。これは、あえて手間をかけることによってこそ得られる利益があるという発想である。例えば、カーナビに頼らず地図を見ながら運転すれば、道を覚え、周囲の景色にも目を向けるようになる。便利さを追求するあまり、私たちは工夫する喜びや、自らの能力を発揮する機会を失ってはいないだろうか。不便益は、効率一辺倒の価値観を問い直すきっかけを与えてくれるのである。',
        passageReading: '',
        translation: { vi: 'Tiến bộ công nghệ luôn tìm cách loại bỏ mọi "bất tiện" khỏi cuộc sống chúng ta. Tuy nhiên gần đây, khái niệm "lợi ích của sự bất tiện" đang thu hút sự chú ý. Đây là ý tưởng rằng có những lợi ích chỉ có được khi ta cố tình bỏ công sức. Ví dụ, nếu lái xe xem bản đồ thay vì dựa vào thiết bị dẫn đường, ta sẽ nhớ đường và chú ý đến cảnh vật xung quanh. Phải chăng vì quá theo đuổi sự tiện lợi, chúng ta đã đánh mất niềm vui sáng tạo và cơ hội phát huy năng lực bản thân? Lợi ích của sự bất tiện cho ta cơ hội nhìn nhận lại hệ giá trị chỉ chú trọng hiệu quả.', en: 'Technological progress has tried to remove every "inconvenience" from our lives. Recently, however, the idea of "the benefit of inconvenience" has been attracting attention: some benefits can only be gained by deliberately taking trouble. For example, if you drive with a map instead of relying on navigation, you learn the roads and notice the scenery. In pursuing convenience, haven\'t we lost the joy of ingenuity and chances to use our own abilities? The benefit of inconvenience prompts us to question efficiency-only values.' },
        questions: [
          ['「不便益」とはどのような考え方か。', 'あえて手間をかけることで得られる利益がある', '不便なものはすべて捨てるべきだ', '技術の進歩は不要だ', '便利さこそが最も重要だ'],
          ['地図を見ながら運転する例は何を示しているか。', '手間をかけることで道を覚え景色に目を向ける', '地図は危険である', 'カーナビは高価である', '運転は疲れる'],
          ['筆者が最も言いたいことは何か。', '効率一辺倒の価値観を問い直すべきだ', '技術を全て否定すべきだ', 'カーナビを使うべきだ', '不便な生活は辛い'],
        ],
      },
      {
        title: { vi: 'Ngôn ngữ và tư duy', en: 'Language and thought', ja: '言語と思考' },
        passage: '私たちは言葉を使って考える。そうであるならば、母語の違いは思考の違いを生むのだろうか。この問いは古くから議論されてきたが、近年の認知科学の研究により、言語が知覚や記憶に一定の影響を与えることが明らかになりつつある。例えば、色を表す語彙が豊富な言語の話者は、微妙な色の違いをより速く識別できるという報告がある。とはいえ、言語が思考を完全に規定するという極端な見方は、今日では支持されていない。言語は思考の枠組みを形作る一方で、人間は新たな言葉を生み出し、その枠組みを乗り越えていく存在でもあるのだ。',
        passageReading: '',
        translation: { vi: 'Chúng ta suy nghĩ bằng ngôn từ. Nếu vậy, sự khác biệt tiếng mẹ đẻ có tạo ra khác biệt trong tư duy không? Câu hỏi này đã được tranh luận từ lâu, nhưng nhờ các nghiên cứu khoa học nhận thức gần đây, người ta dần làm rõ rằng ngôn ngữ có ảnh hưởng nhất định đến tri giác và trí nhớ. Ví dụ, có báo cáo cho thấy người nói ngôn ngữ giàu từ vựng chỉ màu sắc có thể phân biệt sự khác biệt màu tinh tế nhanh hơn. Tuy vậy, quan điểm cực đoan rằng ngôn ngữ quyết định hoàn toàn tư duy ngày nay không được ủng hộ. Ngôn ngữ định hình khung tư duy, nhưng con người cũng là sinh vật tạo ra từ ngữ mới và vượt qua khung đó.', en: 'We think with words. If so, do differences in native language create differences in thought? This question has long been debated, but recent cognitive science is revealing that language has some influence on perception and memory. For example, speakers of languages rich in colour words reportedly distinguish subtle colour differences faster. Still, the extreme view that language completely determines thought is not supported today. Language shapes the framework of thought, but humans also create new words and go beyond that framework.' },
        questions: [
          ['近年の研究で明らかになりつつあることは何か。', '言語が知覚や記憶に影響を与える', '言語は思考と無関係だ', '色の語彙は全言語で同じだ', '母語は変えられない'],
          ['今日支持されていない見方はどれか。', '言語が思考を完全に規定する', '言語は思考に影響する', '人間は新しい言葉を作る', '色の識別には個人差がある'],
          ['筆者は人間をどのような存在だと述べているか。', '言葉の枠組みを乗り越えていく存在', '言語に支配される存在', '色を識別できない存在', '思考しない存在'],
        ],
      },
    ],
    dialogues: [
      {
        title: { vi: 'Phỏng vấn chuyên gia', en: 'Expert interview', ja: '専門家へのインタビュー' },
        lines: [
          ['司会', '地方の過疎化について、先生はどのようにお考えですか。', 'Giáo sư nghĩ thế nào về tình trạng suy giảm dân số ở địa phương?', 'Professor, what are your thoughts on rural depopulation?'],
          ['教授', '人口減少そのものは避けられません。問題は、それを前提とした町づくりができているかどうかです。', 'Bản thân sự suy giảm dân số là không thể tránh. Vấn đề là liệu ta có xây dựng đô thị dựa trên tiền đề đó hay không.', 'Population decline itself is unavoidable. The question is whether towns are being planned on that premise.'],
          ['司会', '具体的にはどういうことでしょうか。', 'Cụ thể là như thế nào ạ?', 'What do you mean specifically?'],
          ['教授', '例えば、公共施設を中心部に集約し、移動手段を確保することで、少ない人口でも暮らしやすい町を維持できるのです。', 'Ví dụ, tập trung các cơ sở công cộng ở trung tâm và đảm bảo phương tiện đi lại, thì dù dân số ít vẫn duy trì được thị trấn dễ sống.', 'For example, by concentrating public facilities in the centre and securing transport, a town can stay livable even with fewer people.'],
        ],
        questions: [
          ['教授によると、問題は何か。', '人口減少を前提とした町づくりができているか', '人口が増えないこと', '若者が都会に行くこと', '公共施設が多すぎること'],
          ['教授が挙げた具体策はどれか。', '公共施設を中心部に集約する', '新しい空港を作る', '外国人を増やす', '税金を下げる'],
        ],
      },
    ],
  },
};
