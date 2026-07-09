"""Playwright浏览器自动化服务 - 实现招聘平台自动打招呼等操作"""

import json
import asyncio
import logging
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


class PlaywrightService:
    """Playwright浏览器自动化服务"""

    def __init__(self):
        """初始化服务"""
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    async def launch(self, cookies: Optional[str] = None):
        """启动浏览器并加载Cookie

        Args:
            cookies: JSON格式的Cookie字符串
        """
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        )

        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )

        # 加载Cookie
        if cookies:
            try:
                cookie_list = json.loads(cookies)
                if isinstance(cookie_list, list):
                    await self.context.add_cookies(cookie_list)
                logger.info("Cookie加载成功")
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Cookie加载失败: {e}")

        self.page = await self.context.new_page()

    async def close(self):
        """关闭浏览器和Playwright"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception as e:
            logger.error(f"关闭浏览器异常: {e}")
        finally:
            self.page = None
            self.context = None
            self.browser = None
            self.playwright = None

    async def navigate_to_job_page(self, encrypt_job_id: str) -> bool:
        """导航到职位候选人列表页面

        Args:
            encrypt_job_id: 加密的职位ID

        Returns:
            是否成功导航
        """
        if not self.page:
            logger.error("浏览器未初始化")
            return False

        try:
            url = f"https://www.zhipin.com/web/geek/job-detail/{encrypt_job_id}"
            await self.page.goto(url, wait_until="networkidle", timeout=30000)
            logger.info(f"成功导航到职位页面: {encrypt_job_id}")
            return True
        except Exception as e:
            logger.error(f"导航到职位页面失败: {e}")
            return False

    async def get_candidate_list(self) -> list:
        """从当前页面获取候选人列表

        Returns:
            候选人信息列表
        """
        if not self.page:
            logger.error("浏览器未初始化")
            return []

        candidates = []
        try:
            # 等待候选人列表加载
            await self.page.wait_for_selector(".job-card-wrapper, .resume-list", timeout=10000)

            # 解析候选人卡片
            cards = await self.page.query_selector_all(".job-card-wrapper")
            for card in cards:
                try:
                    name_el = await card.query_selector(".name")
                    name = await name_el.inner_text() if name_el else ""

                    info_el = await card.query_selector(".info-primary")
                    info = await info_el.inner_text() if info_el else ""

                    candidates.append({
                        "name": name.strip(),
                        "info": info.strip(),
                    })
                except Exception as e:
                    logger.warning(f"解析候选人卡片失败: {e}")
                    continue

            logger.info(f"获取到 {len(candidates)} 个候选人")
        except Exception as e:
            logger.error(f"获取候选人列表失败: {e}")

        return candidates

    async def say_hello_to_candidate(
        self,
        candidate_info: Dict[str, Any],
        hello_text: str,
    ) -> Dict[str, Any]:
        """对单个候选人执行打招呼操作

        Args:
            candidate_info: 候选人信息字典
            hello_text: 打招呼话术

        Returns:
            操作结果字典，包含success状态和详细信息
        """
        result = {
            "success": False,
            "candidate_name": candidate_info.get("name", "未知"),
            "message": "",
            "timestamp": datetime.utcnow().isoformat(),
        }

        if not self.page:
            result["message"] = "浏览器未初始化"
            return result

        try:
            # 查找打招呼按钮
            start_btn = await self.page.query_selector(".start-chat-btn, .btn-start-chat")
            if not start_btn:
                # 尝试点击候选人卡片
                card = await self.page.query_selector(".job-card-wrapper")
                if card:
                    await card.click()
                    await asyncio.sleep(1)
                start_btn = await self.page.query_selector(".start-chat-btn, .btn-start-chat")

            if not start_btn:
                result["message"] = "未找到打招呼按钮"
                return result

            await start_btn.click()
            await asyncio.sleep(1)

            # 在聊天输入框中输入话术
            input_box = await self.page.query_selector(".chat-input, textarea")
            if input_box:
                await input_box.fill(hello_text)
                await asyncio.sleep(0.5)

                # 点击发送按钮
                send_btn = await self.page.query_selector(".btn-send, .chat-submit")
                if send_btn:
                    await send_btn.click()
                    await asyncio.sleep(0.5)
                    result["success"] = True
                    result["message"] = "打招呼成功"
                else:
                    result["message"] = "未找到发送按钮"
            else:
                result["message"] = "未找到聊天输入框"

        except Exception as e:
            result["message"] = f"打招呼操作异常: {str(e)}"
            logger.error(f"打招呼操作失败: {e}")

        return result

    async def get_page_cookies(self) -> str:
        """获取当前页面的Cookie

        Returns:
            JSON格式的Cookie字符串
        """
        if not self.context:
            return "[]"
        cookies = await self.context.cookies()
        return json.dumps(cookies, ensure_ascii=False)

    async def screenshot(self, path: str = "/tmp/screenshot.png"):
        """截取当前页面截图

        Args:
            path: 截图保存路径

        Returns:
            截图是否成功
        """
        if not self.page:
            return False
        try:
            await self.page.screenshot(path=path, full_page=True)
            return True
        except Exception as e:
            logger.error(f"截图失败: {e}")
            return False


async def execute_say_hello_flow(
    cookies: str,
    encrypt_job_id: str,
    hello_text: str,
    max_times: int = 100,
) -> Dict[str, Any]:
    """执行完整的打招呼自动化流程

    Args:
        cookies: 登录Cookie
        encrypt_job_id: 加密职位ID
        hello_text: 打招呼话术
        max_times: 最大打招呼次数

    Returns:
        流程执行结果统计
    """
    service = PlaywrightService()
    stats = {
        "total_attempted": 0,
        "success_count": 0,
        "fail_count": 0,
        "errors": [],
        "details": [],
    }

    try:
        await service.launch(cookies=cookies)

        if not await service.navigate_to_job_page(encrypt_job_id):
            stats["errors"].append("无法导航到职位页面")
            return stats

        candidates = await service.get_candidate_list()

        for candidate in candidates[:max_times]:
            stats["total_attempted"] += 1
            result = await service.say_hello_to_candidate(candidate, hello_text)
            stats["details"].append(result)

            if result["success"]:
                stats["success_count"] += 1
            else:
                stats["fail_count"] += 1

            # 操作间隔，避免被反爬
            await asyncio.sleep(2)

    except Exception as e:
        stats["errors"].append(str(e))
        logger.error(f"打招呼流程异常: {e}")
    finally:
        await service.close()

    return stats
