import { callFetchJob } from '@/config/api';
import { LOCATION_LIST, convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { CalendarOutlined, EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Xây dựng filter từ searchParams
            const queryParams: string[] = [];
            if (searchParams.get("skills")) {
                queryParams.push(`skills=${searchParams.get("skills")}`);
            }
            if (searchParams.get("location")) {
                queryParams.push(`location=${searchParams.get("location")}`);
            }
            if (searchParams.get("name")) {
                queryParams.push(`name=${searchParams.get("name")}`);
            }
            if (searchParams.get("company.name")) {
                queryParams.push(`company.name=${searchParams.get("company.name")}`);
            }

            const newFilter = queryParams.join("&");
            setFilter(newFilter);

            // Gọi API với filter mới
            let query = `current=${current}&pageSize=${pageSize}`;
            if (newFilter) {
                query += `&${newFilter}`;
            }
            if (sortQuery) {
                query += `&${sortQuery}`;
            }

            try {
                const res = await callFetchJob(query);
                if (res && res.data) {
                    setDisplayJob(res.data.result);
                    setTotal(res.data.meta.total);
                } else {
                    setDisplayJob([]);
                    setTotal(0);
                }
            } catch (error) {
                console.error("Lỗi tải công việc:", error);
                setDisplayJob([]);
                setTotal(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [current, pageSize, sortQuery, searchParams]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }



    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`)
    }

    return (
        <div className={`${styles["card-job-section"]}`}>
            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>CÔNG VIỆC MỚI NHẤT</span>
                                {!showPagination &&
                                    <Link to="job">Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={12} key={item._id}>
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
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
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
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;