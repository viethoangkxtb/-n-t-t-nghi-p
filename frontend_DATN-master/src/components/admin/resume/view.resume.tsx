import { callSendApproveEmail, callSendRejectEmail, callUpdateResumeStatus } from "@/config/api";
import { convertSlug } from "@/config/utils";
import { IApproveEmailPayload, IRejectEmailPayload, IResume } from "@/types/backend";
import { Row, Col, Badge, Button, Descriptions, Drawer, Form, Input, Modal, Select, message, notification } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
const { Option } = Select;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}
const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    console.log("dataInit", dataInit)

    const [modalReviewingVisible, setModalReviewingVisible] = useState(false);
    const [modalApprovedVisible, setModalApprovedVisible] = useState(false);
    const [modalRejectedVisible, setModalRejectedVisible] = useState(false);
    
    const [reviewingNote, setReviewingNote] = useState("");
    const [approvedNote, setApprovedNote] = useState({
        to: "",
        from: "",
        companyName: "",
        name: "",
        jobTitle: "",
        interviewTime: "",
        interviewType: "",
        interviewLocation: "",
        jobLink: "",
        senderName: "",
        senderTitle: "Thông báo kết quả trúng tuyển",
        senderPhone: "",
        senderEmail: ""
    });
    const [rejectedNote, setRejectedNote] = useState({
        to: "",
        from: "",
        companyName: "",
        name: "",
        jobTitle: "",
        senderName: "",
        senderTitle: "",
        senderPhone: "",
        senderEmail: "",
        customMessage: ""
    });

    // const handleChangeStatus = async () => {
    //     setIsSubmit(true);

    //     const status = form.getFieldValue('status');
    //     const res = await callUpdateResumeStatus(dataInit?._id, status)
    //     if (res.data) {
    //         message.success("Update Resume status thành công!");
    //         setDataInit(null);
    //         onClose(false);
    //         reloadTable();
    //     } else {
    //         notification.error({
    //             message: 'Có lỗi xảy ra',
    //             description: res.message
    //         });
    //     }

    //     setIsSubmit(false);
    // }

    const handleChangeStatus = () => {
      const status = form.getFieldValue("status");
        
      switch (status) {
        case "PENDING":
          submitPending(); // gọi API cũ
          break;
        case "REVIEWING":
          submitPending();
          break;
        case "APPROVED":
          setModalApprovedVisible(true);
          break;
        case "REJECTED":
          setModalRejectedVisible(true);
          break;
        default:
          message.error("Trạng thái không hợp lệ.");
      }
    };
    
    const submitPending = async () => {
      setIsSubmit(true);
      const status = form.getFieldValue("status");
      const res = await callUpdateResumeStatus(dataInit?._id, status);
    
      if (res.data) {
        message.success("Đã cập nhật trạng thái.");
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: res.message });
      }
      setIsSubmit(false);
    };
    
    const handleReviewingSubmit = async () => {
      setIsSubmit(true);
      const status = form.getFieldValue('status');
      const res = await callUpdateResumeStatus(dataInit?._id, status);
      if (res.data) {
        message.success("Cập nhật REVIEWING thành công");
        setModalReviewingVisible(false);
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: res.message });
      }
      setIsSubmit(false);
    };
    
    const handleApprovedSubmit = async () => {
      setIsSubmit(true);
      const status = form.getFieldValue('status');
      const res = await callUpdateResumeStatus(dataInit?._id, status);
      if (res.data) {
        message.success("Cập nhật APPROVED thành công");
        setModalApprovedVisible(false);
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: res.message });
      }

      const payload: IApproveEmailPayload = {
        ...approvedNote,
      };

      const sendEmail = await callSendApproveEmail(payload);
      if (sendEmail.data) {
        message.success("Gửi email chấp nhận thành công");
        setModalApprovedVisible(false);
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: sendEmail.message });
      }

      setIsSubmit(false);
    };
    
    const handleRejectedSubmit = async () => {
      setIsSubmit(true);
      const status = form.getFieldValue('status');
      const res = await callUpdateResumeStatus(dataInit?._id, status);
      if (res.data) {
        message.success("Cập nhật REJECTED thành công");
        setModalRejectedVisible(false);
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: res.message });
      }

      const payload: IRejectEmailPayload = {
        ...rejectedNote,
      };

      const sendEmail = await callSendRejectEmail(payload);
      if (sendEmail.data) {
        message.success("Gửi email từ chối thành công");
        setModalRejectedVisible(false);
        onClose(false);
        reloadTable();
      } else {
        notification.error({ message: "Lỗi", description: sendEmail.message });
      }

      setIsSubmit(false);
    };

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status)
            const jobSlug = dataInit?.jobId?.name ? convertSlug(dataInit.jobId.name) : '';
            const jobLink = dataInit?.jobId?._id ? `${window.location.origin}/job/${jobSlug}?id=${dataInit.jobId._id}` : '';

            setApprovedNote((prev) => ({
            ...prev,
            to: dataInit?.email || '',
            name: typeof dataInit?.userId === 'string' ? '' : dataInit?.userId.name || '',
            jobTitle: dataInit?.jobId.name || '',
            companyName: dataInit?.companyId.name || '',
            jobLink,
            senderEmail: dataInit?.userLogin,
            senderName: dataInit?.nameLogin,
            }));

            setRejectedNote((prev) => ({
            ...prev,
            senderTitle: "Từ chối tuyển dụng",
            to: dataInit?.email || '',
            name: typeof dataInit?.userId === 'string' ? '' : dataInit?.userId.name || '',
            jobTitle: dataInit?.jobId.name || '',
            companyName: dataInit?.companyId.name || '',
            senderEmail: dataInit?.userLogin,
            senderName: dataInit?.nameLogin,
            }));
        }
        return () => form.resetFields();
    }, [dataInit])

    const lastEdit = dataInit?.history?.length ? dataInit.history[dataInit.history.length - 1] : null;
    
    return (
        <>
            <Drawer
                title="Thông Tin Đơn xin việc"
                placement="right"
                onClose={() => { 
                    onClose(false); 
                    setDataInit(null); 
                    setApprovedNote({
                        to: "",
                        from: "",
                        companyName: "",
                        name: "",
                        jobTitle: "",
                        interviewTime: "",
                        interviewType: "",
                        interviewLocation: "",
                        jobLink: "",
                        senderName: "",
                        senderTitle: "Thông báo kết quả trúng tuyển",
                        senderPhone: "",
                        senderEmail: ""
                    });
                    setReviewingNote("");
                    setRejectedNote({
                        to: "",
                        from: "",
                        companyName: "",
                        name: "",
                        jobTitle: "",
                        senderName: "",
                        senderTitle: "",
                        senderPhone: "",
                        senderEmail: "",
                        customMessage: ""
                    });
                    form.resetFields(); 
                }}
                open={open}
                width={"40vw"}
                maskClosable={false}
                destroyOnClose
                extra={

                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Change Status
                    </Button>

                }
            >
                <Descriptions title="" bordered column={2} layout="vertical">
                    <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Form
                            form={form}
                        >
                            <Form.Item name={"status"}>
                                <Select
                                    // placeholder="Select a option and change input text above"
                                    // onChange={onGenderChange}
                                    // allowClear
                                    style={{ width: "100%" }}
                                    defaultValue={dataInit?.status}
                                >
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="REVIEWING">REVIEWING</Option>
                                    <Option value="APPROVED">APPROVED</Option>
                                    <Option value="REJECTED">REJECTED</Option>
                                </Select>
                            </Form.Item>
                        </Form>

                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Công việc">
                        {dataInit?.jobId?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Công Ty">
                        {dataInit?.companyId?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Link CV">
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${dataInit?.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Xem CV
                      </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>

                    <Descriptions.Item label="Người chỉnh sửa cuối cùng">
                      {lastEdit?.updatedBy?.email || "Không có dữ liệu"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>

                </Descriptions>
            </Drawer>

            <Modal
              title="Nhập ghi chú REVIEWING"
              open={modalReviewingVisible}
              onCancel={() => setModalReviewingVisible(false)}
              onOk={handleReviewingSubmit}
              confirmLoading={isSubmit}
              zIndex={1100}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập ghi chú"
                value={reviewingNote}
                onChange={(e) => setReviewingNote(e.target.value)}
              />
            </Modal>

            {/* Modal APPROVED */}
            <Modal
              title="Nhập thông tin mời phỏng vấn"
              open={modalApprovedVisible}
              onCancel={() => setModalApprovedVisible(false)}
              onOk={handleApprovedSubmit}
              confirmLoading={isSubmit}
              zIndex={1100}
              width={800} // Tăng chiều rộng modal một chút
            >
              <Form layout="vertical">
                <Row gutter={16}>
                  {/* Cột trái */}
                  <Col span={12}>
                    <Form.Item label="To">
                      <Input value={approvedNote.to} disabled />
                    </Form.Item>
                    {/* <Form.Item label="From">
                      <Input value="hoangcongtu2409@gmail.com" disabled />
                    </Form.Item> */}
                    <Form.Item label="Tên công việc">
                      <Input
                        placeholder="Tên công việc"
                        value={approvedNote.jobTitle}
                        disabled
                        onChange={(e) => setApprovedNote({ ...approvedNote, jobTitle: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Tiêu đề gửi">
                      <Input
                        placeholder="Tiêu đề gửi"
                        value={approvedNote.senderTitle}
                        onChange={(e) => setApprovedNote({ ...approvedNote, senderTitle: e.target.value })}
                      />
                    </Form.Item>
                    
                    
                    <Form.Item label="Thời gian phỏng vấn">
                      <Input
                        placeholder="Ví dụ: 10:00 AM, 01/06/2025"
                        value={approvedNote.interviewTime}
                        onChange={(e) => setApprovedNote({ ...approvedNote, interviewTime: e.target.value })}
                      />
                    </Form.Item>
                    
                    <Form.Item label="Tên người liên hệ">
                      <Input
                        placeholder="Tên người liên hệ"
                        value={approvedNote.senderName}
                        onChange={(e) => setApprovedNote({ ...approvedNote, senderName: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Link công việc">
                      <Input
                        placeholder="https://..."
                        value={approvedNote.jobLink}
                        disabled
                        onChange={(e) => setApprovedNote({ ...approvedNote, jobLink: e.target.value })}
                      />
                    </Form.Item>
                  </Col>
                    
                  {/* Cột phải */}
                  <Col span={12}>
                  <Form.Item label="Tên ứng viên">
                      <Input
                        placeholder="Tên ứng viên"
                        value={approvedNote.name || ''}
                        disabled
                        onChange={(e) => setApprovedNote({ ...approvedNote, name: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Tên công ty">
                      <Input
                        placeholder="Tên công ty"
                        disabled
                        value={approvedNote.companyName || ''}
                        onChange={(e) => setApprovedNote({ ...approvedNote, companyName: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Loại hình phỏng vấn">
                      <Select
                        placeholder="Chọn loại hình phỏng vấn"
                        value={approvedNote.interviewType || undefined} // đảm bảo đúng dạng
                        onChange={(value) =>
                          setApprovedNote({ ...approvedNote, interviewType: value })
                        }
                        allowClear
                      >
                        <Select.Option value="Trực tiếp">Trực tiếp</Select.Option>
                        <Select.Option value="Trực tuyến">Trực tuyến</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Vị trí phỏng vấn">
                      <Input
                        placeholder="Địa điểm hoặc link Google Meet"
                        value={approvedNote.interviewLocation}
                        onChange={(e) => setApprovedNote({ ...approvedNote, interviewLocation: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Email liên hệ">
                      <Input
                        placeholder="Email người liên hệ"
                        value={approvedNote.senderEmail}
                        onChange={(e) => setApprovedNote({ ...approvedNote, senderEmail: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item label="Số điện thoại người gửi">
                      <Input
                        placeholder="Số điện thoại"
                        value={approvedNote.senderPhone}
                        onChange={(e) => setApprovedNote({ ...approvedNote, senderPhone: e.target.value })}
                      />
                    </Form.Item>
                    
                  </Col>
                </Row>
              </Form>
            </Modal>

            {/* Modal REJECTED */}
            <Modal
              title="Nhập thông tin từ chối ứng viên"
              open={modalRejectedVisible}
              onCancel={() => setModalRejectedVisible(false)}
              onOk={handleRejectedSubmit}
              confirmLoading={isSubmit}
              zIndex={1100}
              width={800}
            >
              <Form layout="vertical">
                <Row gutter={16}>
                  {/* Cột trái */}
                  <Col span={12}>
                    <Form.Item label="To">
                      <Input value={rejectedNote.to} disabled />
                    </Form.Item>
                    <Form.Item label="Tên công việc">
                      <Input
                        placeholder="Tên công việc"
                        value={rejectedNote.jobTitle}
                        disabled
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, jobTitle: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Tên người gửi">
                      <Input
                        placeholder="Tên người gửi"
                        value={rejectedNote.senderName}
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, senderName: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Tiêu đề email">
                      <Input
                        placeholder="Tiêu đề"
                        value={rejectedNote.senderTitle}
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, senderTitle: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Email liên hệ">
                      <Input
                        placeholder="Email liên hệ"
                        value={rejectedNote.senderEmail}
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, senderEmail: e.target.value })
                        }
                      />
                    </Form.Item>
                  </Col>
                      
                  {/* Cột phải */}
                  <Col span={12}>
                    <Form.Item label="Tên ứng viên">
                      <Input
                        placeholder="Tên ứng viên"
                        value={rejectedNote.name || ''}
                        disabled
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, name: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Tên công ty">
                      <Input
                        placeholder="Tên công ty"
                        value={rejectedNote.companyName || ''}
                        disabled
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, companyName: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Số điện thoại người gửi">
                      <Input
                        placeholder="Số điện thoại"
                        value={rejectedNote.senderPhone}
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, senderPhone: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Ghi chú từ chối (tùy chọn)">
                      <Input.TextArea
                        placeholder="Ví dụ: Ứng viên cần cải thiện kỹ năng hoặc có thêm kinh nghiệm thực tế..."
                        value={rejectedNote.customMessage}
                        onChange={(e) =>
                          setRejectedNote({ ...rejectedNote, customMessage: e.target.value })
                        }
                        rows={4}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
        </>
    )
}

export default ViewDetailResume;