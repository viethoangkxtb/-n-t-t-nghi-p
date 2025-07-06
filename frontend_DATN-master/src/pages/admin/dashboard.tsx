import { Card, Col, Row, Statistic } from "antd";
import CountUp from 'react-countup';
import { useEffect, useState } from "react";
import { callFetchTotalCompanies, callFetchTotalJobs, callFetchTotalUsers } from "@/config/api";

const DashboardPage = () => {
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    const formatter = (value: number | string) => (
        <CountUp end={Number(value)} separator="," />
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resCompanies, resJobs, resUsers] = await Promise.all([
                callFetchTotalCompanies(),
                callFetchTotalJobs(),
                callFetchTotalUsers()
            ]);

            setTotalCompanies(resCompanies.data?.total || 0);
            setTotalJobs(resJobs.data?.total || 0);
            setTotalUsers(resUsers.data?.total || 0);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        }
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={8}>
                <Card title="Số lượng công ty" bordered={false} >
                    <Statistic
                        title=""
                        value={totalCompanies}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Số lượng công việc" bordered={false} >
                    <Statistic
                        title=""
                        value={totalJobs}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Số lượng người dùng" bordered={false} >
                    <Statistic
                        title=""
                        value={totalUsers}
                        formatter={formatter}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardPage;
