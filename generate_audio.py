from gtts import gTTS
import os
import csv
import argparse

def generate_audio(text, output_path, lang='en', slow=False):
    """生成单个音频文件"""
    try:
        tts = gTTS(text=text, lang=lang, slow=slow)
        tts.save(output_path)
        print(f"成功生成: {output_path}")
        return True
    except Exception as e:
        print(f"生成 '{output_path}' 时发生错误: {e}")
        print("请检查你的网络连接，或 gTTS 是否有访问 Google Translate 的权限。")
        return False

def generate_numbers(start, end, output_dir):
    """生成数字音频文件"""
    print(f"\n开始生成从 {start} 到 {end} 的音频文件...")
    for number in range(start, end + 1):
        text = str(number)
        filename = os.path.join(output_dir, f"{number}.mp3")
        generate_audio(text, filename)

def generate_from_wordlist(wordlist_file, output_dir):
    """从单词列表生成音频文件"""
    print(f"\n开始从文件 {wordlist_file} 生成单词音频...")
    with open(wordlist_file, 'r', encoding='utf-8') as f:
        words = [line.strip() for line in f if line.strip()]
    
    for word in words:
        # 使用单词作为文件名，但移除特殊字符
        safe_filename = "".join(c for c in word if c.isalnum() or c in (' ', '-', '_')).strip()
        filename = os.path.join(output_dir, f"{safe_filename}.mp3")
        generate_audio(word, filename)

def generate_from_dialogue(dialogue_file, output_dir):
    """从对话列表生成音频文件"""
    print(f"\n开始从文件 {dialogue_file} 生成对话音频...")
    with open(dialogue_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for index, row in enumerate(reader, 1):
            if len(row) >= 2:
                speaker, text = row[0], row[1]
                # 使用序号_说话者作为文件名
                filename = os.path.join(output_dir, f"{index:02d}_{speaker}.mp3")
                generate_audio(text, filename)
                # 同时保存一个文本文件，记录序号和对应的对话内容
                with open(os.path.join(output_dir, 'dialogue_mapping.txt'), 'a', encoding='utf-8') as map_file:
                    map_file.write(f"{index:02d}_{speaker}.mp3|{text}\n")

def generate_from_sentences(sentence_file, output_dir):
    """从句子列表生成音频文件"""
    print(f"\n开始从文件 {sentence_file} 生成句子音频...")
    with open(sentence_file, 'r', encoding='utf-8') as f:
        sentences = [line.strip() for line in f if line.strip()]
    
    for index, sentence in enumerate(sentences, 1):
        # 使用序号作为文件名前缀
        safe_filename = f"{index:02d}_{sentence[:30]}".replace(' ', '_')
        safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in ('-', '_'))
        filename = os.path.join(output_dir, f"{safe_filename}.mp3")
        generate_audio(sentence, filename)
        # 同时保存一个文本文件，记录序号和对应的句子内容
        with open(os.path.join(output_dir, 'sentence_mapping.txt'), 'a', encoding='utf-8') as map_file:
            map_file.write(f"{safe_filename}.mp3|{sentence}\n")

def main():
    parser = argparse.ArgumentParser(description='生成英语音频文件')
    parser.add_argument('--mode', choices=['numbers', 'words', 'dialogue', 'sentences'], required=True,
                      help='生成模式：numbers(数字), words(单词列表), dialogue(对话列表), sentences(句子列表)')
    parser.add_argument('--output', default='audio',
                      help='输出目录 (默认: audio)')
    parser.add_argument('--start', type=int, default=1,
                      help='数字模式的起始数字 (默认: 1)')
    parser.add_argument('--end', type=int, default=100,
                      help='数字模式的结束数字 (默认: 100)')
    parser.add_argument('--input', 
                      help='输入文件路径 (用于单词列表、对话列表或句子列表模式)')
    
    args = parser.parse_args()
    
    # 创建输出目录
    if not os.path.exists(args.output):
        os.makedirs(args.output)
        print(f"目录 '{args.output}' 已创建。")
    else:
        print(f"目录 '{args.output}' 已存在。")
    
    # 根据模式执行相应的生成函数
    if args.mode == 'numbers':
        generate_numbers(args.start, args.end, args.output)
    elif args.mode == 'words':
        if not args.input:
            print("错误：单词列表模式需要指定输入文件 (--input)")
            return
        generate_from_wordlist(args.input, args.output)
    elif args.mode == 'dialogue':
        if not args.input:
            print("错误：对话列表模式需要指定输入文件 (--input)")
            return
        generate_from_dialogue(args.input, args.output)
    elif args.mode == 'sentences':
        if not args.input:
            print("错误：句子列表模式需要指定输入文件 (--input)")
            return
        generate_from_sentences(args.input, args.output)

if __name__ == '__main__':
    main()