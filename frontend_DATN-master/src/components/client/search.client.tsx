import { Button, Col, Form, Input, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const SearchClient = () => {
    const optionsSkills = SKILLS_LIST;
    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [, setSearchParams] = useSearchParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const jobName = searchParams.get('name')?.replace(/^\/|\/i$/g, '') || '';
        const companyName = searchParams.get('company.name')?.replace(/^\/|\/i$/g, '') || '';
        const skills = searchParams.get('skills')?.split(',') || [];
        const location = searchParams.get('location')?.split(',') || [];

        form.setFieldsValue({
            jobName,
            companyName,
            skills,
            location,
        });
    }, [searchParams]);

    const onFinish = async (values: any) => {
        const { skills, location, jobName, companyName } = values;
        const query: any = {};

        if (skills && skills.length > 0) {
            query.skills = skills.join(',');
        }
        if (location && location.length > 0) {
            query.location = location.join(',');
        }
        if (jobName) {
            query.name = `/${jobName}/i`; // Định dạng jobName thành biểu thức chính quy
        }
        if (companyName) {
            query['company.name'] = `/${companyName}/i`; // Định dạng companyName thành biểu thức chính quy
        }

        setSearchParams(query); // Cập nhật URL
    };

    const handleSearch = () => {
        const currentUrl = window.location.href;
        const values = form.getFieldsValue(); // Lấy giá trị hiện tại của form
        const { skills, location, jobName, companyName } = values;
        const query: any = {};

        // Tạo query parameters từ các giá trị form
        if (skills && skills.length > 0) {
            query.skills = skills.join(',');
        }
        if (location && location.length > 0) {
            query.location = location.join(',');
        }
        if (jobName) {
            query.name = `/${jobName}/i`;
        }
        if (companyName) {
            query['company.name'] = `/${companyName}/i`;
        }

        // Kiểm tra nếu đang ở trang chủ (http://localhost:3000/)
        if (currentUrl === 'http://localhost:3000/' || currentUrl === 'http://localhost:3000') {
            navigate({
                pathname: '/job',
                search: new URLSearchParams(query).toString(),
            });
            // Gọi form.submit() sau khi chuyển hướng
            // setTimeout(() => form.submit(), 0); // Đảm bảo submit sau khi navigate
            onFinish(values);
        } else {
            // Nếu không phải trang chủ, submit form bình thường
            form.submit();
        }
    };

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{ render: () => <></> }}
        >
            <Row gutter={[20, 20]}>
                <Col span={24}><h2>Việc Làm IT Cho Lập Trình Viên</h2></Col>
                
                <Col span={24} md={7}>
                    <ProForm.Item name="jobName">
                        <Input placeholder="Tên công việc" allowClear />
                    </ProForm.Item>
                </Col>
                
                <Col span={12} md={4}>
                    <ProForm.Item name="companyName">
                        <Input placeholder="Tên công ty" allowClear />
                    </ProForm.Item>
                </Col>
                
                <Col span={12} md={4}>
                    <ProForm.Item name="location">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Địa điểm..."
                            options={optionsLocations}
                        />
                    </ProForm.Item>
                </Col>
                
                <Col span={24} md={7}>
                    <ProForm.Item name="skills">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Tìm theo kỹ năng..."
                            options={optionsSkills}
                        />
                    </ProForm.Item>
                </Col>
                
                <Col span={12} md={2} style={{ display: 'flex'}}>
                    <Button type='primary' onClick={handleSearch} block>
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>
        </ProForm>
    );
};

export default SearchClient;
