# Cat Defender: Ghép 3 Bắn Súng

Game ghép-3 (match-3) theo phong cách bắn súng, dùng asset "Cartoon Cat Defense" — menu đầy đủ (Chiến Đơn / Multiplayer / Cửa Hàng / Cài Đặt / Thông Tin), chiến đấu 1v1/2v2/3v3 theo lượt trên bản đồ chọn từ asset kit, đấu với zombie do AI điều khiển.

## Tính năng chính

### Menu & điều hướng
- Màn hình chính với logo thật từ asset, 5 mục menu + icon Tải Về / Bạn Bè
- **Đăng nhập cục bộ** (lưu tên trong trình duyệt — chưa có tài khoản/mật khẩu thật, xem phần "Giới hạn" bên dưới)
- **Cài Đặt**: đổi tên hiển thị, bật/tắt thông báo mời chơi, có khung đổi tên tài khoản/mật khẩu (disabled, chờ backend)
- **Thông Tin**: bản quyền Ronin-Lap
- **Cửa Hàng**: 8 vật phẩm nâng cấp lấy từ asset kit, mua bằng vàng kiếm được sau mỗi trận thắng, cộng vĩnh viễn vào ATK/DEF/HP của toàn bộ mèo

### Chiến Đơn (Solo)
- Chọn thể thức 1v1 / 2v2 / 3v3 — đội hình gồm bạn + mèo bot cùng phe, đấu theo lượt, khi 1 con gục thì con tiếp theo tự vào thay
- **Chơi theo 10 Màn (level) nối tiếp**: thắng màn hiện tại mới mở màn kế — mỗi màn tự gán bản đồ + độ khó zombie tăng dần, tiến trình lưu vào hồ sơ
- Đầy đủ roster: 15 mèo + 15 zombie (8 thường + 7 trùm)

### Trận đấu
- **Bàn cờ dùng chung, đánh theo lượt**, bot dùng đúng hiệu ứng trượt ô mượt khi ghép giống người chơi
- **Đồng hồ thời gian 3 phút cho CẢ HAI BÊN** (không phải mỗi lượt) — chỉ chạy khi tới lượt của bên đó, đổi lượt không hồi lại, chỉ ghép viên Năng Lượng (⭐ sao vàng) mới cộng thêm giây (tối đa 3:00). Hết giờ giữa lượt là thua ngay
- **Hệ thống Skill 3 cấp độ, mỗi mèo một bộ kỹ năng RIÊNG BIỆT hoàn toàn** (không dùng chung công thức): ghép viên "Skill" (xoáy tím) để tích cọc (tối đa 3), dùng cọc kích hoạt skill cấp 1/2/3 — cấp 1 rẻ nhất/yếu nhất, cấp 3 tốn nhất/mạnh nhất. Toàn bộ 15 mèo × 3 cấp = 45 hiệu ứng khác nhau, gồm: bắn nhiều phát, nổ vùng ngẫu nhiên trên bàn cờ (2x2 → 5x5), hút hết 1 loại ô trên bàn cờ, khiên miễn nhiễm sát thương, phản đòn, độc dược (mất % HP theo lượt), hút máu địch, hồi máu vượt ngưỡng (overheal), triệu hồi mèo đấm bốc hỗ trợ (mỗi lượt ghép xong tự đấm thêm, nhân sát thương theo số ô ghép được), buff nhân sát thương nhiều lượt, cộng thêm lượt đánh — xem chi tiết từng mèo trong `src/lib/skills.ts`
- **Bấm vào thẻ trạng thái mèo để mở bảng Skill** (không còn icon riêng ở đầu trang) — icon Chú Thích + Tạm Dừng gọn bên phải đầu trang; bấm icon Chú Thích xem gộp 4 loại viên đá (trước đây chiếm hẳn 1 hàng dưới bàn cờ); đã bỏ chữ "Hiệp"/"Thoát" khỏi đầu trang cho gọn (thoát trận vẫn vào được qua nút Tạm Dừng)
- **Sửa lỗi giật hình khi đổi ô**: trước đây animation trượt ô biến mất theo giờ cố định trong khi dữ liệu bàn cờ cập nhật trễ hơn, gây giật về hình cũ rồi mới nhảy sang hình mới — giờ animation chỉ biến mất đúng lúc bàn cờ thật sự đổi, mượt hoàn toàn
- **Cơ chế chống trận kéo dài vô tận**: sau 60 giây, sát thương cả 2 bên tăng x1.5 (có badge ⚔️ báo hiệu); sau 120 giây, 1 quả bom (icon TNT thật) xuất hiện ngẫu nhiên trên bàn cờ và rơi dần xuống đáy theo từng lượt đánh — chạm đáy sẽ nổ vùng 3x3 + gây sát thương thẳng cho phe đối lập của người vừa đánh
- **Mỗi loại viên đá có tia năng lượng bay về phía thẻ trạng thái liên quan** khi ghép nổ — đường bay cong nhẹ, lấp lánh, kèm bộ hiệu ứng lấp lánh riêng (số lượng/màu khác nhau) cho từng loại viên đá
- **Lượt đi hiển thị bằng viền phát sáng xanh dương (bạn) / đỏ (địch)** quanh khung trạng thái, không còn chữ "Lượt của bạn/đối thủ" chiếm chỗ trên bản đồ
- **Icon trạng thái đang hoạt động** hiện thành 1 hàng riêng dưới 2 khung trạng thái: 🛡️ miễn sát thương, 🔁 phản đòn, 🔥 tăng sát thương nhiều lượt, ⚡ đòn tiếp theo tăng sát thương, 🥊 mèo đấm bốc hỗ trợ, ☠️ trúng độc (bên địch) — kèm số lượt/số lần còn lại
- **Xem trước nhân vật**: chạm vào 1 mèo ở màn chọn đội hình sẽ mở bảng xem trước — coi hoạt ảnh Đứng yên/Bắn/Gục ngã và đọc mô tả cả 3 skill trước khi chọn
- **Thêm lượt khi ghép lớn**: ghép 4 viên +1 lượt, ghép 5 viên +2 lượt (cả 2 bên)
- **Gợi ý nước đi**: nếu bạn không thao tác gì trong 10 giây, 2 ô có thể ghép được sẽ nhấp nháy gợi ý
- **Nút Tạm Dừng** dùng khung/nút thật từ asset, dừng cả đồng hồ lẫn AI
- **Chỉ báo lượt đi hiện ngay trên bản đồ chiến trường** (không còn ở thanh trên cùng)
- **Zombie hiển thị to hơn mèo** (đúng tỉ lệ "trùm quái" nên nhìn hợp lý hơn), bản đồ phủ kín toàn khung không còn viền hở
- **Nền chiến trường lấy từ bản đồ đã chọn**, popup Thắng/Thua dùng banner "YOU WIN"/"YOU LOSE" thật
- **Đạn bắn ra đúng nòng súng của từng mèo** (mỗi mèo cầm súng ở độ cao khác nhau, đã hiệu chỉnh riêng cho cả 15 con)
- **Hoạt ảnh nổ theo 2 giai đoạn rõ ràng và chậm hơn**: nổ trước → rơi ô mới xuống xong → mới tính ghép nối tiếp, mắt kịp theo dõi từng bước
- **Hiệu ứng nổ chi tiết hơn + giãn nhịp giữa các vụ nổ liên tiếp** (skill nổ vùng nhiều lần) để mắt kịp theo dõi
- Zombie đánh cận chiến bằng animation gốc của nó (không bắn đạn giả), có hiệu ứng nổ nhỏ khi cận chiến trúng đòn; mèo vẫn bắn đạn thật bay sang
- **Thông báo trạng thái dạng toast** nổi lên tạm thời (không còn khung log cuộn dài)

