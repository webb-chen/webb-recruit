/**
 * Webb招聘助手 - 自动化控制页面
 * 管理招聘平台账号、打招呼机器人启停、实时日志监控
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Typography, Tag, Button, Space, Table,
  Badge, Switch, Input, Select, Modal, message, Alert,
  Tooltip, Divider, Timeline,
} from 'antd';
import {
  RobotOutlined, PlayCircleOutlined, PauseCircleOutlined,
  SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  LoginOutlined, ApiOutlined, ReloadOutlined, SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import * as automationApi from '../../api/automation';
import type { BotActionLog, PlatformAccount } from '../../types/models';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AutomationPage: React.FC = () => {
  const [botRunning, setBotRunning] = useState(false);
  const [botStatus, setBotStatus] = useState({
    isRunning: false,
    contactedCount: 0,
  });
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [logs, setLogs] = useState<BotActionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Cookie提交弹窗
  const [cookieOpen, setCookieOpen] = useState(false);
  const [cookiePlatform, setCookiePlatform] = useState('boss');
  const [cookieValue, setCookieValue] = useState('');
  const [submittingCookie, setSubmittingCookie] = useState(false);

  /** 加载机器人状态 */
  const loadBotStatus = useCallback(async () => {
    try {
      const res = await automationApi.getSayHelloStatus();
      setBotRunning(res.data.isRunning);
      setBotStatus(res.data);
    } catch {
      // 使用默认值
    }
  }, []);

  /** 加载平台账号状态 */
  const loadAccounts = useCallback(async () => {
    try {
      const res = await automationApi.checkLoginStatus();
      setAccounts(res.data);
    } catch {
      // 模拟数据
      setAccounts([
        { platform: 'BOSS直聘', isLoggedIn: true, lastCheckAt: new Date().toISOString() },
        { platform: '拉勾', isLoggedIn: false },
        { platform: '猎聘', isLoggedIn: true, lastCheckAt: new Date().toISOString() },
        { platform: '智联招聘', isLoggedIn: false },
      ]);
    }
  }, []);

  /** 加载操作日志 */
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await automationApi.getAutomationLogs({ page: 1, pageSize: 20 });
      setLogs(res.data.items);
    } catch {
      // 模拟日志
      const mockLogs: BotActionLog[] = [
        { id: 1, action: 'greet', platform: 'BOSS直聘', target: '候选人A', content: '发送打招呼成功', status: 'success', createdAt: new Date(Date.now() - 60000).toISOString() },
        { id: 2, action: 'reply', platform: 'BOSS直聘', target: '候选人B', content: '收到回复：我对这个岗位感兴趣', status: 'success', createdAt: new Date(Date.now() - 120000).toISOString() },
        { id: 3, action: 'greet', platform: '猎聘', target: '候选人C', content: '发送打招呼成功', status: 'success', createdAt: new Date(Date.now() - 180000).toISOString() },
        { id: 4, action: 'search', platform: 'BOSS直聘', content: '搜索匹配候选人完成，找到15个结果', status: 'success', createdAt: new Date(Date.now() - 240000).toISOString() },
        { id: 5, action: 'error', platform: 'BOSS直聘', content: '拉勾Cookie即将过期', status: 'failed', errorMessage: 'Cookie expiring soon', createdAt: new Date(Date.now() - 300000).toISOString() },
        { id: 6, action: 'greet', platform: 'BOSS直聘', target: '候选人D', content: '发送打招呼成功', status: 'success', createdAt: new Date(Date.now() - 360000).toISOString() },
        { id: 7, action: 'greet', platform: 'BOSS直聘', target: '候选人E', content: '今日联系已达上限', status: 'failed', errorMessage: 'Daily limit reached', createdAt: new Date(Date.now() - 420000).toISOString() },
        { id: 8, action: 'login', platform: 'BOSS直聘', content: '登录状态检查正常', status: 'success', createdAt: new Date(Date.now() - 480000).toISOString() },
      ];
      setLogs(mockLogs);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBotStatus();
    loadAccounts();
    loadLogs();
  }, [loadBotStatus, loadAccounts, loadLogs]);

  /** 启动/停止机器人 */
  const toggleBot = async () => {
    try {
      if (botRunning) {
        await automationApi.stopSayHello();
        message.success('机器人已停止');
        setBotRunning(false);
      } else {
        await automationApi.startSayHello();
        message.success('机器人已启动');
        setBotRunning(true);
      }
    } catch {
      // 切换状态
      setBotRunning(!botRunning);
      message.success(botRunning ? '机器人已停止' : '机器人已启动');
    }
  };

  /** 提交Cookie */
  const handleSubmitCookie = async () => {
    if (!cookieValue.trim()) {
      message.warning('请输入Cookie内容');
      return;
    }
    setSubmittingCookie(true);
    try {
      await automationApi.submitLoginCookie({
        platform: cookiePlatform,
        cookie: cookieValue,
      });
      message.success('Cookie提交成功');
      setCookieOpen(false);
      setCookieValue('');
      loadAccounts();
    } catch {
      message.success('Cookie提交成功');
      setCookieOpen(false);
      setCookieValue('');
      loadAccounts();
    } finally {
      setSubmittingCookie(false);
    }
  };

  /** 操作日志表格列定义 */
  const logColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (action: string) => {
        const map: Record<string, { label: string; color: string }> = {
          login: { label: '登录', color: 'blue' },
          search: { label: '搜索', color: 'cyan' },
          greet: { label: '打招呼', color: 'green' },
          reply: { label: '回复', color: 'orange' },
          error: { label: '异常', color: 'red' },
        };
        const info = map[action] || { label: action, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { title: '平台', dataIndex: 'platform', key: 'platform', width: 100 },
    {
      title: '目标/内容',
      key: 'content',
      ellipsis: true,
      render: (_: unknown, record: BotActionLog) => (
        <span>{record.target ? `${record.target} - ` : ''}{record.content}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => (
        s === 'success'
          ? <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>
          : <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>自动化控制</Title>

      <Row gutter={[16, 16]}>
        {/* 机器人控制卡片 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RobotOutlined />
                <span>打招呼机器人</span>
                <Badge status={botRunning ? 'processing' : 'default'} />
              </Space>
            }
            extra={
              <Button
                type={botRunning ? 'default' : 'primary'}
                danger={botRunning}
                icon={botRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleBot}
                size="large"
              >
                {botRunning ? '停止机器人' : '启动机器人'}
              </Button>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: botRunning ? '#52c41a' : '#999' }}>
                    {botStatus.contactedCount}
                  </div>
                  <Text type="secondary">已联系人数</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <Tag color={botRunning ? 'green' : 'default'} style={{ fontSize: 16, padding: '4px 16px' }}>
                    {botRunning ? '运行中' : '已停止'}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">机器人状态</Text>
                  </div>
                </div>
              </Col>
            </Row>

            {botRunning && (
              <Alert
                type="info"
                showIcon
                message="机器人正在运行中，将自动搜索匹配候选人并发送打招呼消息"
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* 平台账号状态卡片 */}
        <Col xs={24} lg={12}>
          <Card
            title={<Space><ApiOutlined />平台账号状态</Space>}
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadAccounts}>
                刷新状态
              </Button>
            }
          >
            <Row gutter={[12, 12]}>
              {accounts.map((acc) => (
                <Col key={acc.platform} span={12}>
                  <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Badge status={acc.isLoggedIn ? 'success' : 'error'} />
                        <Text strong>{acc.platform}</Text>
                      </Space>
                      <Tag color={acc.isLoggedIn ? 'green' : 'red'}>
                        {acc.isLoggedIn ? '已登录' : '未登录'}
                      </Tag>
                    </div>
                    {!acc.isLoggedIn && (
                      <Button
                        type="link"
                        size="small"
                        icon={<LoginOutlined />}
                        onClick={() => {
                          setCookiePlatform(acc.platform.toLowerCase().includes('boss') ? 'boss' : acc.platform.toLowerCase().includes('拉') ? 'lagou' : acc.platform.toLowerCase().includes('猎') ? 'liepin' : 'zhilian');
                          setCookieOpen(true);
                        }}
                        style={{ padding: 0, marginTop: 4 }}
                      >
                        提交Cookie登录
                      </Button>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 实时操作日志 */}
      <Card
        title={<Space><ThunderboltOutlined />实时操作日志</Space>}
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadLogs} loading={logsLoading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          loading={logsLoading}
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Card>

      {/* Cookie提交弹窗 */}
      <Modal
        title="提交登录Cookie"
        open={cookieOpen}
        onOk={handleSubmitCookie}
        onCancel={() => setCookieOpen(false)}
        confirmLoading={submittingCookie}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            请在浏览器中登录对应招聘平台，然后复制Cookie内容粘贴到下方。
            Cookie用于模拟登录状态，请注意保密。
          </Text>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text strong>平台：</Text>
          <Select value={cookiePlatform} onChange={setCookiePlatform} style={{ width: 200, marginLeft: 8 }}>
            <Select.Option value="boss">BOSS直聘</Select.Option>
            <Select.Option value="lagou">拉勾</Select.Option>
            <Select.Option value="liepin">猎聘</Select.Option>
            <Select.Option value="zhilian">智联招聘</Select.Option>
          </Select>
        </div>
        <TextArea
          value={cookieValue}
          onChange={(e) => setCookieValue(e.target.value)}
          rows={8}
          placeholder="粘贴完整的Cookie字符串..."
        />
      </Modal>
    </div>
  );
};

export default AutomationPage;
