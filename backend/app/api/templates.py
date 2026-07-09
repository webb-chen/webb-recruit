"""话术模板管理API - 模板的增删改查"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.models.template import Template

router = APIRouter(prefix="/templates", tags=["话术模板"])


@router.post("", response_model=ApiResponse[TemplateResponse])
async def create_template(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建话术模板"""
    template = Template(user_id=current_user.id, **template_data.model_dump())
    db.add(template)
    await db.flush()
    await db.refresh(template)
    return ApiResponse(data=TemplateResponse.model_validate(template))


@router.get("", response_model=ApiResponse[PaginatedResponse[TemplateResponse]])
async def list_templates(
    platform: Optional[str] = Query(None, description="平台筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取话术模板列表"""
    query = select(Template).where(Template.user_id == current_user.id)
    count_query = select(Template.id).where(Template.user_id == current_user.id)

    if platform:
        query = query.where(Template.platform == platform)
        count_query = count_query.where(Template.platform == platform)

    query = query.order_by(Template.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    from sqlalchemy import func
    total_result = await db.execute(
        select(func.count(Template.id)).where(Template.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    result = await db.execute(query)
    templates = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return ApiResponse(data=PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[TemplateResponse.model_validate(t) for t in templates],
        total_pages=total_pages,
    ))


@router.get("/{template_id}", response_model=ApiResponse[TemplateResponse])
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取模板详情"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="模板不存在")
    return ApiResponse(data=TemplateResponse.model_validate(template))


@router.put("/{template_id}", response_model=ApiResponse[TemplateResponse])
async def update_template(
    template_id: int,
    template_data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新话术模板"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="模板不存在")

    update_data = template_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)

    await db.flush()
    await db.refresh(template)
    return ApiResponse(data=TemplateResponse.model_validate(template))


@router.delete("/{template_id}", response_model=ApiResponse)
async def remove_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除话术模板"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.user_id == current_user.id
        )
    )
    template = result.scalar_one_or_none()
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="模板不存在")
    await db.delete(template)
    await db.flush()
    return ApiResponse(message="删除成功")
