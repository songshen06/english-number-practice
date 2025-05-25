from gtts import gTTS
import os

# 定义要生成数字的范围
start_number = 1
end_number = 100

# 定义保存音频文件的目录
output_directory = "audio" # 这个目录将与你的 index.html 在同一级别

# 创建输出目录 (如果它还不存在)
if not os.path.exists(output_directory):
    os.makedirs(output_directory)
    print(f"目录 '{output_directory}' 已创建。")
else:
    print(f"目录 '{output_directory}' 已存在。")

print(f"\n开始生成从 {start_number} 到 {end_number} 的音频文件...")

for number in range(start_number, end_number + 1):
    text_to_speak = str(number)  # 要转换为语音的文本
    filename = os.path.join(output_directory, f"{number}.mp3")

    try:
        # 创建 gTTS 对象
        # lang='en' 表示英语
        # slow=False 表示正常语速 (True 会比较慢，适合初学者)
        tts = gTTS(text=text_to_speak, lang='en', slow=False)

        # 保存音频文件
        tts.save(filename)
        print(f"成功生成: {filename}")

    except Exception as e:
        print(f"生成 '{filename}' 时发生错误: {e}")
        print("请检查你的网络连接，或 gTTS 是否有访问 Google Translate 的权限。")

print("\n所有音频文件生成完毕！")
print(f"文件保存在 '{output_directory}' 目录下。")