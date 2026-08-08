# Cat Defender: Ghép 3 Bắn Súng

Game ghép-3 (match-3) theo phong cách bắn súng, dùng asset "Cartoon Cat Defense" — chọn 1 trong 15 boss mèo, ghép biểu tượng để bắn/phòng thủ/hồi máu/nạp năng lượng kéo dài thời gian, đấu solo theo lượt với 1 trong 15 zombie do AI điều khiển trên cùng 1 bàn cờ.

## Tính năng
- **Đầy đủ roster của asset kit**: 15 boss mèo + 15 zombie (8 thường + 7 trùm), mỗi con có animation idle/bắn (mèo) hoặc idle/tấn công/chết (zombie) thật, không phải ảnh tĩnh
- **Bàn cờ dùng chung, đánh theo lượt**: mèo và địch thay phiên nhau ghép trên CÙNG một bàn cờ — đến lượt ai người đó đánh
- **Đồng hồ thời gian 3 phút cho cả trận**: mỗi trận bắt đầu với 3:00, chỉ chạy khi tới lượt bạn, **đổi lượt qua lại không hồi lại thời gian** — chỉ ghép viên Năng Lượng mới cộng thêm giây (tối đa cộng lại đến mốc 3:00, không vượt quá). Hết giờ giữa lượt của bạn là thua ngay
- **Nút Tạm Dừng**: dừng đồng hồ + dừng AI, hiện popup dùng đúng khung/nút từ asset kit, có thể Tiếp tục hoặc Thoát trận
- **Thêm lượt khi ghép lớn**: ghép 4 viên +1 lượt, ghép 5 viên +2 lượt (áp dụng cho cả bạn lẫn địch)
- **Nền chiến trường + popup Thắng/Thua dùng ảnh gốc từ asset kit** ("YOU WIN"/"YOU LOSE" banner thật, không phải chữ tự vẽ)
- **Zombie đánh cận chiến đúng chất**: dùng animation tấn công có sẵn của chúng, không bắn đạn giả — chỉ có hiệu ứng nổ nhỏ (lấy từ asset Explosion) khi cận chiến trúng đòn. Mèo vẫn bắn đạn thật bay sang
- **Hoạt ảnh ghép mượt**: ô trượt mượt khi đổi chỗ; viên mới rơi từ trên xuống có nảy nhẹ
- **Mèo có hiệu ứng gục ngã** khi thua (đổ nghiêng, mờ dần — asset gốc không có khung "chết" riêng cho mèo nên mô phỏng bằng CSS)
- **Log trận đấu nằm ngay dưới khung chiến trường**
- Giao diện portrait tối ưu điện thoại

## Về âm thanh
Asset kit này **không kèm file âm thanh nào** (chỉ có hình ảnh + rig Spine) — game hiện chưa có nhạc/SFX. Nếu bạn có file âm thanh riêng muốn thêm vào, gửi cho mình để tích hợp.

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
Asset gốc có sẵn animation nhiều khung hình (idle 20 khung, bắn 10 khung, tấn công 25-40 khung, chết 50-60 khung). Thay vì dùng tất cả (quá nặng), mình lấy mẫu 9-10 khung mỗi animation rồi ghép thành 1 dải ảnh ngang (`public/sprites/*.png`), sau đó dùng component `AnimatedSprite.tsx` chạy animation bằng CSS `steps()` thuần túy (không cần JS re-render từng khung) — nhẹ và mượt.

## Cấu trúc thư mục
```
src/
  app/page.tsx              # chọn mèo → chọn đối thủ → chiến đấu → kết quả
  components/
    AnimatedSprite.tsx        # component chạy sprite-sheet animation bằng CSS steps()
    BattleScreen.tsx           # màn chiến đấu: bàn cờ chung, lượt đi, đồng hồ thời gian, tạm dừng
    Match3Grid.tsx, TileIcon.tsx, Effects.tsx  # engine ghép-3 dùng chung (bàn cờ, viên đá, hiệu ứng, đạn, impact)
  lib/
    board.ts                 # sinh bàn cờ, tìm match, resolve cascade, AI tìm nước đi tốt nhất
    gameData.ts                # dữ liệu 15 mèo + 15 zombie, đường dẫn sprite
    types.ts                    # type definitions
public/
  sprites/                    # dải ảnh animation cho mèo/zombie + hiệu ứng nổ + nền chiến trường
  ui/                          # popup Thắng/Thua, khung tạm dừng, nút bấm — lấy từ asset kit gốc
```

## Mở rộng tiếp theo (gợi ý)
- Thêm bản đồ/level select giống game trước (asset đã có sẵn trong `Preview/Ui/2.png` — màn "Level Select" rất đẹp)
- Thêm cửa hàng nâng cấp vũ khí (asset đã có sẵn icon UI phù hợp trong `Png/Ui`)
- Lưu tiến trình bằng localStorage giống game trước
- Thêm âm thanh nếu có file riêng
