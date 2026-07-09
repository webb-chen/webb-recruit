/**
 * Webb招聘助手 - 统计卡片组件
 * 用于仪表盘中展示关键指标数据
 */
import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { StatisticProps } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  suffix?: string;
  prefix?: string;
  trend?: number; // 趋势百分比，正数表示上升
  loading?: boolean;
  style?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  suffix,
  prefix,
  trend,
  loading = false,
  style,
  valueStyle,
}) => {
  return (
    <Card
      loading={loading}
      hoverable
      style={{
        borderRadius: 8,
        ...style,
      }}
      bodyStyle={{ padding: '24px 20px' }}
    >
      <Statistic
        title={
          <span style={{ fontSize: 14, color: '#666' }}>
            {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
            {title}
          </span>
        }
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={{
          fontSize: 28,
          fontWeight: 600,
          ...valueStyle,
        }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
          较上周
          <span
            style={{
              color: trend >= 0 ? '#52c41a' : '#ff4d4f',
              marginLeft: 4,
              fontWeight: 500,
            }}
          >
            {trend >= 0 ? (
              <ArrowUpOutlined style={{ fontSize: 11 }} />
            ) : (
              <ArrowDownOutlined style={{ fontSize: 11 }} />
            )}
            {' '}{Math.abs(trend)}%
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
