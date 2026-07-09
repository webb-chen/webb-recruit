/**
 * Webb招聘助手 - ECharts趋势图组件
 * 用于展示招聘数据的趋势变化
 */
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';

interface TrendChartProps {
  /** 图表标题 */
  title?: string;
  /** X轴日期数据 */
  dates: string[];
  /** 各系列数据 */
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
  /** 图表高度 */
  height?: number;
  /** 是否显示工具栏 */
  showToolbox?: boolean;
  /** 是否加载中 */
  loading?: boolean;
}

const defaultColors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

const TrendChart: React.FC<TrendChartProps> = ({
  title,
  dates,
  series,
  height = 350,
  showToolbox = true,
  loading = false,
}) => {
  /** 构造ECharts配置 */
  const option: EChartsOption = useMemo(
    () => ({
      title: title
        ? {
            text: title,
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 500 },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: unknown) => {
          const items = params as Array<{
            seriesName: string;
            value: number;
            marker: string;
            axisValue: string;
          }>;
          if (!Array.isArray(items)) return '';
          let html = `<div style="font-weight:600;margin-bottom:4px">${items[0]?.axisValue || ''}</div>`;
          items.forEach((item) => {
            html += `<div style="display:flex;align-items:center;gap:6px">${item.marker} ${item.seriesName}: <b>${item.value}</b></div>`;
          });
          return html;
        },
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 0,
      },
      toolbox: showToolbox
        ? {
            feature: {
              dataZoom: { yAxisIndex: 'none' },
              restore: {},
              saveAsImage: {},
            },
          }
        : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.map((d) => dayjs(d).format('MM-DD')),
        axisLabel: { rotate: dates.length > 15 ? 45 : 0 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: series.map((s, index) => ({
        name: s.name,
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: s.color || defaultColors[index % defaultColors.length] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: (s.color || defaultColors[index % defaultColors.length]) + '40',
              },
              {
                offset: 1,
                color: (s.color || defaultColors[index % defaultColors.length]) + '05',
              },
            ],
          },
        },
        data: s.data,
      })),
      dataZoom: dates.length > 14
        ? [
            { type: 'inside', start: 60, end: 100 },
            { type: 'slider', start: 60, end: 100 },
          ]
        : undefined,
    }),
    [title, dates, series, showToolbox]
  );

  if (loading) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default TrendChart;
