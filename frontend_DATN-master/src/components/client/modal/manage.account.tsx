import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Table, Tabs, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { ICompany, IFavoriteJobItem, IResume, IUser } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callChangePassword, callDeleteResumeForUser, callFetchCompany, callFetchFavoriteJobs, callFetchResumeByUser, callFetchUserById, callGetSubscriberSkills, callRemoveJobFromFavorites, callUpdateSubscriber, callUpdateUserForNormal } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { convertSlug, SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        setIsFetching(true);
        const res = await callFetchResumeByUser();
        if (res && res.data) {
            setListCV(res.data as IResume[]);
        }
        setIsFetching(false);
    };

    const handleWithdraw = async (id: string) => {
        try {
            const res = await callDeleteResumeForUser(id);
            if (res && res.data) {
                message.success('Đã rút CV thành công');
                fetchResumes(); // load lại danh sách sau khi rút
            }else {
              message.error(res.message);
            }
        } catch (error) {
            message.error('Rút CV thất bại');
        }
    };

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: ["companyId", "name"],

        },
        {
            title: 'Vị trí',
            dataIndex: ["jobId", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
        {
          title: '',
          key: 'action',
          render: (_, record) => (
            <Popconfirm
              title="Bạn có chắc chắn muốn rút CV này không?"
              onConfirm={() => handleWithdraw(record._id as string)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger>Rút CV</Button>
            </Popconfirm>
          ),
        }
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
                rowKey="_id"
            />
        </div>
    )
}

const FavoriteJobs = ({ onClose }: { onClose?: (v: boolean) => void }) => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<IFavoriteJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchFavoriteJobs();
  }, []);

  const fetchFavoriteJobs = async () => {
    setLoading(true);
    try {
      const res = await callFetchFavoriteJobs();
      console.log("res: ", res.data[0].jobs)
    
      // Dữ liệu nằm trong res.data.data[0].jobs
      const favoriteList = res.data[0].jobs;
      if (Array.isArray(favoriteList) && favoriteList.length > 0) {
        const jobs = favoriteList || [];
        setJobs(jobs);
        console.log("jobs: ", jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Lỗi khi fetch jobs", error);
      message.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId: string) => {
    try {
      const res = await callRemoveJobFromFavorites(jobId); // gọi API xoá
      if (res && res.data) {
        message.success('Đã bỏ yêu thích');
        fetchFavoriteJobs(); // load lại danh sách
      }
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleApply = (jobId: string, jobName: string) => {
    const slug = convertSlug(jobName);
    if (onClose) onClose(false);
    navigate(`/job/${slug}?id=${jobId}`);
  };

  const columns: ColumnsType<IFavoriteJobItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'jobName',
    },
    {
      title: 'Tên công ty',
      dataIndex: 'companyName',
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => handleApply(record.jobId, record.jobName)}>Rải CV</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn bỏ yêu thích công việc này?"
            onConfirm={() => handleRemoveJob(record.jobId)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Bỏ yêu thích</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table<IFavoriteJobItem>
        columns={columns}
        dataSource={jobs}
        loading={loading}
        pagination={false}
        rowKey={(record) => record.jobId}
      />
    </div>
  );
};

const ChangePassword = () => {
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const { oldPassword, newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            return message.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
        }

        // Giả lập API đổi mật khẩu
        const res = await callChangePassword({ oldPassword, newPassword });

        if (res.data) {
            message.success("Đổi mật khẩu thành công!");
            form.resetFields();
        } else {
            message.error("Đổi mật khẩu thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Nhập lại mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};


const UserUpdateInfo = () => {
  const user = useAppSelector((state) => state.account.user);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [companies, setCompanies] = useState<ICompany[]>([]);

  // Fetch user data and company list
  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        try {
          // Fetch user data
          const userRes = await callFetchUserById(user._id);
          if (userRes.data) {
            form.setFieldsValue({
              name: userRes.data.name,
              email: userRes.data.email,
              age: userRes.data.age,
              gender: userRes.data.gender,
              address: userRes.data.address,
              role: userRes.data.role?.name || '',
              company: userRes.data.company?._id || '0123456789', // Set company ID
            });
          }

          // Fetch company list
          const companyRes = await callFetchCompany('current=1&pageSize=1000');
          if (companyRes.data?.result) {
            setCompanies([
            { _id: '0123456789', name: 'Không ở công ty nào', logo: "123" },
            ...companyRes.data.result,
          ]);
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
          message.error("Không thể tải thông tin người dùng hoặc danh sách công ty!");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user, form]);

  // Handle form submission
  const onFinish = async (values: any) => {
    console.log("onFinish", values)
    if (user?._id) {
      try {
        const selectedCompany = companies.find((company) => company._id === values.company);

        const payload: Partial<IUser> = {
          name: values.name,
          age: values.age,
          gender: values.gender,
          address: values.address,
          ...(selectedCompany && selectedCompany._id && selectedCompany.name && selectedCompany._id !== '0123456789'
            ? { company: { _id: selectedCompany._id, name: selectedCompany.name } }
            : {}),
        };

        console.log("payload", payload)

        await callUpdateUserForNormal(user._id, payload);
        message.success("Cập nhật thông tin thành công!");
      } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        message.error("Cập nhật thông tin thất bại!");
      }
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        name: '',
        email: '',
        age: undefined,
        gender: '',
        address: '',
        role: '',
        company: '',
      }}
    >
      <h2>Thông tin người dùng</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Tên" name="name">
            <Input />
          </Form.Item>

          <Form.Item
            label="Tuổi"
            name="age"
            rules={[{ required: true, message: 'Vui lòng nhập tuổi' }, { type: 'number', min: 0, message: 'Tuổi phải là số không âm' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: false, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Công ty"
            name="company"
            rules={[{ required: true, message: 'Vui lòng chọn công ty' }]}
          >
            <Select
              showSearch
              placeholder="Chọn công ty"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {companies.map((company) => (
                <Select.Option key={company._id} value={company._id}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng nhập vai trò' }]}
          >
            <Input disabled />
          </Form.Item>
        </Col>

        <Col xs={24} style={{ textAlign: 'right' }}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};



const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);

    useEffect(() => {
        const init = async () => {
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                form.setFieldValue("skills", res.data.skills);
            }
        }
        init();
    }, [])

    const onFinish = async (values: any) => {
        const { skills } = values;
        const res = await callUpdateSubscriber({
            email: user.email,
            name: user.name,
            skills: skills ? skills : []
        });
        if (res.data) {
            message.success("Cập nhật thông tin thành công");
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                showArrow={false}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={SKILLS_LIST}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Danh sách CV đã gửi`,
            children: <UserResume />,
        },
        {
            key: 'favorite-jobs',
            label: `Danh sách CV yêu thích`,
            children: <FavoriteJobs onClose={onClose} />, 
        },
        {
            key: 'email-by-skills',
            label: `Nhận thông tin công việc qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <ChangePassword />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1060px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;