import { callFetchJob } from '@/config/api';
import { LOCATION_LIST, convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { CalendarOutlined, EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

interface IProps {
    showPagination?: boolean;
    companyName: string;   // tên công ty truyền vào để lọc frontend
}

const JobOfCompanyCard = (props: IProps) => {
    const { showPagination = false, companyName } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [allJob, setAllJob] = useState<IJob[]>([]);  // lưu toàn bộ job fetch về
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, sortQuery]);

    useEffect(() => {
        if (companyName.trim()) {
            // Lọc ở frontend theo tên công ty (không phân biệt hoa thường)
            const filtered = allJob.filter(job =>
                job.company?.name.toLowerCase().includes(companyName.toLowerCase())
            );
            setDisplayJob(filtered);
            setTotal(filtered.length);
            setCurrent(1);
        } else {
            setDisplayJob(allJob);
            setTotal(allJob.length);
        }
    }, [companyName, allJob]);

    const fetchJob = async () => {
        setIsLoading(true);
        let query = `current=1&pageSize=1000`;
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            setAllJob(res.data.result);
            // Lưu tất cả job về allJob, việc lọc sẽ xử lý ở useEffect trên
        }
        setIsLoading(false);
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`);
    }

    const handleViewAllJobs = () => {
        // Điều hướng sang /job với query parameter company.name
        navigate({
            pathname: '/job',
            search: `?company.name=/${companyName}/i`,
        });
    };

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>CÔNG VIỆC MỚI NHẤT</span>
                                {!showPagination && (
                                    <a onClick={handleViewAllJobs} style={{ cursor: 'pointer' }}>
                                        Xem tất cả
                                    </a>
                                )}
                            </div>
                        </Col>

                        {displayJob?.slice(0, pageSize).map(item => (   // slice để giới hạn theo pageSize
                            <Col span={24} key={item._id}>
                                <Card size="small" title={null} hoverable
                                    onClick={() => handleViewDetailJob(item)}
                                >
                                    <div className={styles["card-job-content"]}>
                                        <div className={styles["card-job-left"]}>
                                            <img
                                                alt="example"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.company?.logo}`}
                                            />
                                        </div>
                                        <div className={styles["card-job-right"]}>
                                            <div className={styles["job-title"]}>{item.name}</div>
                                            <div className={styles["job-location"]}><EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{getLocationName(item.location)}</div>
                                            <div><ThunderboltOutlined style={{ color: 'orange' }} />&nbsp;{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</div>
                                            <div style={{ marginTop: '6px' }}>
                                                <CalendarOutlined style={{ color: '#52c41a' }} /> Từ&nbsp;
                                                {item.startDate ? dayjs(item.startDate).format('DD/MM/YYYY') : '---'}&nbsp;đến&nbsp;
                                                {item.endDate ? dayjs(item.endDate).format('DD/MM/YYYY') : '---'}
                                            </div>
                                            <div className={styles["job-updatedAt"]}>{dayjs(item.updatedAt).locale('vi').fromNow()}</div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}

                        {(!displayJob || displayJob.length === 0) && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>

                    {showPagination && (
                        <>
                            <div style={{ marginTop: 30 }}></div>
                            <Row style={{ display: "flex", justifyContent: "center" }}>
                                <Pagination
                                    current={current}
                                    total={total}
                                    pageSize={pageSize}
                                    responsive
                                    onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                                />
                            </Row>
                        </>
                    )}
                </Spin>
            </div>
        </div>
    )
}

export default JobOfCompanyCard;