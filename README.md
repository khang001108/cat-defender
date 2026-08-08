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
- Chọn bản đồ: **cả 5 bản đồ có trong asset kit** đều dùng được, xem trước bằng ảnh thumbnail thật
- Đầy đủ roster: 15 mèo + 15 zombie (8 thường + 7 trùm)

### Trận đấu
- **Bàn cờ dùng chung, đánh theo lượt**, bot dùng đúng hiệu ứng trượt ô mượt khi ghép giống người chơi
- **Đồng hồ thời gian 3 phút cho CẢ HAI BÊN** (không phải mỗi lượt) — chỉ chạy khi tới lượt của bên đó, đổi lượt không hồi lại, chỉ ghép viên Năng Lượng mới cộng thêm giây (tối đa 3:00). Hết giờ giữa lượt là thua ngay
- **Hệ thống Skill 3 cấp độ, mỗi mèo một bộ kỹ năng RIÊNG BIỆT hoàn toàn** (không dùng chung công thức): ghép viên "Skill" (ô sao) để tích cọc (tối đa 3), dùng cọc kích hoạt skill cấp 1/2/3 — cấp 1 rẻ nhất/yếu nhất, cấp 3 tốn nhất/mạnh nhất. Toàn bộ 15 mèo × 3 cấp = 45 hiệu ứng khác nhau, gồm: bắn nhiều phát, nổ vùng ngẫu nhiên trên bàn cờ (2x2 → 5x5), hút hết 1 loại ô trên bàn cờ, khiên miễn nhiễm sát thương, phản đòn, độc dược (mất % HP theo lượt), hút máu địch, hồi máu vượt ngưỡng (overheal), triệu hồi mèo đấm bốc hỗ trợ, buff nhân sát thương nhiều lượt, cộng thêm lượt đánh — xem chi tiết từng mèo trong `src/lib/skills.ts`
- **Thêm lượt khi ghép lớn**: ghép 4 viên +1 lượt, ghép 5 viên +2 lượt (cả 2 bên)
- **Gợi ý nước đi**: nếu bạn không thao tác gì trong 10 giây, 2 ô có thể ghép được sẽ nhấp nháy gợi ý
- **Nút Tạm Dừng** dùng khung/nút thật từ asset, dừng cả đồng hồ lẫn AI
- **Nền chiến trường lấy từ bản đồ đã chọn**, popup Thắng/Thua dùng banner "YOU WIN"/"YOU LOSE" thật
- **Hiệu ứng nổ chi tiết hơn** khi ghép trúng (dùng sprite nổ thật từ asset, không phải hình vẽ SVG đơn giản)
- Zombie đánh cận chiến bằng animation gốc của nó (không bắn đạn giả), có hiệu ứng nổ nhỏ khi cận chiến trúng đòn; mèo vẫn bắn đạn thật bay sang
- **Thông báo trạng thái dạng toast** nổi lên tạm thời (không còn khung log cuộn dài)

## ⚠️ Giới hạn hiện tại (cần backend thật)
Các phần sau **cần một máy chủ backend** (database, xác thực, kết nối thời gian thực) mà project này — vốn chỉ là ứng dụng Next.js tĩnh — **chưa có**:
- **Multiplayer thật** (tạo phòng, mời người chơi khác, đấu online) — màn Multiplayer hiện chỉ là giao diện demo, bấm "Chơi thử với Bot" sẽ vào chế độ Chiến Đơn
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
