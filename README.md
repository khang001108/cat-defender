# Cat Defender: Ghép 3 Bắn Súng

Game ghép-3 (match-3) theo phong cách bắn súng, dùng asset "Cartoon Cat Defense" — chọn 1 trong 4 boss mèo, ghép biểu tượng để bắn/phòng thủ/hồi máu/tích đạn đặc biệt, đấu solo với zombie cún do AI điều khiển.

Đây là bản MVP tập trung vào lối chơi cốt lõi (chọn mèo → chọn đối thủ → chiến đấu → chơi lại), chưa có bản đồ/cửa hàng/lên cấp — sẽ mở rộng thêm sau khi lối chơi chính đã ổn.

## Tính năng
- **8 boss zombie** để đấu (5 thường + 3 trùm), mỗi con có animation idle + tấn công + chết thật
- **4 boss mèo** để chọn, mỗi con có animation idle + bắn thật (frame-by-frame, không phải ảnh tĩnh)
- **Bàn cờ dùng chung, đánh theo lượt**: mèo và địch thay phiên nhau ghép trên CÙNG một bàn cờ — đến lượt ai người đó đánh
- **Đồng hồ thời gian cho cả trận** (không phải mỗi lượt): mỗi mèo có sẵn 1 lượng thời gian ban đầu (tùy chỉ số MP của mèo), thời gian chỉ chạy khi tới lượt bạn và cạn dần liên tục — **đổi lượt không hồi thời gian**, chỉ có ghép viên Năng Lượng mới cộng thêm giây. Hết giờ giữa lượt của bạn là thua ngay
- **Thêm lượt khi ghép lớn**: ghép 4 viên +1 lượt, ghép 5 viên +2 lượt (áp dụng cho cả bạn lẫn địch)
- **Nền chiến trường lấy từ asset gốc** (con hẻm đường phố), không còn nền trơn
- **Hiệu ứng đạn bắn thật**: viên đạn bay từ người bắn sang mục tiêu mỗi khi có sát thương
- **Hoạt ảnh ghép mượt**: ô trượt mượt khi đổi chỗ; viên mới rơi từ trên xuống có nảy nhẹ
- **Mèo có hiệu ứng gục ngã** khi thua (đổ nghiêng, mờ dần)
- **Popup kết quả (thắng/thua) hiện giữa màn hình**, không cần cuộn xuống mới thấy
- **Log trận đấu nằm ngay dưới khung chiến trường**, dễ theo dõi diễn biến
- Giao diện portrait tối ưu điện thoại

## Chạy thử local
```bash
npm install
npm run dev
```

## Deploy qua GitHub + Vercel
```bash
git init
git add .
git commit -m "Cat Defender - initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```
Sau đó vào https://vercel.com → Add New Project → chọn repo vừa push → Deploy.

## Hoạt ảnh nhân vật (kỹ thuật)
Asset gốc có sẵn animation nhiều khung hình (idle 20 khung, bắn 10 khung, đi 35 khung, tấn công 25-40 khung, chết 50-60 khung). Thay vì dùng tất cả (quá nặng), mình đã lấy mẫu 9-10 khung mỗi animation rồi ghép thành 1 dải ảnh ngang (`public/sprites/*.png`), sau đó dùng component `AnimatedSprite.tsx` chạy animation bằng CSS `steps()` thuần túy (không cần JS re-render từng khung) — nhẹ và mượt.

## Cấu trúc thư mục
```
src/
  app/page.tsx              # chọn mèo → chọn đối thủ → chiến đấu → kết quả
  components/
    AnimatedSprite.tsx        # component chạy sprite-sheet animation bằng CSS steps()
    BattleScreen.tsx           # màn chiến đấu (tái dùng engine ghép-3 từ game trước)
    Match3Grid.tsx, TileIcon.tsx, Effects.tsx  # engine ghép-3 dùng chung (bàn cờ, viên đá, hiệu ứng)
  lib/
    board.ts                 # sinh bàn cờ, tìm match, resolve cascade (dùng chung)
    gameData.ts                # dữ liệu 4 mèo + 2 đối thủ, đường dẫn sprite
    types.ts                    # type definitions
public/sprites/               # dải ảnh animation (idle/shoot/walk/attack/dead) cho mèo và zombie
```

## Mở rộng tiếp theo (gợi ý)
- Thêm bản đồ/level select giống game trước (asset đã có sẵn trong `Preview/Ui/2.png` — màn "Level Select" rất đẹp)
- Thêm cửa hàng nâng cấp vũ khí (asset đã có sẵn icon UI phù hợp)
- Thêm nhiều mèo/quái hơn (asset kit có tổng cộng 15 mèo, 8 quái thường, 7 boss chưa dùng hết)
- Lưu tiến trình bằng localStorage giống game trước
