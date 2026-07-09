"""候选人模型 - 存储从各平台抓取的候选人信息"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Candidate(Base):
    """候选人模型"""
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True, comment="候选人ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="所属用户ID")
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True, comment="关联职位ID")
    platform = Column(String(50), nullable=False, default="boss", comment="来源平台")
    boss_encrypt_user_id = Column(String(100), nullable=True, index=True, comment="BOSS平台加密用户ID")
    name = Column(String(100), nullable=True, comment="候选人姓名")
    gender = Column(String(10), nullable=True, comment="性别")
    age = Column(Integer, nullable=True, comment="年龄")
    educational = Column(String(50), nullable=True, comment="学历")
    expected_city = Column(String(100), nullable=True, comment="期望城市")
    expected_job_name = Column(String(200), nullable=True, comment="期望职位")
    expected_salary_min = Column(Integer, nullable=True, comment="期望薪资下限")
    expected_salary_max = Column(Integer, nullable=True, comment="期望薪资上限")
    job_intention = Column(String(200), nullable=True, comment="求职意向")
    phone = Column(String(20), nullable=True, comment="手机号")
    weixin = Column(String(50), nullable=True, comment="微信号")
    resume_link = Column(String(500), nullable=True, comment="简历链接")
    work_company = Column(String(200), nullable=True, comment="当前/最近工作单位")
    # 状态: 0=待处理, 1=已打招呼, 2=已复聊, 3=已查看简历, 4=已获取联系方式, 5=已归档
    status = Column(Integer, default=0, index=True, comment="状态(0待处理/1已打招呼/2已复聊/3已查看简历/4已获取联系方式/5已归档)")
    lock_status = Column(Integer, default=0, comment="锁定状态(0未锁定/1已锁定)")
    lock_user_id = Column(Integer, nullable=True, comment="锁定操作用户ID")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关联关系
    user = relationship("User", back_populates="candidates")
    job = relationship("Job", back_populates="candidates")
    messages = relationship("Message", back_populates="candidate", lazy="selectin")
