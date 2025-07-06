import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callAddJobToFavorite, callCheckJobInFavorite, callFetchJobById, callRemoveJobFromFavorites } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, message, Row, Skeleton, Tag } from "antd";
import { CalendarOutlined, DollarOutlined, EnvironmentOutlined, HeartFilled, HeartOutlined, HistoryOutlined } from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')


const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchJobById(id);
                if (res?.data) {
                    setJobDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();

        const fetchFavoriteStatus = async () => {
            if (id) {
              const res = await callCheckJobInFavorite(id);
              setIsFavorite(res?.data === true);
            }
          };
      
          fetchFavoriteStatus();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {jobDetail && jobDetail._id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {jobDetail.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button
                                    onClick={() => setIsModalOpen(true)}
                                    className={styles["btn-apply"]}
                                  >
                                    Nộp hồ sơ ngay bây giờ
                                  </button>

                                  {jobDetail?._id && (
                                    <div
                                      style={{ cursor: 'pointer', fontSize: 24 }}
                                      onClick={async () => {
                                        if (!jobDetail?._id) return;
                                    
                                        try {
                                            if (isFavorite) {
                                              await callRemoveJobFromFavorites(jobDetail._id);
                                              setIsFavorite(false);
                                              message.success('Đã xóa công việc khỏi danh sách yêu thích');
                                            } else {
                                              await callAddJobToFavorite({
                                                jobId: jobDetail._id,
                                                companyId: jobDetail.company?._id,
                                                jobName: jobDetail.name,
                                                companyName: jobDetail.company?.name,
                                              });
                                              setIsFavorite(true);
                                              message.success('Đã thêm công việc vào danh sách yêu thích');
                                            }
                                          } catch (error) {
                                            message.error('Đã xảy ra lỗi, vui lòng thử lại sau');
                                          }
                                      }}
                                    >
                                      {isFavorite ? (
                                        <HeartFilled style={{ color: 'red', fontSize: 36 }} />
                                      ) : (
                                        <HeartOutlined style={{ fontSize: 36 }} />
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Divider />
                                <div className={styles["skills"]}>
                                    {jobDetail?.skills?.map((item, index) => {
                                        return (
                                            <Tag key={`${index}-key`} color="gold" >
                                                {item}
                                            </Tag>
                                        )
                                    })}
                                </div>
                                <div className={styles["salary"]}>
                                    <DollarOutlined />
                                    <span>&nbsp;{(jobDetail.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                </div>
                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{getLocationName(jobDetail.location)}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <CalendarOutlined style={{ color: '#52c41a' }} /> Từ&nbsp;
                                        {jobDetail.startDate ? dayjs(jobDetail.startDate).format('DD/MM/YYYY') : '---'}&nbsp;đến&nbsp;
                                        {jobDetail.endDate ? dayjs(jobDetail.endDate).format('DD/MM/YYYY') : '---'}
                                </div>

                                <div>
                                    <HistoryOutlined /> {dayjs(jobDetail.updatedAt).locale('vi').fromNow()}
                                </div>
                                <Divider />
                                {parse(jobDetail.description)}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${jobDetail.company?.logo}`}
                                            style={{ width: '200px', height: '200px' }}
                                        />
                                    </div>
                                    <div>
                                        {jobDetail.company?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    )
}
export default ClientJobDetailPage;