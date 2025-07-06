import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ISubscriber } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import { fetchSubscriber } from "@/redux/slice/subscriberSlide";
import { callDeleteSubscriber } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const SubscriberPage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.subscriber.isFetching);
    const meta = useAppSelector(state => state.subscriber.meta);
    const subscribers = useAppSelector(state => state.subscriber.result);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleDeleteSubscriber = async (_id: string | undefined) => {
        if (_id) {
            const res = await callDeleteSubscriber(_id);
            if (res && res.data) {
                message.success('Xóa đăng ký thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<ISubscriber>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => (index + 1) + (meta.current - 1) * (meta.pageSize),
            hideInSearch: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            fieldProps: {
                placeholder: 'Nhập email',
            },
        },
        {
            title: 'Tên user',
            dataIndex: 'name',
            sorter: true,
            fieldProps: {
                placeholder: 'Nhập tên ứng viên',
            },
        },
        {
            title: 'Kỹ năng',
            dataIndex: 'skills',
            render: (_, record) => (
                <Space wrap>
                    {record.skills?.map((skill, index) => (
                        <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                </Space>
            ),
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 180,
            render: (_, record) => dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss'),
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 180,
            render: (_, record) => dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss'),
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            width: 90,
            hideInSearch: true,
            render: (_, entity) => (
                <Space>
                    {/* <Access permission={ALL_PERMISSIONS.SUBSCRIBERS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => navigate(`/admin/subscriber/upsert?id=${entity._id}`)}
                        />
                    </Access> */}
                    <Access permission={ALL_PERMISSIONS.SUBSCRIBERS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title="Xác nhận xóa đăng ký"
                            description="Bạn có chắc chắn muốn xóa đăng ký này?"
                            onConfirm={() => handleDeleteSubscriber(entity._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f', cursor: "pointer" }} />
                        </Popconfirm>
                    </Access>
                </Space>
            )
        }
    ];

    const buildQuery = (params: any, sort: any, _filter: any) => {
        const clone = { ...params };
        if (clone.email) clone.email = `/${clone.email}/i`;
        if (clone.name) clone.name = `/${clone.name}/i`;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort?.email) sortBy = sort.email === 'ascend' ? "sort=email" : "sort=-email";
        if (sort?.name) sortBy = sort.name === 'ascend' ? "sort=name" : "sort=-name";
        if (sort?.createdAt) sortBy = sort.createdAt === 'ascend' ? "sort=createdAt" : "sort=-createdAt";
        if (sort?.updatedAt) sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt" : "sort=-updatedAt";

        if (!sortBy) temp += "&sort=-updatedAt";
        else temp += `&${sortBy}`;

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.SUBSCRIBERS.GET_PAGINATE}>
            <DataTable<ISubscriber>
                actionRef={tableRef}
                headerTitle="Danh sách Đăng ký"
                rowKey="_id"
                loading={isFetching}
                columns={columns}
                dataSource={subscribers}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchSubscriber({ query }));
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    total: meta.total,
                    showSizeChanger: true,
                    showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} rows</div>
                }}
                rowSelection={false}
                // toolBarRender={() => (
                //     <Button
                //         icon={<PlusOutlined />}
                //         type="primary"
                //         onClick={() => navigate('/admin/subscriber/upsert')}
                //     >
                //         Thêm mới
                //     </Button>
                // )}
            />
        </Access>
    );
};

export default SubscriberPage;
