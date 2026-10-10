// English vocabulary by CEFR level. One unit = one topic of 18 words.
// Line format: word|IPA|part of speech|Vietnamese|English definition|example|example (Vietnamese)

export const EN_GENERAL = {
  A1: [
    {
      key: 'a1-greetings',
      topic: { vi: 'Chào hỏi & gia đình', en: 'Greetings & family', ja: '挨拶と家族' },
      words: `
hello|/həˈləʊ/|interjection|xin chào|a greeting|Hello, my name is Anna.|Xin chào, tên tôi là Anna.
goodbye|/ˌɡʊdˈbaɪ/|interjection|tạm biệt|said when leaving|Goodbye, see you tomorrow!|Tạm biệt, hẹn gặp bạn ngày mai!
name|/neɪm/|noun|tên|what someone is called|What is your name?|Tên bạn là gì?
friend|/frend/|noun|bạn bè|a person you like and know well|Tom is my best friend.|Tom là bạn thân nhất của tôi.
family|/ˈfæməli/|noun|gia đình|parents, children and relatives|I live with my family.|Tôi sống cùng gia đình.
mother|/ˈmʌðə(r)/|noun|mẹ|female parent|My mother is a teacher.|Mẹ tôi là giáo viên.
father|/ˈfɑːðə(r)/|noun|bố, cha|male parent|My father works in a bank.|Bố tôi làm việc ở ngân hàng.
brother|/ˈbrʌðə(r)/|noun|anh/em trai|a boy with the same parents as you|I have one brother.|Tôi có một người anh trai.
sister|/ˈsɪstə(r)/|noun|chị/em gái|a girl with the same parents as you|My sister is ten years old.|Em gái tôi mười tuổi.
child|/tʃaɪld/|noun|đứa trẻ|a young person|The child is playing in the park.|Đứa trẻ đang chơi trong công viên.
baby|/ˈbeɪbi/|noun|em bé|a very young child|The baby is sleeping.|Em bé đang ngủ.
husband|/ˈhʌzbənd/|noun|chồng|the man a woman is married to|Her husband is a doctor.|Chồng cô ấy là bác sĩ.
wife|/waɪf/|noun|vợ|the woman a man is married to|His wife speaks French.|Vợ anh ấy nói tiếng Pháp.
old|/əʊld/|adjective|già, cũ|having lived for a long time|My grandfather is very old.|Ông tôi đã rất già.
young|/jʌŋ/|adjective|trẻ|not old|She is young and beautiful.|Cô ấy trẻ và xinh đẹp.
happy|/ˈhæpi/|adjective|vui vẻ, hạnh phúc|feeling pleased|I am happy to see you.|Tôi rất vui được gặp bạn.
meet|/miːt/|verb|gặp|to see and talk to someone|Nice to meet you.|Rất vui được gặp bạn.
live|/lɪv/|verb|sống|to have your home somewhere|We live in Hanoi.|Chúng tôi sống ở Hà Nội.`,
    },
    {
      key: 'a1-home',
      topic: { vi: 'Nhà cửa & sinh hoạt', en: 'Home & daily routine', ja: '家と日常' },
      words: `
house|/haʊs/|noun|ngôi nhà|a building where people live|Their house is big.|Nhà của họ rất to.
room|/ruːm/|noun|căn phòng|a part of a building|My room is on the second floor.|Phòng tôi ở tầng hai.
kitchen|/ˈkɪtʃɪn/|noun|nhà bếp|a room for cooking|Mum is cooking in the kitchen.|Mẹ đang nấu ăn trong bếp.
bed|/bed/|noun|giường|furniture for sleeping|I go to bed at ten.|Tôi đi ngủ lúc mười giờ.
table|/ˈteɪbl/|noun|cái bàn|furniture with a flat top|The book is on the table.|Quyển sách ở trên bàn.
chair|/tʃeə(r)/|noun|cái ghế|a seat for one person|Please sit on this chair.|Mời bạn ngồi ghế này.
door|/dɔː(r)/|noun|cửa ra vào|you open it to enter a room|Close the door, please.|Làm ơn đóng cửa lại.
window|/ˈwɪndəʊ/|noun|cửa sổ|an opening in a wall with glass|Open the window, it's hot.|Mở cửa sổ ra, trời nóng quá.
wake up|/weɪk ʌp/|phrasal verb|thức dậy|to stop sleeping|I wake up at six every day.|Tôi thức dậy lúc sáu giờ mỗi ngày.
wash|/wɒʃ/|verb|rửa, giặt|to clean with water|Wash your hands before eating.|Rửa tay trước khi ăn.
clean|/kliːn/|adjective|sạch sẽ|not dirty|The kitchen is very clean.|Nhà bếp rất sạch sẽ.
sleep|/sliːp/|verb|ngủ|to rest with your eyes closed|Babies sleep a lot.|Em bé ngủ rất nhiều.
watch|/wɒtʃ/|verb|xem|to look at something for a time|We watch TV after dinner.|Chúng tôi xem TV sau bữa tối.
read|/riːd/|verb|đọc|to look at words and understand them|I read a book every night.|Tối nào tôi cũng đọc sách.
always|/ˈɔːlweɪz/|adverb|luôn luôn|at all times|She always drinks coffee in the morning.|Cô ấy luôn uống cà phê vào buổi sáng.
usually|/ˈjuːʒuəli/|adverb|thường thường|in most cases|I usually walk to school.|Tôi thường đi bộ đến trường.
never|/ˈnevə(r)/|adverb|không bao giờ|at no time|He never eats meat.|Anh ấy không bao giờ ăn thịt.
early|/ˈɜːli/|adjective|sớm|before the usual time|I get up early on Mondays.|Thứ Hai tôi dậy sớm.`,
    },
    {
      key: 'a1-food',
      topic: { vi: 'Đồ ăn & mua sắm', en: 'Food & shopping', ja: '食べ物と買い物' },
      words: `
apple|/ˈæpl/|noun|quả táo|a round red or green fruit|I eat an apple every day.|Tôi ăn một quả táo mỗi ngày.
bread|/bred/|noun|bánh mì|food made from flour and baked|We have bread for breakfast.|Chúng tôi ăn bánh mì cho bữa sáng.
rice|/raɪs/|noun|gạo, cơm|small white grains that you cook|Vietnamese people eat rice every day.|Người Việt ăn cơm hằng ngày.
water|/ˈwɔːtə(r)/|noun|nước|the clear liquid we drink|Can I have a glass of water?|Cho tôi một cốc nước được không?
milk|/mɪlk/|noun|sữa|white drink from cows|The children drink milk.|Bọn trẻ uống sữa.
egg|/eɡ/|noun|quả trứng|food laid by a chicken|I'd like two eggs, please.|Cho tôi hai quả trứng.
chicken|/ˈtʃɪkɪn/|noun|thịt gà, con gà|a bird kept for meat and eggs|Chicken soup is my favourite.|Súp gà là món tôi thích nhất.
fish|/fɪʃ/|noun|cá|an animal that lives in water|We eat fish on Fridays.|Chúng tôi ăn cá vào thứ Sáu.
vegetable|/ˈvedʒtəbl/|noun|rau củ|a plant eaten as food|Eat more vegetables.|Hãy ăn nhiều rau hơn.
breakfast|/ˈbrekfəst/|noun|bữa sáng|the first meal of the day|Breakfast is at seven.|Bữa sáng lúc bảy giờ.
hungry|/ˈhʌŋɡri/|adjective|đói|wanting to eat|I'm hungry. Let's eat!|Tôi đói rồi. Ăn thôi!
buy|/baɪ/|verb|mua|to get something by paying money|I want to buy a new bag.|Tôi muốn mua một cái túi mới.
price|/praɪs/|noun|giá|the money you pay for something|What is the price of this shirt?|Cái áo này giá bao nhiêu?
cheap|/tʃiːp/|adjective|rẻ|not costing much money|This market is cheap.|Chợ này rẻ.
expensive|/ɪkˈspensɪv/|adjective|đắt|costing a lot of money|That car is very expensive.|Chiếc xe đó rất đắt.
shop|/ʃɒp/|noun|cửa hàng|a place where you buy things|The shop opens at nine.|Cửa hàng mở cửa lúc chín giờ.
money|/ˈmʌni/|noun|tiền|coins and notes used to buy things|I don't have much money.|Tôi không có nhiều tiền.
delicious|/dɪˈlɪʃəs/|adjective|ngon|tasting very good|This cake is delicious!|Cái bánh này ngon quá!`,
    },
    {
      key: 'a1-time-places',
      topic: { vi: 'Thời gian, thời tiết & địa điểm', en: 'Time, weather & places', ja: '時間・天気・場所' },
      words: `
today|/təˈdeɪ/|adverb|hôm nay|on this day|Today is Monday.|Hôm nay là thứ Hai.
tomorrow|/təˈmɒrəʊ/|adverb|ngày mai|the day after today|See you tomorrow.|Hẹn gặp lại ngày mai.
yesterday|/ˈjestədeɪ/|adverb|hôm qua|the day before today|I was at home yesterday.|Hôm qua tôi ở nhà.
week|/wiːk/|noun|tuần|a period of seven days|I go swimming twice a week.|Tôi đi bơi hai lần một tuần.
morning|/ˈmɔːnɪŋ/|noun|buổi sáng|the early part of the day|Good morning, everyone!|Chào buổi sáng mọi người!
night|/naɪt/|noun|ban đêm|the time when it is dark|The city is beautiful at night.|Thành phố đẹp vào ban đêm.
hot|/hɒt/|adjective|nóng|having a high temperature|It's very hot in summer.|Mùa hè trời rất nóng.
cold|/kəʊld/|adjective|lạnh|having a low temperature|It's cold today. Wear a coat.|Hôm nay lạnh. Mặc áo khoác vào.
rain|/reɪn/|noun|mưa|water falling from clouds|Take an umbrella, there will be rain.|Mang ô theo, trời sẽ mưa.
sunny|/ˈsʌni/|adjective|nắng|with a lot of sunshine|It's a sunny day.|Hôm nay là một ngày nắng.
school|/skuːl/|noun|trường học|a place where children learn|My school is near my house.|Trường tôi gần nhà.
hospital|/ˈhɒspɪtl/|noun|bệnh viện|a place where sick people are treated|She works at the hospital.|Cô ấy làm việc ở bệnh viện.
park|/pɑːk/|noun|công viên|a public garden|Let's go to the park.|Chúng ta đi công viên đi.
station|/ˈsteɪʃn/|noun|nhà ga|a place where trains stop|The station is on the left.|Nhà ga ở bên trái.
city|/ˈsɪti/|noun|thành phố|a big town|Ho Chi Minh City is very busy.|Thành phố Hồ Chí Minh rất nhộn nhịp.
near|/nɪə(r)/|preposition|gần|not far from|Is there a bank near here?|Có ngân hàng nào gần đây không?
left|/left/|noun|bên trái|the opposite of right|Turn left at the corner.|Rẽ trái ở góc đường.
right|/raɪt/|noun|bên phải|the opposite of left|The bank is on the right.|Ngân hàng ở bên phải.`,
    },
  ],
  A2: [
    {
      key: 'a2-travel',
      topic: { vi: 'Du lịch & giao thông', en: 'Travel & transport', ja: '旅行と交通' },
      words: `
airport|/ˈeəpɔːt/|noun|sân bay|a place where planes land and take off|We arrived at the airport early.|Chúng tôi đến sân bay sớm.
passport|/ˈpɑːspɔːt/|noun|hộ chiếu|an official document for travelling abroad|Don't forget your passport.|Đừng quên hộ chiếu của bạn.
ticket|/ˈtɪkɪt/|noun|vé|a paper that lets you travel or enter|I bought a train ticket online.|Tôi đã mua vé tàu trên mạng.
luggage|/ˈlʌɡɪdʒ/|noun|hành lý|bags you take on a trip|My luggage is too heavy.|Hành lý của tôi quá nặng.
journey|/ˈdʒɜːni/|noun|chuyến đi|travelling from one place to another|The journey takes three hours.|Chuyến đi mất ba tiếng.
hotel|/həʊˈtel/|noun|khách sạn|a building where you pay to stay|We stayed in a small hotel.|Chúng tôi ở một khách sạn nhỏ.
book|/bʊk/|verb|đặt trước|to arrange to have a room or seat|I booked a room for two nights.|Tôi đã đặt phòng cho hai đêm.
abroad|/əˈbrɔːd/|adverb|ở nước ngoài|in or to a foreign country|She wants to study abroad.|Cô ấy muốn đi du học.
map|/mæp/|noun|bản đồ|a drawing of an area|Can you show me on the map?|Bạn chỉ cho tôi trên bản đồ được không?
tourist|/ˈtʊərɪst/|noun|khách du lịch|a person visiting a place for pleasure|Hoi An is full of tourists.|Hội An đầy khách du lịch.
delay|/dɪˈleɪ/|noun|sự chậm trễ|when something happens later than planned|There is a two-hour delay.|Có sự chậm trễ hai tiếng.
arrive|/əˈraɪv/|verb|đến nơi|to reach a place|The train arrives at 5 p.m.|Tàu đến lúc 5 giờ chiều.
leave|/liːv/|verb|rời đi|to go away from a place|The bus leaves in ten minutes.|Xe buýt rời đi sau mười phút.
traffic|/ˈtræfɪk/|noun|giao thông|vehicles on the road|The traffic is terrible today.|Giao thông hôm nay thật tệ.
crowded|/ˈkraʊdɪd/|adjective|đông đúc|full of people|The beach was crowded.|Bãi biển rất đông.
souvenir|/ˌsuːvəˈnɪə(r)/|noun|quà lưu niệm|something you buy to remember a place|I bought a souvenir for my mum.|Tôi mua quà lưu niệm cho mẹ.
sightseeing|/ˈsaɪtsiːɪŋ/|noun|tham quan|visiting interesting places|We went sightseeing in Rome.|Chúng tôi đi tham quan ở Rome.
return|/rɪˈtɜːn/|verb|trở về|to come or go back|We return home on Sunday.|Chúng tôi trở về nhà vào Chủ nhật.`,
    },
    {
      key: 'a2-health',
      topic: { vi: 'Sức khỏe & cơ thể', en: 'Health & the body', ja: '健康と体' },
      words: `
headache|/ˈhedeɪk/|noun|đau đầu|a pain in your head|I have a terrible headache.|Tôi bị đau đầu kinh khủng.
fever|/ˈfiːvə(r)/|noun|sốt|a high body temperature|The baby has a fever.|Em bé bị sốt.
medicine|/ˈmedsn/|noun|thuốc|something you take to get better|Take this medicine twice a day.|Uống thuốc này hai lần một ngày.
doctor|/ˈdɒktə(r)/|noun|bác sĩ|a person who treats sick people|You should see a doctor.|Bạn nên đi khám bác sĩ.
healthy|/ˈhelθi/|adjective|khỏe mạnh|in good physical condition|Eating fruit keeps you healthy.|Ăn trái cây giúp bạn khỏe mạnh.
exercise|/ˈeksəsaɪz/|noun|tập thể dục|physical activity to stay fit|I do exercise every morning.|Sáng nào tôi cũng tập thể dục.
tired|/ˈtaɪəd/|adjective|mệt mỏi|needing rest|I'm tired after work.|Tôi mệt sau giờ làm.
hurt|/hɜːt/|verb|đau, làm đau|to feel or cause pain|My leg hurts.|Chân tôi bị đau.
stomach|/ˈstʌmək/|noun|dạ dày, bụng|the organ where food goes|I have a stomach ache.|Tôi bị đau bụng.
diet|/ˈdaɪət/|noun|chế độ ăn|the food you usually eat|A balanced diet is important.|Chế độ ăn cân bằng rất quan trọng.
weight|/weɪt/|noun|cân nặng|how heavy someone is|He wants to lose weight.|Anh ấy muốn giảm cân.
appointment|/əˈpɔɪntmənt/|noun|cuộc hẹn|an arranged meeting|I have a dentist appointment at 3.|Tôi có hẹn nha sĩ lúc 3 giờ.
cough|/kɒf/|noun|ho|pushing air out of your throat noisily|She has a bad cough.|Cô ấy ho nặng.
rest|/rest/|verb|nghỉ ngơi|to relax or sleep|You need to rest for a few days.|Bạn cần nghỉ ngơi vài ngày.
ill|/ɪl/|adjective|ốm|not well|He was ill last week.|Tuần trước anh ấy bị ốm.
pharmacy|/ˈfɑːməsi/|noun|nhà thuốc|a shop that sells medicine|Is there a pharmacy nearby?|Gần đây có nhà thuốc không?
injury|/ˈɪndʒəri/|noun|chấn thương|harm done to the body|He has a knee injury.|Anh ấy bị chấn thương đầu gối.
recover|/rɪˈkʌvə(r)/|verb|hồi phục|to become well again|She recovered quickly.|Cô ấy hồi phục nhanh chóng.`,
    },
    {
      key: 'a2-work-school',
      topic: { vi: 'Công việc & trường học', en: 'Work & school', ja: '仕事と学校' },
      words: `
job|/dʒɒb/|noun|công việc|work you do for money|She has a new job.|Cô ấy có công việc mới.
office|/ˈɒfɪs/|noun|văn phòng|a room where people work at desks|The office is on the 5th floor.|Văn phòng ở tầng 5.
boss|/bɒs/|noun|sếp|the person in charge of you at work|My boss is very kind.|Sếp tôi rất tốt bụng.
colleague|/ˈkɒliːɡ/|noun|đồng nghiệp|a person you work with|I had lunch with my colleagues.|Tôi ăn trưa với đồng nghiệp.
salary|/ˈsæləri/|noun|lương|money you earn every month|He gets a good salary.|Anh ấy có mức lương tốt.
busy|/ˈbɪzi/|adjective|bận rộn|having a lot to do|I'm too busy to go out.|Tôi bận quá không đi chơi được.
homework|/ˈhəʊmwɜːk/|noun|bài tập về nhà|school work done at home|Did you finish your homework?|Con làm xong bài tập về nhà chưa?
exam|/ɪɡˈzæm/|noun|kỳ thi|a test of knowledge|I passed the exam!|Tôi đã đỗ kỳ thi!
subject|/ˈsʌbdʒɪkt/|noun|môn học|an area of study at school|Maths is my favourite subject.|Toán là môn học yêu thích của tôi.
teacher|/ˈtiːtʃə(r)/|noun|giáo viên|a person who teaches|Our English teacher is from Canada.|Giáo viên tiếng Anh của chúng tôi đến từ Canada.
student|/ˈstjuːdnt/|noun|học sinh, sinh viên|a person who studies|There are 30 students in my class.|Lớp tôi có 30 học sinh.
learn|/lɜːn/|verb|học|to get knowledge or a skill|I want to learn Japanese.|Tôi muốn học tiếng Nhật.
practise|/ˈpræktɪs/|verb|luyện tập|to do something often to improve|Practise speaking every day.|Hãy luyện nói mỗi ngày.
mistake|/mɪˈsteɪk/|noun|lỗi sai|something that is not correct|Everyone makes mistakes.|Ai cũng mắc lỗi.
meeting|/ˈmiːtɪŋ/|noun|cuộc họp|when people meet to discuss things|The meeting starts at nine.|Cuộc họp bắt đầu lúc chín giờ.
email|/ˈiːmeɪl/|noun|thư điện tử|a message sent by computer|Please send me an email.|Làm ơn gửi email cho tôi.
interview|/ˈɪntəvjuː/|noun|cuộc phỏng vấn|a meeting to see if someone is right for a job|I have a job interview tomorrow.|Ngày mai tôi có buổi phỏng vấn xin việc.
career|/kəˈrɪə(r)/|noun|sự nghiệp|the jobs you do in your working life|She had a long career in teaching.|Cô ấy có sự nghiệp dạy học lâu năm.`,
    },
    {
      key: 'a2-hobbies',
      topic: { vi: 'Sở thích & giải trí', en: 'Hobbies & entertainment', ja: '趣味と娯楽' },
      words: `
hobby|/ˈhɒbi/|noun|sở thích|an activity you enjoy in free time|My hobby is painting.|Sở thích của tôi là vẽ tranh.
music|/ˈmjuːzɪk/|noun|âm nhạc|sounds arranged in a pleasant way|I listen to music on the bus.|Tôi nghe nhạc trên xe buýt.
film|/fɪlm/|noun|bộ phim|a story shown at the cinema|Let's watch a film tonight.|Tối nay chúng ta xem phim đi.
concert|/ˈkɒnsət/|noun|buổi hòa nhạc|a music performance|We went to a rock concert.|Chúng tôi đi xem hòa nhạc rock.
game|/ɡeɪm/|noun|trò chơi|an activity with rules for fun|Do you want to play a game?|Bạn có muốn chơi một trò chơi không?
team|/tiːm/|noun|đội|a group playing together|Our team won the match.|Đội chúng tôi đã thắng trận.
match|/mætʃ/|noun|trận đấu|a sports competition|The football match was exciting.|Trận bóng đá rất hấp dẫn.
camera|/ˈkæmərə/|noun|máy ảnh|a device for taking photos|I bought a new camera.|Tôi đã mua một chiếc máy ảnh mới.
guitar|/ɡɪˈtɑː(r)/|noun|đàn ghi-ta|a musical instrument with strings|He plays the guitar very well.|Anh ấy chơi ghi-ta rất giỏi.
dance|/dɑːns/|verb|nhảy, múa|to move your body to music|She loves to dance.|Cô ấy rất thích nhảy.
draw|/drɔː/|verb|vẽ|to make a picture with a pen or pencil|My son likes to draw animals.|Con trai tôi thích vẽ động vật.
collect|/kəˈlekt/|verb|sưu tầm|to bring things together as a hobby|He collects old coins.|Anh ấy sưu tầm tiền xu cổ.
free time|/friː taɪm/|noun|thời gian rảnh|time when you are not working|What do you do in your free time?|Bạn làm gì vào thời gian rảnh?
favourite|/ˈfeɪvərɪt/|adjective|yêu thích nhất|liked more than others|What's your favourite song?|Bài hát yêu thích nhất của bạn là gì?
boring|/ˈbɔːrɪŋ/|adjective|nhàm chán|not interesting|The film was boring.|Bộ phim thật nhàm chán.
exciting|/ɪkˈsaɪtɪŋ/|adjective|thú vị, hào hứng|making you feel excited|Skiing is really exciting.|Trượt tuyết thật sự rất thú vị.
join|/dʒɔɪn/|verb|tham gia|to become a member of|I joined a book club.|Tôi đã tham gia một câu lạc bộ sách.
relax|/rɪˈlæks/|verb|thư giãn|to rest and enjoy yourself|I relax by reading.|Tôi thư giãn bằng cách đọc sách.`,
    },
  ],
  B1: [
    {
      key: 'b1-environment',
      topic: { vi: 'Môi trường', en: 'The environment', ja: '環境' },
      words: `
environment|/ɪnˈvaɪrənmənt/|noun|môi trường|the natural world|We must protect the environment.|Chúng ta phải bảo vệ môi trường.
pollution|/pəˈluːʃn/|noun|sự ô nhiễm|dirty or harmful substances in air, water, etc.|Air pollution is a big problem in cities.|Ô nhiễm không khí là vấn đề lớn ở các thành phố.
recycle|/ˌriːˈsaɪkl/|verb|tái chế|to treat waste so it can be used again|We recycle paper and plastic.|Chúng tôi tái chế giấy và nhựa.
waste|/weɪst/|noun|rác thải; sự lãng phí|things that are thrown away|Factories produce a lot of waste.|Các nhà máy thải ra nhiều rác.
climate|/ˈklaɪmət/|noun|khí hậu|the usual weather of a place|The climate is changing quickly.|Khí hậu đang thay đổi nhanh chóng.
global warming|/ˌɡləʊbl ˈwɔːmɪŋ/|noun|sự nóng lên toàn cầu|the increase in Earth's temperature|Global warming causes sea levels to rise.|Sự nóng lên toàn cầu khiến mực nước biển dâng.
energy|/ˈenədʒi/|noun|năng lượng|power used to provide heat, light, etc.|Solar energy is clean.|Năng lượng mặt trời là năng lượng sạch.
protect|/prəˈtekt/|verb|bảo vệ|to keep safe from harm|Trees protect the soil.|Cây xanh bảo vệ đất.
species|/ˈspiːʃiːz/|noun|loài|a group of similar animals or plants|Many species are in danger.|Nhiều loài đang gặp nguy hiểm.
endangered|/ɪnˈdeɪndʒəd/|adjective|có nguy cơ tuyệt chủng|at risk of disappearing|Tigers are an endangered species.|Hổ là loài có nguy cơ tuyệt chủng.
plastic|/ˈplæstɪk/|noun|nhựa|a light material made from chemicals|Avoid single-use plastic.|Tránh dùng nhựa dùng một lần.
reduce|/rɪˈdjuːs/|verb|giảm|to make smaller or less|We need to reduce our energy use.|Chúng ta cần giảm việc sử dụng năng lượng.
flood|/flʌd/|noun|lũ lụt|a large amount of water covering land|The flood destroyed many homes.|Lũ lụt đã phá hủy nhiều ngôi nhà.
drought|/draʊt/|noun|hạn hán|a long period without rain|The drought killed the crops.|Hạn hán đã làm chết mùa màng.
forest|/ˈfɒrɪst/|noun|rừng|a large area covered with trees|The forest is home to many animals.|Rừng là nhà của nhiều loài động vật.
natural|/ˈnætʃrəl/|adjective|tự nhiên|existing in nature|Vietnam has many natural resources.|Việt Nam có nhiều tài nguyên thiên nhiên.
environmentally friendly|/ɪnˌvaɪrənˈmentəli ˈfrendli/|adjective|thân thiện với môi trường|not harmful to the environment|Bikes are environmentally friendly.|Xe đạp thân thiện với môi trường.
volunteer|/ˌvɒlənˈtɪə(r)/|noun|tình nguyện viên|a person who works without pay|Volunteers cleaned the beach.|Các tình nguyện viên đã dọn sạch bãi biển.`,
    },
    {
      key: 'b1-technology',
      topic: { vi: 'Công nghệ & truyền thông', en: 'Technology & media', ja: 'テクノロジーとメディア' },
      words: `
device|/dɪˈvaɪs/|noun|thiết bị|a machine or tool for a purpose|Smartphones are useful devices.|Điện thoại thông minh là thiết bị hữu ích.
software|/ˈsɒftweə(r)/|noun|phần mềm|programs used by a computer|Update the software regularly.|Hãy cập nhật phần mềm thường xuyên.
download|/ˌdaʊnˈləʊd/|verb|tải xuống|to copy data from the internet|You can download the app for free.|Bạn có thể tải ứng dụng miễn phí.
password|/ˈpɑːswɜːd/|noun|mật khẩu|a secret word to access something|Never share your password.|Đừng bao giờ chia sẻ mật khẩu.
online|/ˌɒnˈlaɪn/|adjective|trực tuyến|connected to the internet|I take online classes.|Tôi học các lớp trực tuyến.
website|/ˈwebsaɪt/|noun|trang web|pages of information on the internet|Visit our website for details.|Truy cập trang web của chúng tôi để biết chi tiết.
social media|/ˌsəʊʃl ˈmiːdiə/|noun|mạng xã hội|websites for sharing and communicating|Teenagers spend hours on social media.|Thanh thiếu niên dành hàng giờ trên mạng xã hội.
invent|/ɪnˈvent/|verb|phát minh|to create something new|Who invented the telephone?|Ai đã phát minh ra điện thoại?
screen|/skriːn/|noun|màn hình|the flat surface showing pictures|Don't look at the screen too long.|Đừng nhìn màn hình quá lâu.
battery|/ˈbætri/|noun|pin|a device that stores electricity|My phone battery is low.|Pin điện thoại tôi sắp hết.
connect|/kəˈnekt/|verb|kết nối|to join together|Connect your laptop to the Wi-Fi.|Kết nối máy tính xách tay với Wi-Fi.
advertisement|/ədˈvɜːtɪsmənt/|noun|quảng cáo|a notice to sell a product|There are too many advertisements on TV.|Có quá nhiều quảng cáo trên TV.
news|/njuːz/|noun|tin tức|new information about events|I read the news every morning.|Sáng nào tôi cũng đọc tin tức.
information|/ˌɪnfəˈmeɪʃn/|noun|thông tin|facts about something|The internet is full of information.|Internet đầy ắp thông tin.
digital|/ˈdɪdʒɪtl/|adjective|kỹ thuật số|using computer technology|We live in a digital world.|Chúng ta sống trong thế giới kỹ thuật số.
smartphone|/ˈsmɑːtfəʊn/|noun|điện thoại thông minh|a mobile phone that works like a computer|Almost everyone has a smartphone.|Hầu như ai cũng có điện thoại thông minh.
privacy|/ˈprɪvəsi/|noun|sự riêng tư|being free from public attention|Protect your privacy online.|Hãy bảo vệ sự riêng tư khi lên mạng.
artificial intelligence|/ˌɑːtɪfɪʃl ɪnˈtelɪdʒəns/|noun|trí tuệ nhân tạo|computer systems that can think like humans|Artificial intelligence is changing many jobs.|Trí tuệ nhân tạo đang thay đổi nhiều nghề nghiệp.`,
    },
    {
      key: 'b1-relationships',
      topic: { vi: 'Các mối quan hệ & cảm xúc', en: 'Relationships & feelings', ja: '人間関係と感情' },
      words: `
relationship|/rɪˈleɪʃnʃɪp/|noun|mối quan hệ|the way people are connected|They have a good relationship.|Họ có mối quan hệ tốt.
trust|/trʌst/|verb|tin tưởng|to believe someone is honest|I trust my best friend completely.|Tôi hoàn toàn tin tưởng bạn thân.
argue|/ˈɑːɡjuː/|verb|tranh cãi|to disagree angrily|My brothers often argue.|Các anh trai tôi thường cãi nhau.
support|/səˈpɔːt/|verb|ủng hộ, hỗ trợ|to help and encourage|My parents always support me.|Bố mẹ luôn ủng hộ tôi.
proud|/praʊd/|adjective|tự hào|pleased about an achievement|I'm proud of you.|Tôi tự hào về bạn.
jealous|/ˈdʒeləs/|adjective|ghen tị|unhappy because someone has what you want|He was jealous of his brother's success.|Anh ấy ghen tị với thành công của em trai.
embarrassed|/ɪmˈbærəst/|adjective|xấu hổ, ngượng|feeling shy or ashamed|I felt embarrassed when I fell.|Tôi thấy xấu hổ khi bị ngã.
nervous|/ˈnɜːvəs/|adjective|lo lắng, hồi hộp|worried about something|I'm nervous about the exam.|Tôi lo lắng về kỳ thi.
disappointed|/ˌdɪsəˈpɔɪntɪd/|adjective|thất vọng|sad because something was not as good as hoped|She was disappointed with the result.|Cô ấy thất vọng với kết quả.
grateful|/ˈɡreɪtfl/|adjective|biết ơn|thankful|I'm grateful for your help.|Tôi biết ơn sự giúp đỡ của bạn.
confident|/ˈkɒnfɪdənt/|adjective|tự tin|sure of yourself|She is confident when she speaks English.|Cô ấy tự tin khi nói tiếng Anh.
get along with|/ɡet əˈlɒŋ wɪð/|phrasal verb|hòa hợp với|to have a friendly relationship|I get along with my neighbours.|Tôi hòa hợp với hàng xóm.
apologize|/əˈpɒlədʒaɪz/|verb|xin lỗi|to say you are sorry|He apologized for being late.|Anh ấy xin lỗi vì đến muộn.
forgive|/fəˈɡɪv/|verb|tha thứ|to stop being angry with someone|Please forgive me.|Xin hãy tha thứ cho tôi.
lonely|/ˈləʊnli/|adjective|cô đơn|unhappy because you are alone|He felt lonely in the new city.|Anh ấy thấy cô đơn ở thành phố mới.
generous|/ˈdʒenərəs/|adjective|hào phóng|happy to give|She is generous with her time.|Cô ấy hào phóng với thời gian của mình.
respect|/rɪˈspekt/|noun|sự tôn trọng|admiration for someone|Show respect to older people.|Hãy tôn trọng người lớn tuổi.
keep in touch|/kiːp ɪn tʌtʃ/|phrase|giữ liên lạc|to continue to communicate|Let's keep in touch after graduation.|Hãy giữ liên lạc sau khi tốt nghiệp nhé.`,
    },
    {
      key: 'b1-education-career',
      topic: { vi: 'Giáo dục & nghề nghiệp', en: 'Education & careers', ja: '教育とキャリア' },
      words: `
degree|/dɪˈɡriː/|noun|bằng cấp|a qualification from a university|She has a degree in economics.|Cô ấy có bằng kinh tế.
university|/ˌjuːnɪˈvɜːsəti/|noun|trường đại học|a place for higher education|He goes to a university in Hanoi.|Anh ấy học đại học ở Hà Nội.
graduate|/ˈɡrædʒueɪt/|verb|tốt nghiệp|to complete a degree|I graduated last year.|Tôi tốt nghiệp năm ngoái.
scholarship|/ˈskɒləʃɪp/|noun|học bổng|money given to pay for study|She won a scholarship to study in Japan.|Cô ấy giành học bổng du học Nhật Bản.
skill|/skɪl/|noun|kỹ năng|the ability to do something well|Communication is an important skill.|Giao tiếp là một kỹ năng quan trọng.
experience|/ɪkˈspɪəriəns/|noun|kinh nghiệm|knowledge from doing something|Do you have any work experience?|Bạn có kinh nghiệm làm việc không?
apply|/əˈplaɪ/|verb|nộp đơn|to formally ask for a job or place|I applied for three jobs.|Tôi đã nộp đơn cho ba công việc.
qualification|/ˌkwɒlɪfɪˈkeɪʃn/|noun|trình độ chuyên môn|an exam passed or course completed|What qualifications do you need?|Bạn cần trình độ chuyên môn gì?
employer|/ɪmˈplɔɪə(r)/|noun|người tuyển dụng|a person or company that employs people|Employers value teamwork.|Nhà tuyển dụng coi trọng làm việc nhóm.
employee|/ɪmˈplɔɪiː/|noun|nhân viên|a person who is paid to work|The company has 200 employees.|Công ty có 200 nhân viên.
promotion|/prəˈməʊʃn/|noun|sự thăng chức|a move to a higher position|She got a promotion last month.|Cô ấy được thăng chức tháng trước.
training|/ˈtreɪnɪŋ/|noun|sự đào tạo|teaching skills for a job|New staff receive two weeks of training.|Nhân viên mới được đào tạo hai tuần.
lecture|/ˈlektʃə(r)/|noun|bài giảng|a talk to students|The lecture was very interesting.|Bài giảng rất thú vị.
knowledge|/ˈnɒlɪdʒ/|noun|kiến thức|information and understanding|Reading increases your knowledge.|Đọc sách giúp tăng kiến thức.
ambition|/æmˈbɪʃn/|noun|hoài bão|a strong wish to achieve something|His ambition is to become a pilot.|Hoài bão của anh ấy là trở thành phi công.
achieve|/əˈtʃiːv/|verb|đạt được|to succeed in doing something|You can achieve your goals.|Bạn có thể đạt được mục tiêu của mình.
deadline|/ˈdedlaɪn/|noun|hạn chót|the time by which something must be done|The deadline is Friday.|Hạn chót là thứ Sáu.
part-time|/ˌpɑːt ˈtaɪm/|adjective|bán thời gian|working only some hours|She has a part-time job at a café.|Cô ấy làm bán thời gian ở quán cà phê.`,
    },
  ],
  B2: [
    {
      key: 'b2-society',
      topic: { vi: 'Xã hội & văn hóa', en: 'Society & culture', ja: '社会と文化' },
      words: `
tradition|/trəˈdɪʃn/|noun|truyền thống|a custom passed down over time|Tet is an important tradition in Vietnam.|Tết là một truyền thống quan trọng ở Việt Nam.
diversity|/daɪˈvɜːsəti/|noun|sự đa dạng|a range of different things or people|London is known for its cultural diversity.|London nổi tiếng về sự đa dạng văn hóa.
inequality|/ˌɪnɪˈkwɒləti/|noun|sự bất bình đẳng|unfair differences between groups|Income inequality is growing.|Bất bình đẳng thu nhập đang gia tăng.
generation|/ˌdʒenəˈreɪʃn/|noun|thế hệ|people born around the same time|The younger generation uses technology more.|Thế hệ trẻ sử dụng công nghệ nhiều hơn.
heritage|/ˈherɪtɪdʒ/|noun|di sản|history and traditions of a country|Hue is a world heritage site.|Huế là di sản thế giới.
community|/kəˈmjuːnəti/|noun|cộng đồng|people living in one area|The local community helped the flood victims.|Cộng đồng địa phương đã giúp đỡ nạn nhân lũ lụt.
population|/ˌpɒpjuˈleɪʃn/|noun|dân số|the number of people living in a place|The population of the city is rising.|Dân số thành phố đang tăng.
immigrant|/ˈɪmɪɡrənt/|noun|người nhập cư|a person who comes to live in another country|Many immigrants work in the service industry.|Nhiều người nhập cư làm việc trong ngành dịch vụ.
custom|/ˈkʌstəm/|noun|phong tục|a traditional way of behaving|It is a custom to remove your shoes indoors.|Cởi giày khi vào nhà là một phong tục.
discrimination|/dɪˌskrɪmɪˈneɪʃn/|noun|sự phân biệt đối xử|treating people unfairly|Discrimination at work is illegal.|Phân biệt đối xử nơi làm việc là bất hợp pháp.
poverty|/ˈpɒvəti/|noun|sự nghèo đói|the state of being very poor|Education can help reduce poverty.|Giáo dục có thể giúp giảm nghèo.
volunteer work|/ˌvɒlənˈtɪə wɜːk/|noun|công việc tình nguyện|unpaid work to help others|Volunteer work gives you valuable experience.|Công việc tình nguyện mang lại kinh nghiệm quý giá.
urban|/ˈɜːbən/|adjective|thuộc đô thị|relating to a city|Urban areas are often polluted.|Khu vực đô thị thường bị ô nhiễm.
rural|/ˈrʊərəl/|adjective|thuộc nông thôn|relating to the countryside|Life in rural areas is quieter.|Cuộc sống ở nông thôn yên bình hơn.
values|/ˈvæljuːz/|noun|giá trị (đạo đức)|beliefs about what is important|Family values are important to me.|Giá trị gia đình rất quan trọng với tôi.
behaviour|/bɪˈheɪvjə(r)/|noun|hành vi|the way someone acts|His behaviour was unacceptable.|Hành vi của anh ta là không thể chấp nhận.
influence|/ˈɪnfluəns/|noun|sự ảnh hưởng|the power to affect someone|Parents have a strong influence on children.|Cha mẹ có ảnh hưởng lớn đến con cái.
contribute|/kənˈtrɪbjuːt/|verb|đóng góp|to give or add to something|Everyone can contribute to society.|Ai cũng có thể đóng góp cho xã hội.`,
    },
    {
      key: 'b2-science',
      topic: { vi: 'Khoa học & đổi mới', en: 'Science & innovation', ja: '科学とイノベーション' },
      words: `
research|/rɪˈsɜːtʃ/|noun|nghiên cứu|careful study to discover facts|Research shows that sleep improves memory.|Nghiên cứu cho thấy giấc ngủ cải thiện trí nhớ.
experiment|/ɪkˈsperɪmənt/|noun|thí nghiệm|a scientific test|They did an experiment in the lab.|Họ đã làm thí nghiệm trong phòng lab.
discovery|/dɪˈskʌvəri/|noun|khám phá|finding something new|The discovery of penicillin saved millions.|Việc khám phá ra penicillin đã cứu hàng triệu người.
theory|/ˈθɪəri/|noun|lý thuyết|an idea that explains something|Einstein's theory changed physics.|Lý thuyết của Einstein đã thay đổi vật lý học.
evidence|/ˈevɪdəns/|noun|bằng chứng|facts that show something is true|There is no evidence for this claim.|Không có bằng chứng nào cho tuyên bố này.
innovation|/ˌɪnəˈveɪʃn/|noun|sự đổi mới|a new idea or method|Innovation drives economic growth.|Đổi mới thúc đẩy tăng trưởng kinh tế.
breakthrough|/ˈbreɪkθruː/|noun|bước đột phá|an important discovery|Scientists made a breakthrough in cancer research.|Các nhà khoa học đã có bước đột phá trong nghiên cứu ung thư.
laboratory|/ləˈbɒrətri/|noun|phòng thí nghiệm|a room for scientific work|She works in a laboratory.|Cô ấy làm việc trong phòng thí nghiệm.
analyse|/ˈænəlaɪz/|verb|phân tích|to examine in detail|We need to analyse the data.|Chúng ta cần phân tích dữ liệu.
prove|/pruːv/|verb|chứng minh|to show that something is true|Can you prove it?|Bạn có thể chứng minh điều đó không?
scientific|/ˌsaɪənˈtɪfɪk/|adjective|thuộc khoa học|relating to science|Scientific methods must be accurate.|Phương pháp khoa học phải chính xác.
develop|/dɪˈveləp/|verb|phát triển|to grow or create|They developed a new vaccine.|Họ đã phát triển một loại vắc-xin mới.
genetic|/dʒəˈnetɪk/|adjective|thuộc về di truyền|relating to genes|Some diseases are genetic.|Một số bệnh có tính di truyền.
space exploration|/speɪs ˌekspləˈreɪʃn/|noun|thám hiểm không gian|the investigation of outer space|Space exploration is very expensive.|Thám hiểm không gian rất tốn kém.
renewable|/rɪˈnjuːəbl/|adjective|có thể tái tạo|can be replaced naturally|Wind power is a renewable resource.|Năng lượng gió là nguồn tài nguyên tái tạo.
efficient|/ɪˈfɪʃnt/|adjective|hiệu quả|working well without waste|This engine is more efficient.|Động cơ này hiệu quả hơn.
consequence|/ˈkɒnsɪkwəns/|noun|hậu quả|a result of an action|Every decision has consequences.|Mọi quyết định đều có hậu quả.
ethical|/ˈeθɪkl/|adjective|thuộc đạo đức|morally right|Is cloning ethical?|Nhân bản vô tính có hợp đạo đức không?`,
    },
    {
      key: 'b2-economy',
      topic: { vi: 'Kinh tế & tiêu dùng', en: 'Economy & consumers', ja: '経済と消費' },
      words: `
economy|/ɪˈkɒnəmi/|noun|nền kinh tế|the system of money and trade|The economy grew by 6% last year.|Nền kinh tế tăng trưởng 6% năm ngoái.
inflation|/ɪnˈfleɪʃn/|noun|lạm phát|a general rise in prices|Inflation makes food more expensive.|Lạm phát khiến thực phẩm đắt hơn.
unemployment|/ˌʌnɪmˈplɔɪmənt/|noun|thất nghiệp|the state of not having a job|Unemployment fell to 3%.|Tỷ lệ thất nghiệp giảm xuống 3%.
consumer|/kənˈsjuːmə(r)/|noun|người tiêu dùng|a person who buys goods|Consumers want cheaper products.|Người tiêu dùng muốn sản phẩm rẻ hơn.
afford|/əˈfɔːd/|verb|có đủ khả năng chi trả|to have enough money for|I can't afford a new car.|Tôi không đủ tiền mua xe mới.
budget|/ˈbʌdʒɪt/|noun|ngân sách|a plan of how to spend money|We need to stay within budget.|Chúng ta cần chi tiêu trong ngân sách.
loan|/ləʊn/|noun|khoản vay|money borrowed from a bank|He took out a loan to buy a house.|Anh ấy vay tiền để mua nhà.
invest|/ɪnˈvest/|verb|đầu tư|to put money into something to make profit|She invested in property.|Cô ấy đầu tư vào bất động sản.
profit|/ˈprɒfɪt/|noun|lợi nhuận|money gained in business|The company made a big profit.|Công ty thu được lợi nhuận lớn.
tax|/tæks/|noun|thuế|money paid to the government|Taxes pay for public services.|Thuế chi trả cho các dịch vụ công.
brand|/brænd/|noun|thương hiệu|a product name of a company|This is a famous fashion brand.|Đây là một thương hiệu thời trang nổi tiếng.
quality|/ˈkwɒləti/|noun|chất lượng|how good something is|The quality of the product is excellent.|Chất lượng sản phẩm rất tuyệt vời.
demand|/dɪˈmɑːnd/|noun|nhu cầu|the desire of people to buy something|Demand for electric cars is increasing.|Nhu cầu về xe điện đang tăng.
supply|/səˈplaɪ/|noun|nguồn cung|the amount available to buy|Supply cannot meet demand.|Nguồn cung không đáp ứng được nhu cầu.
debt|/det/|noun|nợ|money that you owe|He is trying to pay off his debt.|Anh ấy đang cố trả hết nợ.
discount|/ˈdɪskaʊnt/|noun|giảm giá|a reduction in price|Students get a 10% discount.|Sinh viên được giảm giá 10%.
refund|/ˈriːfʌnd/|noun|tiền hoàn lại|money returned to you|I asked for a refund.|Tôi đã yêu cầu hoàn tiền.
purchase|/ˈpɜːtʃəs/|verb|mua|to buy|You can purchase tickets online.|Bạn có thể mua vé trực tuyến.`,
    },
    {
      key: 'b2-media-arts',
      topic: { vi: 'Truyền thông & nghệ thuật', en: 'Media & the arts', ja: 'メディアと芸術' },
      words: `
journalist|/ˈdʒɜːnəlɪst/|noun|nhà báo|a person who writes news|The journalist interviewed the minister.|Nhà báo đã phỏng vấn bộ trưởng.
headline|/ˈhedlaɪn/|noun|tiêu đề báo|the title of a news story|The story made headlines worldwide.|Câu chuyện đã lên tiêu đề báo khắp thế giới.
broadcast|/ˈbrɔːdkɑːst/|verb|phát sóng|to send out on TV or radio|The match was broadcast live.|Trận đấu được phát sóng trực tiếp.
audience|/ˈɔːdiəns/|noun|khán giả|people watching or listening|The audience applauded loudly.|Khán giả vỗ tay rất to.
critic|/ˈkrɪtɪk/|noun|nhà phê bình|a person who judges art or films|The critics loved the new film.|Các nhà phê bình rất thích bộ phim mới.
exhibition|/ˌeksɪˈbɪʃn/|noun|cuộc triển lãm|a public show of art|We visited a photography exhibition.|Chúng tôi đã đi xem một triển lãm ảnh.
performance|/pəˈfɔːməns/|noun|màn trình diễn|acting, singing, or playing for an audience|Her performance was outstanding.|Màn trình diễn của cô ấy thật xuất sắc.
masterpiece|/ˈmɑːstəpiːs/|noun|kiệt tác|an excellent work of art|The Mona Lisa is a masterpiece.|Mona Lisa là một kiệt tác.
creative|/kriˈeɪtɪv/|adjective|sáng tạo|having original ideas|Children are very creative.|Trẻ em rất sáng tạo.
publish|/ˈpʌblɪʃ/|verb|xuất bản|to print and sell a book|Her first novel was published in 2020.|Cuốn tiểu thuyết đầu tay của cô ấy được xuất bản năm 2020.
novel|/ˈnɒvl/|noun|tiểu thuyết|a long written story|I'm reading a novel by Murakami.|Tôi đang đọc một cuốn tiểu thuyết của Murakami.
celebrity|/səˈlebrəti/|noun|người nổi tiếng|a famous person|Celebrities often influence fashion.|Người nổi tiếng thường ảnh hưởng đến thời trang.
documentary|/ˌdɒkjuˈmentri/|noun|phim tài liệu|a film about real events|I watched a documentary about whales.|Tôi đã xem phim tài liệu về cá voi.
biased|/ˈbaɪəst/|adjective|thiên vị|unfairly favouring one side|The article was biased.|Bài báo đó thiên vị.
censorship|/ˈsensəʃɪp/|noun|sự kiểm duyệt|controlling what can be published|Censorship limits freedom of speech.|Kiểm duyệt hạn chế quyền tự do ngôn luận.
entertainment|/ˌentəˈteɪnmənt/|noun|giải trí|things that amuse people|The city offers lots of entertainment.|Thành phố có rất nhiều hoạt động giải trí.
review|/rɪˈvjuː/|noun|bài đánh giá|an opinion about a film, book, etc.|The restaurant got great reviews.|Nhà hàng nhận được những đánh giá tuyệt vời.
inspire|/ɪnˈspaɪə(r)/|verb|truyền cảm hứng|to give someone ideas or motivation|Her story inspired many young people.|Câu chuyện của cô ấy đã truyền cảm hứng cho nhiều bạn trẻ.`,
    },
  ],
  C1: [
    {
      key: 'c1-politics-law',
      topic: { vi: 'Chính trị & pháp luật', en: 'Politics & law', ja: '政治と法律' },
      words: `
legislation|/ˌledʒɪsˈleɪʃn/|noun|luật pháp, sự lập pháp|laws made by a government|New legislation bans smoking in public places.|Luật mới cấm hút thuốc nơi công cộng.
accountability|/əˌkaʊntəˈbɪləti/|noun|trách nhiệm giải trình|being responsible for your actions|Voters demand greater accountability.|Cử tri đòi hỏi trách nhiệm giải trình cao hơn.
advocate|/ˈædvəkeɪt/|verb|ủng hộ, biện hộ|to publicly support|She advocates for women's rights.|Cô ấy ủng hộ quyền phụ nữ.
controversial|/ˌkɒntrəˈvɜːʃl/|adjective|gây tranh cãi|causing public disagreement|The new policy is highly controversial.|Chính sách mới gây rất nhiều tranh cãi.
enforce|/ɪnˈfɔːs/|verb|thi hành, thực thi|to make people obey a law|The police enforce the law.|Cảnh sát thực thi pháp luật.
jurisdiction|/ˌdʒʊərɪsˈdɪkʃn/|noun|quyền tài phán|the official power to make legal decisions|This case is outside our jurisdiction.|Vụ việc này nằm ngoài quyền tài phán của chúng tôi.
legitimate|/lɪˈdʒɪtɪmət/|adjective|hợp pháp, chính đáng|allowed by law; reasonable|They raised legitimate concerns.|Họ đã nêu lên những lo ngại chính đáng.
sovereignty|/ˈsɒvrənti/|noun|chủ quyền|complete power to govern a country|The nation defended its sovereignty.|Quốc gia đã bảo vệ chủ quyền của mình.
undermine|/ˌʌndəˈmaɪn/|verb|làm suy yếu|to make something weaker gradually|Corruption undermines public trust.|Tham nhũng làm suy yếu lòng tin của công chúng.
implement|/ˈɪmplɪment/|verb|thực hiện, triển khai|to put a plan into action|The government will implement the reforms next year.|Chính phủ sẽ triển khai cải cách vào năm tới.
constitution|/ˌkɒnstɪˈtjuːʃn/|noun|hiến pháp|the basic laws of a country|The constitution protects free speech.|Hiến pháp bảo vệ quyền tự do ngôn luận.
verdict|/ˈvɜːdɪkt/|noun|phán quyết|a decision made by a court|The jury reached a verdict.|Bồi thẩm đoàn đã đưa ra phán quyết.
prosecute|/ˈprɒsɪkjuːt/|verb|truy tố|to officially accuse in court|Shoplifters will be prosecuted.|Kẻ trộm đồ trong cửa hàng sẽ bị truy tố.
reform|/rɪˈfɔːm/|noun|cải cách|a change to improve a system|Education reform is long overdue.|Cải cách giáo dục lẽ ra phải làm từ lâu.
coalition|/ˌkəʊəˈlɪʃn/|noun|liên minh|a group of parties working together|A coalition government was formed.|Một chính phủ liên minh đã được thành lập.
bureaucracy|/bjʊəˈrɒkrəsi/|noun|bộ máy quan liêu|complicated official rules|Small businesses complain about bureaucracy.|Các doanh nghiệp nhỏ phàn nàn về bộ máy quan liêu.
transparency|/trænsˈpærənsi/|noun|sự minh bạch|openness and honesty|We need more transparency in government.|Chúng ta cần sự minh bạch hơn trong chính phủ.
mandate|/ˈmændeɪt/|noun|sự ủy nhiệm|the authority given by voters|The party won a clear mandate.|Đảng đó đã giành được sự ủy nhiệm rõ ràng.`,
    },
    {
      key: 'c1-mind',
      topic: { vi: 'Tâm lý & tư duy', en: 'Psychology & the mind', ja: '心理と思考' },
      words: `
cognitive|/ˈkɒɡnətɪv/|adjective|thuộc về nhận thức|relating to thinking and learning|Puzzles improve cognitive skills.|Câu đố cải thiện kỹ năng nhận thức.
perception|/pəˈsepʃn/|noun|nhận thức, cách nhìn nhận|the way you notice or understand|Public perception of the brand improved.|Nhận thức của công chúng về thương hiệu đã cải thiện.
resilience|/rɪˈzɪliəns/|noun|khả năng phục hồi|the ability to recover from difficulties|Children show remarkable resilience.|Trẻ em có khả năng phục hồi đáng kinh ngạc.
anxiety|/æŋˈzaɪəti/|noun|sự lo âu|a feeling of worry|Exams cause anxiety in many students.|Kỳ thi gây lo âu cho nhiều học sinh.
motivation|/ˌməʊtɪˈveɪʃn/|noun|động lực|the reason or desire to do something|Lack of motivation is a common problem.|Thiếu động lực là vấn đề phổ biến.
subconscious|/ˌsʌbˈkɒnʃəs/|adjective|tiềm thức|existing in the mind without awareness|Dreams reflect our subconscious fears.|Giấc mơ phản ánh nỗi sợ trong tiềm thức.
empathy|/ˈempəθi/|noun|sự đồng cảm|understanding others' feelings|Good leaders show empathy.|Lãnh đạo giỏi thể hiện sự đồng cảm.
bias|/ˈbaɪəs/|noun|thành kiến, thiên kiến|an unfair preference|We all have unconscious biases.|Ai cũng có thiên kiến vô thức.
cope with|/kəʊp wɪð/|phrasal verb|đối phó với|to deal successfully with|She copes with stress by running.|Cô ấy đối phó với căng thẳng bằng cách chạy bộ.
deteriorate|/dɪˈtɪəriəreɪt/|verb|xấu đi, suy giảm|to become worse|His health deteriorated rapidly.|Sức khỏe của ông ấy suy giảm nhanh chóng.
intuition|/ˌɪntjuˈɪʃn/|noun|trực giác|knowing something without reasoning|Trust your intuition.|Hãy tin vào trực giác của bạn.
self-esteem|/ˌself ɪˈstiːm/|noun|lòng tự trọng|confidence in your own worth|Praise can boost children's self-esteem.|Lời khen có thể nâng cao lòng tự trọng của trẻ.
stimulate|/ˈstɪmjuleɪt/|verb|kích thích|to encourage activity or growth|Music stimulates the brain.|Âm nhạc kích thích não bộ.
irrational|/ɪˈræʃənl/|adjective|phi lý|not based on reason|He has an irrational fear of spiders.|Anh ấy có nỗi sợ nhện một cách phi lý.
compulsive|/kəmˈpʌlsɪv/|adjective|có tính ám ảnh, cưỡng chế|difficult to stop doing|Compulsive phone checking is common.|Việc kiểm tra điện thoại liên tục là phổ biến.
well-being|/ˈwel biːɪŋ/|noun|sự khỏe mạnh, hạnh phúc|being healthy and happy|Exercise improves mental well-being.|Tập thể dục cải thiện sức khỏe tinh thần.
temperament|/ˈtemprəmənt/|noun|tính khí|a person's nature|She has a calm temperament.|Cô ấy có tính khí điềm tĩnh.
conscientious|/ˌkɒnʃiˈenʃəs/|adjective|tận tâm|careful and hard-working|He is a conscientious student.|Cậu ấy là một học sinh tận tâm.`,
    },
    {
      key: 'c1-discourse',
      topic: { vi: 'Diễn ngôn học thuật', en: 'Academic discourse', ja: 'アカデミックな表現' },
      words: `
albeit|/ˌɔːlˈbiːɪt/|conjunction|mặc dù|although|It was a success, albeit a small one.|Đó là một thành công, mặc dù nhỏ.
notwithstanding|/ˌnɒtwɪθˈstændɪŋ/|preposition|bất chấp|despite|Notwithstanding the costs, the project continued.|Bất chấp chi phí, dự án vẫn tiếp tục.
paradigm|/ˈpærədaɪm/|noun|mô hình, khuôn mẫu|a typical model or pattern|The internet created a new paradigm for business.|Internet đã tạo ra mô hình kinh doanh mới.
inherent|/ɪnˈhɪərənt/|adjective|vốn có|existing as a natural part|There are risks inherent in any investment.|Mọi khoản đầu tư đều có rủi ro vốn có.
ambiguous|/æmˈbɪɡjuəs/|adjective|mơ hồ|having more than one meaning|The question was ambiguous.|Câu hỏi đó mơ hồ.
comprehensive|/ˌkɒmprɪˈhensɪv/|adjective|toàn diện|including everything|The report gives a comprehensive overview.|Báo cáo đưa ra cái nhìn tổng quan toàn diện.
substantiate|/səbˈstænʃieɪt/|verb|chứng minh, củng cố|to provide evidence for|Can you substantiate these claims?|Bạn có thể chứng minh các tuyên bố này không?
preliminary|/prɪˈlɪmɪnəri/|adjective|sơ bộ|coming before the main part|Preliminary results look promising.|Kết quả sơ bộ có vẻ khả quan.
implication|/ˌɪmplɪˈkeɪʃn/|noun|hàm ý, hệ quả|a possible effect|The implications of the study are serious.|Hệ quả của nghiên cứu là nghiêm trọng.
discrepancy|/dɪsˈkrepənsi/|noun|sự chênh lệch, khác biệt|a difference between things that should match|There is a discrepancy between the two reports.|Có sự chênh lệch giữa hai báo cáo.
plausible|/ˈplɔːzəbl/|adjective|hợp lý, khả tín|seeming reasonable|That is a plausible explanation.|Đó là một lời giải thích hợp lý.
underlying|/ˌʌndəˈlaɪɪŋ/|adjective|tiềm ẩn, cơ bản|important but not obvious|We must address the underlying causes.|Chúng ta phải giải quyết các nguyên nhân sâu xa.
coherent|/kəʊˈhɪərənt/|adjective|mạch lạc|logical and well organised|Write a coherent argument.|Hãy viết một lập luận mạch lạc.
facilitate|/fəˈsɪlɪteɪt/|verb|tạo điều kiện|to make easier|Technology facilitates communication.|Công nghệ tạo điều kiện cho giao tiếp.
predominantly|/prɪˈdɒmɪnəntli/|adverb|chủ yếu|mostly|The audience was predominantly young.|Khán giả chủ yếu là người trẻ.
hypothesis|/haɪˈpɒθəsɪs/|noun|giả thuyết|an idea to be tested|The data supports the hypothesis.|Dữ liệu ủng hộ giả thuyết.
nuance|/ˈnjuːɑːns/|noun|sắc thái|a slight difference in meaning|Translation often loses nuance.|Bản dịch thường mất đi sắc thái.
scrutiny|/ˈskruːtəni/|noun|sự xem xét kỹ lưỡng|careful examination|The plan came under close scrutiny.|Kế hoạch bị xem xét kỹ lưỡng.`,
    },
  ],
};
