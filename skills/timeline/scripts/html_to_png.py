#!/usr/bin/env python3
"""
将HTML文件转换为PNG图片

使用方法:
    html_to_png.py <input.html> [output.png] [--width WIDTH] [--height HEIGHT] [--wait SECONDS] [--scale SCALE] [--fit]

参数:
    input.html: 输入的HTML文件路径
    output.png: 输出的PNG文件路径（可选，默认为input.html同名的.png文件）
    --width: 图片宽度（像素，默认1920）
    --height: 图片高度（像素，默认1080）
    --wait: 等待页面加载的时间（秒，默认2）
    --scale: 缩放倍数，用于高清输出（默认2）
    --fit: 自动适配内容大小，裁剪空白区域

示例:
    html_to_png.py diagram.html
    html_to_png.py diagram.html output.png --width 2560 --height 1440
    html_to_png.py diagram.html --fit --scale 2
"""

import sys
import argparse
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time


def html_to_png(html_path, output_path=None, width=1920, height=1080, wait_time=2, scale=2, fit_content=False):
    """
    将HTML文件转换为PNG图片
    
    Args:
        html_path: HTML文件路径
        output_path: 输出PNG文件路径（如果为None，则使用HTML文件名）
        width: 浏览器窗口宽度
        height: 浏览器窗口高度
        wait_time: 等待页面加载的时间（秒）
        scale: 缩放倍数，用于高清输出
        fit_content: 是否自动适配内容大小
    """
    html_path = Path(html_path)
    if not html_path.exists():
        raise FileNotFoundError(f"HTML文件不存在: {html_path}")
    
    if output_path is None:
        output_path = html_path.with_suffix('.png')
    else:
        output_path = Path(output_path)
    
    # 配置Chrome选项
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument(f'--window-size={width},{height}')
    chrome_options.add_argument('--disable-gpu')
    # 高DPI缩放，提升清晰度
    chrome_options.add_argument(f'--force-device-scale-factor={scale}')
    chrome_options.add_argument('--high-dpi-support=1')
    
    driver = None
    try:
        # 创建WebDriver（自动管理ChromeDriver）
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
        except Exception as e:
            # 如果webdriver-manager失败，尝试使用系统PATH中的chromedriver
            print(f"⚠️  使用webdriver-manager失败，尝试使用系统chromedriver: {e}")
            driver = webdriver.Chrome(options=chrome_options)
        
        driver.set_window_size(width, height)
        
        # 加载HTML文件
        file_url = f"file://{html_path.absolute()}"
        driver.get(file_url)
        
        # 等待页面加载
        time.sleep(wait_time)
        
        # 等待页面完全加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(("tag name", "body"))
        )
        
        if fit_content:
            # 获取内容容器的实际宽度（优先使用.container）
            content_width = driver.execute_script("""
                var container = document.querySelector('.container');
                if (container) {
                    var rect = container.getBoundingClientRect();
                    return rect.width;
                }
                return Math.max(
                    document.body.scrollWidth,
                    document.documentElement.scrollWidth
                );
            """)
            
            # 获取完整文档高度
            content_height = driver.execute_script("""
                return Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.offsetHeight,
                    document.body.clientHeight,
                    document.documentElement.clientHeight
                );
            """)
            
            # 添加边距
            padding_x = 20
            padding_y = 20
            final_width = int(content_width) + padding_x * 2
            final_height = int(content_height) + padding_y
            
            # 调整窗口大小以适配内容
            driver.set_window_size(final_width, final_height)
            time.sleep(0.5)  # 等待重新渲染
            
            # 重新计算高度（窗口调整后内容可能重排）
            new_height = driver.execute_script("""
                return Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.offsetHeight
                );
            """)
            
            if new_height > final_height - padding_y:
                driver.set_window_size(final_width, int(new_height) + padding_y)
                time.sleep(0.3)
            
            # 截取整个页面
            driver.save_screenshot(str(output_path))
        else:
            # 截图
            driver.save_screenshot(str(output_path))
        
        print(f"✅ 成功将 {html_path} 转换为 {output_path}")
        
    except Exception as e:
        print(f"❌ 转换失败: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if driver:
            driver.quit()


def main():
    parser = argparse.ArgumentParser(
        description='将HTML文件转换为PNG图片',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('input_html', help='输入的HTML文件路径')
    parser.add_argument('output_png', nargs='?', help='输出的PNG文件路径（可选）')
    parser.add_argument('--width', type=int, default=1920, help='图片宽度（像素，默认1920）')
    parser.add_argument('--height', type=int, default=1080, help='图片高度（像素，默认1080）')
    parser.add_argument('--wait', type=float, default=2.0, help='等待页面加载的时间（秒，默认2）')
    parser.add_argument('--scale', type=int, default=2, help='缩放倍数，用于高清输出（默认2）')
    parser.add_argument('--fit', action='store_true', help='自动适配内容大小，裁剪空白区域')
    
    args = parser.parse_args()
    
    html_to_png(
        args.input_html,
        args.output_png,
        args.width,
        args.height,
        args.wait,
        args.scale,
        args.fit
    )


if __name__ == "__main__":
    main()