## ⚠️ Giới hạn hiện tại (cần backend thật)
Các phần sau **cần một máy chủ backend** (database, xác thực, kết nối thời gian thực) mà project này — vốn chỉ là ứng dụng Next.js tĩnh — **chưa có**:
- **Multiplayer thật** (tạo phòng, mời người chơi khác, đấu online) — màn Multiplayer hiện chỉ là giao diện demo, bấm "Chơi thử với Bot" sẽ vào chế độ Chiến Đơn (đấu với zombie, chưa phải "bot dùng mèo + skill như người thật" — phần này cần thêm 1 vòng phát triển riêng để đồng bộ hệ thống skill cho AI và đổi cấu trúc sprite địch từ zombie sang mèo)
- **Tài khoản/mật khẩu an toàn** — đăng nhập hiện tại chỉ lưu tên trong trình duyệt (localStorage), không có mã hóa/bảo mật thật
- **Bạn bè online, thông báo mời chơi thật** — cần hệ thống presence + push notification từ server

Nếu bạn muốn làm phần này thành thật, cách nhanh nhất là nối Supabase (auth + database + realtime) — nói mình biết để triển khai tiếp.

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

## Cấu trúc thư mục
```
src/
  app/page.tsx                # điều hướng toàn bộ: menu, đăng nhập, chọn đội/map, chiến đấu, kết quả
  components/
    MainMenu.tsx, LoginScreen.tsx, SettingsScreen.tsx, InfoScreen.tsx,
    MultiplayerScreen.tsx, ShopScreen.tsx   # các màn hình menu
    AnimatedSprite.tsx           # sprite-sheet animation bằng CSS steps()
    BattleScreen.tsx              # màn chiến đấu: team battle, lượt đi, đồng hồ 2 bên, skill, hint
    Match3Grid.tsx, TileIcon.tsx, Effects.tsx  # engine ghép-3 (bàn cờ, viên đá, nổ, đạn, toast)
  lib/
    board.ts                    # sinh bàn cờ, tìm match, AI tìm nước đi tốt nhất
    gameData.ts                   # 15 mèo + 15 zombie + 8 vật phẩm cửa hàng
    skills.ts                      # bộ skill 3 cấp theo 4 hệ (burst/shield/heal/multi)
    maps.ts                        # 5 bản đồ từ asset kit
    profile.ts                      # lưu hồ sơ người chơi cục bộ (tên, vàng, nâng cấp)
    types.ts
public/
  sprites/    # animation mèo/zombie, hiệu ứng nổ, ảnh bản đồ (5 map field + thumbnail)
  ui/          # popup Thắng/Thua, khung tạm dừng, nút bấm, icon cửa hàng, logo — từ asset kit gốc
```
